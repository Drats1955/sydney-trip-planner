import { GoogleGenAI, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateGreetingAudio(userLanguage: string) {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const baseText = `welcome to the pre production version of the visitors and non english speaking trip planer. With the ability to take a picture of a magazine article or brochure of where they want to go have the app identify it and complete the trip planer. The live feeds from Transport NSW are not in place, for the trip planner, and other data to make this work correctly.`;

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

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  return inlineData ? { data: inlineData.data, mimeType: inlineData.mimeType } : null;
}

export async function generateSpeech(text: string, userLanguage: string) {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly in a friendly Australian accent: ${text}` }] }],
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

  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  return inlineData ? { data: inlineData.data, mimeType: inlineData.mimeType } : null;
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
  
  RESPONSE STYLE:
  - Concentrate on PUBLIC TRANSPORT options.
  - Be CONCISE and avoid excessive detail.
  - If a destination is difficult to reach by public transport, identify the CLOSEST public transport stop and then specify how far it is from there by TAXI or WALKING.
  
  You provide information about trip planning, delays, transfers, and walking directions.
  The user's detected language is ${userLanguage}. Please respond in this language if appropriate, or stay in English if the user switches to it.
  Always be polite and professional. 
  
  PERSONALIZATION: If the user provides their age or interests (often passed in the message context), you MUST tailor your suggestions to be age-appropriate and relevant to their interests. For example, do not suggest high-energy nightlife to seniors unless they specifically ask, and focus on accessibility, comfort, and relevant cultural/leisure activities.
  
  When providing walking directions, suggest using Google Maps and provide helpful context.
  Use Google Search to find real-time information about Sydney transport delays or specific trip details if needed.
  
  CRITICAL FEATURE: If the user provides an image (like a brochure, a photo of a landmark, a map, street signs, a QR code, an itinerary, a hotel booking, or event tickets), you MUST:
  1. Proactively analyze the image to identify the destination, point of interest, starting location, or event details.
  2. For tickets/bookings: Extract the venue name, address, and event time to provide precise transport timing and directions.
  3. For street signs: Identify the intersection or street name to determine the starting point.
  4. For QR codes: If it's a transport QR code, identify the stop or station it belongs to.
  5. Determine the user's likely transport needs.
  6. Provide specific transport advice, including train lines, bus numbers, or ferry routes.
  7. If the destination is unclear, ask clarifying questions while providing your best guess based on visual cues.
  
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
