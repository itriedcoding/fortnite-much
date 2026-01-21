
import React, { useState, useEffect } from 'react';
import { EsportsMascot, LogoStyle, AspectRatio } from '../types';
import { generateBrandName, generateLogoPrompt, generateThumbnailImage, analyzeBrandIdentity } from '../services/gemini';
import { LoadingSpinner, ShieldIcon, SparklesIcon, DownloadIcon, MagicWandIcon, RobotIcon, ScissorsIcon } from './Icons';

const JERSEY_PATTERNS = [
    { id: 'plain', name: 'Clean', svg: null },
    { id: 'stripes', name: 'Vertical', svg: <path d="M192 32 V480 M256 32 V480 M320 32 V480" stroke="rgba(255,255,255,0.1)" strokeWidth="20" /> },
    { id: 'chevron', name: 'Victory', svg: <path d="M128 160 L256 288 L384 160 M128 220 L256 348 L384 220" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="30" /> },
    { id: 'camo', name: 'Digital', svg: <path d="M150 100 H200 V150 H150 Z M300 200 H350 V250 H300 Z M200 300 H250 V350 H200 Z" fill="rgba(255,255,255,0.1)" /> }
];

export const BrandStudio: React.FC = () => {
    // Configuration State
    const [teamName, setTeamName] = useState('');
    const [vibe, setVibe] = useState('');
    const [mascot, setMascot] = useState<EsportsMascot>(EsportsMascot.WOLF);
    const [style, setStyle] = useState<LogoStyle>(LogoStyle.VECTOR);
    const [color, setColor] = useState('#EF4444');
    
    // View State
    const [viewMode, setViewMode] = useState<'logo' | 'kit' | 'banner'>('logo');
    const [kitColor, setKitColor] = useState('#111111');
    const [kitPattern, setKitPattern] = useState(JERSEY_PATTERNS[0]);

    // Processing State
    const [isNaming, setIsNaming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isForging, setIsForging] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    // Auto-Analyze Identity when name changes (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (teamName.length > 3) {
                setIsAnalyzing(true);
                const identity = await analyzeBrandIdentity(teamName);
                
                // Map string response to Enums if possible, else default
                const matchedMascot = Object.values(EsportsMascot).find(m => identity.mascot.includes(m)) || identity.mascot as EsportsMascot;
                const matchedStyle = Object.values(LogoStyle).find(s => identity.style.includes(s.split(' ')[0])) || LogoStyle.VECTOR;
                
                setMascot(matchedMascot);
                setStyle(matchedStyle);
                setColor(identity.color);
                setKitColor(identity.color); // Sync jersey color
                setIsAnalyzing(false);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [teamName]);

    const handleInventName = async () => {
        if (!vibe.trim()) return;
        setIsNaming(true);
        const name = await generateBrandName(vibe);
        setTeamName(name);
        setIsNaming(false);
    };

    const handleForge = async () => {
        if (!teamName) return;
        setIsForging(true);
        setResultUrl(null);
        setProcessedUrl(null);
        
        try {
            const prompt = generateLogoPrompt({
                name: teamName,
                mascot: mascot,
                style: style,
                primaryColor: color
            });
            const url = await generateThumbnailImage(prompt, null, AspectRatio.SQUARE);
            setResultUrl(url);
            
            // Auto Remove BG Attempt immediately
            setTimeout(() => handleRemoveBackground(url), 500);

        } catch (e) {
            console.error(e);
        } finally {
            setIsForging(false);
        }
    };

    const handleRemoveBackground = (inputUrl?: string) => {
        const urlToUse = inputUrl || resultUrl;
        if (!urlToUse) return;
        
        setIsRemovingBg(true);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = urlToUse;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Sample top-left pixel to find background color
            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];
            const tolerance = 40; // Tolerance for compression artifacts

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (
                    Math.abs(r - bgR) < tolerance &&
                    Math.abs(g - bgG) < tolerance &&
                    Math.abs(b - bgB) < tolerance
                ) {
                    data[i + 3] = 0; // Transparent
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedUrl(canvas.toDataURL('image/png'));
            setIsRemovingBg(false);
        };
    };

    const currentLogo = processedUrl || resultUrl;

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-20">
             
             {/* Header */}
             <div className="text-center space-y-6 mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[300px] bg-red-600/10 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
                 <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <ShieldIcon className="w-20 h-20 text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
                    <span>CLAN</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 drop-shadow-[0_0_30px_rgba(255,23,68,0.6)]">FORGE</span>
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Esports Identity Engine • Vector Fabricator</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 
                 {/* LEFT: CONTROLS */}
                 <div className="lg:col-span-5 space-y-8">
                     <div className="bg-[#130b1c] rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                         
                         {/* 1. IDENTITY ENGINE */}
                         <div className="mb-10 relative">
                             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                 <RobotIcon className="w-4 h-4 text-red-500"/> Phase 1: Identity
                             </h3>
                             
                             <div className="space-y-4">
                                 <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        value={vibe} 
                                        onChange={(e) => setVibe(e.target.value)} 
                                        placeholder="Team Vibe (e.g. Aggressive, Royal, Speed)" 
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-red-500 transition-all"
                                     />
                                     <button onClick={handleInventName} disabled={isNaming} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all disabled:opacity-50">
                                        {isNaming ? <LoadingSpinner className="w-5 h-5"/> : <MagicWandIcon className="w-5 h-5"/>}
                                     </button>
                                 </div>

                                 <div className="relative group">
                                     <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="TEAM NAME" className="w-full bg-black/60 border-2 border-red-500/30 rounded-2xl px-6 py-6 text-2xl font-black text-white uppercase italic tracking-wider text-center focus:border-red-500 focus:shadow-[0_0_30px_rgba(220,38,38,0.2)] outline-none transition-all placeholder:text-slate-700"/>
                                     {teamName && (
                                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                             {isAnalyzing ? <LoadingSpinner className="w-5 h-5 text-red-500" /> : <ShieldIcon className="w-6 h-6 text-green-500"/>}
                                         </div>
                                     )}
                                 </div>
                                 {isAnalyzing && <p className="text-[10px] text-red-400 font-mono text-center animate-pulse">ANALYZING IDENTITY & COLOR THEORY...</p>}
                             </div>
                         </div>

                         {/* 2. VISUAL BLUEPRINT */}
                         <div className="relative">
                             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                 <SparklesIcon className="w-4 h-4 text-orange-500"/> Phase 2: Visuals
                             </h3>

                             <div className="space-y-6">
                                 {/* Mascot Selector */}
                                 <div className="space-y-2">
                                     <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mascot Archetype</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         {Object.values(EsportsMascot).slice(0, 6).map((m) => (
                                             <button key={m} onClick={() => setMascot(m as EsportsMascot)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${mascot === m ? 'bg-red-600 text-white border-red-500' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5'}`}>{m}</button>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                         <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Art Style</label>
                                         <select value={style} onChange={(e) => setStyle(e.target.value as LogoStyle)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white font-bold outline-none focus:border-orange-500 appearance-none">
                                             {Object.values(LogoStyle).map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                                         </select>
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Primary Hex</label>
                                         <div className="flex gap-2">
                                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"/>
                                            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white font-bold outline-none focus:border-orange-500"/>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="mt-10">
                            <button onClick={handleForge} disabled={isForging || !teamName} className="w-full py-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] font-display text-4xl text-white tracking-wide shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                {isForging ? <span className="animate-pulse">FORGING...</span> : <span className="drop-shadow-md" style={{WebkitTextStroke: '1px black'}}>FORGE LOGO</span>}
                            </button>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT: PREVIEW */}
                 <div className="lg:col-span-7 flex flex-col justify-center">
                     <div className="flex gap-4 mb-4 justify-center bg-black/40 p-2 rounded-full border border-white/10 inline-flex mx-auto">
                         <button onClick={() => setViewMode('logo')} className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'logo' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>Icon</button>
                         <button onClick={() => setViewMode('kit')} className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'kit' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>Jersey</button>
                         <button onClick={() => setViewMode('banner')} className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${viewMode === 'banner' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}>Social Banner</button>
                     </div>

                     <div className="relative w-full aspect-square rounded-[3rem] bg-[#050505] border border-white/10 shadow-2xl flex items-center justify-center p-8 overflow-hidden group">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505] animate-pulse-slow"></div>
                         <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

                         {resultUrl ? (
                             viewMode === 'logo' ? (
                                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-fade-in">
                                    <div className="relative w-full max-w-[500px] aspect-square rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_0_100px_rgba(220,38,38,0.2)] bg-black/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                        <img src={currentLogo!} alt="Logo" className="w-full h-full object-contain p-8 relative z-10"/>
                                        
                                        {/* Auto BG Removal Notification */}
                                        {isRemovingBg && (
                                            <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded text-[10px] text-green-400 font-mono animate-pulse border border-green-500/30">
                                                REMOVING BG...
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-8 text-center space-y-4">
                                        <h2 className="text-6xl font-display text-white italic uppercase tracking-wider drop-shadow-2xl">{teamName}</h2>
                                        <div className="flex gap-2 justify-center">
                                            <a href={currentLogo!} download={`${teamName}-logo.png`} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-black uppercase rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg">
                                                <DownloadIcon className="w-5 h-5"/> Download PNG
                                            </a>
                                            {!processedUrl && (
                                                <button onClick={() => handleRemoveBackground()} disabled={isRemovingBg} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10">
                                                    {isRemovingBg ? <LoadingSpinner className="w-5 h-5"/> : <ScissorsIcon className="w-5 h-5"/>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                             ) : viewMode === 'kit' ? (
                                 <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-fade-in">
                                     <div className="relative w-[400px] h-[500px]">
                                         {/* T-Shirt SVG */}
                                         <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl" style={{filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}}>
                                             <defs>
                                                 <mask id="shirtMask">
                                                     <path d="M128 32 C 128 32 160 64 256 64 C 352 64 384 32 384 32 L 480 96 L 448 192 L 384 160 L 384 480 L 128 480 L 128 160 L 64 192 L 32 96 L 128 32" fill="white" />
                                                 </mask>
                                             </defs>
                                             {/* Base */}
                                             <path d="M128 32 C 128 32 160 64 256 64 C 352 64 384 32 384 32 L 480 96 L 448 192 L 384 160 L 384 480 L 128 480 L 128 160 L 64 192 L 32 96 L 128 32" fill={kitColor} />
                                             
                                             {/* Pattern Overlay masked to shirt */}
                                             <g mask="url(#shirtMask)">
                                                 {kitPattern.svg}
                                             </g>

                                             {/* Outline */}
                                             <path d="M128 32 C 128 32 160 64 256 64 C 352 64 384 32 384 32 L 480 96 L 448 192 L 384 160 L 384 480 L 128 480 L 128 160 L 64 192 L 32 96 L 128 32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/>
                                         </svg>
                                         
                                         {/* Logo Overlay */}
                                         <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[120px] h-[120px]">
                                             <img src={currentLogo!} className="w-full h-full object-contain" style={{filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))'}} />
                                         </div>
                                         <div className="absolute top-[250px] left-1/2 -translate-x-1/2 text-center w-full">
                                             <span className="font-display text-4xl text-white opacity-90 uppercase tracking-widest drop-shadow-md block" style={{WebkitTextStroke: '1px rgba(0,0,0,0.5)'}}>{teamName}</span>
                                             <div className="flex justify-center gap-4 mt-2">
                                                 <div className="w-8 h-8 bg-white/10 rounded border border-white/20"></div>
                                                 <div className="w-8 h-8 bg-white/10 rounded border border-white/20"></div>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     <div className="mt-4 flex flex-col gap-3 items-center">
                                         <div className="flex gap-2">
                                            {['#111111', '#ffffff', color, '#3b82f6', '#22c55e'].map((c, i) => (
                                                <button key={i} onClick={() => setKitColor(c)} className="w-6 h-6 rounded-full border border-white/20 shadow-lg hover:scale-110 transition-transform" style={{backgroundColor: c}}></button>
                                            ))}
                                         </div>
                                         <div className="flex gap-2">
                                             {JERSEY_PATTERNS.map(p => (
                                                 <button key={p.id} onClick={() => setKitPattern(p)} className={`px-2 py-1 text-[9px] uppercase font-bold border rounded ${kitPattern.id === p.id ? 'bg-white text-black' : 'bg-black/40 text-slate-400 border-white/10'}`}>
                                                     {p.name}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             ) : (
                                 // BANNER MODE
                                 <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-fade-in">
                                     <div className="w-full aspect-[3/1] bg-black relative overflow-hidden rounded-xl border border-white/10 group shadow-2xl">
                                         {/* Banner BG */}
                                         <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{backgroundImage: `url(${currentLogo})`, filter: 'blur(20px) saturate(1.5)'}}></div>
                                         <div className="absolute inset-0 bg-black/40"></div>
                                         
                                         {/* Content */}
                                         <div className="absolute inset-0 flex items-center justify-between px-12">
                                             <div className="flex items-center gap-6">
                                                 <div className="w-24 h-24 rounded-full bg-black border-4 border-white/10 overflow-hidden shadow-xl">
                                                     <img src={currentLogo!} className="w-full h-full object-cover" />
                                                 </div>
                                                 <div>
                                                     <h2 className="text-4xl font-display text-white italic uppercase tracking-wider drop-shadow-lg">{teamName}</h2>
                                                     <p className="text-xs font-mono text-white/70 tracking-widest uppercase">EST. 2026 • PRO TEAM</p>
                                                 </div>
                                             </div>
                                             <div className="flex gap-4">
                                                 {/* Social Icons Placeholder */}
                                                 <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                                 <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                                 <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                             </div>
                                         </div>
                                     </div>
                                     <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Twitter / X Header Preview</p>
                                 </div>
                             )
                         ) : (
                             <div className="text-center opacity-30 flex flex-col items-center gap-6">
                                 <ShieldIcon className="w-32 h-32 text-slate-600"/>
                                 <div className="space-y-2">
                                     <h3 className="text-2xl font-black text-white uppercase tracking-widest">Awaiting Blueprint</h3>
                                     <p className="text-sm font-mono text-slate-500">Configure parameters to begin fabrication</p>
                                 </div>
                             </div>
                         )}

                         {isForging && (
                             <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-md">
                                 <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                                 <h3 className="text-4xl font-display text-white animate-pulse">FABRICATING VECTOR...</h3>
                             </div>
                         )}
                     </div>
                 </div>

             </div>
        </div>
    );
};
