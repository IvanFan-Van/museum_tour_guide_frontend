import { KokoroTTS } from "kokoro-js";
import { RawAudio } from "@huggingface/transformers";

let tts: KokoroTTS | null = null;
// 使用一个 Promise 来确保模型只被初始化一次
let ttsInitializationPromise: Promise<void> | null = null;

export interface TTSWorkerTask {
    text: string;
    id: number;
}

export interface TTSWorkerResult {
    id: number;
    audio: RawAudio;
}

/**
 * 异步初始化 TTS 模型。
 * 此函数确保模型只被加载一次。
 */
function initializeTTS() {
    if (!ttsInitializationPromise) {
        ttsInitializationPromise = (async () => {
            console.log("加载 TTS 模型...");
            const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
            let device: "wasm" | "webgpu" = "wasm";
            // if (typeof navigator !== "undefined" && "gpu" in navigator) {
            //     device = "webgpu";
            //     console.log(
            //         "Worker: WebGPU available, using for TTS inference."
            //     );
            // } else {
            //     console.log(
            //         "Worker: WebGPU not available, falling back to WASM."
            //     );
            // }
            try {
                tts = await KokoroTTS.from_pretrained(model_id, {
                    dtype: "q8",
                    device,
                });
                console.log("成功加载模型");
            } catch (error) {
                console.error("加载模型失败:", error);
                throw error; // 抛出错误以使 Promise 失败
            }
        })();
    }
    return ttsInitializationPromise;
}

initializeTTS();

// --- 消息监听器 ---
self.onmessage = async (event: MessageEvent<TTSWorkerTask>) => {
    const { text, id } = event.data;

    try {
        await initializeTTS(); // 确保模型已加载
        if (!tts) throw new Error("TTS model is not initialized.");

        const audio = await tts.generate(text, { voice: "af_heart" });

        // 将结果发送回主线程
        self.postMessage({ id, audio } as TTSWorkerResult);
    } catch (error) {
        console.error(`Worker failed on task ID ${id}:`, error);
        // 可以在这里通过 postMessage 发送一个错误对象，但 WorkerPool 的 onerror 已经可以捕获
        // self.postMessage({ id, error: error.message });
        throw error; // 抛出错误，让 WorkerPool 的 onerror 捕获
    }
};
