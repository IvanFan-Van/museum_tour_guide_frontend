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
            className="flex items-center justify-center w-full transition-all duration-200 basis-auto fill-[rgba(217,217,217,1)] rounded-[20px] border-[none] outline-none text-center bg-gray-200 hover:bg-gray-400 text-gray-600 py-2"
            aria-label="Send"
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-12 w-12 text-white" // 进一步放大图标
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#000"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="#000"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                <svg
                    className="h-12 w-12" // 进一步放大图标
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            )}
        </button>
    );
}
