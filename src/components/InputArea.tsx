import RecordButton from "./RecordButton";
import SendButton from "./SendButton";
import TakePhotoButton from "./TakePhotoButton";
import type { Dispatch, Ref, SetStateAction } from "react";
import InputTextDisplay from "./InputTextDisplay";
import QRCodeIcon from "../assets/QRCode.svg";

export default function InputArea({
    isRecording,
    isLoading,
    textInput,
    setTextInput,
    onRecordClick,
    onSendClick,
    onTakePhotoClick,
    setScannerMode,
    inputTextAreaRef,
}: {
    isRecording: boolean;
    isLoading: boolean;
    textInput: string;
    setTextInput: Dispatch<SetStateAction<string>>;
    onRecordClick: () => void;
    onSendClick: (e: React.FormEvent) => void;
    onTakePhotoClick: Dispatch<SetStateAction<string>>;
    setScannerMode: Dispatch<SetStateAction<boolean>>;
    inputTextAreaRef: Ref<HTMLTextAreaElement> | undefined;
}) {
    const hasText = textInput.trim().length > 0;

    return (
        <div className="flex flex-col">
            <InputTextDisplay
                text={textInput}
                setTextInput={setTextInput}
                isRecording={isRecording}
                isLoading={isLoading}
                inputTextAreaRef={inputTextAreaRef}
            />
            <div className="flex items-center gap-4">
                <TakePhotoButton onClick={onTakePhotoClick} />
                <div className="flex items-center justify-center px-4 grow-1">
                    {isRecording || (!hasText && !isLoading) ? (
                        <RecordButton
                            isRecording={isRecording}
                            isLoading={isLoading}
                            onRecordClick={onRecordClick}
                        />
                    ) : (
                        <SendButton
                            isRecording={isRecording}
                            isLoading={isLoading}
                            hasText={hasText}
                            onSendClick={onSendClick}
                        />
                    )}
                </div>
                <div className="size-[7vh] rounded-full focus:outline-none transition-all duration-200 flex items-center hover:opacity-50">
                    <button
                        disabled={isLoading}
                        onClick={() => setScannerMode(true)}
                    >
                        <img src={QRCodeIcon} className="w-14" />
                    </button>
                </div>
            </div>
        </div>
    );
}
