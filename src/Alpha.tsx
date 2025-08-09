import { useState, useRef, useEffect } from "react";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import ChatDisplay from "./components/ChatDisplay";
import useTextToSpeechAPI from "./hooks/useTextToSpeechAPI";
import useAudioPlayer from "./hooks/useAudioPlayer";
import useTypewriter from "./hooks/useTypeWriter";
import InputArea from "./components/InputArea";
import ChatHistoryButton from "./components/ChatHistoryButton";
import ChatHistoryDisplay from "./components/ChatHistoryDisplay";
import SettingsButton from "./components/SettingsButton";
import Logo from "./assets/UMAG-logo.svg";
import ScannerPage from "./components/ScannerPage";

interface Message {
    sender: string,
    text: string,
    image: string
}



export default function Alpha() {
    // State for the text shown in the main display
    const [textOutput, setTextOutput] = useState(`Oh, the Kangxi porcelain from Jingdezhen? That stuff was a real game-changer for European ceramics. Here's the scoop: during the Kangxi period (1662–1722), Chinese artisans perfected techniques like the “powder blue” glaze (where they blew cobalt blue through bamboo tubes!) and ornate multi-step painting styles, like the "Long Eliza" motif featuring slender elegant figures. These porcelain wares weren’t just stunning—they were also ridiculously intricate to produce, which made them luxury items in European markets.  

European manufacturers, especially those in places like Worcester in England, were obsessed with mimicking Kangxi designs. They couldn’t initially replicate the Chinese hard-paste porcelain formula, so they created soft-paste porcelain, taking inspiration from the motifs and patterns of import wares. The "Long Eliza" figures? You’d find them peppered all over British plates and bowls during this time!

Here’s one of the iconic pieces featuring the powder blue glaze and detailed designs that wowed European consumers:  
![](https://cdn-mineru.openxlab.org.cn/result/2025-07-27/26ec8c02-599c-4b79-9876-e092d6287e02/c98871958c5499de21bb459198c2901658b12abdafc06a3b4fdbf2035d6e4697.jpg)  
And another with exquisite detail:  
![](https://cdn-mineru.openxlab.org.cn/result/2025-07-27/26ec8c02-599c-4b79-9876-e092d6287e02/0cc02fb6b7586efcedbed5f97e772400067122497506e0b8f7c5326eef0721f0.jpg)  

What’s super interesting is how porcelain fever eventually pushed Europeans to crack the secret of true hard-paste porcelain. By 1708, Johann Friedrich Böttger in Meissen, Germany, finally figured it out, marking the start of European competition. Before that, though, Kangxi-period porcelain was the benchmark designers in Europe aspired to copy.

Have you seen any of these “Long Eliza” motifs on European ceramics before? They're such a fun little crossover between cultures!`);
    const [textInput, setTextInput] = useState("");
    const [imageInput, setImageInput] = useState("");
    // State to determine if qr code scanner mode is active
    const [scannerMode, setScannerMode] = useState(false);
    const [qrValue, setQrValue] = useState("");

    // State for message histroy
    const [msgHistory, setMsgHistory] = useState<Message[]>([])
    // State to determine whether to display chat history in place of current output
    const [displayHistory, setDisplayHistory] = useState(false);
    // --- LOGIC HOOKS ---
    const {
        isRecording,    // Is the client recording
        transcript,     // STT output
        setTranscript,
        startRecording,
        stopRecording,
    } = useSpeechRecognition();

    const {
        isLoading,
        audioQueue,
        setAudioQueue,
        submitQuery         // Submits query to backend, adds query to msg history, addes fetched response to history
    } = useTextToSpeechAPI(transcript, imageInput,
        (sender: string, text: string, image: string) => {
            setMsgHistory(msg => [...msg,
            { sender: sender, text: text, image: image }
            ]);
        }
    );

    const audioRef = useRef<HTMLAudioElement>(null);
    const { isPlaying, currentItem } = useAudioPlayer({
        audioQueue,
        setAudioQueue,
        audioRef,
    });

    const audioDuration = audioRef.current?.duration ?? 0;
    const { typewriterText, setTypewriterText } = useTypewriter(
        currentItem?.text ?? null,
        audioDuration > 1 ? audioDuration - 0.5 : 3
    );

    // --- UI REFS & EFFECTS ---
    const chatTextAreaRef = useRef<HTMLDivElement>(null);
    const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

    // Sync different text sources to the main display
    useEffect(() => {
        if (isRecording) {
            setTextInput(transcript);
        }
        if (currentItem) {
            setTextOutput(typewriterText);
        }
    }, [isRecording, transcript, currentItem, typewriterText]);

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
            inputTextAreaRef.current.scrollTop = inputTextAreaRef.current.scrollHeight;
        }
    }, [textInput]);

    useEffect(() => {
        if (chatTextAreaRef.current) {
            chatTextAreaRef.current.scrollTop = chatTextAreaRef.current.scrollHeight;
        }
    }, [textOutput]);

    // Auto return to chat screen when scanner scans anything
    useEffect(() => {
        setScannerMode(false);
        console.log(qrValue)
    }, [qrValue])

    // QR Code Scanner Screen
    if (scannerMode) {
        return (<ScannerPage setQrValue={setQrValue} setScannerMode={setScannerMode} />)
    }

    // Chatbot Screen
    return (
        <div className="flex flex-col h-screen bg-linear-to-t from-[#252733] to-[#493E51] font-sans">
            <header className="px-4 py-2 mx-[2vw] flex flex-row items-center justify-between relative font-sans text-4xl">
                <ChatHistoryButton setIsOpen={setDisplayHistory} isOpen={displayHistory} />
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
                    isPlaying={isPlaying}
                    hasText={transcript.trim().length > 0}
                    onRecordClick={handleVoiceInput}
                    onSendClick={(e: React.FormEvent) => {
                        if (textOutput.trim().length > 0) {

                            setMsgHistory(msg => [...msg,
                            { sender: "bot", text: textOutput, image: "" }
                            ]);
                            setTextOutput("");
                            setTypewriterText("");
                        }
                        submitQuery(e);
                    }}
                    onTakePhotoClick={setImageInput}
                    inputTextAreaRef={inputTextAreaRef}
                    textInput={textInput}
                    setTextInput={
                        (value) => {
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

