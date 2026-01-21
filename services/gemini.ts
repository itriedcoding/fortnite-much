
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ThumbnailCategory, ThumbnailConfig, AdvancedConfig, LightingStyle, CameraAngle, CompositionMode, FortnitePOI, FortniteWeapon, ItemRarity, GraphicsMode, AspectRatio, ActionType, SkinVibe, FortniteRank, FortniteSeason, BrandConfig, EsportsMascot, LogoStyle, LoadoutAnalysis, DropStrategy, CreativeBlueprint } from "../types";

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
 * GENERATE BRAND NAME (CLAN FORGE)
 */
export const generateBrandName = async (vibe: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a single, cool, 1-word esports team name based on this vibe: "${vibe}". 
            Examples: Solary, Sentinels, Cloud9, Liquid, FaZe, 100Thieves, Ghost, Shadow.
            Return ONLY the name. No quotes, no extra text.`
        });
        return response.text?.trim() || "Obsidian";
    } catch (e) {
        return "Apex";
    }
}

/**
 * DEEP BRAND ANALYSIS (CLAN FORGE)
 */
export const analyzeBrandDeeply = async (name: string): Promise<{
    mascot: string;
    style: string;
    element: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    vibe: string;
    archetype: string;
    strategy: string;
    sponsors: string[];
    roles: string[];
    evolutionTier: number;
}> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the esports team name "${name}" and construct a complete visual identity and community structure.
            
            Return a JSON object with:
            - mascot: Best fitting mascot from [Wolf, Knight, Spartan, Reaper, Dragon, Phoenix, Samurai, Cyborg, Tiger, Shark, Viking, Demon, Alien, Fox, Bear].
            - style: Best fitting style from [Vector Illustration, Minimalist, Chrome 3D, Glitch Cyberpunk, Vintage Badge, Neon Sign].
            - element: Best element matching the name from [Fire, Ice, Electric, Void, Nature, Metal, Cyber, Toxic].
            - primaryColor: A hex code.
            - secondaryColor: A complementary hex code.
            - accentColor: A highlight hex code.
            - vibe: 1 word description (e.g. Aggressive, Stealthy).
            - archetype: A cool title for the team identity (e.g. "The Apex Predators", "Digital Assassins").
            - strategy: One sentence explaining why this identity fits the name.
            - sponsors: 2 fake, cool sounding sponsor names that fit the vibe (e.g. "Vertex Energy", "Flux Peripherals").
            - roles: 4 Discord role names ranked from highest to lowest (e.g. ["Commander", "Elite", "Member", "Recruit"]).
            - evolutionTier: Choose 1 for "Clean/Simple/Rookie" or 2 for "Pro/Complex/3D" based on how "big budget" the name sounds.
            `,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const json = JSON.parse(response.text || "{}");
        return {
            mascot: json.mascot || 'Wolf',
            style: json.style || 'Vector Illustration',
            element: json.element || 'Fire',
            primaryColor: json.primaryColor || '#FF0000',
            secondaryColor: json.secondaryColor || '#880000',
            accentColor: json.accentColor || '#FFFFFF',
            vibe: json.vibe || 'Aggressive',
            archetype: json.archetype || 'The Contenders',
            strategy: json.strategy || 'A fierce identity for a competitive team.',
            sponsors: json.sponsors || ['HyperTech', 'GamerFuel'],
            roles: json.roles || ['Owner', 'Captain', 'Player', 'Fan'],
            evolutionTier: json.evolutionTier || 1
        };
    } catch (e) {
        console.error("Deep Analysis Error", e);
        return { 
            mascot: 'Wolf', style: 'Vector Illustration', element: 'Fire', 
            primaryColor: '#FF0000', secondaryColor: '#000000', accentColor: '#FFFFFF',
            vibe: 'Default', archetype: 'Standard', strategy: 'Default fallback.',
            sponsors: ['Sponsor 1', 'Sponsor 2'], roles: ['Admin', 'Mod', 'Member', 'Guest'],
            evolutionTier: 1
        };
    }
}

/**
 * GENERATE LOGO PROMPT (CLAN FORGE)
 */
export const generateLogoPrompt = (config: BrandConfig & { element: string, evolutionTier: number }): string => {
    const tierDesc = config.evolutionTier === 2 
        ? "Hyper-detailed 3D render, Esports Masterpiece, Metallic Textures, Glowing Eyes, Unreal Engine 5 style." 
        : "Clean Vector Illustration, Flat Design, Bold Thick Outlines, Professional Esports Logo style.";

    return `
      Esports Team Logo for "${config.name}".
      Subject: A stylized ${config.mascot} head/mascot infused with ${config.element} energy.
      Style: ${config.style}.
      Render Tier: ${tierDesc}
      Primary Colors: ${config.primaryColor} and Black/White.
      
      IMPORTANT COMPOSITION RULES:
      - Centered composition.
      - **BACKGROUND MUST BE SOLID WHITE (#FFFFFF)**.
      - No realistic photo details. Must look like a professional gaming clan logo (e.g. like G2, Liquid, Cloud9).
      - If element is Fire, use sharp flame shapes. If Ice, use shards. If Cyber, use circuitry.
    `;
}

/**
 * GENERATE WALLPAPER PROMPT
 */
export const generateWallpaperPrompt = (config: BrandConfig & { element: string }): string => {
    return `
        Abstract Esports Wallpaper for team "${config.name}".
        Theme: ${config.element} element.
        Colors: ${config.primaryColor} dominant, dark background.
        Style: 3D Abstract, Geometry, Particles, Smoke, Neon Lights.
        Quality: 4k, High Resolution, Cinematic, Unreal Engine 5.
        No text. Just background texture.
    `;
}

/**
 * GENERATE THUMBNAIL / LOGO (NANO BANANA FAST)
 */
export const generateThumbnailImage = async (prompt: string, referenceImage: string | null, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const parts: any[] = [{ text: prompt }];
    
    // Robust Reference Image Handling
    if (referenceImage) {
        // Attempt to extract real MIME type from data URL
        const matches = referenceImage.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const data = matches[2];
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: data
                }
            });
        } else {
             // Fallback for raw base64 or unexpected formats
             const cleanBase64 = referenceImage.split(',')[1] || referenceImage;
             parts.push({
                inlineData: {
                    mimeType: 'image/png', // Default fallback
                    data: cleanBase64
                }
            });
        }
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

/**
 * GENERATE CAT SOUND (NEURAL AUDIO)
 */
export const generateCatSound = async (prompt: string): Promise<string> => {
    // We reuse the TTS engine but hijack it for non-verbal sound generation
    // 'Puck' often has good high pitch range for cat sounds
    return generateHypeVoiceover([{ speaker: 'Puck', text: prompt }]);
}

/**
 * TACTICAL OS: INVENTORY VISION (GEMINI 3 FLASH MULTIMODAL)
 */
export const analyzeLoadoutImage = async (base64Image: string): Promise<LoadoutAnalysis> => {
    try {
        const parts: any[] = [
            { text: "Analyze this Fortnite inventory screenshot. Identify the weapons, heals, and materials. Assess the loadout's competitive viability for a ranked endgame scenario. Return a JSON object." },
        ];
        
        // Handle image data
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            parts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Using Flash for fast multimodal reasoning
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "Viability score 0-100" },
                        viability: { type: Type.STRING, enum: ["META", "COMPETITIVE", "CASUAL", "TRASH"] },
                        identifiedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        advice: { type: Type.STRING, description: "Specific tactical advice on what to drop/pickup" }
                    },
                    required: ["score", "viability", "identifiedItems", "strengths", "weaknesses", "advice"]
                }
            }
        });

        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Loadout Analysis Error", e);
        throw new Error("Failed to analyze loadout image.");
    }
}

/**
 * TACTICAL OS: DROP COMMANDER (GEMINI 3 FLASH REASONING)
 */
export const generateDropStrategy = async (poi: string): Promise<DropStrategy> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a pro-level drop strategy for the Fortnite POI: "${poi}". Assume Chapter 6 / Current Meta.
            
            Return JSON with:
            - threatLevel: [LOW, MEDIUM, HIGH, EXTREME]
            - rotationPath: 3-step array of next locations to rotate to.
            - lootPriority: 3 key items to look for at this spot.
            - farmingGuide: 1 sentence on what material to farm here.
            - earlyGamePlan: 1 strategic sentence for the first 2 minutes.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        poi: { type: Type.STRING },
                        threatLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "EXTREME"] },
                        rotationPath: { type: Type.ARRAY, items: { type: Type.STRING } },
                        lootPriority: { type: Type.ARRAY, items: { type: Type.STRING } },
                        farmingGuide: { type: Type.STRING },
                        earlyGamePlan: { type: Type.STRING }
                    },
                    required: ["threatLevel", "rotationPath", "lootPriority", "farmingGuide", "earlyGamePlan"]
                }
            }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Drop Strategy Error", e);
         throw new Error("Failed to generate drop strategy.");
    }
}

/**
 * CREATIVE ARCHITECT: BLUEPRINT ENGINE
 */
export const generateCreativeBlueprint = async (concept: string): Promise<CreativeBlueprint> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create a technical Fortnite Creative map design for the concept: "${concept}".
            
            Return JSON with:
            - title: Cool map name.
            - description: Short description.
            - islandTemplate: Best base island to start with.
            - memoryUsage: Estimated memory usage (e.g. "Low (15k)").
            - devices: Array of 3-5 critical devices needed. Each device has a name, location, and array of key settings (key/value pairs).
            - flowSummary: A sentence describing the game loop.
            - codeSnippet: A fake verse code snippet for a key mechanic.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        islandTemplate: { type: Type.STRING },
                        memoryUsage: { type: Type.STRING },
                        devices: { 
                            type: Type.ARRAY, 
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    location: { type: Type.STRING },
                                    settings: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                key: { type: Type.STRING },
                                                value: { type: Type.STRING }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        flowSummary: { type: Type.STRING },
                        codeSnippet: { type: Type.STRING }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Blueprint Error", e);
        throw new Error("Failed to generate blueprint.");
    }
}

export const generateBlueprintImage = async (concept: string): Promise<string> => {
    return generateThumbnailImage(
        `Top down technical blueprint schematic of a Fortnite Creative map: ${concept}. 
        Style: Architectural Drawing, Blueprint Blue Background, White Lines, Grid Layout, Technical Annotations. 
        High contrast, vector style.`, 
        null, 
        AspectRatio.SQUARE
    );
}

// ... rest of exports (Viral Titles, etc) not modified but kept for context ...
export const generateViralTitles = async (topic: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 5 viral, clickbait YouTube titles for a Fortnite video about: "${topic}". 
            Style: ALL CAPS, use punctuation like "!?". Keep them short and punchy. Return as a JSON array of strings.`
        });
        const text = response.text || "[]";
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        return ["IMPOSSIBLE CHALLENGE!", "I BROKE THE GAME!", "SECRET UPDATE found?", "1000 IQ PLAY", "DON'T DO THIS!"];
    }
}
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
export const generateBrandSlogan = async (name: string, vibe: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate a short, hype esports slogan (max 4 words) for a team named "${name}". Vibe: ${vibe}.
            Examples: "Always Above", "Fear the Deep", "Victory Assured", "Defy Limits".
            Return ONLY the slogan.`
        });
        return response.text?.trim().replace(/"/g, '') || "Victory Forever";
    } catch (e) {
        return "Dominate The Game";
    }
}
