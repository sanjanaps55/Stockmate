import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello Gemini, are you working?");
    const reply = result.response.text();
    console.log("✅ Gemini API Working. Response:", reply);
  } catch (error) {
    console.error("❌ Gemini API failed:", error);
  }
}

testGemini();
