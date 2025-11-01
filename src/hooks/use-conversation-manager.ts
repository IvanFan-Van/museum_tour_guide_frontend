import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "./use-chat";

export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

export interface FileMetadata {
    docId: string;
    filename: string;
    pageIndex?: number;
}

export interface Conversation {
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
    messages: Message[];
    files: FileMetadata[];
}

const testConversations: Conversation[] = [
    {
        id: "1",
        title: "Tell me something about porcelain?",
        preview: "Porcelain is a beautiful product comes from Shang Dynasty",
        timestamp: new Date(),
        messages: [
            {
                id: crypto.randomUUID(),
                role: "user",
                content: "Tell me something about porcelain?",
            },
            {
                id: crypto.randomUUID(),
                role: "ai",
                content:
                    "Porcelain is a beautiful product comes from Shang Dynasty",
            },
        ],
        files: [],
    },
    {
        id: "2",
        title: "hello?",
        preview: "Porcelain is a beautiful product comes from Shang Dynasty",
        timestamp: new Date(),
        messages: [],
        files: [],
    },
];

export default function useConversationManager() {
    const [conversations, setConversations] =
        useState<Conversation[]>(testConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null);

    const audioRef = useRef<HTMLAudioElement | null>(null); // 用于播放音频的元素引用
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // 上一个会话 ID
    const prevConvIdRef = useRef<string | null>(null);

    const currentConversation = useMemo(
        () =>
            conversations.find((conv) => conv.id === selectedConversationId) ||
            null,
        [conversations, selectedConversationId]
    );

    const messages = useMemo(
        () => currentConversation?.messages || [],
        [conversations, selectedConversationId]
    );

    const attachedFiles = useMemo(
        () => currentConversation?.files || [],
        [conversations, selectedConversationId]
    );

    const {
        response,
        query,
        isLoading,
        audioQueue,
        sendMessage,
        handleInputChange,
        setQuery,
        getNextAudio,
    } = useChat({
        api: import.meta.env.VITE_API_URL,
        options: { doc_id: currentConversation?.files[0]?.docId || null },
    });

    // 当 selectedConversationId 变化时, 更新上一条 conversation 的 preview
    useEffect(() => {
        const prevId = prevConvIdRef.current;
        // console.log("之前的 convID :", prevId);

        if (prevId && prevId !== selectedConversationId) {
            setConversations((prev) => {
                const prevConv = prev.find((conv) => conv.id === prevId);

                if (
                    prevConv &&
                    prevConv.preview === "" &&
                    prevConv.messages.length >= 2
                ) {
                    return prev.map((conv) =>
                        conv.id === prevId
                            ? { ...conv, preview: prevConv.messages[1].content }
                            : conv
                    );
                }
                return prev;
            });
        }

        prevConvIdRef.current = selectedConversationId;
        // console.log("更新完 preview 之后的 convID: ", selectedConversationId);
    }, [selectedConversationId]);

    // 当返回响应时, 更新 message 以及 chats
    useEffect(() => {
        if (!response) return;

        setConversations((prev) => {
            const currentConversation = prev.find(
                (conv) => conv.id === selectedConversationId
            );

            if (!currentConversation) return prev;

            const lastMessage = currentConversation.messages.at(-1);
            if (!lastMessage) return prev;

            let updatedMessages: Message[];
            if (lastMessage.role === "user") {
                updatedMessages = [
                    ...currentConversation.messages,
                    {
                        id: crypto.randomUUID(),
                        role: "ai",
                        content: response,
                    },
                ];
            } else {
                updatedMessages = [
                    ...currentConversation.messages.slice(0, -1),
                    {
                        ...lastMessage,
                        content: response,
                    },
                ];
            }

            return prev.map((conv) => {
                if (conv.id !== selectedConversationId) {
                    return conv;
                } else {
                    return {
                        ...conv,
                        messages: updatedMessages,
                    };
                }
            });
        });
    }, [response]);

    // 处理音频播放队列
    useEffect(() => {
        if (audioQueue.length === 0) return;
        const playNextAudio = async () => {
            if (audioQueue.length === 0) return;
            const audioUrl = getNextAudio();
            if (audioUrl && audioRef.current) {
                console.log("Playing audio:", audioUrl);
                setIsPlaying(true);
                audioRef.current.src = audioUrl;
                audioRef.current
                    .play()
                    .catch((e) => console.error("Audio play error:", e));

                audioRef.current.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    audioRef.current!.src = "";
                    setIsPlaying(false);
                };
            }
        };
        if (audioRef.current && audioRef.current.paused) {
            playNextAudio();
        }
    }, [audioQueue, getNextAudio, isPlaying]);

    const createConversation = (title: string = "New Conversation") => {
        const newConversation: Conversation = {
            id: crypto.randomUUID(),
            title,
            preview: "",
            timestamp: new Date(),
            messages: [],
            files: [],
        };
        setConversations((prev) => [...prev, newConversation]);
        setSelectedConversationId(newConversation.id);
        if (title !== "New Conversation") {
            setQuery(title);
        } else {
            setQuery("");
        }
    };

    // 选择会话
    const selectConversation = (conversationId: string | null) => {
        setSelectedConversationId(conversationId);
    };

    // 更新 chats, 同时更新 messages
    const handleSubmit = () => {
        if (!query.trim() || !currentConversation) return;

        const newMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: query,
        };

        //TODO 更新 chats 记录, 之后会更改为发送请求到服务器更新记录
        setConversations((prev) => {
            return prev.map((conv) =>
                conv.id === selectedConversationId
                    ? {
                        ...conv,
                        title:
                            conv.title === "New Conversation"
                                ? query
                                : conv.title,
                        messages: [...conv.messages, newMessage],
                    }
                    : conv
            );
        });

        sendMessage();
    };

    // 处理扫描事件, 更新 optionsRef 以及 chats 中的 metadata
    const processScannedFile = (file: FileMetadata) => {
        if (!currentConversation) return;

        setConversations((prev) =>
            prev.map((conv) => {
                // 避免重复添加同一个文件
                if (
                    conv.id === selectedConversationId &&
                    !conv.files.some((f) => f.docId === file.docId)
                ) {
                    return { ...conv, files: [...conv.files, file] };
                }
                return conv;
            })
        );
        console.log("Scan result ", file);
    };

    return {
        conversations,
        currentConversation,
        messages,
        attachedFiles,
        query,
        isLoading,
        audioRef,
        handleInputChange,
        createConversation,
        selectConversation,
        handleSubmit,
        processScannedFile,
    };
}
