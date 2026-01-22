
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSpectralAnalysis = async (waveCount: number) => {
  try {
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
    
    return JSON.parse(response.text);
  } catch (e: any) {
    console.warn("Gemini API Error (likely quota):", e.message);
    // Return high-quality fallback data to keep game immersive
    const fallbacks = [
      { riskLevel: "Elevated", strategy: "Concentrate fire on the northern spirits.", lore: "The fog thickens as the moon reaches its zenith." },
      { riskLevel: "Critical", strategy: "Conserve Spirit Energy for the salt ritual.", lore: "Ancient voices whisper from the cracked tombstones." },
      { riskLevel: "Moderate", strategy: "Keep your circle intact. Don't stray.", lore: "The spirits are testing your resolve tonight." }
    ];
    return fallbacks[waveCount % fallbacks.length];
  }
};

export const generateSplashImage = async (prompt: string) => {
  try {
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
  } catch (e: any) {
    console.warn("Splash Image generation failed (Quota reached). Using CSS fallback.");
  }
  return null;
};
