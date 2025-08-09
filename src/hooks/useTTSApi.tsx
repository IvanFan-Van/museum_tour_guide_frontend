import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { Client } from "@langchain/langgraph-sdk";
import { useState } from "react";

const client = new Client({
  apiUrl: "http://10.147.19.97:8000",
});
const splitter = new TextSplitterStream();
const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
const tts = await KokoroTTS.from_pretrained(model_id, {
  dtype: "fp32", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
  // device: "webgpu", // Options: "wasm", "webgpu" (web) or "cpu" (node).
});


export default function useTTSApi(query: string, addMessageHistory: (sender: string, text: string) => void) {
  const [displayedText, setDisplayedText] = useState("");
  const [audioQueue, setAudioQueue] = useState<
    Array<{ url: string; text: string }>
  >([]);



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

    for await (const chunk of streamResponse) {
      setDisplayedText((prev) => { return prev + chunk });
      const words = chunk.event.match(/\s*\S+/g);
      for (const token of words) {
        splitter.push(token);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

  const stream = tts.stream(splitter);
  (async () => {
    let i = 0;
    for await (const { text, phonemes, audio } of stream) {
      console.log({ text, phonemes });
      audio.save(`audio-${i++}.wav`);
    }
  })();

  const temp = text.match(/\s*\S+/g);
  const tokens = temp ? temp : "";
  for (const token of tokens) {
    splitter.push(token);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  splitter.flush();
  };





  // First, set up the stream



  // Finally, close the stream to signal that no more text will be added.


  // Alternatively, if you'd like to keep the stream open, but flush any remaining text, you can use the `flush` method.
  // 

  return { typewriterText: displayedText, setTypewriterText: setDisplayedText };
}