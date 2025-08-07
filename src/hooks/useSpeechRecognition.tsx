import { useEffect, useRef, useState } from "react";

// 定义 SpeechRecognition 接口以兼容不同浏览器
interface CustomSpeechRecognition extends SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
}

// 兼容不同浏览器的 SpeechRecognition
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    // 用于存储已确认的最终识别文本
    const [transcript, setTranscript] = useState<string>("");
    // 对 SpeechRecognition 实例的引用
    const recognitionRef = useRef<CustomSpeechRecognition | null>(null);

    // 初始化语音识别
    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn(
                "Speech Recognition is not supported in this browser."
            );
            return;
        }

        const recognition = new SpeechRecognition() as SpeechRecognition;
        recognition.continuous = true; // 持续识别
        recognition.interimResults = true; // 返回临时结果
        recognition.lang = "en-US"; // 设置语言

        // 处理识别结果
        recognition.onresult = (event) => {
            const interimTranscript = [];
            const currentFinalTranscript = [];

            for (let i = 0; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentFinalTranscript.push(transcript);
                } else {
                    interimTranscript.push(transcript);
                }
            }
            // 更新最终识别文本
            setTranscript(
                currentFinalTranscript.join(" ") +
                    " " +
                    interimTranscript.join(" ")
            );
        };

        // 录音结束时
        recognition.onend = () => {
            console.log("Speech recognition ended");
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            // 当未检测到录音时不处理
            if (event.error === "no-speech") {
                return;
            }
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
    }, []);

    const startRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsRecording(true);
            setTranscript(""); // 清空之前的转录文本
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    return {
        isRecording,
        transcript,
        startRecording,
        stopRecording,
        setTranscript,
        recognitionRef,
    };
}

export default useSpeechRecognition;
