import Markdown from "react-markdown";

export default function ChatHistoryDisplay({
    messageHistory,
}: {
    messageHistory: {
        sender: string;
        text: string;
        image: string;
    }[];
}) {
    return (
        <div
            className={`overflow-y-auto flex flex-col bg-stone-900 rounded-xl w-[100%] h-[100%] p-3
            [&::-webkit-scrollbar]:w-3
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-neutral-800
            [&::-webkit-scrollbar-thumb]:duration-150
            [&::-webkit-scrollbar-thumb]:transition-all
            [&::-webkit-scrollbar-thumb:hover]:bg-neutral-600
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-track]:rounded-full`}
        >
            {messageHistory.map((msg, i) => (
                <div
                    className={
                        msg.sender === "bot"
                            ? "max-w-[75%] my-[6px] p-[12px] bg-[#473246] rounded-xl self-start"
                            : "max-w-[75%] my-[6px] p-[12px] bg-[#3D355D] rounded-xl self-end"
                    }
                    key={i}
                >
                    <div className="text-xs text-white">
                        <Markdown>{msg.text + "\n" + msg.image}</Markdown>
                    </div>
                </div>
            ))}
        </div>
    );
}
