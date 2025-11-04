import "./App.css";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInterface from "./components/ChatInterface";
import {
    ConversationProvider,
    useConversation,
} from "./context/conversation_context";

function AppContent() {
    const { currentConversation, audioRef } = useConversation();
    return (
        <>
            {/* 侧边栏 */}
            <ChatHistorySidebar />
            {/* 主视图区域 */}
            <div className="w-full min-h-screen flex flex-col">
                {/* 主视图区头部栏 */}
                <Header />
                {/* 如果没有任何 CHATID 选择, 则展示 Welcome page, 否则展示 ChatInterface */}
                {!currentConversation ? <WelcomeScreen /> : <ChatInterface />}
            </div>
            <audio ref={audioRef} />
        </>
    );
}

function App() {
    return (
        <ConversationProvider>
            <AppContent />
        </ConversationProvider>
    );
}

export default App;
