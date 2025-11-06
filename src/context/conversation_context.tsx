import useConversationManager, {
    type ConversationManager,
} from "@/hooks/use-conversation-manager";
import { createContext } from "react";

export const ConversationContext = createContext<ConversationManager | null>(null);
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
