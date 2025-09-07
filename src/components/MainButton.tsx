import RecordButton from "./RecordButton";
import SendButton from "./SendButton";
import SoundWave from "./SoundWave";

const MainButton = ({
    startPlaying,
    isRecording,
    isLoading,
    hasText,
    onRecordClick,
    onSendClick,
}: {
    startPlaying: boolean;
    isRecording: boolean;
    isLoading: boolean;
    hasText: boolean;
    onRecordClick: () => void;
    onSendClick: (e: React.FormEvent) => void;
}) => {
    const getButton = () => {
        if (startPlaying) {
            return <SoundWave />;
        } else if (isRecording || (!hasText && !isLoading)) {
            return (
                <RecordButton
                    isRecording={isRecording}
                    isLoading={isLoading}
                    onRecordClick={onRecordClick}
                />
            );
        } else {
            return (
                <SendButton
                    isRecording={isRecording}
                    isLoading={isLoading}
                    hasText={hasText}
                    onSendClick={onSendClick}
                />
            );
        }
    };

    return (
        <div className="bg-white flex justify-center align-center rounded-lg w-full py-2 text-3xl">
            {getButton()}
        </div>
    );
};

export default MainButton;
