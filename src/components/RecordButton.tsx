import { PiRecordFill } from "react-icons/pi";

export default function RecordButton({
    isRecording,
    isLoading,
    onRecordClick,
}: {
    isRecording: boolean;
    isLoading: boolean;
    onRecordClick: () => void;
}) {
    const color = isRecording ? "text-red-500" : "text-gray-400";

    return (
        <button
            type="button"
            onClick={onRecordClick}
            disabled={isLoading}
            aria-label="Record voice"
        >
            <PiRecordFill
                className={`transition-colors ${color} hover:text-red-400`}
            />
        </button>
    );
}
