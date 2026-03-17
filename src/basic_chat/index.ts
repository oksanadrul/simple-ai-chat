import { count } from "console";
import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

const MODEL = "gpt-4.1";
const MAX_TOKENS = 700;

const openai = new OpenAI({});
const encoder = encoding_for_model(MODEL);

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot.",
  },
];

async function createChatCompletion() {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: context,
  });

  context.push({
    role: "assistant",
    content: response.choices[0].message.content,
  });

  if ((response.usage?.total_tokens ?? 0) > MAX_TOKENS) {
    removeOldMessages();
  }

  console.log("Context:", context);
  console.log(
    `${response.choices[0].message.role}: ${response.choices[0].message.content}`,
  );
}

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();

  context.push({
    role: "user",
    content: userInput,
  });

  await createChatCompletion();
});

function removeOldMessages() {
  let contextLength = countTokens();

  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      if (context[i].role !== "system") {
        context.splice(i, 1);
        contextLength = countTokens();

        console.log(
          `Removed message at index ${i}. Current token count: ${contextLength}`,
        );

        break;
      }
    }
  }
}

function countTokens() {
  let totalTokens = 0;

  context.forEach((message) => {
    if (typeof message.content == "string") {
      totalTokens += encoder.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach((part) => {
        if (typeof part == "string") {
          totalTokens += encoder.encode(part).length;
        }
      });
    }
  });

  return totalTokens;
}
