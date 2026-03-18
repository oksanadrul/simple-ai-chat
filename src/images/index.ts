import OpenAI from "openai";
import * as fs from "fs";
import { toFile } from "openai";

const openai = new OpenAI();
const MODEL = "dall-e-2";

async function loadPngUpload(filePath: string, uploadName: string) {
  const data = await fs.promises.readFile(filePath);
  return toFile(data, uploadName, { type: "image/png" });
}

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
    fs.writeFileSync("city.png", buffer);
  }
}

async function createImageVariation() {
  const sourceImage = await loadPngUpload("city.png", "city.png");

  const response = await openai.images.createVariation({
    model: MODEL,
    image: sourceImage,
    response_format: "b64_json",
    n: 1,
    size: "1024x1024",
  });

  const imageData = response.data?.[0].b64_json;
  if (imageData) {
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync("city_variation.png", buffer);
  }
}

async function editImage() {
  const sourceImage = await loadPngUpload("city.png", "city.png");
  const maskImage = await loadPngUpload("cityMask.png", "cityMask.png");

  const response = await openai.images.edit({
    model: MODEL,
    image: sourceImage,
    mask: maskImage,
    prompt: "Add flying cars in the sky, futuristic style",
    response_format: "b64_json",
    n: 1,
  });
  const imageData = response.data?.[0].b64_json;
  if (imageData) {
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync("city_edited.png", buffer);
  }
}

editImage();
