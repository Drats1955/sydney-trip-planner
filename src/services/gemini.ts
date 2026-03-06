import { GoogleGenAI, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateGreetingAudio(userLanguage: string) {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const baseText = `welcome to the pre production version of the visitors and non english specking trip planer. With the ability to take a picture of a magazine article or brocure of where they want to go have the app identify it and complete the trip planer. Most of it is not working yet`;

  // First, translate the text if it's not English
  let textToSpeak = baseText;
  if (userLanguage !== 'en') {
    const translationResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text into ${userLanguage}. Keep the tone friendly and professional: "${baseText}"`,
      config: {
        temperature: 0.3,
      },
    });
    textToSpeak = translationResponse.text || baseText;
  }

  // Then, generate the audio
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say cheerfully in a friendly Australian accent: ${textToSpeak}` }] }],
    config: {
      temperature: 0.3,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}

export async function getChatResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: any[] }[], 
  userLanguage: string,
  imageData?: { data: string, mimeType: string }
) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const systemInstruction = `You are Sydney Visitors Trip Planer, a helpful Sydney Transport AI assistant. 
  Your goal is to help users plan trips in Sydney using trains, buses, ferries, and light rail.
  You provide information about trip planning, delays, transfers, and walking directions.
  The user's detected language is ${userLanguage}. Please respond in this language if appropriate, or stay in English if the user switches to it.
  Always be polite and professional. 
  When providing walking directions, suggest using Google Maps and provide helpful context.
  Use Google Search to find real-time information about Sydney transport delays or specific trip details if needed.
  
  CRITICAL FEATURE: If the user provides an image (like a brochure, a photo of a landmark, or a map), you MUST:
  1. Proactively analyze the image to identify the destination or point of interest.
  2. Determine the user's likely transport needs (e.g., how to get there from a major hub like Central Station).
  3. Provide specific transport advice, including train lines, bus numbers, or ferry routes.
  4. If the destination is unclear, ask clarifying questions while providing your best guess based on visual cues.
  
  Current time is ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}.`;

  const userParts: any[] = [{ text: message }];
  if (imageData) {
    userParts.push({
      inlineData: {
        data: imageData.data,
        mimeType: imageData.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: userParts }
    ],
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
}
