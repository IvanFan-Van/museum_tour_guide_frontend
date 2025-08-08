import { useState, useEffect, useRef } from "react";

type AudioQueueItem = { url: string; text: string };

interface UseAudioPlayerProps {
    audioQueue: AudioQueueItem[];
    setAudioQueue: React.Dispatch<React.SetStateAction<AudioQueueItem[]>>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const useAudioPlayer = ({
    audioQueue,
    setAudioQueue,
    audioRef,
}: UseAudioPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<AudioQueueItem | null>(null);

    // Effect for handling audio element events
    useEffect(() => {
        const audio = audioRef.current;
        const handleAudioEnded = () => {
            if (audio) URL.revokeObjectURL(audio.src);
            setAudioQueue((prev) => prev.slice(1));
            setIsPlaying(false);
            setCurrentItem(null);
            console.log("ended");
        };

        if (audio) {
            audio.addEventListener("ended", handleAudioEnded);
            return () => audio.removeEventListener("ended", handleAudioEnded);
        }
    }, [audioRef, setAudioQueue]);

    // Effect for playing audio from the queue
    useEffect(() => {
        if (audioQueue.length > 0 && !isPlaying && audioRef.current) {
            const item = audioQueue[0];
            const audio = audioRef.current;
            audio.src = item.url;
            audio
                .play()
                .then(() => {
                    setIsPlaying(true);
                    setCurrentItem(item);
                })
                .catch((error) => {
                    console.error("Error playing audio:", error);
                    // Skip to next item on error
                    setAudioQueue((prev) => prev.slice(1));
                    setIsPlaying(false);
                });
        }
    }, [audioQueue, isPlaying, audioRef, setAudioQueue]);

    return { isPlaying, currentItem };
};

export default useAudioPlayer;
