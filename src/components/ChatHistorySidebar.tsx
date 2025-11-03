import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
} from "./ui/sidebar";
import { MessageCircle, Plus } from "lucide-react";

import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useConversation } from "@/context/conversation_context";

export default function ChatHistorySidebar() {
    const {
        currentConversation,
        conversations,
        selectConversation,
        createConversation,
    } = useConversation();

    const selectedChatId = currentConversation?.id || null;
    const [searchQuery, setSearchQuery] = useState("");
    const filteredConvs = useMemo(
        () =>
            conversations.filter((conv) => {
                return (
                    conv.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    conv.preview
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                );
            }),
        [searchQuery, conversations]
    );

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="px-4">
                <div className="border-b pb-4">
                    <Button
                        className="w-full"
                        onClick={() => createConversation()}
                    >
                        <Plus />
                        New Chat
                    </Button>
                </div>

                <div className=" w-full flex items-center justify-between">
                    <div className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                        RECENT CHATS
                    </div>
                    <div>
                        <Search className="w-4 h-4" />
                    </div>
                </div>

                <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                    }}
                    className="text-sm"
                ></Input>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredConvs.map((conv) => {
                                return (
                                    <SidebarMenuItem
                                        key={conv.id}
                                        onClick={() =>
                                            selectConversation(conv.id)
                                        }
                                    >
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "h-auto w-full justify-start p-3 text-left hover:bg-primary/10",
                                                selectedChatId === conv.id &&
                                                    "bg-primary/10"
                                            )}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <div className="min-w-0 flex-1 pr-4">
                                                <div className="truncate text-sm font-bold">
                                                    {conv.title}
                                                </div>
                                                <div className="text-muted-foreground mt-0.5 truncate text-xs">
                                                    {conv.preview}
                                                </div>
                                            </div>
                                        </Button>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
