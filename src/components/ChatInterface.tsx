import Markdown from "react-markdown";
import { type Components } from "react-markdown";
import InputArea from "./InputArea";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import type { FileMetadata, Message } from "@/hooks/use-conversation-manager";
import { useConversation } from "@/context/conversation_context";

const MarkdownImage: Components["img"] = ({ node, src, alt, ...props }) => {
    const newSrc = new URL(src || "", import.meta.env.VITE_STATIC_URL).toString();
    // console.log("Image src:", newSrc);
    return (
        <span className="mx-auto w-1/4 lg:w-1/3 block sm:float-left clear-both pr-2 pt-2">
            <img
                src={newSrc}
                alt={alt}
                {...props}
                className="object-contain w-full h-full"
            />
        </span>
    );
};

const MarkdownParagraph: Components["p"] = ({ node, children, ...props }) => {
    return (
        <>
            <p {...props} className="mb-2">
                {children}
            </p>
        </>
    );
};

export default function ChatInterface() {
    const { messages, isLoading } = useConversation();

    const handleClickCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success("Content copied to clipboard!!!");
        } catch (err) {
            console.error("Failed to copy content", err);
        }
    };

    return (
        <main className="flex-1 flex flex-col px-4 md:px-6 pb-4">
            <div className="flex flex-col gap-4 mx-auto w-full flex-1 mt-4 mb-12">
                {messages.map((message) => (
                    <div key={message.id}>
                        {message.role == "user" ? (
                            <div className="flex justify-end max-w-4xl">
                                <div className="bg-muted rounded-lg p-4 text-right">
                                    <p className="text-muted-foreground">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-start max-w-4xl">
                                <div className="flex flex-col bg-muted rounded-lg p-4 text-left border">
                                    <div className="mb-4 text-muted-foreground">
                                        <Markdown
                                            components={{
                                                img: MarkdownImage,
                                                p: MarkdownParagraph,
                                            }}
                                        >
                                            {message.content}
                                        </Markdown>
                                    </div>

                                    {!isLoading && (
                                        <div className="flex items-center justify-between gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-gray-200"
                                                onClick={() =>
                                                    handleClickCopy(
                                                        message.content
                                                    )
                                                }
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 hover:bg-gray-200"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 hover:bg-gray-200"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div></div>
            </div>
            <InputArea />
        </main>
    );
}
