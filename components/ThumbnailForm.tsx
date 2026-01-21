
import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbnailCategory, LightingStyle, CameraAngle, ColorGrade, Emotion, 
  AdvancedConfig, ThumbnailConfig, CompositionMode, ArtStyle, FontStyle,
  FortniteSeason, FortnitePOI, FortniteWeapon, ItemRarity, FortniteRank,
  GraphicsMode, SkinVibe, ActionType, AspectRatio
} from '../types';
import { MagicWandIcon, LoadingSpinner, SparklesIcon, UploadIcon, ControllerIcon, FireIcon, ScissorsIcon } from './Icons';
import { optimizePromptText } from '../services/gemini';

interface ThumbnailFormProps {
  onGenerate: (config: ThumbnailConfig) => void;
  isGenerating: boolean;
  statusMessage: string;
}

const EXAMPLE_PROMPTS = [
    "POV: You just hit a 360 no-scope to win the FNCS finals.",
    "The Cube Queen returns and destroys Tilted Towers.",
    "New Mythic Shotgun is broken! (200 damage headshot).",
    "Default skin holding the Victory Crown in a vault full of gold.",
    "1v1 Build Fight against a sweat in Creative Mode."
];

const DEFAULT_ADVANCED: AdvancedConfig = {
    lighting: LightingStyle.DEFAULT,
    camera: CameraAngle.DEFAULT,
    colorGrade: ColorGrade.VIBRANT,
    emotion: Emotion.SHOCK,
    composition: CompositionMode.STANDARD,
    artStyle: ArtStyle.RENDER_3D,
    fontStyle: FontStyle.BURBANK,
    aspectRatio: AspectRatio.LANDSCAPE,
    season: FortniteSeason.CH6_S1,
    location: FortnitePOI.NEO_TILTED,
    weapon: FortniteWeapon.PUMP_2026,
    rarity: ItemRarity.LEGENDARY,
    rank: FortniteRank.UNREAL,
    graphicsMode: GraphicsMode.CINEMATIC,
    skinVibe: SkinVibe.SWEATY,
    actionType: ActionType.SHOOTING_ADS,
    showDamage: false,
    showCrown: false,
    showBuilds: true,
    particles: true,
    speedLines: false,
    clickbaitArrows: true,
    saturationBoost: true,
    showRankIcon: false,
    killCount: 20,
    timeOfDay: 'Sunset',
    facialIntensity: 9,
};

// Skin Lab Options
const SKIN_BASES = ['Female Default', 'Male Default', 'Robot', 'Monster', 'Anime Character', 'Banana', 'Fish'];
const SKIN_STYLES = ['Tactical', 'Sweaty (Minimal)', 'Cyberpunk', 'Military', 'Casual Streetwear', 'Formal Suit', 'Galaxy/Cosmic', 'Armored'];
const SKIN_COLORS = ['Black/Red', 'All Black', 'White/Gold', 'Slurp Blue', 'Galaxy Purple', 'Neon Green', 'Camo', 'Pastel Pink'];
const SKIN_ACCESSORIES = ['Mask', 'Hoodie Up', 'Headphones', 'Sunglasses', 'Crown', 'Cape', 'Backwards Hat'];

export const ThumbnailForm: React.FC<ThumbnailFormProps> = ({ onGenerate, isGenerating, statusMessage }) => {
  // Core Inputs
  const [topic, setTopic] = useState('');
  const [textOverlay, setTextOverlay] = useState('');
  
  // Skin Logic
  const [skinDetails, setSkinDetails] = useState('');
  const [showSkinLab, setShowSkinLab] = useState(false);
  const [labConfig, setLabConfig] = useState({
      base: '',
      style: '',
      color: '',
      accessories: [] as string[]
  });

  const [category, setCategory] = useState<ThumbnailCategory>(ThumbnailCategory.BATTLE_ROYALE);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [greenScreen, setGreenScreen] = useState(false);

  // Advanced Config
  const [advanced, setAdvanced] = useState<AdvancedConfig>(DEFAULT_ADVANCED);
  const [showAdvanced, setShowAdvanced] = useState(true); 
  const [activeTab, setActiveTab] = useState<'loadout' | 'world' | 'gfx' | 'hype'>('loadout');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync Skin Lab to Input string
  useEffect(() => {
    if (labConfig.base || labConfig.style || labConfig.color || labConfig.accessories.length > 0) {
        const parts = [];
        if (labConfig.base) parts.push(`${labConfig.base} Model`);
        if (labConfig.style) parts.push(`${labConfig.style} Style`);
        if (labConfig.color) parts.push(`${labConfig.color} Color Theme`);
        if (labConfig.accessories.length > 0) parts.push(`Wearing ${labConfig.accessories.join(', ')}`);
        setSkinDetails(parts.join(', '));
    }
  }, [labConfig]);

  const updateAdvanced = (key: keyof AdvancedConfig, value: any) => {
    setAdvanced(prev => ({ ...prev, [key]: value }));
  };

  const toggleAccessory = (acc: string) => {
      setLabConfig(prev => {
          const exists = prev.accessories.includes(acc);
          return {
              ...prev,
              accessories: exists ? prev.accessories.filter(a => a !== acc) : [...prev.accessories, acc]
          };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    const config: ThumbnailConfig = {
        topic,
        textOverlay,
        skinDetails,
        category,
        referenceImage,
        greenScreen,
        advanced,
    };
    
    onGenerate(config);
  };

  const handleMagicOptimize = async () => {
    if (!topic.trim()) return;
    setIsOptimizing(true);
    const tempConfig: ThumbnailConfig = { topic, textOverlay, skinDetails, category, referenceImage, greenScreen, advanced };
    const optimized = await optimizePromptText(tempConfig);
    setTopic(optimized);
    setIsOptimizing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- VISUAL SELECTOR COMPONENT ---
  const VisualSelector = ({ label, value, options, onChange, cols = 2 }: any) => (
      <div className="space-y-3">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">{label}</label>
          <div className={`grid grid-cols-${cols} gap-2`}>
              {Object.entries(options).map(([k, v]) => {
                  const val = v as string;
                  const isSelected = value === val;
                  // Extract display name (remove parens if needed for cleaner look)
                  const displayName = val.split(' (')[0].replace('Fortnite ', '');
                  
                  return (
                      <button
                          key={k}
                          type="button"
                          onClick={() => onChange(val)}
                          className={`
                              relative p-3 rounded-xl border text-left transition-all duration-200 group overflow-hidden
                              ${isSelected 
                                  ? 'bg-strawberry-600 border-strawberry-500 text-white shadow-[0_0_15px_rgba(255,23,68,0.4)] scale-[1.02]' 
                                  : 'bg-void-700 border-white/5 text-zinc-400 hover:bg-void-600 hover:border-white/10 hover:text-white'}
                          `}
                      >
                          <span className="relative z-10 text-[10px] font-black uppercase tracking-wide block truncate">{displayName}</span>
                          {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-strawberry-500/20 to-transparent"></div>}
                      </button>
                  );
              })}
          </div>
      </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 animate-fade-in-up">
      {/* Hero Title Section */}
      <div className="text-center space-y-6 relative mb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-strawberry-600/20 via-purple-900/10 to-strawberry-900/20 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
        
        <h2 className="text-7xl sm:text-9xl font-display text-white italic tracking-wider drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] stroke-black z-10 relative flex flex-col sm:flex-row items-center justify-center gap-4" style={{ WebkitTextStroke: '2px black' }}>
          <span>CREATE</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-strawberry-400 to-strawberry-600 drop-shadow-[0_0_30px_rgba(255,23,68,0.6)]">HYPE</span>
        </h2>
        
        <div className="flex justify-center gap-4">
            <span className="px-6 py-2 rounded-full bg-black/60 border border-strawberry-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-white backdrop-blur-md shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Gemini 2.5 Active
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="bg-void-900/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Header / Meta Bar */}
            <div className="h-16 bg-black/80 border-b border-white/5 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PROJECT: NEW THUMBNAIL</span>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mr-2">QUICK SET:</span>
                     <button type="button" onClick={() => setTopic("WINNING WITH 1 HP!")} className="text-[9px] font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded border border-white/10 uppercase transition-colors">Clutch</button>
                     <button type="button" onClick={() => setTopic("SECRET UPDATE FOUND")} className="text-[9px] font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded border border-white/10 uppercase transition-colors">News</button>
                </div>
            </div>

            <div className="p-6 sm:p-10 space-y-10">
            
            {/* --- PRIMARY INPUTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                
                {/* Left Column: Core Idea */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* Prompt Input Area */}
                    <div className="space-y-4 group">
                        <div className="flex justify-between items-end px-1">
                            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
                                 <FireIcon className="w-5 h-5 text-strawberry-500" /> 
                                 <span className="text-zinc-300">Video Concept</span>
                            </label>
                            <button type="button" onClick={handleMagicOptimize} disabled={isOptimizing} className="text-[10px] font-black text-strawberry-400 hover:text-white transition-all flex items-center gap-2 bg-strawberry-900/20 hover:bg-strawberry-600 px-4 py-2 rounded-lg border border-strawberry-500/30 hover:scale-105">
                                {isOptimizing ? <LoadingSpinner className="w-3 h-3"/> : <MagicWandIcon className="w-3 h-3"/>} 
                                <span>AI ENHANCE</span>
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-strawberry-600 to-purple-900 blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500 rounded-3xl"></div>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Describe the scene (e.g. 'I Won a Game with 0 Kills')"
                                className="relative w-full bg-void-800 border-2 border-white/10 rounded-3xl px-8 py-6 text-white focus:border-strawberry-500 focus:shadow-[0_0_30px_rgba(255,23,68,0.2)] transition-all h-32 text-xl font-bold placeholder:text-zinc-700 resize-none leading-relaxed outline-none z-10"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Secondary Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- SKIN INPUT --- */}
                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-1">Hero Character</label>
                                <button type="button" onClick={() => setShowSkinLab(!showSkinLab)} className="text-[9px] font-bold text-strawberry-400 uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1">
                                    <ScissorsIcon className="w-3 h-3" />
                                    {showSkinLab ? 'Close Lab' : 'Customize'}
                                </button>
                            </div>
                            
                            <input 
                                type="text" 
                                value={skinDetails} 
                                onChange={(e) => setSkinDetails(e.target.value)} 
                                placeholder="e.g. Aura, Travis Scott" 
                                className="w-full bg-void-800 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-strawberry-500 focus:shadow-[0_0_20px_rgba(255,23,68,0.3)] outline-none transition-all" 
                            />

                            {/* --- SKIN LAB PANEL --- */}
                            {showSkinLab && (
                                <div className="mt-4 p-6 bg-void-800 rounded-2xl border border-strawberry-500/30 shadow-xl animate-fade-in relative overflow-hidden">
                                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-strawberry-500 rounded-full animate-pulse"></span>
                                        Character Designer
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Base Model</span>
                                            <div className="flex flex-wrap gap-1">
                                                {SKIN_BASES.map(base => (
                                                    <button key={base} type="button" onClick={() => setLabConfig({...labConfig, base})} className={`px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${labConfig.base === base ? 'bg-strawberry-600 text-white border-strawberry-500' : 'bg-black/30 text-zinc-500 border-white/5 hover:bg-white/5'}`}>{base}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Style</span>
                                            <div className="flex flex-wrap gap-1">
                                                {SKIN_STYLES.map(style => (
                                                    <button key={style} type="button" onClick={() => setLabConfig({...labConfig, style})} className={`px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${labConfig.style === style ? 'bg-blue-600 text-white border-blue-500' : 'bg-black/30 text-zinc-500 border-white/5 hover:bg-white/5'}`}>{style}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative group">
                             <label className="text-[10px] text-zinc-400 font-black uppercase tracking-widest ml-1">3D Text Overlay</label>
                             <input type="text" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} placeholder="e.g. SECRET!" className="w-full bg-void-800 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:border-fortnite-gold focus:shadow-[0_0_20px_rgba(251,191,36,0.3)] outline-none transition-all tracking-wide" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Reference Image */}
                <div className="xl:col-span-4 flex flex-col gap-4">
                     <label className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 bg-strawberry-500 rounded-full animate-pulse"></span>
                         Reference Asset
                     </label>
                    <div onClick={() => fileInputRef.current?.click()} className={`flex-1 min-h-[220px] border-2 border-dashed rounded-[2rem] bg-void-800 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden transition-all group ${referenceImage ? 'border-strawberry-500 shadow-[0_0_30px_rgba(255,23,68,0.2)]' : 'border-white/10 hover:border-strawberry-500/50 hover:bg-void-700'}`}>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        
                        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                        {referenceImage ? (
                            <>
                                <img src={referenceImage} alt="Ref" className="w-full h-full object-contain p-6 z-10 relative" />
                                <div className="absolute bottom-4 right-4 bg-green-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">Active</div>
                                <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-red-500 transition-colors z-20" onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-strawberry-500/50 group-hover:bg-strawberry-500/10 transition-colors">
                                    <UploadIcon className="w-6 h-6 text-zinc-500 group-hover:text-strawberry-500 transition-colors"/>
                                </div>
                                <span className="text-sm text-white font-black uppercase tracking-widest block mb-1">Upload Face / Skin</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ADVANCED SETTINGS PANEL (VISUAL UPGRADE) --- */}
            <div className="border-t border-white/5 pt-10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                     <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-strawberry-600 to-black p-2.5 rounded-xl shadow-lg border border-strawberry-500/30">
                            <ControllerIcon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="flex flex-col">
                            <span className="tracking-widest uppercase text-white font-black text-xl">Studio Config</span>
                            <span className="text-[10px] text-strawberry-500 uppercase tracking-[0.2em] font-bold">Customize Every Detail</span>
                        </div>
                    </div>
                </div>

                <div className="bg-void-800 rounded-[2.5rem] p-2 border border-white/5 shadow-inner relative overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex space-x-2 p-2 mb-2 overflow-x-auto no-scrollbar bg-void-900 rounded-[2rem] border border-white/5">
                        {(['loadout', 'world', 'gfx', 'hype'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 px-4 rounded-3xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-black shadow-lg scale-100' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab === 'loadout' && '🎒 Loadout'}
                                {tab === 'world' && '🌍 Map'}
                                {tab === 'gfx' && '🎨 Graphics'}
                                {tab === 'hype' && '🔥 Hype'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                        
                        {/* TAB: LOADOUT */}
                        {activeTab === 'loadout' && (
                            <>
                                <VisualSelector label="Weapon" value={advanced.weapon} options={FortniteWeapon} onChange={(v:any) => updateAdvanced('weapon', v)} cols={2} />
                                <VisualSelector label="Rarity" value={advanced.rarity} options={ItemRarity} onChange={(v:any) => updateAdvanced('rarity', v)} cols={2} />
                                <VisualSelector label="Emotion" value={advanced.emotion} options={Emotion} onChange={(v:any) => updateAdvanced('emotion', v)} cols={2} />
                                <VisualSelector label="Pose" value={advanced.actionType} options={ActionType} onChange={(v:any) => updateAdvanced('actionType', v)} cols={1} />
                            </>
                        )}

                         {/* TAB: WORLD */}
                         {activeTab === 'world' && (
                            <>
                                <VisualSelector label="Season" value={advanced.season} options={FortniteSeason} onChange={(v:any) => updateAdvanced('season', v)} cols={1} />
                                <VisualSelector label="POI" value={advanced.location} options={FortnitePOI} onChange={(v:any) => updateAdvanced('location', v)} cols={2} />
                                <VisualSelector label="Lighting" value={advanced.lighting} options={LightingStyle} onChange={(v:any) => updateAdvanced('lighting', v)} cols={2} />
                                <div className="space-y-2">
                                     <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Time of Day</label>
                                     <input type="range" min="0" max="24" className="w-full h-2 bg-void-900 rounded-lg appearance-none cursor-pointer accent-strawberry-500"/>
                                </div>
                            </>
                        )}

                         {/* TAB: GFX */}
                         {activeTab === 'gfx' && (
                            <>
                                <VisualSelector label="Render Mode" value={advanced.graphicsMode} options={GraphicsMode} onChange={(v:any) => updateAdvanced('graphicsMode', v)} cols={1} />
                                <VisualSelector label="Cam Angle" value={advanced.camera} options={CameraAngle} onChange={(v:any) => updateAdvanced('camera', v)} cols={2} />
                                <VisualSelector label="Color Grade" value={advanced.colorGrade} options={ColorGrade} onChange={(v:any) => updateAdvanced('colorGrade', v)} cols={2} />
                                <VisualSelector label="Ratio" value={advanced.aspectRatio} options={AspectRatio} onChange={(v:any) => updateAdvanced('aspectRatio', v)} cols={2} />
                            </>
                        )}

                         {/* TAB: HYPE */}
                         {activeTab === 'hype' && (
                            <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { id: 'showDamage', label: '200 Damage', icon: '💥', active: advanced.showDamage },
                                    { id: 'clickbaitArrows', label: 'Red Arrows', icon: '🛑', active: advanced.clickbaitArrows },
                                    { id: 'showRankIcon', label: 'Rank Icon', icon: '🏆', active: advanced.showRankIcon },
                                    { id: 'greenScreen', label: 'Chroma Key', icon: '🟩', active: greenScreen }
                                ].map((item) => (
                                    <button 
                                        key={item.id}
                                        type="button" 
                                        onClick={() => item.id === 'greenScreen' ? setGreenScreen(!greenScreen) : updateAdvanced(item.id as keyof AdvancedConfig, !item.active)} 
                                        className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 ${item.active ? 'bg-gradient-to-br from-strawberry-600 to-red-800 border-strawberry-500 text-white shadow-lg scale-105' : 'bg-void-900 border-white/10 text-zinc-500 hover:bg-white/5'}`}
                                    >
                                        <span className="text-4xl">{item.icon}</span>
                                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>

            {/* GENERATE BUTTON */}
            <div className="pt-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-strawberry-500 via-red-600 to-strawberry-800 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-[2rem]"></div>
                <button
                    type="submit"
                    disabled={isGenerating}
                    className={`w-full py-8 rounded-[2rem] font-display text-5xl tracking-wide shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform transition-all duration-300 flex items-center justify-center group relative overflow-hidden border-t-2 border-white/30 active:scale-[0.98] active:shadow-none
                    ${isGenerating ? 'bg-zinc-900 cursor-not-allowed grayscale' : 'bg-gradient-to-b from-strawberry-500 to-strawberry-700 text-white hover:scale-[1.01]'}`}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
                    
                    {isGenerating ? (
                        <>
                            <LoadingSpinner className="w-10 h-10 mr-6 text-white"/> 
                            <span className="text-2xl font-display text-white/70 animate-pulse">{statusMessage}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 relative z-10 drop-shadow-sm">
                            <span className="text-6xl">🚀</span>
                            <span className="mt-2 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: '2px black' }}>GENERATE</span>
                        </div>
                    )}
                </button>
            </div>
            
            </div>
        </div>
      </form>
    </div>
  );
};
