import { GrSend } from "react-icons/gr";

export default function SendButton({
    isRecording,
    isLoading,
    hasText,
    onSendClick,
}: {
    isRecording: boolean;
    isLoading: boolean;
    hasText: boolean;
    onSendClick: (e: React.FormEvent) => void;
}) {
    return (
        <button
            type="button"
            onClick={onSendClick}
            disabled={isLoading || !hasText || isRecording}
            aria-label="Send"
        >
            {isLoading ? (
                <div className="loader"></div>
            ) : (
                <GrSend className="text-gray-400" />
            )}
        </button>
    );
}
