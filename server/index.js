const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI setup
if (!process.env.OPENAI_API_KEY) {
    throw new Error(
        "Missing OPENAI_API_KEY. Add it to the root .env (mern-app/.env) or your environment."
    );
}
const apiKey = process.env.OPENAI_API_KEY;
const baseURL =
    process.env.OPENAI_BASE_URL ||
    (apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : undefined);

const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
    ...(baseURL?.includes("openrouter.ai")
        ? {
            defaultHeaders: {
                ...(process.env.OPENROUTER_SITE_URL
                    ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
                    : {}),
                ...(process.env.OPENROUTER_APP_NAME
                    ? { "X-Title": process.env.OPENROUTER_APP_NAME }
                    : {}),
            },
        }
        : {}),
});

// Chat API
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful AI assistant." },
                { role: "user", content: message }
            ],
        });

        res.json({
            reply: response.choices[0].message.content,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Error aa gaya 😢" });
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
});