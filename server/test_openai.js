require("dotenv").config();
const axios = require("axios");

const testOpenAIKey = async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY in .env file.");
    return;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Say hello!" },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("OpenAI Response:", response.data);
  } catch (error) {
    console.error("Error testing OpenAI API:", error.response?.data || error.message);
  }
};

testOpenAIKey();