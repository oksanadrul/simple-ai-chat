import OpenAI from "openai";

const openai = new OpenAI({});

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are a helpful chatbot.",
  },
];

async function createChatCompletion() {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: context,
  });

  context.push({
    role: "assistant",
    content: response.choices[0].message.content,
  });

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
