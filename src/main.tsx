import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Alpha from "./Alpha.tsx"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Alpha />
    </StrictMode>
);
