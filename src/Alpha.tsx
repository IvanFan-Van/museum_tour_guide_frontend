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

import * as ort from "onnxruntime-web/webgpu";

interface Message {
    sender: string;
    text: string;
    image: string;
}

export default function Alpha() {
    // State for the text shown in the main display
    const [textOutput, setTextOutput] = useState("Hi! How can I help you?");
    const [textInput, setTextInput] = useState("");
    const [imageInput, setImageInput] = useState("");
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
        transcript, // STT output
        setTranscript,
        startRecording,
        stopRecording,
    } = useSpeechRecognition();
    const audioRef = useRef<HTMLAudioElement>(null);

    const { typewriterText, setTypewriterText, isLoading, submitQuery } =
        useTTSApi(transcript, audioRef, (sender: string, text: string) => {
            setMsgHistory((msg) => [
                ...msg,
                { sender: sender, text: text, image: "" },
            ]);
        });

    // --- UI REFS & EFFECTS ---
    const chatTextAreaRef = useRef<HTMLDivElement>(null);
    const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

    // Sync different text sources to the main display
    // useEffect(() => {
    //     if (isRecording) {
    //         setTextInput(transcript);
    //     }
    //     if (currentItem) {
    //         setTextOutput(typewriterText);
    //     }
    // }, [isRecording, transcript, currentItem, typewriterText]);

    // Handle voice input toggle
    const handleVoiceInput = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setTextInput("");
            setTranscript("");
            setTypewriterText("");
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

    useEffect(() => {
        async function main() {
            const session = await ort.InferenceSession.create("./model.onnx");
        }
    }, []);

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
                    isPlaying={false}
                    hasText={transcript.trim().length > 0}
                    onRecordClick={handleVoiceInput}
                    onSendClick={(e: React.FormEvent) => {
                        if (textOutput.trim().length > 0) {
                            setMsgHistory((msg) => [
                                ...msg,
                                { sender: "bot", text: textOutput, image: "" },
                            ]);
                            setTextOutput("");
                            setTypewriterText("");
                        }
                        submitQuery(e);
                    }}
                    onTakePhotoClick={setImageInput}
                    inputTextAreaRef={inputTextAreaRef}
                    textInput={textInput}
                    setTextInput={(value) => {
                        setTranscript(value);
                        setTextInput(value);
                    }}
                    setScannerMode={setScannerMode}
                    imageInput={imageInput}
                />
            </footer>

            <audio ref={audioRef} />
        </div>
    );
}
