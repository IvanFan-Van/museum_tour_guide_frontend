import { useCallback, useEffect, useRef, useState } from "react";

function base64ToBlob(base64: string): Blob {
    const base64String = base64.split(",")[1];
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const mimeType = base64.match(/data:(.*);base64,/)?.[1] || "audio/wav";
    const blob = new Blob([bytes], { type: mimeType });
    return blob;
}

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
    const sourceRef = useRef<EventSource | null>(null);
    const currentAudioIdRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.close();
            sourceRef.current = null;
        }
        currentAudioIdRef.current = 0;
        setAudioQueue((prevQueue) => {
            prevQueue.forEach((item) => item && URL.revokeObjectURL);
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
        const params = new URLSearchParams({
            ...options,
            query: effectiveQuery,
        });
        const url = new URL(`${api}?${params.toString()}`);
        console.log(url.href);

        // 获取数据
        const source = new EventSource(url.href);
        sourceRef.current = source;

        source.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === "audio") {
                const blob = base64ToBlob(data.chunk);
                const audioUrl = URL.createObjectURL(blob);
                setAudioQueue((prevQueue) => [...prevQueue, audioUrl]);
            } else if (data.type === "text") {
                setResponse((prev) => prev + data.chunk);
            }
        });

        source.addEventListener("done", (event) => {
            const data = JSON.parse(event.data);
            setAudioQueue((prev) => [...prev, null]); // 在队列末尾添加一个 null 以表示结束
            console.log(data);
            setIsLoading(false);
            source.close();
            sourceRef.current = null;
        });

        source.addEventListener("error", (err) => {
            console.log(err);
            setIsLoading(false);
            setAudioQueue((prev) => [...prev, null]); // 在队列末尾添加一个 null 以表示结束
            source.close();
            sourceRef.current = null;
        });
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
