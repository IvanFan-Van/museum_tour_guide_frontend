import { useState } from "react";

const base64ToUint8Array = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const useTextToSpeechAPI = (query: string, addMessageHistory: (sender: string, text: string, image: string) => void) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [audioQueue, setAudioQueue] = useState<
        Array<{ url: string; text: string }>
    >([]);

    const submitQuery = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim() || isLoading) return;
        
        addMessageHistory("user", query, "")

        setIsLoading(true); // 开始加载状态

        // Get JWT Token
        const response = await fetch("http://localhost:8000/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            console.error("Error fetching audio:");
            setIsLoading(false);
            setAudioQueue([]);
            return;
        }

        // Await backend response
        const token = await response.json();
        const source = new EventSource(
            `http://localhost:8000/api/stream?token=${token}`
        );

        let isFirstChunk = true;
        source.onmessage = (event) => {
            // 如果收到了第一份 data, 则将 IsLoading 设置为 false
            if (isFirstChunk) {
                setIsLoading(false);
                isFirstChunk = false;
            }
            const data: { text: string; audio: string } = JSON.parse(
                event.data
            );

            console.log("Received data:", data);
            const bytes = base64ToUint8Array(data.audio);

            const blob = new Blob([bytes], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            // 将音频 URL 和文本添加到播放列表
            setAudioQueue((prev) => [...prev, { url, text: data.text }]);
        };

        source.onerror = (error) => {
            console.error("Error in EventSource:", error);
            source.close();
            setIsLoading(false);
        };

        source.addEventListener("done", (event) => {
            const data = JSON.parse(event.data);
            console.log("Stream ended:", data);
            source.close();
        });
    };

    return {
        isLoading,
        audioQueue,
        setAudioQueue,
        submitQuery,
    };
};

export default useTextToSpeechAPI;
