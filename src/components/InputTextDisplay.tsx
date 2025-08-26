import type { Dispatch, Ref, SetStateAction } from "react";
export default function InputTextDisplay({
    text,
    setTextInput,
    isLoading,
    isRecording,
    inputTextAreaRef,
}: {
    text: string;
    image: string;
    setTextInput: Dispatch<SetStateAction<string>>;
    isRecording: boolean;
    isLoading: boolean;
    inputTextAreaRef: Ref<HTMLTextAreaElement> | undefined;
}) {
    return (
        <div className="rounded-lg outline-2 outline-gray-500/75 mb-[4vh]">
            <textarea
                ref={inputTextAreaRef}
                value={text}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : ""}
                disabled={isLoading}
                className="w-full h-full bg-transparent resize-none focus:outline-none text-left text-xl sm:text-4xl text-[#fff] px-2 py-2"
                style={{
                    fontFamily: "Georgia, serif",
                    maskImage:
                        "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                }}
            />
        </div>
    );
}
