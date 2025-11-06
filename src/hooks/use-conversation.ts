import { ConversationContext } from "@/context/conversation_context";
import { useContext } from "react";

export function useConversation() {
    const context = useContext(ConversationContext);

    if (!context) {
        throw new Error(
            "ConversationProvider must be used within a ConversationContext"
        );
    }

    return context;
}