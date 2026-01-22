
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSpectralAnalysis = async (waveCount: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the current wave of spirits (Wave ${waveCount}). Describe the haunting patterns and suggest a tactical exorcism strategy using silver bolts and salt circles.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING },
          strategy: { type: Type.STRING },
          lore: { type: Type.STRING }
        },
        required: ["riskLevel", "strategy", "lore"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      riskLevel: "Unknown",
      strategy: "Hold your ground within the salt circle.",
      lore: "The spirits are restless tonight."
    };
  }
};

export const generateSplashImage = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
