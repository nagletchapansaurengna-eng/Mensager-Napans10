import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export async function generateMockup(
  logoBase64: string,
  product: string,
  size: "1K" | "2K" | "4K",
  additionalPrompt: string = ""
): Promise<string | null> {
  // Use process.env.API_KEY which is injected after user selects it in the dialog
  // Fallback to GEMINI_API_KEY just in case, though paid models require the selected key.
  const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
  
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Generate a high-quality, professional product mockup of a ${product}. 
  The uploaded image is a logo that should be placed naturally and realistically on the ${product}. 
  The mockup should have clean lighting, a minimalist background, and look like a professional product photo.
  ${additionalPrompt}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: logoBase64.split(',')[1] || logoBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating mockup:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      // This might indicate an API key issue, handled by the UI
      throw error;
    }
  }

  return null;
}
