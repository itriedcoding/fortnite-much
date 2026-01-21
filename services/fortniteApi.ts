
import { ShopItem, PlayerStats, NewsItem, CosmeticItem, MapData } from "../types";

// API Keys
const IO_API_KEY = 'c8994e16-f9efba2f-da65b937-55d026d8'; // Deprecated for Shop, kept for legacy if needed
const COM_API_KEY = '71d91f6f-df4c-4ea8-a406-cbb834d79bf5'; // For Shop, Stats, News & Map

// API Endpoints
const SHOP_API_BASE = 'https://fortniteapi.io'; 
const STATS_API_BASE = 'https://fortnite-api.com';

/**
 * FETCH SHOP FROM FORTNITE-API.COM (New Provider)
 */
export const fetchDailyShop = async (): Promise<ShopItem[]> => {
    try {
        // Add cache busting and language param
        // Added Pragma: no-cache to be thorough
        const response = await fetch(`${STATS_API_BASE}/v2/shop/br?language=en&t=${Date.now()}`, { 
            headers: { 
                'Authorization': COM_API_KEY,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            console.warn(`Shop API Status: ${response.status}`);
            return [];
        }

        const json = await response.json();
        
        if (!json.data) return [];

        const shopData = json.data;
        const rawEntries: any[] = [];

        // Iterate over all keys in data to find sections (featured, daily, etc.)
        // This handles dynamic section names automatically
        Object.entries(shopData).forEach(([key, section]: [string, any]) => {
            // Skip metadata keys
            if (key === 'hash' || key === 'date' || key === 'vbuckIcon') return;

            if (section && typeof section === 'object' && Array.isArray(section.entries)) {
                section.entries.forEach((entry: any) => {
                    // Inject the section name into the entry for grouping
                    rawEntries.push({ ...entry, _sectionName: section.name || key });
                });
            }
        });

        return rawEntries.map((entry: any): ShopItem | null => {
            try {
                // 1. Identify Main Item
                const mainItem = entry.items?.[0];
                if (!mainItem) return null;

                // 2. Resolve Display Name (Bundle Name > Item Name)
                const name = entry.bundle?.name || mainItem.name;
                const desc = entry.bundle?.info || mainItem.description;

                // 3. Resolve Image
                // Priority: NewDisplayAsset (Render) > Bundle Image > Item Featured > Item Icon
                let imageUrl = null;
                
                if (entry.newDisplayAsset) {
                    imageUrl = entry.newDisplayAsset.materialInstances?.[0]?.images?.OfferImage 
                            || entry.newDisplayAsset.renderImages?.[0]?.image;
                }
                
                if (!imageUrl && entry.bundle && entry.bundle.image) {
                    imageUrl = entry.bundle.image;
                }

                if (!imageUrl) {
                    imageUrl = mainItem.images.featured || mainItem.images.icon || mainItem.images.smallIcon;
                }

                if (!imageUrl) return null; // Skip if no image found

                // 4. Resolve Rarity
                // Bundles might not have a direct rarity, usually take from first item or default
                const rarityId = mainItem.rarity?.value || 'common';
                const rarityName = mainItem.rarity?.displayValue || 'Common';

                // 5. Resolve Section
                // Use the layout name if available, otherwise the injected section key
                let sectionName = entry.layout?.name || entry._sectionName || 'Featured';
                let sectionId = entry.layout?.id || sectionName.toLowerCase().replace(/\s+/g, '-');

                // Clean up section names for better grouping
                if(sectionId.includes('jam') || sectionName.includes('Jam')) {
                    sectionName = 'Jam Tracks';
                    sectionId = 'jam-tracks';
                }

                return {
                    id: entry.offerId || mainItem.id,
                    displayName: name,
                    displayDescription: desc || '',
                    price: {
                        finalPrice: entry.finalPrice,
                        regularPrice: entry.regularPrice
                    },
                    rarity: {
                        id: rarityId,
                        name: rarityName
                    },
                    displayAssets: [{
                        url: imageUrl,
                        background: mainItem.images.background
                    }],
                    section: {
                        id: sectionId,
                        name: sectionName
                    },
                    banner: entry.banner ? { value: entry.banner.value, intensity: entry.banner.intensity } : undefined,
                    firstRelease: mainItem.introduction ? {
                        season: mainItem.introduction.season,
                        chapter: mainItem.introduction.chapter
                    } : undefined
                };
            } catch (e) {
                return null;
            }
        }).filter((item): item is ShopItem => item !== null);

    } catch (error) {
        console.error("Failed to fetch shop:", error);
        return [];
    }
};

/**
 * FETCH MAP FROM FORTNITE-API.COM
 */
export const fetchCurrentMap = async (): Promise<MapData | null> => {
    try {
        const response = await fetch(`${STATS_API_BASE}/v1/map`, { 
            headers: { 'Authorization': COM_API_KEY } 
        });
        
        if (!response.ok) {
            console.warn(`Map API Status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.status === 200 && data.data && data.data.images) {
            return {
                images: {
                    blank: data.data.images.blank,
                    pois: data.data.images.pois
                },
                pois: data.data.pois || []
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch map:", error);
        return null;
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

        // Handle specific HTTP errors for better UX
        if (response.status === 404) {
            throw new Error(`Player '${username}' not found. Please check spelling or try their Epic ID.`);
        }
        if (response.status === 403) {
            throw new Error(`The profile for '${username}' is private. They must enable "Show on Career Leaderboard" in Fortnite settings.`);
        }
        
        if (!response.ok) {
             const text = await response.text();
             // Try to parse error from body
             try {
                 const errData = JSON.parse(text);
                 throw new Error(errData.error || `API Error: ${response.status}`);
             } catch {
                 throw new Error(`API Error: ${response.status}`);
             }
        }

        const data = await response.json();

        if (data.status === 200 && data.data) {
            return data.data; 
        } 
        
        throw new Error(data.error || 'Unknown error occurred while fetching stats.');
    } catch (error: any) {
        // Suppress console errors for expected user-errors (404/403) to keep console clean
        if (!error.message.includes('not found') && !error.message.includes('private')) {
            console.error("Failed to fetch player stats", error);
        }
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
        
        if (response.status === 404) return null;

        const data = await response.json();

        if (data.status === 200 && data.data) {
            return data.data as CosmeticItem;
        }
        return null;
    } catch (error) {
        // Silent fail for cosmetic search typeahead
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
        
        if (!response.ok) return [];

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
