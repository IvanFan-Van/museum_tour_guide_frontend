import { ws, http, HttpResponse } from "msw";

const chat = ws.link("ws://localhost:8000/api/v1/invoke");

// const MOCK_AUDIO_URL = "/audio.mp3";
const MOCK_AUDIO_URL = "/audio.mp3";
const MOCK_CHUNKS = [
    "Hello! ",
    "I am ",
    "your ",
    "AI ",
    "museum ",
    "guide. ",
    "The ",
    "Ming ",
    "dynasty ",
    "porcelain ",
    "is ",
    "renowned ",
    "for ",
    "Its ",
    "exquisite ",
    "craftsmanship. ",
    "How ",
    "can ",
    "I ",
    "assist ",
    "you ",
    "further?",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadAudioChunks(
    audioUrl: string,
    chunkSize: number = 1024,
    n_splits: number | null = null,
): Promise<Blob[]> {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const chunks: Blob[] = [];
    if (n_splits) {
        chunkSize = Math.ceil(arrayBuffer.byteLength / n_splits);
    }
    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
        chunks.push(
            new Blob([arrayBuffer.slice(i, i + chunkSize)], {
                type: "audio/mpeg",
            }),
        );
    }

    return chunks;
}

export const handlers = [
    http.get("https://api.example.com/user", () => {
        return HttpResponse.json({
            id: "abc-123",
            firstName: "John",
            lastName: "Maverick",
        });
    }),

    chat.addEventListener("connection", ({ client, server }) => {
        client.addEventListener("message", async (event) => {
            event.preventDefault(); // intercept all messages send to server
            console.log(event.data);

            const audioChunks = await loadAudioChunks(
                MOCK_AUDIO_URL,
                -1,
                MOCK_CHUNKS.length,
            );

            client.send(
                JSON.stringify({
                    type: "status",
                    payload: {
                        status: "searching",
                        detail: "Web Searching...",
                    },
                }),
            );
            await delay(2000);

            client.send(
                JSON.stringify({
                    type: "status",
                    payload: {
                        status: "analyzing",
                        detail: "Analyzing Image...",
                    },
                }),
            );
            await delay(2000);
            // stream response text
            for (let i = 0; i < MOCK_CHUNKS.length; i++) {
                await delay(100);
                let text_chunk = MOCK_CHUNKS[i];
                let audio_chunk = audioChunks[i % audioChunks.length];
                client.send(
                    JSON.stringify({
                        type: "text_chunk",
                        payload: {
                            content: text_chunk,
                            is_final: false,
                        },
                    }),
                );
                client.send(audio_chunk);
            }

            client.send(
                JSON.stringify({
                    type: "text_chunk",
                    payload: {
                        content: "",
                        is_final: true,
                    },
                }),
            );
        });
    }),
];
