import { TextSplitterStream } from "kokoro-js";
import { Client } from "@langchain/langgraph-sdk";
import { useState, useEffect, useRef } from "react";

const client = new Client({
    apiUrl: "http://10.147.19.97:8000",
});
const splitter = new TextSplitterStream();
// KokoroTTS 初始化代码已移至 web worker

type Chunk = {
    event: string;
    data: {
        generation: string;
        messages: object[];
    };
};

export default function useTTSApi(
    query: string,
    addMessageHistory: (sender: string, text: string) => void
) {
    const [displayedText, setDisplayedText] = useState("");
    const [audioQueue, setAudioQueue] = useState<
        Array<{ url: string; text: string }>
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // 创建一个新的 worker 实例
        const worker = new Worker(
            new URL("../workers/tts.worker.ts", import.meta.url),
            {
                type: "module",
            }
        );
        workerRef.current = worker;

        // 监听来自 worker 的消息
        worker.onmessage = (
            event: MessageEvent<{
                type: string;
                url?: string;
                text?: string;
                error?: string;
            }>
        ) => {
            const { type, url, text, error } = event.data;
            if (type === "RESULT" && url && text) {
                // 将收到的音频 URL 添加到播放队列
                setAudioQueue((prev) => [...prev, { url, text }]);
            } else if (type === "INITIALIZED") {
                console.log("TTS Worker is ready.");
            } else if (type === "ERROR") {
                console.error("TTS Worker Error:", error);
            }
        };

        // 组件卸载时终止 worker
        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const submitQuery = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim() || !workerRef.current) return;

        setIsLoading(true);
        addMessageHistory("user", query);

        const assistants = await client.assistants.search({
            metadata: null,
            offset: 0,
            limit: 10,
        });
        const agent = assistants[0];
        const thread = await client.threads.create();
        const messages = [{ role: "human", content: query }];

        const streamResponse = client.runs.stream(
            thread["thread_id"],
            agent["assistant_id"],
            {
                input: { messages },
            }
        );

        for await (const chunk of streamResponse as AsyncIterable<Chunk>) {
            if (chunk["event"] == "values" && chunk["data"]["generation"]) {
                const newText = chunk["data"]["generation"];
                setDisplayedText((prev) => prev + newText);

                // 将文本块发送到 worker 进行处理
                const textToSpeak = newText.match(/\s*\S+/g) || [];
                if (textToSpeak.length > 0) {
                    workerRef.current?.postMessage({
                        text: textToSpeak.join(""),
                    });
                }
            }
        }

        splitter.flush();
        setIsLoading(false);
    };

    return {
        typewriterText: displayedText,
        setTypewriterText: setDisplayedText,
        isLoading,
        audioQueue,
        setAudioQueue,
        submitQuery,
    };
}
