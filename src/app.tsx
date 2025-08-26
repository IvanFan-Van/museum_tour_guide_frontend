import { useState, useRef, useEffect } from "react";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import ChatDisplay from "./components/ChatDisplay";
import InputArea from "./components/InputArea";
import ChatHistoryButton from "./components/ChatHistoryButton";
import ChatHistoryDisplay from "./components/ChatHistoryDisplay";
import SettingsButton from "./components/SettingsButton";
import Logo from "./assets/UMAG-logo.svg";
import ScannerPage from "./components/ScannerPage";
import useTTSApi from "./hooks/useTTSApi";

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
    const [msgHistory, setMsgHistory] = useState<Message[]>([]);
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

    const { isLoading, submitQuery, isPlayingRef } = useTTSApi(
        textInput,
        audioRef,
        setTextOutput,
        (sender: string, text: string) => {
            setMsgHistory((msg) => [
                ...msg,
                { sender: sender, text: text, image: "" },
            ]);
        }
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

    // Chatbot Screen
    return (
        <div className="flex flex-col h-screen bg-linear-to-t from-[#252733] to-[#493E51] font-sans">
            <header className="px-4 py-2 mx-[2vw] flex flex-row items-center justify-between relative font-sans text-4xl">
                <ChatHistoryButton
                    setIsOpen={setDisplayHistory}
                    isOpen={displayHistory}
                />
                <img src={Logo} className="max-w-[60vw]  px-4" />
                <SettingsButton />
            </header>
            <main className="mx-[2vw] flex-1 p-4 px-6 flex items-center justify-center relative overflow-hidden">
                {displayHistory ? (
                    <ChatHistoryDisplay messageHistory={msgHistory} />
                ) : (
                    <ChatDisplay
                        textareaRef={chatTextAreaRef}
                        displayedText={textOutput}
                    />
                )}
            </main>
            <footer className="mx-[2vw] p-6">
                <InputArea
                    isRecording={isRecording}
                    isLoading={isLoading}
                    onRecordClick={handleVoiceInput}
                    onSendClick={(e: React.FormEvent) => {
                        if (textOutput.trim().length > 0) {
                            setMsgHistory((msg) => [
                                ...msg,
                                { sender: "bot", text: textOutput, image: "" },
                            ]);
                            setTextOutput("");
                        }
                        submitQuery(e);
                    }}
                    inputTextAreaRef={inputTextAreaRef}
                    textInput={textInput}
                    setTextInput={(value) => {
                        setTranscript(value);
                        setTextInput(value);
                    }}
                    setScannerMode={setScannerMode}
                    onTakePhotoClick={setQrValue}
                />
            </footer>

            <audio ref={audioRef} />
        </div>
    );
}
