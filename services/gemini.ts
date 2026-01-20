import { GoogleGenAI } from "@google/genai";
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
