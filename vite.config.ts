import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import postcssPresetEnv from "postcss-preset-env";
// import autoprefixer from "autoprefixer";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    css: {
        postcss: {
            plugins: [
                // autoprefixer()
                // require("postcss-preset-env")
            ]
        }
    }
});
