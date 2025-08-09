import type { Ref } from "react";
import Markdown from "react-markdown";

const ChatDisplay = ({
    displayedText,
    textareaRef,
}: {
    displayedText: string;
    textareaRef: Ref<HTMLDivElement> | undefined;
}) => {
    return (
        <div
            ref={textareaRef}
            className={`w-full h-full overflow-y-auto bg-transparent border-none resize-none focus:outline-none text-left text-xl sm:text-4xl text-[#fff] leading-relaxed px-4
            [&::-webkit-scrollbar]:w-3
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-neutral-600
            [&::-webkit-scrollbar-thumb]:duration-150
            [&::-webkit-scrollbar-thumb]:transition-all
            [&::-webkit-scrollbar-thumb:hover]:bg-neutral-400
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-track]:rounded-full
            `}
            style={{
                fontFamily: "Georgia, serif",
                paddingTop: "5vh",
                paddingBottom: "5vh",
                maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
            }}
        ><Markdown>{displayedText}</Markdown></div>
    );
};

export default ChatDisplay;
