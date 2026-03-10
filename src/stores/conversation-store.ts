import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArtifactResultPayload } from "@/types";

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    images?: string[];
    references?: string[];
    usedWebSearch?: boolean;
}

export interface FileMetadata {
    docId: string;
}

export interface Conversation {
    id: string;
    title: string;
    preview: string;
    timestamp: number;
    messages: Message[];
    files: FileMetadata[];
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface ConversationStore {
    // ── State ──────────────────────────────────────────────────────────────
    conversations: Conversation[];
    selectedConversationId: string | null;
    isPlaying: boolean;
    isPaused: boolean;

    // ── Actions ────────────────────────────────────────────────────────────

    /** 创建新会话，返回新会话 id */
    createConversation: (title?: string) => string;

    /** 切换当前会话（切换前自动更新上一个会话的 preview） */
    selectConversation: (id: string | null) => void;

    /** 将扫描结果文件附加到当前会话（去重） */
    processScannedFile: (file: FileMetadata) => void;

    setIsPlaying: (v: boolean) => void;
    setIsPaused: (v: boolean) => void;

    // ── Internal actions（由 ChatBridgeProvider 调用）─────────────────────

    /** 向指定会话追加用户消息，同时更新会话标题（首条消息） */
    addUserMessage: (convId: string, msg: Message, queryText: string) => void;

    /** 流式更新或追加最新 AI 消息内容 */
    updateAiResponse: (convId: string, response: string) => void;

    /** 将 artifact（图片 / 参考链接 / web 搜索标记）写入最新 AI 消息 */
    applyArtifact: (
        convId: string,
        artifact: ArtifactResultPayload,
        usedWebSearch: boolean,
    ) => void;
}

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useConversationStore = create<ConversationStore>()(
    persist(
        (set, get) => ({
    conversations: [],
    selectedConversationId: null,
    isPlaying: false,
    isPaused: false,

    createConversation: (title = "New Conversation") => {
        const id = crypto.randomUUID();
        const conv: Conversation = {
            id,
            title,
            preview: "",
            timestamp: Date.now(),
            messages: [],
            files: [],
        };
        set((s) => ({
            conversations: [...s.conversations, conv],
            selectedConversationId: id,
        }));
        return id;
    },

    selectConversation: (id) => {
        const { selectedConversationId, conversations } = get();

        // 切换前将上一个会话的空 preview 填入第一条 AI 回复
        if (selectedConversationId && selectedConversationId !== id) {
            const prev = conversations.find(
                (c) => c.id === selectedConversationId,
            );
            if (prev && prev.preview === "" && prev.messages.length >= 2) {
                set((s) => ({
                    conversations: s.conversations.map((c) =>
                        c.id === selectedConversationId
                            ? { ...c, preview: prev.messages[1].content }
                            : c,
                    ),
                }));
            }
        }

        set({ selectedConversationId: id });
    },

    processScannedFile: (file) => {
        const { selectedConversationId } = get();
        if (!selectedConversationId) return;
        set((s) => ({
            conversations: s.conversations.map((c) =>
                c.id === selectedConversationId &&
                !c.files.some((f) => f.docId === file.docId)
                    ? { ...c, files: [...c.files, file] }
                    : c,
            ),
        }));
        console.log("Scan result ", file);
    },

    setIsPlaying: (v) => set({ isPlaying: v }),
    setIsPaused: (v) => set({ isPaused: v }),

    addUserMessage: (convId, msg, queryText) => {
        set((s) => ({
            conversations: s.conversations.map((c) =>
                c.id !== convId
                    ? c
                    : {
                          ...c,
                          title:
                              c.title === "New Conversation"
                                  ? queryText
                                  : c.title,
                          messages: [...c.messages, msg],
                      },
            ),
        }));
    },

    updateAiResponse: (convId, response) => {
        set((s) => {
            const conv = s.conversations.find((c) => c.id === convId);
            if (!conv) return s;

            const lastMsg = conv.messages.at(-1);
            if (!lastMsg) return s;

            let updatedMessages: Message[];
            if (lastMsg.role === "user") {
                // 首次 AI 回复块 → 新建 AI 消息
                updatedMessages = [
                    ...conv.messages,
                    { id: crypto.randomUUID(), role: "ai", content: response },
                ];
            } else {
                // 后续块 → 替换最后一条 AI 消息
                updatedMessages = [
                    ...conv.messages.slice(0, -1),
                    { ...lastMsg, content: response },
                ];
            }

            return {
                conversations: s.conversations.map((c) =>
                    c.id !== convId ? c : { ...c, messages: updatedMessages },
                ),
            };
        });
    },

    applyArtifact: (convId, artifact, usedWebSearch) => {
        set((s) => {
            const conv = s.conversations.find((c) => c.id === convId);
            if (!conv) return s;

            const lastMsg = conv.messages.at(-1);
            if (!lastMsg || lastMsg.role !== "ai") return s;

            return {
                conversations: s.conversations.map((c) =>
                    c.id !== convId
                        ? c
                        : {
                              ...c,
                              messages: [
                                  ...c.messages.slice(0, -1),
                                  {
                                      ...lastMsg,
                                      images: artifact.images,
                                      references: artifact.references,
                                      usedWebSearch,
                                  },
                              ],
                          },
                ),
            };
        });
    },
        }),
        {
            name: "museum_conversations",
            partialize: (state) => ({
                conversations: state.conversations,
                selectedConversationId: state.selectedConversationId,
            }),
        },
    ),
);
