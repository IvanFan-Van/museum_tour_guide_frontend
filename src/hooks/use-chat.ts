import { useCallback, useEffect, useRef, useState } from "react";

export function useChat({
    api,
    options,
}: {
    api: string;
    options?: Record<string, any>;
}) {
    const [response, setResponse] = useState<string>("");
    const [audioQueue, setAudioQueue] = useState<(string | null)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const socketRef = useRef<WebSocket | null>(null);
    const currentAudioIdRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        currentAudioIdRef.current = 0;
        setAudioQueue((prevQueue) => {
            prevQueue.forEach((item) => item && URL.revokeObjectURL(item));
            return [];
        });
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, []);

    const sendMessage = (queryParam?: string) => {
        if (isLoading) return;
        setIsLoading(true);
        setResponse("");
        setAudioQueue([]);
        setQuery("");
        currentAudioIdRef.current = 0;

        // 构建请求
        const effectiveQuery = queryParam || query;
        const payload = {
            query: effectiveQuery,
            doc_id: options?.doc_id || null,
        };
        console.info("request params: \n", JSON.stringify(payload, null, 2));

        // 获取数据
        const socket = new WebSocket(api);
        socketRef.current = socket;

        socket.onopen = () => {
            console.info("WebSocket connection established.");
            socket.send(JSON.stringify(payload));
        };

        socket.onmessage = (event) => {
            if (typeof event.data === "string") {
                const message = JSON.parse(event.data);
                const eventType = message.event;
                const data = message.data;

                switch (eventType) {
                    case "connected":
                        console.info("Connected to backend service.");
                        break;
                    case "message":
                        setResponse((prev) => prev + data.chunk);
                        setIsLoading(false);
                        break;
                    case "done":
                        console.log("Stream finished:", data);
                        setAudioQueue((prev) => [...prev, null]); // 在队列末尾添加 null 以表示结束
                        setIsLoading(false);
                        socket.close();
                        socketRef.current = null;
                        break;
                    case "error":
                        console.error("An error occurred:", data);
                        setAudioQueue((prev) => [...prev, null]); // 在队列末尾添加 null 以表示结束
                        setIsLoading(false);
                        socket.close();
                        socketRef.current = null;
                        break;
                    default:
                        console.warn("Unknown event type:", eventType);
                }
            } else if (event.data instanceof Blob) {
                const audioBlob = event.data;
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioQueue((prevQueue) => [...prevQueue, audioUrl]);
            } else {
                console.warn("Received unknown data type from WebSocket.");
            }
        };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
    };

    const getNextAudio = (): string | null => {
        if (currentAudioIdRef.current < audioQueue.length) {
            console.log(
                "获取当前 audio ID 的音频: ",
                currentAudioIdRef.current
            );
            const audioUrl = audioQueue[currentAudioIdRef.current];
            currentAudioIdRef.current += 1;
            return audioUrl;
        }

        return null;
    };

    return {
        audioQueue,
        response,
        isLoading,
        query,
        setQuery,
        sendMessage,
        handleInputChange,
        getNextAudio,
    };
}
