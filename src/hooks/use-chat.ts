import { getDecoder } from "@/hooks/audioDecoders";
import type { ArtifactResultPayload, WSMessage } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

// Safari 使用 webkitAudioContext，扩展 Window 类型声明以避免 any
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

export function useChat({
    api,
    options,
}: {
    api: string;
    options?: Record<string, unknown>;
}) {
    const [response, setResponse] = useState<string>("");
    const [audioQueue, setAudioQueue] = useState<(string | null)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [artifact, setArtifact] = useState<ArtifactResultPayload | null>(null);
    const [usedWebSearch, setUsedWebSearch] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);
    // 保存最近一次请求的 query、session_id 和 language，用于重试
    const lastQueryRef = useRef<string | null>(null);
    const lastSessionIdRef = useRef<string | null>(null);
    const lastLanguageRef = useRef<"en" | "zh" | null>(null);
    const currentAudioIdRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    // 使用 ref 追踪播放状态，避免闭包问题
    const isPlayingRef = useRef<boolean>(false);
    // 预解码的 AudioBuffer 队列
    const audioBufferQueueRef = useRef<AudioBuffer[]>([]);
    // 每次发送新消息时递增，用于使旧的 processAudioQueue 协程立即失效
    const audioGenerationRef = useRef<number>(0);
    // 当前正在调度的 AudioBufferSourceNode，用于在新消息时立即停止
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // initialize audio context
    useEffect(() => {
        audioContextRef.current = new (
            window.AudioContext || window.webkitAudioContext
        )({ sampleRate: 24000 });

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // 从队列中取出 AudioBuffer 并播放
    const playNextBuffer = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            const audioBuffer = audioBufferQueueRef.current.shift();

            if (!audioBuffer || !audioContextRef.current) {
                resolve();
                return;
            }
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            currentSourceRef.current = source;

            source.onended = () => {
                if (currentSourceRef.current === source) {
                    currentSourceRef.current = null;
                }
                resolve();
            };
            source.start(0);
        });
    }, []);

    const processAudioQueue = useCallback(async (generation: number) => {
        if (isPlayingRef.current) return;
        isPlayingRef.current = true;
        setIsAudioPlaying(true);
        while (
            audioBufferQueueRef.current.length > 0 &&
            generation === audioGenerationRef.current
        ) {
            await playNextBuffer();
        }
        // Only update shared state if this coroutine is still the active generation
        if (generation === audioGenerationRef.current) {
            isPlayingRef.current = false;
            setIsAudioPlaying(false);
        }
    }, [playNextBuffer]);

    const suspendAudio = useCallback(async () => {
        await audioContextRef.current?.suspend();
        setIsAudioPlaying(false);
    }, []);

    const resumeAudio = useCallback(async () => {
        await audioContextRef.current?.resume();
        if (isPlayingRef.current) {
            setIsAudioPlaying(true);
        }
    }, []);

    // 根据 Blob 的 MIME type 自动选择解码器（PCM16 或 MP3），解码后加入播放队列
    const decodeAndEnqueue = useCallback(
        async (blob: Blob) => {
            if (!audioContextRef.current) return;

            try {
                const decoder = getDecoder(blob);
                console.info(
                    `Decoding audio chunk: type="${blob.type || "(empty)"}", decoder=${decoder.constructor.name}`,
                );
                const audioBuffer = await decoder.decode(
                    blob,
                    audioContextRef.current,
                );
                audioBufferQueueRef.current.push(audioBuffer);

                // 如果当前没在播放，启动播放
                if (!isPlayingRef.current) {
                    processAudioQueue(audioGenerationRef.current);
                }
            } catch (error) {
                console.error("Error decoding audio chunk:", error);
            }
        },
        [processAudioQueue],
    );

    const sendMessage = (queryParam?: string, sessionId?: string, language?: "en" | "zh") => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setResponse("");
        setAudioQueue([]);
        setQuery("");
        setCurrentStatus(null);
        setArtifact(null);
        setUsedWebSearch(false);
        setIsAudioPlaying(false);
        currentAudioIdRef.current = 0;
        // Increment generation — invalidates any in-flight processAudioQueue coroutine
        audioGenerationRef.current++;
        // Stop the currently playing source immediately to prevent overlap
        try {
            currentSourceRef.current?.stop();
        } catch {
            // Source may have already ended naturally
        }
        currentSourceRef.current = null;
        audioBufferQueueRef.current = [];
        isPlayingRef.current = false;
        // Ensure AudioContext is running for the new audio stream (in case it was suspended)
        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }

        // 构建请求
        const effectiveQuery = queryParam || query;
        lastQueryRef.current = effectiveQuery;
        lastSessionIdRef.current = sessionId ?? null;
        lastLanguageRef.current = language ?? null;
        const payload = {
            query: effectiveQuery,
            doc_id: options?.doc_id || null,
            session_id: sessionId ?? null,
            language: language ?? "en",
        };
        console.info("request params: \n", JSON.stringify(payload, null, 2));

        // 获取数据
        const socket = new WebSocket(api);
        socketRef.current = socket;

        socket.onopen = () => {
            console.info("WebSocket connection established.");
            socket.send(JSON.stringify(payload));
        };

        socket.onerror = () => {
            console.error("WebSocket error: unable to connect to the server.");
            setError("Unable to connect to the server, please check your network and try again.");
            setIsLoading(false);
            setCurrentStatus(null);
        };

        socket.onclose = (event) => {
            // 非正常关闭（code 1000 为正常关闭）
            if (event.code !== 1000) {
                // 如果 onerror 已经设置了 error，则不重复设置
                setError((prev) =>
                    prev ? prev : "Unexpectedly disconnected, please try again.",
                );
                setIsLoading(false);
                setCurrentStatus(null);
            }
        };

        socket.onmessage = async (event) => {
            if (typeof event.data === "string") {
                const message: WSMessage = JSON.parse(event.data);

                switch (message.type) {
                    case "text_chunk":
                        setResponse((prev) => prev + message.payload.content);
                        setCurrentStatus(null);
                        if (message.payload.is_final) {
                            setIsLoading(false);
                        }

                        break;
                    case "status":
                        if (message.payload.status === "error") {
                            setError(message.payload.detail || "An error occurred while processing the request, please try again.");
                            setIsLoading(false);
                            setCurrentStatus(null);
                        } else {
                            setCurrentStatus(message.payload.detail);
                            if (message.payload.status === "searching") {
                                setUsedWebSearch(true);
                            }
                        }
                        break;
                    case "artifact":
                        setArtifact(message.payload);
                        break;
                    default:
                        console.log(message);
                }
            } else if (event.data instanceof Blob) {
                decodeAndEnqueue(event.data);
            } else {
                console.warn(
                    "Received unknown data type from WebSocket.",
                    event.data,
                    typeof event.data,
                );
            }
        };
    };

    /** 使用上一次的 query 重新发送请求 */
    const retryLastMessage = () => {
        if (lastQueryRef.current) {
            sendMessage(
                lastQueryRef.current,
                lastSessionIdRef.current ?? undefined,
                lastLanguageRef.current ?? undefined,
            );
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
    };

    const getNextAudio = (): string | null => {
        if (currentAudioIdRef.current < audioQueue.length) {
            console.log(
                "获取当前 audio ID 的音频: ",
                currentAudioIdRef.current,
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
        currentStatus,
        artifact,
        usedWebSearch,
        error,
        isAudioPlaying,
        suspendAudio,
        resumeAudio,
        setQuery,
        sendMessage,
        retryLastMessage,
        handleInputChange,
        getNextAudio,
    };
}
