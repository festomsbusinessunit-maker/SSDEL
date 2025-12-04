
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing");
    return res.status(500).json({ error: 'Server Configuration Error: API Key missing' });
  }

  try {
    const { history, message, systemInstruction } = req.body;

    const ai = new GoogleGenAI({ apiKey });
    
    // Initialize chat with the provided history and system instruction
    const chat = ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history || []
    });

    // SDK v1+ expects an object with a 'message' property
    const result = await chat.sendMessageStream({ message: message });

    // Set headers for streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache'
    });

    // Correct iteration for SDK v1+ (iterate result directly, not result.stream)
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(chunkText);
      }
    }

    res.end();

  } catch (error) {
    console.error("Gemini API Error:", error);
    // If headers haven't been sent, send JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      // Stream already started, just end it
      res.end();
    }
  }
}
