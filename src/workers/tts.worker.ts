import { KokoroTTS } from "kokoro-js";

let tts: KokoroTTS | null = null;

/**
 * 异步初始化 TTS 模型。
 * 初始化完成后，向主线程发送 'INITIALIZED' 消息。
 */
async function initializeTTS() {
    console.log("Initializing TTS model...");
    const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
    try {
        tts = await KokoroTTS.from_pretrained(model_id, {
            dtype: "q8",
        });
        // 通知主线程模型已准备就绪
        self.postMessage({ type: "INITIALIZED" });
        console.log("TTS model initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize TTS model in worker:", error);
        self.postMessage({
            type: "ERROR",
            error: "Model initialization failed.",
        });
    }
}

// 启动 TTS 初始化
initializeTTS();

/**
 * 监听来自主线程的消息。
 * 当接收到文本时，使用 TTS 模型生成音频并将其 URL 发送回主线程。
 */
self.onmessage = async (event: MessageEvent<{ text: string }>) => {
    if (!tts) {
        console.error("TTS model is not yet initialized.");
        self.postMessage({ type: "ERROR", error: "TTS not initialized" });
        return;
    }

    const { text } = event.data;

    try {
        const audio = await tts.generate(text, {
            voice: "af_heart",
        });
        const blob = audio.toBlob();
        const url = URL.createObjectURL(blob);

        // 将生成的音频 URL 和原始文本发送回主线程
        self.postMessage({ type: "RESULT", url, text });
    } catch (error) {
        console.error("Error generating TTS in worker:", error);
        self.postMessage({ type: "ERROR", error: (error as Error).message });
    }
};
