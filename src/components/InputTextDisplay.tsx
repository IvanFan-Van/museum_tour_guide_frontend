import type { Dispatch, Ref, SetStateAction } from "react";
export default function InputTextDisplay({
  text,
  setTextInput,
  isLoading,
  isRecording,
  inputTextAreaRef,
}: {
  text: string;
  setTextInput: Dispatch<SetStateAction<string>>;
  isRecording: boolean;
  isLoading: boolean;
  inputTextAreaRef: Ref<HTMLTextAreaElement> | undefined;
}) {
  return (
    <div className="rounded-lg outline-4 outline-gray-500/75 mb-[4vh]">
      <textarea
        ref={inputTextAreaRef}
        value={text}
        onChange={(e) => setTextInput(e.target.value)}
        onInput={(e) => {
          const ta = e.target as HTMLTextAreaElement;
          ta.style.height = "auto";
          ta.style.height = ta.scrollHeight + "px";
        }}
        placeholder={isRecording ? "Listening..." : ""}
        disabled={isLoading}
        rows={1}
        className="w-full bg-transparent resize-none focus:outline-none text-left text-xl sm:text-4xl text-[#fff] px-2 py-2 min-h-[32px] max-h-[40vh] transition-all duration-200 overflow-y-auto"
      />
    </div>
  );
}
