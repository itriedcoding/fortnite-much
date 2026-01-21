

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum ThumbnailCategory {
  BATTLE_ROYALE = 'Battle Royale Gameplay',
  ZERO_BUILD = 'Zero Build / Tactical',
  RANKED = 'Ranked / Arena Grind',
  CREATIVE = 'Creative / Box Fight / 1v1',
  FASHION = 'Fashion Show / Skin Review',
  LORE = 'Live Event / Lore / Theory',
  CHALLENGE = 'Challenge / Meme Run',
  XP_GLITCH = 'XP Glitch / Tutorial',
  TOURNAMENT = 'FNCS / Cash Cup'
}

export enum FortniteSeason {
  CH6_S1 = 'Chapter 6: Season 1 (Jan 2026 - Current)',
  CH5_S4 = 'Chapter 5: Season 4 (Marvel)',
  OG_RELOAD = 'Fortnite Reload / OG Map',
  CH1_S1 = 'Chapter 1: Season 1 (The Beginning)',
  CH2_S2 = 'Chapter 2: Season 2 (Midas/Agency)',
  CH2_S4 = 'Chapter 2: Season 4 (Marvel OG)',
  CH4_OG = 'Chapter 4: OG Season',
  FUTURE = 'Chapter 7 (Concept)'
}

export enum FortnitePOI {
  NEO_TILTED = 'Neo Tilted (2026)',
  THE_VOID = 'The Void (Chapter 6)',
  TILTED = 'Tilted Towers (OG)',
  PLEASANT = 'Pleasant Park',
  RETAIL = 'Retail Row',
  AGENCY = 'The Agency',
  GROTTO = 'The Grotto',
  MEGA_CITY = 'Mega City',
  UNDERWORLD = 'The Underworld',
  BOX_FIGHT = 'Creative Box Fight (Clean)',
  SKYBASE = 'Skybase (High Altitude)',
  ISLAND = 'Spawn Island',
  BATTLE_BUS = 'On Top of Battle Bus'
}

export enum FortniteWeapon {
  NONE = 'None / Emote',
  PUMP_OG = 'OG Pump Shotgun (Spas-12)',
  PUMP_2026 = 'Quantum Pump (Ch6)',
  SCAR = 'Gold SCAR',
  SNIPER = 'Heavy Sniper',
  PICKAXE = 'Pickaxe (Star Wand/Driver)',
  MYTHIC = 'Mythic Ability',
  GRAVITY_HAMMER = 'Shockwave Hammer',
  KATANA = 'Kinetic Blade',
  PISTOL = 'Tactical Pistol'
}

export enum FortniteRank {
  NONE = 'None / Pubs',
  BRONZE = 'Bronze',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
  ELITE = 'Elite',
  CHAMPION = 'Champion',
  UNREAL = 'Unreal (Top 500)'
}

export enum GraphicsMode {
  CINEMATIC = 'Cinematic (Lumen/Nanite/8K)',
  PERFORMANCE = 'Performance Mode (Bubble Wrap Builds)',
  PLASTIC = 'Plastic / Toy Texture',
  CARTOON = 'Cel Shaded / Anime'
}

export enum SkinVibe {
  DEFAULT = 'Default',
  SWEATY = 'Sweaty (Single Color/Clean)',
  MEME = 'Meme / Bulky (Peely/Fishstick)',
  TACTICAL = 'Tactical / Military',
  COLLAB = 'Collab / Anime Skin'
}

export enum ActionType {
  IDLE_HEROIC = 'Pose: Heroic Idle Stand',
  IDLE_CROSSED = 'Pose: Arms Crossed (Cool)',
  VICTORY_DANCE = 'Victory: Celebration Dance',
  VICTORY_CROWN = 'Victory: Holding Crown High',
  EMOTE_GRIDDY = 'Emote: The Griddy',
  EMOTE_FLOSS = 'Emote: The Floss',
  EMOTE_L = 'Emote: Take The L',
  EMOTE_ORANGE = 'Emote: Orange Justice',
  EMOTE_TOXIC = 'Emote: Laugh It Up (Toxic)',
  BUILDING = 'Gameplay: Cranking 90s',
  EDITING = 'Gameplay: Fast Wall Edit',
  SHOOTING_ADS = 'Gameplay: ADS / Firing',
  SHOOTING_HIP = 'Gameplay: Hip Fire',
  HEALING = 'Gameplay: Popping Minis',
  DRIVING = 'Gameplay: Driving Vehicle',
  GLIDING = 'Gameplay: Gliding / Skydiving'
}

export enum ItemRarity {
  COMMON = 'Common (Grey)',
  RARE = 'Rare (Blue)',
  LEGENDARY = 'Legendary (Gold Glow)',
  MYTHIC = 'Mythic (Yellow Glow)',
  EXOTIC = 'Exotic (Teal Glow)',
  TRANSCENDENT = 'Transcendent (Red/Black 2026)'
}

export enum LightingStyle {
  DEFAULT = 'Default AI Choice',
  STORM = 'Inside the Storm (Purple)',
  VICTORY = 'Victory Royale (Blue/Gold)',
  VOLUMETRIC = 'Cinematic God Rays',
  CYBERPUNK = 'Mega City Neon',
  SUNSET = 'Golden Hour (Sweaty)',
  NIGHT = 'Night Mode / Stealth',
  STUDIO = 'Clean Studio Lighting',
  REMBRANDT = 'Dramatic Rembrandt (Face Focus)'
}

export enum CameraAngle {
  DEFAULT = 'Default',
  LOW_ANGLE = 'Low Angle (Heroic)',
  HIGH_ANGLE = 'High Angle (Sniper View)',
  DUTCH = 'Dutch Angle (Action)',
  FISHEYE = 'Fish Eye (Vlog/Meme)',
  DRONE = 'Drone Shot (Map View)',
  OVER_SHOULDER = 'Over The Shoulder (Gameplay)',
  SELFIE = 'Selfie Mode'
}

export enum ColorGrade {
  DEFAULT = 'Default',
  VIBRANT = 'Sweaty Vibrant (100% Saturation)',
  TEAL_ORANGE = 'Cinematic Teal & Orange',
  DEEP_PURPLE = 'Dark / Storm Vibes',
  PASTEL = 'Pastel / Cute',
  CONTRAST = 'High Contrast / Competitive',
  OG = 'OG Chapter 1 Graphics (Washed Out)'
}

export enum Emotion {
  SHOCK = 'Shock / Pog',
  RAGE = 'Extreme Rage',
  JOY = 'Winning Smile',
  FOCUSED = 'Locked In / Focused',
  SCARED = 'Terrified / Low HP',
  EVIL = 'Evil / Scheming',
  TOXIC = 'Laughing / Toxic'
}

export enum CompositionMode {
  STANDARD = 'Rule of Thirds',
  VERSUS = '1v1 Split Screen',
  SQUAD = 'Squad Lineup (4 Players)',
  POV = 'First Person POV',
  THUMBNAIL_META = 'Red Arrow & Circle Meta',
  FACE_CAM = 'Face Cam Style overlay'
}

export enum ArtStyle {
  RENDER_3D = 'Unreal Engine 5 Render (Official)',
  BLENDER = 'Blender GFX (Smooth/Plastic)',
  CARTOON = 'Toon Shaded / Cell Shaded',
  COMIC = 'Comic Book Style',
  REALISTIC = 'Hyper-Realistic 8K',
  SKETCH = 'Concept Art Sketch'
}

export enum FontStyle {
  BURBANK = 'Burbank (Official Fortnite)',
  IMPACT = 'Impact (Classic Meme)',
  NEON = 'Neon Light Tubes',
  DRAMATIC = 'Cinematic / Movie Trailer',
  GLITCH = 'Glitch / Hacked Text'
}

export enum AspectRatio {
  LANDSCAPE = '16:9 (YouTube Video)',
  PORTRAIT = '9:16 (Shorts/TikTok)',
  SQUARE = '1:1 (Post)'
}

// --- CLAN FORGE TYPES ---
export enum EsportsMascot {
  WOLF = 'Wolf',
  KNIGHT = 'Knight',
  SPARTAN = 'Spartan',
  REAPER = 'Grim Reaper',
  DRAGON = 'Dragon',
  PHOENIX = 'Phoenix',
  SAMURAI = 'Samurai',
  CYBORG = 'Cyborg',
  TIGER = 'Tiger',
  SHARK = 'Shark',
  VIKING = 'Viking',
  DEMON = 'Demon',
  ALIEN = 'Alien'
}

export enum LogoStyle {
  VECTOR = 'Vector Illustration (Thick Outlines)',
  MINIMAL = 'Minimalist / Flat',
  CHROME = 'Chrome / Y2K / 3D',
  GLITCH = 'Glitch / Cyberpunk',
  VINTAGE = 'Vintage Badge / Shield',
  NEON = 'Neon Sign / Glowing'
}

export interface BrandConfig {
    name: string;
    mascot: EsportsMascot;
    style: LogoStyle;
    primaryColor: string;
}

export interface AdvancedConfig {
  lighting: LightingStyle;
  camera: CameraAngle;
  colorGrade: ColorGrade;
  emotion: Emotion;
  composition: CompositionMode;
  artStyle: ArtStyle;
  fontStyle: FontStyle;
  aspectRatio: AspectRatio;
  
  // Fortnite Specifics
  season: FortniteSeason;
  location: FortnitePOI;
  weapon: FortniteWeapon;
  rarity: ItemRarity;
  rank: FortniteRank;
  graphicsMode: GraphicsMode;
  skinVibe: SkinVibe;
  actionType: ActionType;
  
  // Toggles & Sliders
  showDamage: boolean; // "200"
  showCrown: boolean;
  showBuilds: boolean; // Wood/Brick/Metal walls
  particles: boolean;
  speedLines: boolean;
  clickbaitArrows: boolean;
  saturationBoost: boolean;
  showRankIcon: boolean;
  killCount: number; // 0-99
  
  timeOfDay: string;
  facialIntensity: number; // 1-10
}

export interface ThumbnailConfig {
  topic: string;
  textOverlay: string;
  skinDetails: string;
  category: ThumbnailCategory;
  referenceImage: string | null;
  advanced: AdvancedConfig;
  greenScreen: boolean;
}

// --- API Types ---

export interface ShopItem {
  id: string;
  displayName: string;
  displayDescription: string;
  price: {
    finalPrice: number;
    regularPrice: number;
  };
  rarity: {
    id: string;
    name: string;
  };
  displayAssets: {
    url: string;
    background?: string;
  }[];
  section: {
    id: string;
    name: string;
  };
  banner?: {
      value: string;
      intensity: string;
  };
  firstRelease?: {
      season: string;
      chapter: string;
  }
}

export interface CosmeticItem {
    id: string;
    name: string;
    description: string;
    type: { value: string; displayValue: string };
    rarity: { value: string; displayValue: string };
    images: { smallIcon: string; icon: string; featured: string; background: string };
    introduction?: { chapter: string; season: string; text: string };
}

export interface PlayerStats {
  account: {
    name: string;
    id: string;
  };
  battlePass: {
    level: number;
    progress: number;
  };
  stats: {
      all: InputStats;
      keyboardMouse?: InputStats;
      gamepad?: InputStats;
      touch?: InputStats;
  }
}

export interface InputStats {
  solo:  ModeStats;
  duo:   ModeStats;
  squad: ModeStats;
  overall: ModeStats;
}

export interface ModeStats {
  score: number;
  scorePerMin: number;
  scorePerMatch: number;
  wins: number;
  top3: number;
  top5: number;
  top6: number;
  top10: number;
  top12: number;
  top25: number;
  kills: number;
  killsPerMin: number;
  killsPerMatch: number;
  deaths: number;
  kd: number;
  matches: number;
  winRate: number;
  minutesPlayed: number;
  playersOutlived: number;
  lastModified: string;
}

export interface NewsItem {
    id: string;
    title: string;
    tabTitle: string;
    body: string;
    image: string;
    tileImage: string;
    video: string | null;
    date: string;
}

export interface MapPOI {
    id: string;
    name: string;
    location: {
        x: number;
        y: number;
        z: number;
    }
}

export interface MapData {
    images: {
        blank: string;
        pois: string;
    };
    pois: MapPOI[];
}
