import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { Client } from "@langchain/langgraph-sdk";
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type RefObject,
    type Dispatch,
    type SetStateAction,
} from "react";
import TTSWorker from "../workers/tts.worker.ts?worker";
// import WebWorker from "@/workers/tts.worker.ts?worker";
import { RawAudio } from "@huggingface/transformers";
import { WorkerPool } from "../workers/worker_pool"; // 导入我们的 WorkerPool
import type { TTSWorkerTask, TTSWorkerResult } from "../workers/tts.worker";
import { cleanMarkdownText, segment } from "../utils";

const client = new Client({
    apiUrl: "http://10.147.19.97:8000",
});

type Chunk = {
    event: string;
    data: {
        generation: string;
        messages: object[];
    };
};

const NUM_WORKERS = 4;

export default function useTTSApi(
    query: string,
    audioPlayer: RefObject<HTMLAudioElement | null>,
    setTextoutput: Dispatch<SetStateAction<string>>,
    addMessageHistory: (sender: string, text: string) => void
) {
    const [isLoading, setIsLoading] = useState(false);
    const [startPlaying, setStartPlaying] = useState(false); // 是否开始播放音频
    const workerPoolRef = useRef<WorkerPool<
        TTSWorkerTask,
        TTSWorkerResult
    > | null>(null);
    const resultQueueRef = useRef(
        new MinPriorityQueue<TTSWorkerResult>((item) => item.id)
    );
    const nextExpectedAudioIdRef = useRef(0);
    const isPlayingRef = useRef(false);
    const textChunkIdRef = useRef(0);
    const currentObjectUrlRef = useRef<string | null>(null);
    const textRef = useRef("");

    // --- 消费者：音频播放逻辑 ---
    const consumeAudioQueue = useCallback(() => {
        // 检查是否播放了最后一个音频, 如果是则设置 startPlaying 为 false
        if (nextExpectedAudioIdRef.current >= textChunkIdRef.current) {
            setStartPlaying(false);
        }

        if (isPlayingRef.current || resultQueueRef.current.isEmpty()) return;

        if (!audioPlayer.current) return;

        const nextAudio = resultQueueRef.current.front();
        if (nextAudio && nextAudio.id === nextExpectedAudioIdRef.current) {
            setStartPlaying(true);

            isPlayingRef.current = true;
            const resultItem = resultQueueRef.current.dequeue();
            if (!resultItem) {
                return;
            }
            console.log(`[消费者]正在消费 [音频 ${resultItem.id}]`);

            // 设置文本输出
            setTextoutput(textRef.current);
            const audio = new RawAudio(
                resultItem.audio.audio,
                resultItem.audio.sampling_rate
            );

            const blob = audio.toBlob();
            const url = URL.createObjectURL(blob);

            // 清理上一个 ObjectURL
            if (currentObjectUrlRef.current) {
                URL.revokeObjectURL(currentObjectUrlRef.current);
            }

            console.log(url);

            audioPlayer.current.src = url;
            audioPlayer.current.play().catch((e) => {
                console.error("Audio playback failed: ", e);
                isPlayingRef.current = false;
            });
        }
    }, []);

    // 初始化音频播放器
    const handlePlaybackEnded = useCallback(() => {
        isPlayingRef.current = false;
        nextExpectedAudioIdRef.current++;
    }, []);

    // --- 初始化和清理 ---
    useEffect(() => {
        if (!audioPlayer.current) {
            return;
        }

        // 初始化 Worker 池
        // const workerUrl = new URL("../workers/tts.worker.ts", import.meta.url); // <- 移除这一行
        workerPoolRef.current = new WorkerPool<TTSWorkerTask, TTSWorkerResult>(
            TTSWorker,
            NUM_WORKERS
        );

        audioPlayer.current.addEventListener("ended", handlePlaybackEnded);

        // 消费者线程
        const consumerInterval = setInterval(() => {
            consumeAudioQueue();
        }, 100);

        // 清理函数
        return () => {
            clearInterval(consumerInterval);
            audioPlayer.current?.removeEventListener(
                "ended",
                handlePlaybackEnded
            );
            workerPoolRef.current?.terminate();
            if (currentObjectUrlRef.current) {
                URL.revokeObjectURL(currentObjectUrlRef.current);
            }
        };
    }, [audioPlayer]);

    // 添加任务
    const submitQuery = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsLoading(true);
        addMessageHistory("user", query);

        try {
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
                    textRef.current = newText;

                    // 添加聊天记录
                    addMessageHistory("bot", newText);

                    console.log(`LLM 的生成文本: ${newText}`);
                    const cleaned_text = cleanMarkdownText(newText);
                    console.log(`清理后的文本: ${cleaned_text}`);

                    // 生产者逻辑
                    const sentences = segment(cleaned_text, 64);
                    console.log(`划分为 ${sentences.length} 个段落`);
                    for (const sentence of sentences) {
                        if (sentence.trim()) {
                            const currentId = textChunkIdRef.current++;

                            console.log(
                                `添加 [任务 ${currentId}]: ${sentence}`
                            );
                            // 提交任务到 WorkerPool
                            workerPoolRef.current
                                ?.run(
                                    { text: sentence, id: currentId },
                                    currentId
                                )
                                .then((result) => {
                                    // 任务完成，将结果放入结果队列
                                    resultQueueRef.current.enqueue(result);
                                    // 尝试播放
                                    consumeAudioQueue();
                                })
                                .catch((error) => {
                                    console.error(
                                        `Task ID ${currentId} failed:`,
                                        error
                                    );
                                });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("An error occurred during the stream:", error);
            addMessageHistory("system", "Sorry, an error occurred.");
        } finally {
            await workerPoolRef.current?.completed();
            setIsLoading(false);
            console.log("所有任务均已完成");
        }
    };

    return {
        isLoading,
        startPlaying,
        submitQuery,
    };
}
