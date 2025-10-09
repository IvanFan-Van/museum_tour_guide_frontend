import { MessageSquare, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import Logo from "@/assets/UMAG-logo.svg?react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useTheme from "@/hooks/use-theme";

export default function Header({
    handleLogoClick,
}: {
    handleLogoClick: () => void;
}) {
    const { toggleSidebar } = useSidebar();
    const { isDark, setIsDark } = useTheme();

    return (
        <header className="w-full flex items-center justify-between space-x-4 px-4 md:px-6 py-2 border-b pb-4 sticky top-0 bg-background">
            <Button
                size="icon"
                variant="ghost"
                className="md:hidden h-8 w-8 p-0"
                onClick={toggleSidebar}
            >
                <MessageSquare className="h-4 w-4" />
            </Button>

            <Logo
                aria-label="UMAG Logo"
                className="h-8 sm:h-10 w-auto fill-black dark:fill-white"
                onClick={handleLogoClick}
            />

            <DropdownMenu>
                <DropdownMenuTrigger className="w-8 h-8 p-0">
                    <Settings className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Switch
                                id="dark-mode"
                                checked={isDark}
                                onCheckedChange={setIsDark}
                            />
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
