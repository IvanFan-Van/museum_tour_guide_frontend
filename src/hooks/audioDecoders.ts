/**
 * 音频解码器策略接口
 */
export interface AudioDecoder {
    decode(blob: Blob, audioContext: AudioContext): Promise<AudioBuffer>;
    canHandle(blob: Blob): boolean;
}

/**
 * PCM16 格式解码器
 *
 * 处理原始 PCM 16-bit 小端数据，固定采样率 24 kHz、单声道。
 * 匹配 MIME type: "audio/pcm" | "audio/x-pcm" | "audio/l16"
 */
export class PCM16Decoder implements AudioDecoder {
    private readonly sampleRate: number;

    constructor(sampleRate = 24000) {
        this.sampleRate = sampleRate;
    }

    canHandle(blob: Blob): boolean {
        const type = blob.type.toLowerCase();
        return (
            type.includes("pcm") ||
            type.includes("audio/l16") ||
            type.includes("raw")
        );
    }

    async decode(blob: Blob, audioContext: AudioContext): Promise<AudioBuffer> {
        const buffer = await blob.arrayBuffer();
        const int16Array = new Int16Array(buffer);
        const float32Array = new Float32Array(int16Array.length);

        // 将 PCM int16 转换为 [-1, 1] 范围的 float32
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        const audioBuffer = audioContext.createBuffer(
            1, // mono
            float32Array.length,
            this.sampleRate,
        );
        audioBuffer.getChannelData(0).set(float32Array);

        return audioBuffer;
    }
}

/**
 * MP3 格式解码器
 *
 * 使用 Web Audio API 的 decodeAudioData 解码 MP3，
 * 采样率和声道数由编码本身决定，无需手动指定。
 * 匹配 MIME type: "audio/mpeg" | "audio/mp3"
 */
export class MP3Decoder implements AudioDecoder {
    canHandle(blob: Blob): boolean {
        const type = blob.type.toLowerCase();
        return type.includes("mpeg") || type.includes("mp3");
    }

    async decode(blob: Blob, audioContext: AudioContext): Promise<AudioBuffer> {
        const buffer = await blob.arrayBuffer();
        return audioContext.decodeAudioData(buffer);
    }
}

// 按优先级排列：PCM 需要明确的 MIME type，MP3 作为 fallback
const DECODERS: AudioDecoder[] = [new PCM16Decoder(), new MP3Decoder()];

/**
 * 根据 Blob 的 MIME type 同步返回对应的解码器。
 *
 * 匹配顺序：PCM16 → MP3 (fallback)。
 * 当 MIME type 为空或无法识别时，退回到 MP3Decoder。
 */
export function getDecoder(blob: Blob): AudioDecoder {
    for (const decoder of DECODERS) {
        if (decoder.canHandle(blob)) {
            return decoder;
        }
    }
    // MIME type 为空或无法识别时，默认使用 MP3Decoder
    return new MP3Decoder();
}
