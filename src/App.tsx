import "./App.css";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInterface from "./components/ChatInterface";
import useConversationManager from "./hooks/use-conversation-manager";

function App() {
    const {
        conversations,
        currentConversation,
        messages,
        attachedFiles,
        query,
        isLoading,
        audioRef,
        handleInputChange,
        createConversation,
        selectConversation,
        handleSubmit,
        processScannedFile,
    } = useConversationManager();

    return (
        <>
            {/* 侧边栏 */}
            <ChatHistorySidebar
                convs={conversations}
                selectedChatId={currentConversation?.id || null}
                onSelectChat={selectConversation}
                onNewChat={() => createConversation()}
            />
            {/* 主视图区域 */}
            <div className="w-full min-h-screen flex flex-col">
                {/* 主视图区头部栏 */}
                <Header handleLogoClick={() => selectConversation(null)} />

                {/* 如果没有任何 CHATID 选择, 则展示 Welcome page, 否则展示 ChatInterface */}
                {!currentConversation ? (
                    <WelcomeScreen
                        handleSuggestionClick={(suggestion: string) =>
                            createConversation(suggestion)
                        }
                    />
                ) : (
                    <ChatInterface
                        query={query}
                        files={attachedFiles}
                        messages={messages}
                        handleSubmit={handleSubmit}
                        handleInputChange={handleInputChange}
                        isLoading={isLoading}
                        handleScan={processScannedFile}
                    />
                )}
            </div>
            <audio ref={audioRef} />
        </>
    );
}

export default App;
