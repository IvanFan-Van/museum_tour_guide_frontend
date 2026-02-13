export type WSMessageType =
    | "query"
    | "status"
    | "text_chunk"
    | "artifact";

export type WSMessage =
    | WSQueryMessage
    | WSTextChunkMessage
    | WSStatusMessage
    | WSArtifactMessage;

export interface WSQueryMessage {
    type: "query";
    payload: {
        text: string;
        images: { format: string; data: string }[];
        section_idx?: number | null;
        language?: "en" | "zh";
    };
}

export interface WSTextChunkMessage {
    type: "text_chunk";
    payload: {
        content: string;
        is_final: boolean;
    };
}

export interface WSStatusMessage {
    type: "status";
    payload: {
        status: string;
        detail: string;
    };
}

export interface ArtifactResultPayload {
    images: string[]; // image paths or URLs (e.g. ["imgs/1.png", "imgs/2.png"])
    references: string[]; // reference urls (e.g. ["https://en.wikipedia.org/wiki/Museum", "https://www.moma.org/"])
}

export interface WSArtifactMessage {
    type: "artifact";
    payload: ArtifactResultPayload;
}
