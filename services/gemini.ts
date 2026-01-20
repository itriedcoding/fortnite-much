
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ThumbnailCategory, ThumbnailConfig, AdvancedConfig, LightingStyle, CameraAngle, CompositionMode, FortnitePOI, FortniteWeapon, ItemRarity, GraphicsMode, AspectRatio, ActionType, SkinVibe, FortniteRank, FortniteSeason } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * OPTIMIZE PROMPT - FORTNITE ASSET RETRIEVAL
 */
export const optimizePromptText = async (config: ThumbnailConfig): Promise<string> => {
    const { topic, category, skinDetails, advanced } = config;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
              ROLE: You are the Art Director for the biggest Fortnite YouTuber (e.g., MrBeast Gaming, LazarBeam).
              
              INPUTS:
              - Topic: "${topic}"
              - User Skin Request: "${skinDetails}"
              - Era: "${advanced.season}"

              TASK:
              Create a visually explosive YouTube Thumbnail concept description.
              1. IDENTIFY THE HERO: If the user specified a skin, describe it in high detail (color palette, helmet/hair). If generic, invent a cool, sweaty, or meme skin.
              2. IDENTIFY THE ACTION: What is the most click-worthy moment? (e.g., hitting a snipe while falling, winning with 1HP).
              3. SET THE SCENE: Use the ${advanced.season} map context.
              
              OUTPUT FORMAT:
              A concise, punchy visual description focusing on colors, lighting, and action.
            `,
        });
        return response.text?.trim() || topic;
    } catch (e) {
        console.error("Optimization Error:", e);
        return `${topic} featuring ${skinDetails}`;
    }
}

/**
 * MASTER PROMPT BUILDER (TOP TIER QUALITY)
 */
export const enhancePrompt = async (config: ThumbnailConfig): Promise<string> => {
  try {
    const { topic, textOverlay, skinDetails, category, advanced, greenScreen } = config;

    // 1. Graphics & Render Engine (Top Tier Specs)
    const graphicsKeywords = "Unreal Engine 5.5 Render, 8K Resolution, Lumen Global Illumination, Nanite Geometry, Ray Tracing, Cinematic Lighting, High Fidelity, Sharp Textures, Volumetric Fog.";

    // 2. Character & Action
    const characterContext = `
        SUBJECT: ${skinDetails || 'A Fortnite Character (Sweaty Style)'}.
        ACTION: ${advanced.actionType}. Dynamic pose with exaggerated perspective.
        EXPRESSION: ${advanced.emotion} (Intensity ${advanced.facialIntensity}/10). Open mouth shock or intense focus.
        WEAPON: ${advanced.weapon} with metallic reflections.
        VFX: ${advanced.rarity === ItemRarity.MYTHIC ? 'Golden Mythic Aura' : 'Rim Lighting'}. ${advanced.showCrown ? 'Victory Crown shining above head' : ''}.
    `;

    // 3. Environment
    const locationContext = `
        LOCATION: ${advanced.location} (${advanced.season} aesthetic).
        LIGHTING: ${advanced.lighting} style. High contrast, saturated colors.
        ATMOSPHERE: ${advanced.timeOfDay}, atmospheric depth.
        BUILDS: ${advanced.showBuilds ? 'Surrounded by high-level wood/brick/metal edits' : 'Open ground'}.
    `;

    // 4. Composition (Click-Through Rate Optimization)
    const compositionContext = `
        COMPOSITION: ${advanced.composition}. ${advanced.camera}.
        COLOR GRADE: ${advanced.colorGrade}. Vibrant, punchy colors.
        DETAILS: ${advanced.showDamage ? 'Floating yellow "200" damage number' : ''}. ${advanced.speedLines ? 'Radial motion blur' : ''}.
    `;

    const bgInstruction = greenScreen 
      ? "BACKGROUND: SOLID CHROMA KEY GREEN (#00FF00). NO SHADOWS ON BACKGROUND." 
      : locationContext;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        GOAL: Generate a prompt for a "Top Tier" Fortnite YouTube Thumbnail using an AI image generator.
        
        SCENE: "${topic}"
        
        STYLE GUIDE:
        - The image must look like a high-budget 3D render from Epic Games or a top YouTuber's thumbnail artist.
        - "Fortnite Style": Stylized realism, slightly cartoonish proportions, vibrant textures.
        - NO photorealistic humans.
        - Camera should be dynamic and close to the action.
        
        ELEMENTS:
        ${graphicsKeywords}
        ${characterContext}
        ${bgInstruction}
        ${compositionContext}
        
        TEXT OVERLAY INSTRUCTION:
        ${textOverlay ? `The image MUST include 3D text reading "${textOverlay}" in the Fortnite 'Burbank' font style.` : 'No text.'}
        
        OUTPUT:
        Return ONLY the optimized prompt string.
      `,
    });
    
    return response.text?.trim() || `${topic} Fortnite thumbnail 8k render`;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return config.topic;
  }
};

/**
 * GENERATE VIRAL TITLES
 */
export const generateViralTitles = async (topic: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 5 viral, clickbait YouTube titles for a Fortnite video about: "${topic}". 
            Style: ALL CAPS, use punctuation like "!?". Keep them short and punchy. Return as a JSON array of strings.`
        });
        const text = response.text || "[]";
        // Simple cleanup to ensure JSON parsing if markdown is included
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        return ["IMPOSSIBLE CHALLENGE!", "I BROKE THE GAME!", "SECRET UPDATE found?", "1000 IQ PLAY", "DON'T DO THIS!"];
    }
}

/**
 * GENERATE TAGS
 */
export const generateTags = async (topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 15 comma-separated YouTube SEO tags for a Fortnite video about: "${topic}".`
        });
        return response.text || "Fortnite, Battle Royale, Gaming";
    } catch (e) {
        return "Fortnite, Battle Royale, Gaming, Chapter 6, Update";
    }
}

/**
 * GENERATE NEWS SUMMARY (AI INTELLIGENCE)
 */
export const summarizeNews = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Summarize this Fortnite news update in one hype sentence for a gamer. Keep it under 20 words. Text: "${text}"`
        });
        return response.text?.trim() || "Update details unavailable.";
    } catch (e) {
        return "AI Summary unavailable.";
    }
}

/**
 * GENERATE THUMBNAIL (NANO BANANA FAST)
 */
export const generateThumbnailImage = async (prompt: string, referenceImage: string | null, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const parts: any[] = [{ text: prompt }];
    
    if (referenceImage) {
        const cleanBase64 = referenceImage.split(',')[1] || referenceImage;
        parts.push({
            inlineData: {
                mimeType: 'image/png',
                data: cleanBase64
            }
        });
    }

    // Determine Aspect Ratio
    let arString = '16:9';
    if (aspectRatio === AspectRatio.PORTRAIT) arString = '9:16';
    if (aspectRatio === AspectRatio.SQUARE) arString = '1:1';

    // Using gemini-2.5-flash-image (Nano Banana Fast)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
            aspectRatio: arString as any
        }
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};


/**
 * GENERATE HYPE VOICEOVER (Audio Studio)
 */

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Simple WAV header generator for raw PCM (1 channel, 24kHz, 16-bit)
function createWavFile(samples: Int16Array, sampleRate: number = 24000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
  
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
  
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
  
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
  
    // Write samples
    const offset = 44;
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(offset + i * 2, samples[i], true);
    }
  
    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// NEW: Script Director
export const generateDirectorScript = async (topic: string, tone: string): Promise<{speaker: string, text: string}[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Write a short, high-energy 20-second dialogue between two Fortnite commentators discussing: "${topic}".
            Tone: ${tone}.
            Speakers are "Fenrir" (Deep voice, intense) and "Puck" (Energetic, fast).
            Format the output as a JSON array of objects with keys "speaker" and "text".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            speaker: { type: Type.STRING },
                            text: { type: Type.STRING }
                        },
                        required: ["speaker", "text"]
                    }
                }
            }
        });
        
        return JSON.parse(response.text?.trim() || "[]");
    } catch (e) {
        console.error("Script Gen Error:", e);
        return [
            { speaker: "Fenrir", text: "System error." },
            { speaker: "Puck", text: "Try again!" }
        ];
    }
}

export interface VoiceLine {
    speaker: string;
    text: string;
}

export const generateHypeVoiceover = async (lines: VoiceLine[]): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key is missing.");

    try {
        // Construct the prompt with speaker labels
        const prompt = lines.map(l => `${l.speaker}: ${l.text}`).join('\n');
        
        // Identify unique speakers for config
        const speakers = Array.from(new Set(lines.map(l => l.speaker)));
        
        let speechConfig: any = {};

        if (speakers.length > 1) {
            // Multi-speaker config
            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: speakers.map(s => ({
                        speaker: s,
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: s } }
                    }))
                }
            };
        } else {
            // Single speaker fallback
            speechConfig = {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speakers[0] || 'Fenrir' },
                },
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: speechConfig,
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data generated.");

        const rawBytes = base64ToUint8Array(base64Audio);
        const pcmSamples = new Int16Array(rawBytes.buffer);
        const wavBlob = createWavFile(pcmSamples, 24000);

        return URL.createObjectURL(wavBlob);

    } catch (error) {
        console.error("Audio Generation Error:", error);
        throw error;
    }
}
