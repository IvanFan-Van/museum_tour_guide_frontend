import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "zh";

interface LanguageStore {
    language: Language;
    toggleLanguage: (lang: Language) => void;
}

const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: "en",
            toggleLanguage: (lang) => set({ language: lang }),
        }),
        { name: "language" },
    ),
);

export default function useLanguage() {
    return useLanguageStore();
}
