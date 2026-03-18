import OpenAI from "openai";
import * as fs from "fs";

const openai = new OpenAI();
const MODEL = "dall-e-3";

async function createImage() {
  const response = await openai.images.generate({
    model: MODEL,
    prompt: "A photo of a dog sitting on a mat, realistic, soft lighting",
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
    n: 1,
  });

  console.log("response:", response.data?.[0].url);
}

async function createAndSaveImageLocally() {
  const response = await openai.images.generate({
    model: MODEL,
    prompt: "A photo of a dog sitting on a mat, realistic, soft lighting",
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
    n: 1,
    response_format: "b64_json",
  });

  const imageData = response.data?.[0].b64_json;
  if (imageData) {
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync("dog.png", buffer);
  }
}

async function createAdvancedImage() {
  const response = await openai.images.generate({
    model: MODEL,
    prompt:
      "A futuristic cityscape at sunset, highly detailed, cinematic lighting",
    size: "1024x1024",
    quality: "hd",
    n: 1,
    response_format: "b64_json",
  });

  const imageData = response.data?.[0].b64_json;
  if (imageData) {
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync("advanced_image.png", buffer);
  }
}

createAdvancedImage();
