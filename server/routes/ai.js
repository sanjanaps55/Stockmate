import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Message to Gemini:", message);

    const model = genAI.getGenerativeModel({ model:  "gemini-1.5-pro-latest" });
    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("🔥 Gemini error:", err);  // shows full stack
    res.status(500).json({ error: err.message }); // shows readable error in frontend
  }
});

export default router;
