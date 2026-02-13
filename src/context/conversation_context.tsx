/**
 * ConversationProvider（精简版）
 *
 * 职责：
 *  1. 初始化 useChat WebSocket hook 并将其响应/artifact 同步到 Zustand store
 *  2. 管理 audioRef（DOM ref，无法存入 Zustand）及音频播放队列逻辑
 *  3. 通过 Context 向组件暴露无法序列化的 React 状态（query、isLoading 等）
 *     以及需要同时操作 store 与 useChat 的组合 action（handleSubmit、createConversation）
 *
 * 所有可序列化的会话状态（conversations、selectedConversationId 等）
 * 均存储在 Zustand store（src/stores/conversation-store.ts）中，
 * 组件可直接通过 useConversationStore 订阅所需切片，无需经过此 Context。
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { useChat } from "@/hooks/use-chat";
import useLanguage from "@/hooks/use-language";
import {
    useConversationStore,
    type FileMetadata,
    type Message,
} from "@/stores/conversation-store";

// ─── Context Shape ─────────────────────────────────────────────────────────

export interface ChatBridge {
    /** 当前输入框内容 */
    query: string;
    /** AI 回复是否正在加载 */
    isLoading: boolean;
    /** 当前状态文本（如 "searching"、"responding"） */
    currentStatus: string | null;
    /** 错误信息，null 表示无错误 */
    error: string | null;
    /** 是否正在播放音频 */
    isPlaying: boolean;

    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    /** 创建新会话（同时重置 query） */
    createConversation: (title?: string) => void;
    /** 提交当前 query：写入用户消息并发送 WebSocket 请求 */
    handleSubmit: () => void;
    /** 处理扫描结果 */
    processScannedFile: (file: FileMetadata) => void;
    /** 暂停/恢复音频播放 */
    toggleAudioPlay: () => void;
    /** 使用上一次的 query 重新发送请求 */
    retryLastMessage: () => void;
}

export const ConversationContext = createContext<ChatBridge | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export function ConversationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // ── Zustand store 操作 ──────────────────────────────────────────────
    const {
        selectedConversationId,
        conversations,
        createConversation: storeCreateConversation,
        processScannedFile: storeProcessScannedFile,
        addUserMessage,
        updateAiResponse,
        applyArtifact,
    } = useConversationStore();

    const currentConversation = useMemo(
        () =>
            conversations.find((c) => c.id === selectedConversationId) ?? null,
        [conversations, selectedConversationId],
    );

    // ── Language preference ─────────────────────────────────────────────
    const { language } = useLanguage();

    // ── useChat（WebSocket + 音频解码） ────────────────────────────────
    const {
        response,
        query,
        isLoading,
        currentStatus,
        artifact,
        usedWebSearch,
        error,
        isAudioPlaying,
        suspendAudio,
        resumeAudio,
        sendMessage,
        retryLastMessage,
        handleInputChange,
        setQuery,
    } = useChat({
        api: import.meta.env.VITE_API_URL,
        options: { doc_id: currentConversation?.files[0]?.docId ?? null },
    });

    // 用 ref 追踪 usedWebSearch，避免 artifact effect 闭包捕获旧值
    const usedWebSearchRef = useRef<boolean>(false);
    useEffect(() => {
        usedWebSearchRef.current = usedWebSearch;
    }, [usedWebSearch]);

    // ── 将 useChat 响应同步到 Zustand store ───────────────────────────

    useEffect(() => {
        if (!response || !selectedConversationId) return;
        updateAiResponse(selectedConversationId, response);
    }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!artifact || !selectedConversationId) return;
        applyArtifact(
            selectedConversationId,
            artifact,
            usedWebSearchRef.current,
        );
    }, [artifact]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── 组合 Actions ────────────────────────────────────────────────────

    const createConversation = useCallback(
        (title?: string) => {
            storeCreateConversation(title);
            if (title && title !== "New Conversation") {
                setQuery(title);
            } else {
                setQuery("");
            }
        },
        [storeCreateConversation, setQuery],
    );

    const handleSubmit = useCallback(() => {
        if (!query.trim() || !selectedConversationId) return;
        const msg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: query,
        };
        addUserMessage(selectedConversationId, msg, query);
        sendMessage(undefined, selectedConversationId, language);
    }, [query, selectedConversationId, addUserMessage, sendMessage, language]);

    const toggleAudioPlay = useCallback(() => {
        if (isAudioPlaying) {
            suspendAudio();
        } else {
            resumeAudio();
        }
    }, [isAudioPlaying, suspendAudio, resumeAudio]);

    const value: ChatBridge = {
        query,
        isLoading,
        currentStatus,
        error,
        isPlaying: isAudioPlaying,
        handleInputChange,
        createConversation,
        handleSubmit,
        processScannedFile: storeProcessScannedFile,
        toggleAudioPlay,
        retryLastMessage,
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}

// ─── Internal helper hook ─────────────────────────────────────────────────

export function useChatBridge(): ChatBridge {
    const ctx = useContext(ConversationContext);
    if (!ctx) {
        throw new Error(
            "useChatBridge must be used within a ConversationProvider",
        );
    }
    return ctx;
}

