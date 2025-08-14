import PauseButton from "../assets/Pause.svg";

export default function WaveformButton({
    isPlaying,
    stopPlaying,
}: {
    isPlaying: boolean;
    stopPlaying: any;
}) {
    return (
        <button
            type="button"
            onClick={stopPlaying}
            disabled={!isPlaying}
            className="flex items-center justify-center w-full transition-all duration-200 basis-auto fill-[rgba(217,217,217,1)] rounded-[20px] border-[none] outline-none text-center bg-gray-200 hover:bg-zinc-400 text-gray-600"
        >
            <img src={PauseButton} className="size-10" />
        </button>
    );
}
