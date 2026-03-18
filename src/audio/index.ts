import { createReadStream, writeFileSync } from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

async function transcriptAudio() {
  const url = "https://cdn.openai.com/API/docs/audio/alloy.wav";
  const audioResponse = await fetch(url);
  const buffer = await audioResponse.arrayBuffer();
  const base64str = Buffer.from(buffer).toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-audio",
    modalities: ["text", "audio"],
    audio: { voice: "alloy", format: "wav" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What is in this recording?" },
          {
            type: "input_audio",
            input_audio: { data: base64str, format: "wav" },
          },
        ],
      },
    ],
    store: true,
  });

  console.log(response.choices[0].message.audio?.transcript);
}

async function translate() {
  const response = await openai.audio.transcriptions.create({
    file: createReadStream("dog.wav"),
    temperature: 0.2,
    model: "whisper-1",
    language: "uk",
  });

  console.log("translation:", response.text);

  return response.text;
}

async function generateAndSaveAudioToFile() {
  const response = await openai.chat.completions.create({
    model: "gpt-audio",
    modalities: ["text", "audio"],
    audio: { voice: "alloy", format: "wav" },
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: "Is a cockapoo a good family dog?",
      },
    ],
    store: true,
  });

  console.log(response.choices[0]);
  writeFileSync(
    "dog.wav",
    Buffer.from(response.choices?.[0]?.message?.audio?.data || "", "base64"),
    { encoding: "utf-8" },
  );
  translate();
}

async function textToSpeach() {
  const textToConvert = await translate();
  const response = await openai.audio.speech.create({
    voice: "alloy",
    model: "tts-1",
    input: textToConvert,
    response_format: "mp3",
  });

  console.log(response);

  writeFileSync(
    "speech.mp3",
    Buffer.from(await response.arrayBuffer()),
  );
}

textToSpeach();
