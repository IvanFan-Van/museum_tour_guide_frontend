// import Markdown from "react-markdown";

const scrollbarStyles = `
    overflow-y-auto flex flex-col bg-stone-900 rounded-xl w-full h-full p-3
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-neutral-700
    [&::-webkit-scrollbar-thumb:hover]:bg-neutral-600
    [&::-webkit-scrollbar-thumb]:rounded-full
`;

const messageBaseStyle = "max-w-[80%] my-1 px-4 py-2 rounded-xl break-words";
const botMessageStyle = `${messageBaseStyle} bg-gray-700 self-start`;
const userMessageStyle = `${messageBaseStyle} bg-blue-800 self-end`;

interface Message {
    sender: string;
    text: string;
    image: string;
}

export default function ChatHistoryDisplay({
    messageHistory,
}: {
    messageHistory: Message[];
}) {
    const linkify = (text: string) =>
        text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" class="text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );

    return (
        <div className={`${scrollbarStyles}`}>
            {messageHistory.map((msg, i) => {
                let htmlContent = linkify(msg.text).replace(/\n/g, "<br />");
                if (msg.image) {
                    htmlContent += `<br /><img src="${msg.image}" alt="image" class="max-w-full mt-2 rounded" />`;
                }

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
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: htmlContent,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
