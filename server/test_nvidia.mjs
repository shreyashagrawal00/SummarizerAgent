import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  console.log("Testing Nvidia AI with model: thudm/chatglm3-6b");
  try {
    const completion = await openai.chat.completions.create({
      model: "thudm/chatglm3-6b",
      messages: [{ "role": "user", "content": "Hello, can you give me a short summary of what you are?" }],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
    })

    console.log("Response:", completion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
