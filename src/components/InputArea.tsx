import RecordButton from "./RecordButton";
import WaveformButton from "./WaveformButton";
import SendButton from "./SendButton";
import TakePhotoButton from "./TakePhotoButton"
import type { Dispatch, Ref, SetStateAction } from "react";
import InputTextDisplay from "./InputTextDisplay";
import QRCodeIcon from "../assets/QRCode.svg"

export default function InputArea({
    isRecording,
    isLoading,
    isPlaying,
    hasText,
    textInput,
    imageInput,
    setTextInput,
    onRecordClick,
    onSendClick,
    onTakePhotoClick,
    setScannerMode,
    inputTextAreaRef
}: {
    isRecording: boolean,
    isLoading: boolean,
    hasText: boolean,
    isPlaying: boolean,
    textInput: string,
    imageInput: string,
    setTextInput: Dispatch<SetStateAction<string>>
    onRecordClick: () => void,
    onSendClick: (e: React.FormEvent) => void,
    onTakePhotoClick: Dispatch<SetStateAction<string>>
    setScannerMode: Dispatch<SetStateAction<boolean>>
    inputTextAreaRef: Ref<HTMLTextAreaElement> | undefined,
}) {
    return (
        <div className="flex flex-col">
            <InputTextDisplay
                text={textInput}
                setTextInput={setTextInput}
                image={imageInput}
                isRecording={isRecording}
                isLoading={isLoading}
                inputTextAreaRef={inputTextAreaRef}
            />
            <div className="flex items-center justify-between">
                <TakePhotoButton onClick={onTakePhotoClick} />
                <div className="flex items-center justify-center px-4">
                    {isRecording || (!hasText && !isLoading) ? (<RecordButton
                        isRecording={isRecording}
                        isLoading={isLoading}
                        onRecordClick={onRecordClick}
                    />) : (isPlaying ? (
                        <WaveformButton stopPlaying={() => {return;}} isPlaying={false}/>
                    ) : (<SendButton
                        isRecording={isRecording}
                        isLoading={isLoading}
                        hasText={hasText}
                        onSendClick={onSendClick}
                    />))
                    }
                </div>
                <div className="size-[7vh] rounded-full focus:outline-none transition-all duration-200 flex items-center hover:opacity-50">
                    <button disabled={isLoading} onClick={() => setScannerMode(true)}>
                        <img src={QRCodeIcon}/>
                    </button>
                </div>
            </div>
        </div>

    );

}