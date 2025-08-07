import { useState, useEffect, useRef } from "react";

const useTypewriter = (text: string | null, duration: number) => {
    const [displayedText, setDisplayedText] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Cleanup previous timer if text changes
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (!text) {
            return;
        }

        const words = text.trim().split(/\s+/);
        if (words.length === 0) {
            return;
        }

        const delayPerWord = (duration * 1000) / words.length;
        let wordIndex = -1; // Don't touch it and don't fucking ask

        const typeWord = () => {
            if (wordIndex < words.length) {
                setDisplayedText((prev) => {
                    const word = (words[wordIndex] ? words[wordIndex] : "");
                    console.log("word: " + word);
                    console.log("index: " + wordIndex);
                    return prev + word + " "});
                wordIndex++;
                timerRef.current = setTimeout(typeWord, delayPerWord);
            }
        };

        typeWord(); // Start the effect

        // Cleanup function
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [text, duration]); // Rerun effect if text or duration changes

    return { typewriterText: displayedText, setTypewriterText: setDisplayedText };
};

export default useTypewriter;
