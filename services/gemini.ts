import { GoogleGenAI, Type } from "@google/genai";
import type { TriviaCard } from "../types";

// Initialize the Gemini client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRIVIA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "The funny and relatable category of the question (e.g., 'Modern Slang', 'Dorm History')",
    },
    question: {
      type: Type.STRING,
      description: "The weird question relevant to young adults that requires a specific and strange answer",
    },
    real_answer: {
      type: Type.STRING,
      description: "The single, correct, and often strange answer",
    },
  },
  required: ["category", "question", "real_answer"],
};

const FAKES_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fakes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Three funny, believable fake answers that match the tone and length of the real answer.",
    },
  },
  required: ["fakes"],
};

const SYSTEM_INSTRUCTION = `
You are a creative game content generator for a trivia and bluffing game designed for a modern college and teen audience. Your task is to provide exactly one set of complete game content per request.

Core Content Requirements:
1. Audience & Tone: The content must be funny, bizarre, and highly relatable to young adults (college students and teenagers).
2. Safety: The content must be strictly SFW (Safe For Work) and contain absolutely no sexually explicit or harmful material.
3. Obscurity: The fact must be obscure or strange enough to encourage players to submit clever, believable fake answers.
4. Topics: Focus on subjects relevant to this audience (e.g., Internet Slang, Modern Digital/Social Norms, Academic Stress, Strange Food/Dorm Life, Obscure Pop Culture).
`;

export const generateTrivia = async (): Promise<TriviaCard> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a new obscure trivia card.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: TRIVIA_SCHEMA,
        temperature: 0.9, // Higher temperature for more creativity/bizarre facts
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(text) as TriviaCard;
    return data;
  } catch (error) {
    console.error("Error generating trivia:", error);
    throw error;
  }
};

export const generateFakes = async (question: string, realAnswer: string): Promise<string[]> => {
  try {
    const prompt = `
      Context: A personal bluffing game for teens/young adults.
      Question: "${question}"
      Real Answer provided by player: "${realAnswer}"
      
      Task: Generate 3 creative, funny, and plausible fake answers (bluffs) that blend in with the real answer. 
      The fakes should be similar in style, length, and tone to the real answer so they are hard to distinguish.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: FAKES_SCHEMA,
        temperature: 1.0,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    const data = JSON.parse(text) as { fakes: string[] };
    return data.fakes;
  } catch (error) {
    console.error("Error generating fakes:", error);
    // Fallback fakes if API fails
    return ["Pizza", "Homework", "A weird cat"];
  }
};