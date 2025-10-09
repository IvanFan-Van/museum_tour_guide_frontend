import type {
    Conversation,
    FileMetadata,
    Message,
} from "./../hooks/use-conversation-manager";
import { create } from "zustand";

export interface ConversationState {
    conversations: Conversation[];
    selectedConversationId: string | null;
    query: string;
    isLoading: boolean;
}
