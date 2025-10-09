import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SidebarProvider>
            <App />
            <Toaster />
        </SidebarProvider>
    </StrictMode>
);
