// Vercel serverless function for POST /api/conversations
import { MongoClient, ServerApiVersion } from "mongodb";
import { GoogleGenAI } from "@google/genai";

// Cache the MongoDB client across invocations
let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.DB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { constraint, context, format, persona, task } = req.body || {};
    if (!constraint || !context || !format || !persona || !task) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Call Gemini API
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt =
      "Generate a response fully in markdown format (with multiple level headings when appropriate) for the following prompt built using the Pentagram Framework for prompt engineering. Do not mention the Pentragram Framework or that the response is being formatted as markdown: \n{" +
      `  constraint: ${constraint}\n` +
      `  context: ${context}\n` +
      `  format: ${format}\n` +
      `  persona: ${persona}\n` +
      `  task: ${task}\n` +
      `}`;
    const chat = gemini.chats.create({ model: "gemini-2.0-flash", history: [] });
    const geminiResponse = await chat.sendMessage({ message: prompt });
    const answer = geminiResponse.text;

    // Save conversation to MongoDB
    const db = await getDb();
    const conversation = {
      constraint,
      context,
      format,
      persona,
      task,
      answer,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: [],
    };
    const result = await db.collection("conversations").insertOne(conversation);
    conversation._id = result.insertedId;

    res.status(201).json(conversation);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
