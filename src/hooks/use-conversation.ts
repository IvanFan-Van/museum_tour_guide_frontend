/**
 * useConversation
 *
 * 公共 hook，向组件暴露完整的 ConversationManager 接口。
 *
 * 数据来源：
 *  - 可序列化的会话状态 → Zustand store（useConversationStore）
 *  - React 不可序列化状态 / useChat 状态 → ChatBridge Context（useChatBridge）
 */

import { useMemo } from "react";
import { useChatBridge } from "@/context/conversation_context";
import { useConversationStore } from "@/stores/conversation-store";
import type { Conversation, FileMetadata, Message } from "@/stores/conversation-store";

export type { Conversation, FileMetadata, Message };

export interface ConversationManager {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    attachedFiles: FileMetadata[];
    query: string;
    isPlaying: boolean;
    isLoading: boolean;
    currentStatus: string | null;
    /** 错误信息，null 表示无错误 */
    error: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    createConversation: (title?: string) => void;
    selectConversation: (conversationId: string | null) => void;
    handleSubmit: () => void;
    processScannedFile: (data: FileMetadata) => void;
    toggleAudioPlay: () => void;
    /** 使用上一次的 query 重新发送请求 */
    retryLastMessage: () => void;
}

export function useConversation(): ConversationManager {
    // ── Zustand store ──────────────────────────────────────────────────
    const {
        conversations,
        selectedConversationId,
        selectConversation,
    } = useConversationStore();

    // ── ChatBridge Context（useChat state + 组合 actions）─────────────
    const {
        query,
        isLoading,
        isPlaying,
        currentStatus,
        error,
        handleInputChange,
        createConversation,
        handleSubmit,
        processScannedFile,
        toggleAudioPlay,
        retryLastMessage,
    } = useChatBridge();

    // ── 派生状态 ────────────────────────────────────────────────────────
    const currentConversation = useMemo(
        () =>
            conversations.find((c) => c.id === selectedConversationId) ?? null,
        [conversations, selectedConversationId],
    );

    const messages = useMemo(
        () => currentConversation?.messages ?? [],
        [currentConversation],
    );

    const attachedFiles = useMemo(
        () => currentConversation?.files ?? [],
        [currentConversation],
    );

    return {
        conversations,
        currentConversation,
        messages,
        attachedFiles,
        query,
        isPlaying,
        isLoading,
        currentStatus,
        error,
        handleInputChange,
        createConversation,
        selectConversation,
        handleSubmit,
        processScannedFile,
        toggleAudioPlay,
        retryLastMessage,
    };
}