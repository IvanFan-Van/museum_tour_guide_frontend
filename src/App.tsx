import ChatHistorySidebar from "./components/ChatHistorySidebar";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInterface from "./components/ChatInterface";
import { useConversation } from "./hooks/use-conversation";
import { Toaster } from "./components/ui/sonner";
import { useState, useEffect } from "react";

function App() {
    const { currentConversation } = useConversation();

    // 跟随 <html> 上的 .dark class 同步 Toaster 主题
    // 使用 MutationObserver 监听 className 变化，避免独立的 useTheme 实例间不同步
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains("dark"),
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <ChatHistorySidebar />
            <div className="w-full min-h-screen flex flex-col" >
                <Header />
                {!currentConversation ? <WelcomeScreen /> : <ChatInterface />}
            </div>
            <Toaster theme={isDark ? "dark" : "light"} />
        </>
    );
}

export default App;
