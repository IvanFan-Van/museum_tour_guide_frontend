import useConversationManager, {
    type ConversationManager,
} from "@/hooks/use-conversation-manager";
import { createContext, useContext } from "react";

const ConversationContext = createContext<ConversationManager | null>(null);

export function useConversation() {
    const context = useContext(ConversationContext);

    if (!context) {
        throw new Error(
            "ConversationProvider must be used within a ConversationContext"
        );
    }

    return context;
}

export function ConversationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const conversationManager = useConversationManager();

    return (
        <ConversationContext.Provider value={conversationManager}>
            {children}
        </ConversationContext.Provider>
    );
}
