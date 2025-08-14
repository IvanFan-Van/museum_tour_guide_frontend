import RecordMic from "../assets/RecordMic.svg";
import RecordCircle from "../assets/RecordCircle.svg";

export default function RecordButton({
    isRecording,
    isLoading,
    onRecordClick,
}: {
    isRecording: boolean;
    isLoading: boolean;
    onRecordClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onRecordClick}
            disabled={isLoading}
            className="flex items-center justify-center w-full grow-0 px-4 py-4 transition-all duration-200 basis-auto fill-[rgba(217,217,217,1)] rounded-[20px] border-[none] outline-none text-center bg-gray-200 hover:bg-zinc-400 text-gray-600"
            aria-label="Record voice"
        >
            <img src={isRecording ? RecordCircle : RecordMic} />
        </button>
    );
}
