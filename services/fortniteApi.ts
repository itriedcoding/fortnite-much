import { ShopItem, PlayerStats, NewsItem, CosmeticItem } from "../types";

// API Keys
const IO_API_KEY = 'c8994e16-f9efba2f-da65b937-55d026d8'; // For Item Shop
const COM_API_KEY = '71d91f6f-df4c-4ea8-a406-cbb834d79bf5'; // For Stats & News

// API Endpoints
const SHOP_API_BASE = 'https://fortniteapi.io'; 
const STATS_API_BASE = 'https://fortnite-api.com';

/**
 * FETCH SHOP FROM FORTNITEAPI.IO
 */
export const fetchDailyShop = async (): Promise<ShopItem[]> => {
    try {
        const response = await fetch(`${SHOP_API_BASE}/v2/shop?lang=en`, { 
            headers: { 'Authorization': IO_API_KEY } 
        });
        
        if (!response.ok) {
            console.error(`Shop API Error: ${response.status}`);
            throw new Error(`Shop API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.result && data.shop) {
            // Filter out any null items after mapping
            return data.shop.map((item: any) => {
                try {
                    // --- 1. NAME RESOLUTION ---
                    let displayName = item.displayName;
                    let displayDescription = item.displayDescription;

                    // If top level name is missing (common in bundles), find the "Main" item
                    if (!displayName && item.granted && item.granted.length > 0) {
                         const mainItem = item.granted.find((g: any) => g.type?.id === 'outfit') || item.granted[0];
                         displayName = mainItem.name;
                         displayDescription = mainItem.description;
                    }

                    // --- 2. IMAGE RESOLUTION ---
                    let imageUrl = null;
                    let backgroundUrl = null;

                    // A. Try Display Assets (Shop Tiles) - The best quality
                    if (item.displayAssets && item.displayAssets.length > 0) {
                        imageUrl = item.displayAssets[0].url || item.displayAssets[0].background;
                        backgroundUrl = item.displayAssets[0].background;
                    }

                    // B. If no Display Asset, look at the Granted Content
                    if (!imageUrl && item.granted && item.granted.length > 0) {
                        // Priority: Outfit > Backpack > Pickaxe > Emote > Glider > Wrap > Any
                        const typePriority = ['outfit', 'backpack', 'pickaxe', 'emote', 'glider', 'wrap'];
                        
                        const mainItem = item.granted.sort((a: any, b: any) => {
                             const indexA = typePriority.indexOf(a.type?.id);
                             const indexB = typePriority.indexOf(b.type?.id);
                             if (indexA === -1 && indexB === -1) return 0;
                             if (indexA === -1) return 1;
                             if (indexB === -1) return -1;
                             return indexA - indexB;
                        })[0];
                        
                        if (mainItem) {
                             imageUrl = mainItem.images?.featured || mainItem.images?.icon || mainItem.images?.background;
                             // Fallback for Jam Tracks (Album Art)
                             if (!imageUrl && mainItem.albumArt) {
                                 imageUrl = mainItem.albumArt;
                             }
                             backgroundUrl = mainItem.images?.background;
                        }
                    }

                    // C. Fallback for Instruments/Cars/Tracks located at root
                    if (!imageUrl) {
                         imageUrl = item.images?.icon || item.images?.featured || item.images?.background;
                    }
                    
                    // --- 3. STRICT FILTERING ---
                    // If we still don't have a name, or it's "Unknown", or image is the generic placeholder -> KILL IT.
                    if (!displayName || displayName.toLowerCase() === 'unknown' || !imageUrl || imageUrl.includes('unknown/icon.png')) {
                        return null; 
                    }

                    // Fallback section logic
                    let sectionName = 'Daily';
                    let sectionId = 'daily';

                    if (item.section) {
                        sectionName = item.section.name || 'Daily';
                        sectionId = item.section.id || 'daily';
                    } else if (item.priority < 0) {
                        sectionName = 'Featured';
                        sectionId = 'featured';
                    }

                    return {
                        id: item.mainId,
                        displayName: displayName,
                        displayDescription: displayDescription || '',
                        price: {
                            finalPrice: item.price?.finalPrice || 0,
                            regularPrice: item.price?.regularPrice || 0
                        },
                        rarity: {
                            id: item.rarity?.id || 'Common',
                            name: item.rarity?.name || 'Common'
                        },
                        displayAssets: [{
                            url: imageUrl,
                            background: backgroundUrl
                        }],
                        section: {
                            id: sectionId,
                            name: sectionName
                        },
                        banner: item.banner ? { value: item.banner.name, intensity: item.banner.intensity } : undefined,
                        firstRelease: item.firstRelease ? {
                            season: item.firstRelease.season,
                            chapter: item.firstRelease.chapter
                        } : undefined
                    };
                } catch (innerError) {
                    return null; 
                }
            }).filter((item: ShopItem | null) => item !== null);
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch shop from .io:", error);
        return [];
    }
};

/**
 * FETCH STATS FROM FORTNITE-API.COM
 */
export const fetchPlayerStats = async (username: string): Promise<PlayerStats | null> => {
    try {
        const response = await fetch(`${STATS_API_BASE}/v2/stats/br/v2?name=${encodeURIComponent(username)}`, { 
            headers: { 'Authorization': COM_API_KEY } 
        });
        const data = await response.json();

        if (data.status === 200 && data.data) {
            return data.data; 
        } else if (data.status === 403) {
            throw new Error(`The profile for '${username}' is private. Users must enable "Show on Career Leaderboard" in Fortnite settings.`);
        } else if (data.status === 404) {
            throw new Error(`Player '${username}' not found. Please check spelling.`);
        }
        throw new Error(data.error || 'Unknown error');
    } catch (error: any) {
        console.error("Failed to fetch player stats", error);
        throw error;
    }
};

/**
 * SEARCH COSMETICS (REAL SKINS)
 */
export const searchCosmetic = async (name: string): Promise<CosmeticItem | null> => {
    try {
        // We only want Outfits (skins)
        const response = await fetch(`${STATS_API_BASE}/v2/cosmetics/br/search?name=${encodeURIComponent(name)}&type=outfit`, {
            headers: { 'Authorization': COM_API_KEY }
        });
        const data = await response.json();

        if (data.status === 200 && data.data) {
            return data.data as CosmeticItem;
        }
        return null;
    } catch (error) {
        console.error("Failed to search cosmetic", error);
        return null;
    }
}

/**
 * FETCH NEWS FROM FORTNITE-API.COM
 */
export const fetchNews = async (): Promise<NewsItem[]> => {
    try {
        const response = await fetch(`${STATS_API_BASE}/v2/news/br`, { 
            headers: { 'Authorization': COM_API_KEY } 
        });
        const data = await response.json();

        if (data.status === 200 && data.data) {
            const motds = data.data.motds || [];
            return motds.map((item: any) => ({
                id: item.id,
                title: item.title,
                tabTitle: item.tabTitle,
                body: item.body,
                image: item.image,
                tileImage: item.tileImage,
                video: item.video, 
                date: data.data.date || new Date().toISOString()
            }));
        }
        return [];
    } catch (error) {
         console.error("Failed to fetch news", error);
         return [];
    }
}