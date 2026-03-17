import OpenAI from "openai";

const MODEL = "gpt-4.1";
const openai = new OpenAI();

async function callOpenAI() {
  const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that provides information about the current date and time and order status.",
    },
    {
        role: "user",
        content: "What is the status of my order with id 12345?",
    }
  ];
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentDateTime",
          description: "Get the current date and time.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the status of an order by its ID.",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order to check.",
              },
            },
            required: ["orderId"],
          },
        },
      },
    ],
    tool_choice: "auto", // Let the model decide when to call the tool
  });

  // Check if the model decided to call the tool
  const willInvokeTool = response.choices[0].finish_reason === "tool_calls";
  const toolCalls = response.choices[0].message.tool_calls![0];

  if (willInvokeTool) {
    if (toolCalls.function.name === "getCurrentDateTime") {
      const toolResponse = getCurrentDateTime();

      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCalls.id,
      });
    } else if (toolCalls.function.name === "getOrderStatus") {
      const rawArguments = toolCalls.function.arguments;
      const parsedArguments = JSON.parse(rawArguments);

      const toolResponse = getOrderStatus(parsedArguments?.orderId);

      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCalls.id,
      });
    }
  }

  const finalResponse = await openai.chat.completions.create({
    model: MODEL,
    messages: context,
  });

  console.log(
    `${finalResponse.choices[0].message.role}: ${finalResponse.choices[0].message.content}`,
  );
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString();
}

function getOrderStatus(orderId: string) {
  // Mock order status
  const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  const status =
    statuses[Math.floor(Math.random() * statuses.length + orderId.length) % statuses.length];
    console.log(`Order ID: ${orderId}, Status: ${status}`);
  return `Order ${orderId} is currently: ${status}`;
}

callOpenAI();
