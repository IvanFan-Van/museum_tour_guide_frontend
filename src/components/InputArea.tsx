import RecordButton from "./RecordButton";
import SendButton from "./SendButton";
import TakePhotoButton from "./TakePhotoButton";
import type { Dispatch, Ref, SetStateAction } from "react";
import InputTextDisplay from "./InputTextDisplay";

import SoundWave from "./SoundWave";
import MainButton from "./MainButton";
import QRCodeButton from "./QRCodeButton";

export default function InputArea({
    isRecording,
    isLoading,
    textInput,
    startPlaying,
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
    startPlaying: boolean;
    setTextInput: Dispatch<SetStateAction<string>>;
    onRecordClick: () => void;
    onSendClick: (e: React.FormEvent) => void;
    onTakePhotoClick: Dispatch<SetStateAction<string>>;
    setScannerMode: Dispatch<SetStateAction<boolean>>;
    inputTextAreaRef: Ref<HTMLTextAreaElement> | undefined;
}) {
    const hasText = textInput.trim().length > 0;

    return (
        <div className="flex flex-col w-full">
            <InputTextDisplay
                text={textInput}
                setTextInput={setTextInput}
                isRecording={isRecording}
                isLoading={isLoading}
                inputTextAreaRef={inputTextAreaRef}
            />
            {/* BUTTON GROUP */}
            <div className="flex items-center gap-4 justify-between text-4xl text-gray-200">
                <TakePhotoButton onClick={onTakePhotoClick} />
                <MainButton
                    startPlaying={startPlaying}
                    isRecording={isRecording}
                    isLoading={isLoading}
                    hasText={hasText}
                    onRecordClick={onRecordClick}
                    onSendClick={onSendClick}
                />
                <QRCodeButton
                    isLoading={isLoading}
                    setScannerMode={setScannerMode}
                />
            </div>
        </div>
    );
}
