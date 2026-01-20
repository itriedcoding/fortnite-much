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

const getRandomEnum = <T extends object>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex] as T[keyof T];
};

const DEFAULT_ADVANCED: AdvancedConfig = {
    lighting: LightingStyle.DEFAULT,
    camera: CameraAngle.DEFAULT,
    colorGrade: ColorGrade.VIBRANT,
    emotion: Emotion.SHOCK,
    composition: CompositionMode.STANDARD,
    artStyle: ArtStyle.RENDER_3D,
    fontStyle: FontStyle.BURBANK,
    aspectRatio: AspectRatio.LANDSCAPE,
    
    // Fortnite Defaults
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

  const handleRandomize = () => {
      setAdvanced({
          ...DEFAULT_ADVANCED,
          lighting: getRandomEnum(LightingStyle),
          season: getRandomEnum(FortniteSeason),
          location: getRandomEnum(FortnitePOI),
          weapon: getRandomEnum(FortniteWeapon),
          emotion: getRandomEnum(Emotion),
          composition: getRandomEnum(CompositionMode),
          graphicsMode: getRandomEnum(GraphicsMode),
          actionType: getRandomEnum(ActionType),
          showCrown: Math.random() > 0.5,
          showDamage: Math.random() > 0.5,
          killCount: Math.floor(Math.random() * 99),
      });
  };

  const applyPreset = (type: 'viral' | 'competitive' | 'horror') => {
      if (type === 'viral') {
          setAdvanced({
              ...DEFAULT_ADVANCED,
              emotion: Emotion.SHOCK,
              colorGrade: ColorGrade.VIBRANT,
              showDamage: true,
              clickbaitArrows: true,
              killCount: 99,
              lighting: LightingStyle.SUNSET,
              weapon: FortniteWeapon.MYTHIC
          });
          setTextOverlay("IMPOSSIBLE?!");
      } else if (type === 'competitive') {
          setAdvanced({
              ...DEFAULT_ADVANCED,
              emotion: Emotion.FOCUSED,
              colorGrade: ColorGrade.CONTRAST,
              graphicsMode: GraphicsMode.PERFORMANCE,
              showBuilds: true,
              skinVibe: SkinVibe.SWEATY,
              weapon: FortniteWeapon.PUMP_OG,
              camera: CameraAngle.OVER_SHOULDER
          });
      } else if (type === 'horror') {
          setAdvanced({
              ...DEFAULT_ADVANCED,
              emotion: Emotion.SCARED,
              lighting: LightingStyle.NIGHT,
              colorGrade: ColorGrade.DEEP_PURPLE,
              location: FortnitePOI.UNDERWORLD,
              showDamage: false,
              showCrown: false
          });
          setTextOverlay("DON'T GO HERE");
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderSelect = (label: string, value: any, options: object, key: keyof AdvancedConfig) => (
    <div className="space-y-2 group">
      <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-fortnite-gold transition-colors ml-1">{label}</label>
      <div className="relative">
        <select 
            value={value} 
            onChange={(e) => updateAdvanced(key, e.target.value)} 
            className="w-full bg-[#0a0510] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:border-fortnite-purple focus:ring-1 focus:ring-fortnite-purple focus:shadow-[0_0_20px_rgba(126,34,206,0.3)] outline-none transition-all hover:bg-white/5 appearance-none font-bold cursor-pointer"
        >
            {Object.entries(options).map(([k, v]) => <option key={k} value={v} className="bg-[#1a0b2e]">{v}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-12 animate-fade-in-up">
      {/* Hero Title Section */}
      <div className="text-center space-y-6 relative mb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-fortnite-purple/20 via-blue-500/10 to-fortnite-gold/20 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
        
        <h2 className="text-7xl sm:text-9xl font-display text-white italic tracking-wider drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] stroke-black z-10 relative flex flex-col sm:flex-row items-center justify-center gap-4" style={{ WebkitTextStroke: '3px black' }}>
          <span>CREATE</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-fortnite-gold via-yellow-300 to-orange-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">HYPE</span>
        </h2>
        
        <div className="flex justify-center gap-4">
            <span className="px-6 py-2 rounded-full bg-black/60 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-fortnite-blue backdrop-blur-md shadow-lg">
                Chapter 6 Season 1
            </span>
            <span className="px-6 py-2 rounded-full bg-black/60 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-fortnite-gold backdrop-blur-md shadow-lg">
                UE 5.5 Render
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="bg-[#130b1c]/80 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Cosmetic Header Bar */}
            <div className="h-14 bg-[#0a0510] border-b border-white/5 flex items-center justify-between px-8">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">QUICK PRESETS:</span>
                    <div className="flex gap-2">
                         <button type="button" onClick={() => applyPreset('viral')} className="text-[9px] font-bold bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-colors uppercase">VIRAL</button>
                         <button type="button" onClick={() => applyPreset('competitive')} className="text-[9px] font-bold bg-blue-500/10 text-blue-500 px-3 py-1 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors uppercase">SWEAT</button>
                         <button type="button" onClick={() => applyPreset('horror')} className="text-[9px] font-bold bg-red-500/10 text-red-500 px-3 py-1 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors uppercase">SCARY</button>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-12 space-y-12">
            
            {/* --- PRIMARY INPUTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                
                {/* Left Column: Text Inputs */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* Topic Input */}
                    <div className="space-y-3 group">
                        <div className="flex justify-between items-end px-1">
                            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
                                 <FireIcon className="w-5 h-5 text-orange-500" /> 
                                 <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Video Concept</span>
                            </label>
                            <button type="button" onClick={handleMagicOptimize} disabled={isOptimizing} className="text-[10px] font-black text-fortnite-gold hover:text-white transition-all flex items-center gap-2 bg-fortnite-gold/10 hover:bg-fortnite-gold px-4 py-2 rounded-lg border border-fortnite-gold/30 hover:scale-105">
                                {isOptimizing ? <LoadingSpinner className="w-3 h-3"/> : <MagicWandIcon className="w-3 h-3"/>} 
                                <span>AI ENHANCE</span>
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-fortnite-purple to-fortnite-blue blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl"></div>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Describe your video idea... (e.g. 'I Won a Game with 0 Kills')"
                                className="relative w-full bg-[#0a0510] border-2 border-white/10 rounded-3xl px-8 py-6 text-white focus:border-fortnite-purple focus:shadow-[0_0_30px_rgba(126,34,206,0.2)] transition-all h-40 text-2xl font-bold placeholder:text-slate-700 resize-none leading-relaxed outline-none z-10 selection:bg-fortnite-purple selection:text-white"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Secondary Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- SKIN INPUT WITH SKIN LAB TOGGLE --- */}
                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">Hero Skin</label>
                                <button type="button" onClick={() => setShowSkinLab(!showSkinLab)} className="text-[9px] font-bold text-fortnite-purple uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1">
                                    <ScissorsIcon className="w-3 h-3" />
                                    {showSkinLab ? 'Close Lab' : '✨ Open Skin Lab'}
                                </button>
                            </div>
                            
                            <input 
                                type="text" 
                                value={skinDetails} 
                                onChange={(e) => setSkinDetails(e.target.value)} 
                                placeholder="e.g. Aura, Travis Scott" 
                                className="w-full bg-[#0a0510] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-fortnite-blue focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] outline-none transition-all" 
                            />

                            {/* --- SKIN LAB PANEL --- */}
                            {showSkinLab && (
                                <div className="mt-4 p-6 bg-[#1a0b2e] rounded-2xl border border-fortnite-purple/30 shadow-xl animate-fade-in relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                        <SparklesIcon className="w-24 h-24 text-fortnite-purple" />
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-fortnite-purple rounded-full animate-pulse"></span>
                                        Character Designer
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        {/* Base Model */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Base Model</span>
                                            <div className="flex flex-wrap gap-2">
                                                {SKIN_BASES.map(base => (
                                                    <button 
                                                        key={base}
                                                        type="button"
                                                        onClick={() => setLabConfig({...labConfig, base})}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${labConfig.base === base ? 'bg-fortnite-purple text-white border-fortnite-purple' : 'bg-black/30 text-slate-400 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        {base}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Style */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Outfit Style</span>
                                            <div className="flex flex-wrap gap-2">
                                                {SKIN_STYLES.map(style => (
                                                    <button 
                                                        key={style}
                                                        type="button"
                                                        onClick={() => setLabConfig({...labConfig, style})}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${labConfig.style === style ? 'bg-blue-600 text-white border-blue-500' : 'bg-black/30 text-slate-400 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Theme */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Color Theme</span>
                                            <div className="flex flex-wrap gap-2">
                                                {SKIN_COLORS.map(color => (
                                                    <button 
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setLabConfig({...labConfig, color})}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${labConfig.color === color ? 'bg-fortnite-gold text-black border-fortnite-gold' : 'bg-black/30 text-slate-400 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        {color}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Accessories */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">Accessories (Toggle)</span>
                                            <div className="flex flex-wrap gap-2">
                                                {SKIN_ACCESSORIES.map(acc => (
                                                    <button 
                                                        key={acc}
                                                        type="button"
                                                        onClick={() => toggleAccessory(acc)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${labConfig.accessories.includes(acc) ? 'bg-green-600 text-white border-green-500' : 'bg-black/30 text-slate-400 border-white/5 hover:border-white/20'}`}
                                                    >
                                                        {acc}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative group">
                             <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">3D Text Overlay</label>
                             <input type="text" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} placeholder="e.g. SECRET!" className="w-full bg-[#0a0510] border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:border-fortnite-gold focus:shadow-[0_0_20px_rgba(251,191,36,0.3)] outline-none transition-all tracking-wide" />
                             {textOverlay === '' && <span className="absolute right-4 top-[38px] text-[9px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 font-bold tracking-wider pointer-events-none">AUTO</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reference Image */}
                <div className="xl:col-span-4 flex flex-col gap-4">
                     <label className="text-sm font-black text-slate-300 uppercase tracking-widest text-center xl:text-left flex items-center gap-2 justify-center xl:justify-start">
                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                         Reference Asset
                     </label>
                    <div onClick={() => fileInputRef.current?.click()} className={`flex-1 min-h-[250px] border-2 border-dashed rounded-[2rem] bg-[#0a0510] cursor-pointer flex flex-col items-center justify-center relative overflow-hidden transition-all group ${referenceImage ? 'border-fortnite-gold shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/10 hover:border-fortnite-purple/50 hover:bg-[#11081f]'}`}>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        
                        {/* Grid Pattern Background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                        {referenceImage ? (
                            <>
                                <img src={referenceImage} alt="Ref" className="w-full h-full object-contain p-6 z-10 relative" />
                                <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 z-0" style={{backgroundImage: `url(${referenceImage})`}}></div>
                                <div className="absolute bottom-4 right-4 bg-green-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">Active</div>
                                <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-red-500 transition-colors z-20" onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}>
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:border-fortnite-purple/50 group-hover:bg-fortnite-purple/10 transition-colors">
                                    <UploadIcon className="w-6 h-6 text-slate-400 group-hover:text-fortnite-purple transition-colors"/>
                                </div>
                                <span className="text-sm text-white font-black uppercase tracking-widest block mb-1">Upload Face / Skin</span>
                                <span className="text-[10px] text-slate-500 font-bold block">Supports PNG, JPG (Max 5MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ADVANCED SETTINGS PANEL --- */}
            <div className="border-t border-white/5 pt-10">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                     <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-fortnite-blue to-[#1e40af] p-2.5 rounded-xl shadow-lg border border-white/10">
                            <ControllerIcon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="flex flex-col">
                            <span className="tracking-widest uppercase text-white font-black text-xl">Studio Config</span>
                            <span className="text-[10px] text-fortnite-blue uppercase tracking-[0.2em] font-bold">Customize Every Detail</span>
                        </div>
                    </div>
                    
                    <button type="button" onClick={handleRandomize} className="group relative px-6 py-3 bg-[#0a0510] border border-white/10 rounded-xl overflow-hidden hover:border-fortnite-gold/50 transition-colors">
                        <div className="absolute inset-0 bg-fortnite-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center gap-2">
                             <SparklesIcon className="w-4 h-4 text-fortnite-gold group-hover:animate-spin"/>
                             <span className="text-xs font-black text-slate-300 uppercase tracking-wider group-hover:text-white">Randomize Loadout</span>
                        </div>
                    </button>
                </div>

                {showAdvanced && (
                    <div className="animate-fade-in bg-[#0a0510] rounded-[2.5rem] p-2 border border-white/5 shadow-inner relative overflow-hidden">
                        {/* Tab Headers */}
                        <div className="flex space-x-2 p-2 mb-2 overflow-x-auto no-scrollbar bg-[#130b1c] rounded-[2rem] border border-white/5">
                            {(['loadout', 'world', 'gfx', 'hype'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 px-4 rounded-3xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-black shadow-lg scale-100' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {tab === 'loadout' && '🎒 Loadout'}
                                    {tab === 'world' && '🌍 Map'}
                                    {tab === 'gfx' && '🎨 Graphics'}
                                    {tab === 'hype' && '🔥 Hype'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 min-h-[300px]">
                             {/* Tab Content with Animation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 animate-fade-in">
                            
                            {/* TAB: LOADOUT */}
                            {activeTab === 'loadout' && (
                                <>
                                    <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6 border-r border-white/5 pr-4">
                                        <h4 className="text-[10px] font-black text-fortnite-purple uppercase tracking-[0.3em] mb-4 opacity-70">Weapons</h4>
                                        {renderSelect('Equipped Item', advanced.weapon, FortniteWeapon, 'weapon')}
                                        {renderSelect('Item Rarity', advanced.rarity, ItemRarity, 'rarity')}
                                    </div>
                                    <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6 border-r border-white/5 pr-4">
                                        <h4 className="text-[10px] font-black text-fortnite-purple uppercase tracking-[0.3em] mb-4 opacity-70">Character</h4>
                                        {renderSelect('Skin Style', advanced.skinVibe, SkinVibe, 'skinVibe')}
                                        {renderSelect('Facial Emotion', advanced.emotion, Emotion, 'emotion')}
                                    </div>
                                    <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6 pr-4">
                                        <h4 className="text-[10px] font-black text-fortnite-purple uppercase tracking-[0.3em] mb-4 opacity-70">Action</h4>
                                        {renderSelect('Pose / Action', advanced.actionType, ActionType, 'actionType')}
                                        {renderSelect('Rank Badge', advanced.rank, FortniteRank, 'rank')}
                                    </div>
                                </>
                            )}

                             {/* TAB: WORLD */}
                             {activeTab === 'world' && (
                                <>
                                    <div className="col-span-1 md:col-span-2 space-y-6 border-r border-white/5 pr-6">
                                        <h4 className="text-[10px] font-black text-fortnite-blue uppercase tracking-[0.3em] mb-4 opacity-70">Location</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            {renderSelect('Season Era', advanced.season, FortniteSeason, 'season')}
                                            {renderSelect('POI / Drop', advanced.location, FortnitePOI, 'location')}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-6">
                                        <h4 className="text-[10px] font-black text-fortnite-blue uppercase tracking-[0.3em] mb-4 opacity-70">Atmosphere</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                             {renderSelect('Lighting', advanced.lighting, LightingStyle, 'lighting')}
                                             <div className="flex flex-col gap-2">
                                                 <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Environment Toggles</label>
                                                 <div className="flex gap-2 h-full">
                                                    <button type="button" onClick={() => updateAdvanced('showBuilds', !advanced.showBuilds)} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${advanced.showBuilds ? 'bg-fortnite-blue/20 border-fortnite-blue text-fortnite-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:border-white/30'}`}>
                                                        Builds
                                                    </button>
                                                    <button type="button" onClick={() => updateAdvanced('showCrown', !advanced.showCrown)} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${advanced.showCrown ? 'bg-fortnite-gold/20 border-fortnite-gold text-fortnite-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:border-white/30'}`}>
                                                        Crown
                                                    </button>
                                                 </div>
                                             </div>
                                        </div>
                                    </div>
                                </>
                            )}

                             {/* TAB: GFX */}
                             {activeTab === 'gfx' && (
                                <>
                                    <div className="col-span-1 md:col-span-2 space-y-6 border-r border-white/5 pr-6">
                                        <h4 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-4 opacity-70">Engine Settings</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            {renderSelect('Graphics Mode', advanced.graphicsMode, GraphicsMode, 'graphicsMode')}
                                            {renderSelect('Art Style', advanced.artStyle, ArtStyle, 'artStyle')}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-6">
                                        <h4 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-4 opacity-70">Camera Lens</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            {renderSelect('Camera Angle', advanced.camera, CameraAngle, 'camera')}
                                            {renderSelect('Composition', advanced.composition, CompositionMode, 'composition')}
                                            {renderSelect('Color Grade', advanced.colorGrade, ColorGrade, 'colorGrade')}
                                            {renderSelect('Aspect Ratio', advanced.aspectRatio, AspectRatio, 'aspectRatio')}
                                        </div>
                                    </div>
                                </>
                            )}

                             {/* TAB: HYPE */}
                             {activeTab === 'hype' && (
                                <>
                                     <div className="col-span-full mb-4">
                                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 opacity-70">Clickbait Enhancers</h4>
                                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <button type="button" onClick={() => updateAdvanced('showDamage', !advanced.showDamage)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all border flex flex-col items-center gap-2 ${advanced.showDamage ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:bg-white/5'}`}>
                                                <span className="text-xl">💥</span>
                                                <span>200 Pump</span>
                                            </button>
                                            <button type="button" onClick={() => updateAdvanced('clickbaitArrows', !advanced.clickbaitArrows)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all border flex flex-col items-center gap-2 ${advanced.clickbaitArrows ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:bg-white/5'}`}>
                                                <span className="text-xl">🛑</span>
                                                <span>Red Arrow</span>
                                            </button>
                                            <button type="button" onClick={() => updateAdvanced('showRankIcon', !advanced.showRankIcon)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all border flex flex-col items-center gap-2 ${advanced.showRankIcon ? 'bg-white/20 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:bg-white/5'}`}>
                                                <span className="text-xl">🏆</span>
                                                <span>Rank Icon</span>
                                            </button>
                                            <button type="button" onClick={() => setGreenScreen(!greenScreen)} className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-wide transition-all border flex flex-col items-center gap-2 ${greenScreen ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-[#1a0b2e] border-white/10 text-slate-500 hover:bg-white/5'}`}>
                                                <span className="text-xl">🟩</span>
                                                <span>Chroma Key</span>
                                            </button>
                                         </div>
                                     </div>
                                     <div className="col-span-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Elimination Counter</label>
                                            <span className="text-2xl font-black text-fortnite-gold font-display drop-shadow-md">{advanced.killCount}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="99" 
                                            value={advanced.killCount} 
                                            onChange={(e) => updateAdvanced('killCount', parseInt(e.target.value))} 
                                            className="w-full h-4 bg-[#1a0b2e] rounded-full appearance-none cursor-pointer accent-fortnite-gold border border-white/10" 
                                        />
                                     </div>
                                </>
                            )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* GENERATE BUTTON */}
            <div className="pt-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-fortnite-gold via-yellow-400 to-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-[2rem]"></div>
                <button
                    type="submit"
                    disabled={isGenerating}
                    className={`w-full py-8 rounded-[2rem] font-display text-5xl tracking-wide shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform transition-all duration-300 flex items-center justify-center group relative overflow-hidden border-t-2 border-white/30 active:scale-[0.98] active:shadow-none
                    ${isGenerating ? 'bg-slate-900 cursor-not-allowed grayscale' : 'bg-gradient-to-b from-fortnite-gold to-yellow-600 text-[#0f0518] hover:scale-[1.01]'}`}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
                    
                    {isGenerating ? (
                        <>
                            <LoadingSpinner className="w-10 h-10 mr-6 text-black"/> 
                            <span className="text-2xl font-display text-black/70 animate-pulse">{statusMessage}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 relative z-10 drop-shadow-sm">
                            <span className="text-6xl">🚀</span>
                            <span className="mt-2 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: '1px black' }}>GENERATE</span>
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
