import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { Toaster } from "sonner";

async function enableMocking() {
    if (process.env.NODE_ENV !== "development" || !import.meta.env.DEV) {
        return;
    }

    const { worker } = await import("./mocks/browser");
    return worker.start();
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <SidebarProvider>
                <App />
                <Toaster />
            </SidebarProvider>
        </StrictMode>
    );
})

