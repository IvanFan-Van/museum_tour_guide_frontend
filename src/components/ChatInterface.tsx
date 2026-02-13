import Markdown from "react-markdown";
import { type Components } from "react-markdown";
import InputArea from "./InputArea";
import { Copy, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useConversation } from "@/hooks/use-conversation";
import { Spinner } from "./ui/spinner";

const MarkdownImage: Components["img"] = ({
    node: _node,
    src,
    alt,
    ...props
}) => {
    const newSrc = new URL(
        src || "",
        import.meta.env.VITE_STATIC_URL,
    ).toString();
    // console.log("Image src:", newSrc);
    return (
        <span className="mx-auto w-full sm:w-1/4 block sm:float-left clear-both pr-2 pt-2">
            <img
                src={newSrc}
                alt={alt}
                {...props}
                className="object-contain w-full h-full"
            />
        </span>
    );
};

const MarkdownParagraph: Components["p"] = ({
    node: _node,
    children,
    ...props
}) => {
    return (
        <>
            <p {...props} className="mb-2 text-sm lg:text-base">
                {children}
            </p>
        </>
    );
};

const MarkdownHorizontalRule: Components["hr"] = () => {
    return <></>;
};

const UserMessage = ({ content }: { content: string }) => {
    return (
        <div className="flex self-end max-w-3/4">
            <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm lg:text-base">
                    {content}
                </p>
            </div>
        </div>
    );
};

const StatusIndicator = ({ detail }: { detail: string }) => (
    <div className="flex justify-start max-w-3/4">
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 border border-muted-foreground/20">
            <Spinner className="h-5 w-5" />
            <span className="text-sm text-muted-foreground">{detail}</span>
        </div>
    </div>
);

const ErrorBanner = ({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) => (
    <div className="flex justify-start max-w-3/4">
        <div className="flex items-center gap-3 bg-destructive/10 rounded-lg p-4 border border-destructive/40">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span className="text-sm text-destructive flex-1">{message}</span>
            <Button
                variant="outline"
                size="sm"
                className="ml-2 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={onRetry}
            >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
            </Button>
        </div>
    </div>
);

const AssistantMessage = ({
    content,
    images,
    references,
    usedWebSearch,
}: {
    content: string;
    images?: string[];
    references?: string[];
    usedWebSearch?: boolean;
}) => {
    const { isLoading } = useConversation();

    const handleClickCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success("Content copied to clipboard!!!");
        } catch (err) {
            console.error("Failed to copy content", err);
        }
    };

    return (
        <div className="flex justify-start max-w-3/4 min-w-0">
            <div className="flex flex-col bg-muted rounded-lg p-4 border min-w-0 max-w-full">
                <div className="text-muted-foreground">
                    <Markdown
                        components={{
                            img: MarkdownImage,
                            p: MarkdownParagraph,
                            hr: MarkdownHorizontalRule,
                        }}
                    >
                        {content}
                    </Markdown>
                </div>

                {images && images.length > 0 && (
                    <div className="mt-3 flex flex-row gap-2 overflow-x-auto pb-1 max-w-full">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className="shrink-0 w-36 sm:w-48 aspect-[4/3] overflow-hidden rounded bg-muted-foreground/10"
                            >
                                <img
                                    src={new URL(img, import.meta.env.VITE_STATIC_URL).toString()}
                                    alt={`artifact-image-${i}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {usedWebSearch && references && references.length > 0 && (
                    <div className="mt-3 border-t pt-2">
                        <p className="text-xs text-muted-foreground font-semibold mb-1">References</p>
                        <ul className="flex flex-col gap-1">
                            {references.map((ref, i) => (
                                <li key={i} className="flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                                    <a
                                        href={ref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline break-all"
                                    >
                                        {ref}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!isLoading && (
                    // 复制按钮
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-200"
                        onClick={() => handleClickCopy(content)}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default function ChatInterface() {
    const { messages, currentStatus, isLoading, error, retryLastMessage } = useConversation();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // 每当消息列表或 loading 状态变化时，自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentStatus, error]);

    return (
        <main className="flex-1 flex flex-col px-4 md:px-6 pb-4">
            <div className="flex flex-col gap-4 mx-auto w-full flex-1 mt-4 mb-12">
                {messages.map((message) =>
                    message.role == "user" ? (
                        <UserMessage
                            key={message.id}
                            content={message.content}
                        />
                    ) : (
                        <AssistantMessage
                            key={message.id}
                            content={message.content}
                            images={message.images}
                            references={message.references}
                            usedWebSearch={message.usedWebSearch}
                        />
                    ),
                )}
                {currentStatus && isLoading && (
                    <StatusIndicator detail={currentStatus} />
                )}
                {error && !isLoading && (
                    <ErrorBanner message={error} onRetry={retryLastMessage} />
                )}
                <div ref={messagesEndRef} />
            </div>
            <InputArea />
        </main>
    );
}
