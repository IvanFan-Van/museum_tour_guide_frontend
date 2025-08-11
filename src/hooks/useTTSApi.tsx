import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { Client } from "@langchain/langgraph-sdk";
import { useState } from "react";
import type { list } from "postcss";

const client = new Client({
  apiUrl: "http://10.147.19.97:8000",
});
const splitter = new TextSplitterStream();
const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
const tts = await KokoroTTS.from_pretrained(model_id, {
  dtype: "fp32", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
  // device: "webgpu", // Options: "wasm", "webgpu" (web) or "cpu" (node).
});
const stream = tts.stream(splitter);

type Chunk = {
  event: string;
  data: {
    generation: string;
    messages: object[];
  };
}

export default function useTTSApi(query: string, addMessageHistory: (sender: string, text: string) => void) {
  const [displayedText, setDisplayedText] = useState("");
  const [audioQueue, setAudioQueue] = useState<
    Array<{ url: string; text: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);


  const submitQuery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Add user msg to histroy
    addMessageHistory("user", query);

    // Send request to backend
    const assistants = await client.assistants.search({
      metadata: null,
      offset: 0,
      limit: 10,
    });

    const agent = assistants[0];

    const thread = await client.threads.create();

    const messages = [{ role: "human", content: query }];
    const streamResponse = client.runs.stream(
      thread["thread_id"],
      agent["assistant_id"],
      {
        input: { messages },
      }
    );

    (async () => {
      for await (const { text, phonemes, audio } of stream) {
        console.log({ text, phonemes });
        const url = URL.createObjectURL(audio.toBlob());
        setAudioQueue((prev) => [...prev, { url: url, text: text }]);
      }
    })();

    for await (const chunk of streamResponse as AsyncIterable<Chunk>) {
      
      if (chunk["event"] == "values" && chunk["data"]["generation"]) {
        setDisplayedText((prev) => { return prev + chunk["data"]["generation"]});
        const words = chunk.event.match(/\s*\S+/g) + "";
        for (const token of words) {
          splitter.push(token);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    }

    splitter.flush();
  };

  return {
    typewriterText: displayedText,
    setTypewriterText: setDisplayedText,
    isLoading,
    audioQueue,
    setAudioQueue,
    submitQuery,
  };
}