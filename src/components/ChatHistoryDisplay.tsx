import Markdown from "react-markdown";

const scrollbarStyles = `
    overflow-y-auto flex flex-col bg-stone-900 rounded-xl w-full h-full p-3
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-neutral-700
    [&::-webkit-scrollbar-thumb:hover]:bg-neutral-600
    [&::-webkit-scrollbar-thumb]:rounded-full
`;

const messageBaseStyle = "max-w-[80%] my-1 p-3 rounded-xl break-words";
const botMessageStyle = `${messageBaseStyle} bg-gray-700 self-start`;
const userMessageStyle = `${messageBaseStyle} bg-blue-800 self-end`;

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
        <div className={scrollbarStyles}>
            {messageHistory.map((msg, i) => {
                const messageContent = `${msg.text}${
                    msg.image ? `\n\n![image](${msg.image})` : ""
                }`;

                return (
                    <div
                        className={
                            msg.sender === "bot"
                                ? botMessageStyle
                                : userMessageStyle
                        }
                        key={i}
                    >
                        <div className="text-sm text-white">
                            <Markdown
                                components={{
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="text-blue-300 hover:underline"
                                            {...props}
                                        />
                                    ),
                                }}
                            >
                                {messageContent}
                            </Markdown>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
