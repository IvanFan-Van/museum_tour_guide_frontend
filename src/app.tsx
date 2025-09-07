import { useState, useRef, useEffect } from "react";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import ChatDisplay from "./components/ChatDisplay";
import ChatHistoryButton from "./components/ChatHistoryButton";
import ChatHistoryDisplay from "./components/ChatHistoryDisplay";
import SettingsButton from "./components/SettingsButton";
import Logo from "./assets/UMAG-logo.svg";
import ScannerPage from "./components/ScannerPage";
import useTTSApi from "./hooks/useTTSApi";
import InputTextDisplay from "./components/InputTextDisplay";
import MainButton from "./components/MainButton";
import CameraButton from "./components/CameraButton";
import QRCodeButton from "./components/QRCodeButton";

interface Message {
    sender: string;
    text: string;
    image: string;
}

export default function App() {
    // State for the text shown in the main display
    const [textOutput, setTextOutput] = useState("Hi! How can I help you?");
    const [textInput, setTextInput] = useState("");
    // State to determine if qr code scanner mode is active
    const [scannerMode, setScannerMode] = useState(false);
    const [qrValue, setQrValue] = useState("");

    // State for message histroy
    const [messageHistory, setMessageHistory] = useState<Message[]>([
        { sender: "bot", text: "Hi! How can I help you?", image: "" },
    ]);
    // State to determine whether to display chat history in place of current output
    const [displayHistory, setDisplayHistory] = useState(false);
    // --- LOGIC HOOKS ---
    const {
        isRecording, // Is the client recording
        setTranscript,
        startRecording,
        stopRecording,
    } = useSpeechRecognition();
    const audioRef = useRef<HTMLAudioElement>(null);

    /**
     * 添加历史记录
     * @param sender 发送者
     * @param text 文本
     * @param image 图像
     */
    const addMessageHistory = (
        sender: string,
        text: string,
        image: string = ""
    ) => {
        setMessageHistory((prev) => [...prev, { sender, text, image: image }]);
    };

    const { isLoading, startPlaying, submitQuery } = useTTSApi(
        textInput,
        audioRef,
        setTextOutput,
        addMessageHistory
    );

    // --- UI REFS & EFFECTS ---
    const chatTextAreaRef = useRef<HTMLDivElement>(null);
    const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

    // Handle voice input toggle
    const handleVoiceInput = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setTextInput("");
            setTranscript("");
            startRecording();
        }
    };

    // Auto-scroll textarea to the bottom
    useEffect(() => {
        if (inputTextAreaRef.current) {
            inputTextAreaRef.current.scrollTop =
                inputTextAreaRef.current.scrollHeight;
        }
    }, [textInput]);

    useEffect(() => {
        if (chatTextAreaRef.current) {
            chatTextAreaRef.current.scrollTop =
                chatTextAreaRef.current.scrollHeight;
        }
    }, [textOutput]);

    // Auto return to chat screen when scanner scans anything
    useEffect(() => {
        setScannerMode(false);
        console.log(qrValue);
    }, [qrValue]);

    // QR Code Scanner Screen
    if (scannerMode) {
        return (
            <ScannerPage
                setQrValue={setQrValue}
                setScannerMode={setScannerMode}
            />
        );
    }

    const hasText = textInput.trim().length > 0;

    // Chatbot Screen
    return (
        <div className="px-8 py-6 flex flex-col h-screen bg-linear-to-t from-[#252733] to-[#493E51] font-sans">
            <header className="text-white flex items-center justify-between relative text-5xl gap-4">
                <ChatHistoryButton
                    setIsOpen={setDisplayHistory}
                    isOpen={displayHistory}
                />
                <div className="w-auto">
                    <img src={Logo} className="w-full" />
                </div>

                <SettingsButton />
            </header>
            <main className="flex-1 py-6 flex flex-col items-center justify-center relative overflow-hidden">
                {/* CHAT HISTORY */}
                {displayHistory ? (
                    <ChatHistoryDisplay messageHistory={messageHistory} />
                ) : (
                    <ChatDisplay
                        textareaRef={chatTextAreaRef}
                        displayedText={textOutput}
                    />
                )}

                {/* INPUT AREA */}
                <InputTextDisplay
                    text={textInput}
                    setTextInput={setTextInput}
                    isRecording={isRecording}
                    isLoading={isLoading}
                    inputTextAreaRef={inputTextAreaRef}
                />

                {/* BUTTON GROUP */}
                <div className="w-full flex items-center gap-8 justify-between text-3xl text-gray-200">
                    <CameraButton />
                    <MainButton
                        startPlaying={startPlaying}
                        isRecording={isRecording}
                        isLoading={isLoading}
                        hasText={hasText}
                        onRecordClick={handleVoiceInput}
                        onSendClick={submitQuery}
                    />
                    <QRCodeButton
                        isLoading={isLoading}
                        setScannerMode={setScannerMode}
                    />
                </div>
            </main>
            <audio ref={audioRef} />
        </div>
    );
}
