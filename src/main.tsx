import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { ConversationProvider } from "./context/conversation_context";

console.log(import.meta.env.MODE);
async function enableMocking() {
    if (import.meta.env.MODE === "mock") {
        const { worker } = await import("./mocks/browser");
        return worker.start();
    }
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <ConversationProvider>
                <SidebarProvider>
                    <App />
                </SidebarProvider>
            </ConversationProvider>
        </StrictMode>,
    );
});
