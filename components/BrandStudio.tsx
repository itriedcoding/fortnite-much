
import React, { useState, useEffect, useRef } from 'react';
import { EsportsMascot, LogoStyle, AspectRatio } from '../types';
import { generateBrandName, generateLogoPrompt, generateThumbnailImage, analyzeBrandIdentity, generateBrandSlogan } from '../services/gemini';
import { LoadingSpinner, ShieldIcon, SparklesIcon, DownloadIcon, MagicWandIcon, RobotIcon, ScissorsIcon, FireIcon } from './Icons';

const JERSEY_PATTERNS = [
    { id: 'plain', name: 'Clean', svg: null },
    { id: 'stripes', name: 'Stryker', svg: <path d="M160 32 L200 480 M256 32 L256 480 M352 32 L312 480" stroke="currentColor" strokeWidth="20" opacity="0.1" /> },
    { id: 'chevron', name: 'V-Force', svg: <path d="M128 160 L256 288 L384 160 M128 220 L256 348 L384 220 M128 280 L256 408 L384 280" fill="none" stroke="currentColor" strokeWidth="25" opacity="0.1" /> },
    { id: 'hex', name: 'Hive', svg: <path d="M50 50 L100 50 L125 93 L100 136 L50 136 L25 93 Z M200 50 L250 50 L275 93 L250 136 L200 136 L175 93 Z" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.1" transform="scale(0.5)" /> },
    { id: 'shards', name: 'Fracture', svg: <path d="M0 0 L512 512 M512 0 L0 512 M256 0 L256 512" stroke="currentColor" strokeWidth="10" opacity="0.1" /> }
];

const ELEMENTS = ['Fire', 'Ice', 'Electric', 'Void', 'Nature', 'Metal', 'Cyber', 'Toxic'];

// Helper to darken hex color
const adjustColor = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);
    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);
    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  
    const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
}

export const BrandStudio: React.FC = () => {
    // Identity State
    const [teamName, setTeamName] = useState('');
    const [vibe, setVibe] = useState('');
    const [slogan, setSlogan] = useState('');
    
    // Visual Core State
    const [mascot, setMascot] = useState<EsportsMascot>(EsportsMascot.WOLF);
    const [style, setStyle] = useState<LogoStyle>(LogoStyle.VECTOR);
    const [element, setElement] = useState('Fire');
    
    // Chromatic State
    const [primaryColor, setPrimaryColor] = useState('#EF4444');
    const [secondaryColor, setSecondaryColor] = useState('#7f1d1d');
    const [accentColor, setAccentColor] = useState('#ffffff');
    
    // View State
    const [viewMode, setViewMode] = useState<'logo' | 'merch' | 'social'>('logo');
    const [merchItem, setMerchItem] = useState<'jersey' | 'cap' | 'mousepad'>('jersey');
    const [kitPattern, setKitPattern] = useState(JERSEY_PATTERNS[0]);

    // Processing State
    const [isNaming, setIsNaming] = useState(false);
    const [isSloganing, setIsSloganing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isForging, setIsForging] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    
    // Download Refs
    const merchRef = useRef<SVGSVGElement>(null);

    // Auto-Analyze Identity when name changes (Debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (teamName.length > 3 && !resultUrl) { // Only analyze if we haven't generated yet
                setIsAnalyzing(true);
                const identity = await analyzeBrandIdentity(teamName);
                
                // Map string response to Enums if possible, else default
                const matchedMascot = Object.values(EsportsMascot).find(m => identity.mascot.includes(m)) || identity.mascot as EsportsMascot;
                const matchedStyle = Object.values(LogoStyle).find(s => identity.style.includes(s.split(' ')[0])) || LogoStyle.VECTOR;
                
                setMascot(matchedMascot);
                setStyle(matchedStyle);
                setElement(identity.element);
                
                // Update Color Palette
                setPrimaryColor(identity.color);
                
                setIsAnalyzing(false);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [teamName]);

    // Update Palette when Primary Changes
    useEffect(() => {
        setSecondaryColor(adjustColor(primaryColor, -40)); // Darker version
        setAccentColor('#ffffff'); // Default accent
    }, [primaryColor]);

    const handleInventName = async () => {
        if (!vibe.trim()) return;
        setIsNaming(true);
        const name = await generateBrandName(vibe);
        setTeamName(name);
        setIsNaming(false);
    };

    const handleInventSlogan = async () => {
        if (!teamName) return;
        setIsSloganing(true);
        const s = await generateBrandSlogan(teamName, vibe || 'Victory');
        setSlogan(s);
        setIsSloganing(false);
    }

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
                primaryColor: primaryColor,
                element: element
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

    // --- DOWNLOAD HANDLERS ---
    const handleDownloadMerch = () => {
        if (!merchRef.current) return;
        
        // Serialize SVG
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(merchRef.current);
        
        // Ensure namespaces
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        const svgBlob = new Blob([source], {type:"image/svg+xml;charset=utf-8"});
        const url = URL.createObjectURL(svgBlob);
        
        // Convert to PNG via Canvas for compatibility
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // High res export
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Fill background based on item? Or transparency. Transparency is better for merch mockup.
            ctx.drawImage(img, 0, 0, 1024, 1024);
            
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${teamName}_${merchItem}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleDownloadBanner = async () => {
        if (!currentLogo) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        // 1. Draw Background (Black base)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0,0, 1500, 500);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentLogo;
        await new Promise((resolve) => { img.onload = resolve; });

        // 2. Draw Blurred/Saturated Background Image
        ctx.save();
        ctx.filter = 'blur(40px) saturate(1.8)';
        ctx.globalAlpha = 0.5;
        // Cover fit
        const scale = Math.max(1500/img.width, 500/img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (1500 - w) / 2;
        const y = (500 - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();

        // 3. Gradient Overlay (Left to Right Fade)
        const grad = ctx.createLinearGradient(0,0, 1000, 0);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.6, 'rgba(0,0,0,0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0, 1500, 500);
        
        // 4. Pattern Overlay
        // We can simulate a simple pattern or skip. Skipping for canvas perf.

        // 5. Avatar Circle with Border
        const avatarSize = 300;
        const avX = 100;
        const avY = 100;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX + avatarSize/2, avY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#111';
        ctx.fillRect(avX, avY, avatarSize, avatarSize);
        // Draw logo centered in avatar circle
        // Maintain aspect ratio fit inside circle
        const avScale = Math.min(avatarSize/img.width, avatarSize/img.height) * 0.8; // 80% size
        const avW = img.width * avScale;
        const avH = img.height * avScale;
        const avImgX = avX + (avatarSize - avW) / 2;
        const avImgY = avY + (avatarSize - avH) / 2;
        ctx.drawImage(img, avImgX, avImgY, avW, avH);
        ctx.restore();

        // Avatar Border
        ctx.beginPath();
        ctx.arc(avX + avatarSize/2, avY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();

        // 6. Typography
        ctx.fillStyle = '#ffffff';
        // Fallback fonts if custom fonts not fully loaded, but usually they are
        ctx.font = 'italic 900 100px "Luckiest Guy", sans-serif'; 
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillText(teamName.toUpperCase(), 450, 260);

        // Slogan Gradient Text
        ctx.shadowColor = "transparent"; // Reset shadow
        ctx.font = '900 40px "Space Grotesk", sans-serif';
        const textGrad = ctx.createLinearGradient(450, 0, 1000, 0);
        textGrad.addColorStop(0, '#ef4444');
        textGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = textGrad;
        ctx.fillText((slogan || 'EST. 2026').toUpperCase(), 450, 320);

        // Download
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = png;
        link.download = `${teamName}-social-header.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const currentLogo = processedUrl || resultUrl;

    return (
        <div className="w-full max-w-[1600px] mx-auto animate-fade-in-up pb-20">
             
             {/* Header */}
             <div className="text-center space-y-6 mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[300px] bg-red-600/10 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
                 <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <ShieldIcon className="w-20 h-20 text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
                    <span>CLAN</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 drop-shadow-[0_0_30px_rgba(255,23,68,0.6)]">FORGE</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <span className="bg-black/60 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">Identity Engine v4.0</span>
                     <span className="bg-black/60 border border-white/10 text-slate-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">Vector Fabricator</span>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 {/* LEFT: CONTROLS PANEL */}
                 <div className="lg:col-span-5 space-y-6">
                     
                     {/* 1. CLAN DNA */}
                     <div className="bg-[#0f0a15] rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><RobotIcon className="w-12 h-12 text-white"/></div>
                         <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Phase 1: Clan DNA
                         </h3>
                         
                         <div className="space-y-4">
                             {/* Name & Vibe */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Team Name</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={teamName} 
                                            onChange={(e) => setTeamName(e.target.value)} 
                                            placeholder="e.g. OMEGA" 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-red-500 transition-all uppercase"
                                        />
                                        {isAnalyzing && <div className="absolute right-3 top-3"><LoadingSpinner className="w-4 h-4 text-red-500"/></div>}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Team Vibe</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={vibe} 
                                            onChange={(e) => setVibe(e.target.value)} 
                                            placeholder="e.g. Toxic" 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-red-500 transition-all"
                                        />
                                        <button onClick={handleInventName} disabled={isNaming} className="px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white disabled:opacity-50">
                                            <MagicWandIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                             </div>

                             {/* Slogan Engine */}
                             <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Battle Cry / Slogan</label>
                                    <button onClick={handleInventSlogan} disabled={isSloganing || !teamName} className="text-[9px] font-bold text-red-500 hover:text-white uppercase tracking-wider flex items-center gap-1">
                                        {isSloganing ? 'Generating...' : 'Auto-Gen'} <SparklesIcon className="w-3 h-3"/>
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={slogan} 
                                    onChange={(e) => setSlogan(e.target.value)} 
                                    placeholder="e.g. VICTORY OR NOTHING" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs outline-none focus:border-red-500 transition-all uppercase tracking-wide"
                                />
                             </div>
                         </div>
                     </div>

                     {/* 2. VISUAL CORE */}
                     <div className="bg-[#0f0a15] rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldIcon className="w-12 h-12 text-white"/></div>
                         <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Phase 2: Visual Core
                         </h3>

                         <div className="space-y-6">
                             {/* Elemental Affinity */}
                             <div className="space-y-2">
                                 <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Elemental Affinity</label>
                                 <div className="flex flex-wrap gap-2">
                                     {ELEMENTS.map((elm) => (
                                         <button 
                                            key={elm} 
                                            onClick={() => setElement(elm)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${element === elm ? 'bg-white text-black border-white' : 'bg-black/40 text-slate-500 border-white/5 hover:bg-white/5'}`}
                                         >
                                             {elm}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Mascot & Style Grid */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                     <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Mascot</label>
                                     <select value={mascot} onChange={(e) => setMascot(e.target.value as EsportsMascot)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white font-bold outline-none appearance-none">
                                         {Object.values(EsportsMascot).map(m => <option key={m} value={m}>{m}</option>)}
                                     </select>
                                </div>
                                <div className="space-y-2">
                                     <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Art Style</label>
                                     <select value={style} onChange={(e) => setStyle(e.target.value as LogoStyle)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white font-bold outline-none appearance-none">
                                         {Object.values(LogoStyle).map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                                     </select>
                                </div>
                             </div>
                         </div>
                     </div>

                     {/* 3. CHROMATIC */}
                     <div className="bg-[#0f0a15] rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><FireIcon className="w-12 h-12 text-white"/></div>
                         <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Phase 3: Chromatic
                         </h3>

                         <div className="flex items-center gap-4">
                             <div className="space-y-1 flex-1">
                                 <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Primary Hex</label>
                                 <div className="flex gap-2">
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"/>
                                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white font-bold outline-none uppercase"/>
                                 </div>
                             </div>
                             
                             {/* Generated Palette Preview */}
                             <div className="space-y-1 flex-1">
                                 <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Generated Palette</label>
                                 <div className="flex h-10 rounded-xl overflow-hidden border border-white/10">
                                     <div className="flex-1 h-full" style={{backgroundColor: primaryColor}} title="Primary"></div>
                                     <div className="flex-1 h-full" style={{backgroundColor: secondaryColor}} title="Secondary"></div>
                                     <div className="flex-1 h-full" style={{backgroundColor: accentColor}} title="Accent"></div>
                                 </div>
                             </div>
                         </div>
                     </div>
                     
                     {/* FORGE BUTTON */}
                     <button onClick={handleForge} disabled={isForging || !teamName} className="w-full py-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] font-display text-4xl text-white tracking-wide shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale relative overflow-hidden group border-t border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {isForging ? <span className="animate-pulse">FABRICATING...</span> : <span className="drop-shadow-md" style={{WebkitTextStroke: '1px black'}}>FORGE ASSETS</span>}
                     </button>
                 </div>

                 {/* RIGHT: PREVIEW DECK */}
                 <div className="lg:col-span-7 flex flex-col h-full bg-[#0a0510] rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                     
                     {/* View Tabs */}
                     <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex gap-1">
                         <button onClick={() => setViewMode('logo')} className={`px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'logo' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Logo</button>
                         <button onClick={() => setViewMode('merch')} className={`px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'merch' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Merch</button>
                         <button onClick={() => setViewMode('social')} className={`px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'social' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>Social</button>
                     </div>

                     <div className="flex-1 flex flex-col relative">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#050505] to-[#050505] animate-pulse-slow"></div>
                         
                         {resultUrl ? (
                             <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8 animate-fade-in">
                                 
                                 {/* LOGO VIEW */}
                                 {viewMode === 'logo' && (
                                    <>
                                        <div className="relative w-full max-w-[500px] aspect-square rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_0_100px_rgba(220,38,38,0.2)] bg-black/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                            <img src={currentLogo!} alt="Logo" className="w-full h-full object-contain p-8 relative z-10"/>
                                            {isRemovingBg && <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded text-[10px] text-green-400 font-mono animate-pulse border border-green-500/30">REMOVING BG...</div>}
                                        </div>
                                        <div className="mt-8 flex gap-4">
                                            <a href={currentLogo!} download={`${teamName}-logo.png`} className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2">
                                                <DownloadIcon className="w-5 h-5"/> Save Asset
                                            </a>
                                            {!processedUrl && (
                                                <button onClick={() => handleRemoveBackground()} disabled={isRemovingBg} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white border border-white/10">
                                                    <ScissorsIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                 )}

                                 {/* MERCH VIEW */}
                                 {viewMode === 'merch' && (
                                     <div className="w-full h-full flex flex-col items-center justify-center">
                                         
                                         {/* Sub-Tabs for Merch */}
                                         <div className="flex gap-2 mb-8">
                                             {['jersey', 'cap', 'mousepad'].map(m => (
                                                 <button key={m} onClick={() => setMerchItem(m as any)} className={`px-3 py-1 text-[9px] uppercase font-bold rounded border ${merchItem === m ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-slate-500 border-white/10'}`}>
                                                     {m}
                                                 </button>
                                             ))}
                                         </div>

                                         <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                                             {merchItem === 'jersey' && (
                                                <svg ref={merchRef} viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl">
                                                    <defs>
                                                        <mask id="shirtMask"><path d="M128 32 C 128 32 160 64 256 64 C 352 64 384 32 384 32 L 480 96 L 448 192 L 384 160 L 384 480 L 128 480 L 128 160 L 64 192 L 32 96 L 128 32" fill="white" /></mask>
                                                    </defs>
                                                    <path d="M128 32 C 128 32 160 64 256 64 C 352 64 384 32 384 32 L 480 96 L 448 192 L 384 160 L 384 480 L 128 480 L 128 160 L 64 192 L 32 96 L 128 32" fill={primaryColor} />
                                                    
                                                    {/* Sleeves (Secondary Color) */}
                                                    <path d="M128 32 L 32 96 L 64 192 L 128 160 Z" fill={secondaryColor} mask="url(#shirtMask)" />
                                                    <path d="M384 32 L 480 96 L 448 192 L 384 160 Z" fill={secondaryColor} mask="url(#shirtMask)" />

                                                    <g mask="url(#shirtMask)" className="text-white opacity-20">{kitPattern.svg}</g>
                                                    
                                                    {/* Collar */}
                                                    <path d="M160 64 C 160 64 200 90 256 90 C 312 90 352 64 352 64" fill="none" stroke={secondaryColor} strokeWidth="8"/>
                                                    
                                                    {/* Logo Overlay */}
                                                    <image href={currentLogo!} x="156" y="150" height="200" width="200" />
                                                </svg>
                                             )}

                                             {merchItem === 'cap' && (
                                                 <svg ref={merchRef} viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl">
                                                     <path d="M100 250 Q 256 100 412 250 L 412 300 Q 256 350 100 300 Z" fill={primaryColor} />
                                                     <path d="M80 300 Q 256 360 432 300 L 480 350 Q 256 450 32 350 Z" fill={secondaryColor} />
                                                     <circle cx="256" cy="180" r="10" fill={secondaryColor} />
                                                     <image href={currentLogo!} x="216" y="200" height="80" width="80" />
                                                 </svg>
                                             )}

                                             {merchItem === 'mousepad' && (
                                                <svg ref={merchRef} viewBox="0 0 600 400" className="w-[90%] drop-shadow-2xl">
                                                    <rect x="0" y="0" width="600" height="400" rx="30" ry="30" fill={primaryColor} />
                                                    {/* Pattern Pattern */}
                                                    <pattern id="padPattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                                        <rect width="20" height="40" fill={secondaryColor} fillOpacity="0.2"/>
                                                    </pattern>
                                                    <rect x="0" y="0" width="600" height="400" rx="30" ry="30" fill="url(#padPattern)" />
                                                    
                                                    {/* Logo */}
                                                    <image href={currentLogo!} x="100" y="50" height="300" width="400" opacity="0.9" />
                                                    
                                                    {/* Glow */}
                                                    <circle cx="550" cy="350" r="100" fill="white" fillOpacity="0.1" filter="blur(20px)" />
                                                </svg>
                                             )}
                                         </div>

                                         <div className="flex gap-4 mt-4 items-center">
                                             <div className="flex gap-2">
                                                {JERSEY_PATTERNS.map(p => (
                                                    <button key={p.id} onClick={() => setKitPattern(p)} className={`w-8 h-8 rounded border flex items-center justify-center ${kitPattern.id === p.id ? 'bg-white border-white' : 'bg-transparent border-white/10'}`}>
                                                        <div className="w-4 h-4 bg-current opacity-50"></div>
                                                    </button>
                                                ))}
                                             </div>
                                             <div className="h-8 w-[1px] bg-white/10"></div>
                                             <button onClick={handleDownloadMerch} className="px-6 py-2 bg-white text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200 shadow-lg flex items-center gap-2">
                                                 <DownloadIcon className="w-4 h-4"/> Save Design
                                             </button>
                                         </div>
                                     </div>
                                 )}

                                 {/* SOCIAL VIEW */}
                                 {viewMode === 'social' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <div className="w-[90%] aspect-[3/1] bg-black relative overflow-hidden rounded-2xl border border-white/10 group shadow-2xl">
                                            {/* Banner BG */}
                                            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{backgroundImage: `url(${currentLogo})`, filter: 'blur(30px) saturate(1.5)'}}></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
                                            
                                            {/* Pattern Overlay */}
                                            <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>

                                            {/* Content */}
                                            <div className="absolute inset-0 flex items-center justify-between px-12">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-32 h-32 rounded-full bg-black border-4 border-white/10 overflow-hidden shadow-2xl relative">
                                                        <img src={currentLogo!} className="w-full h-full object-cover p-2" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-5xl font-display text-white italic uppercase tracking-wider drop-shadow-lg">{teamName}</h2>
                                                        <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-widest uppercase">{slogan || 'EST. 2026'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-4">
                                            <button onClick={handleDownloadBanner} className="px-6 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg font-bold text-white uppercase text-xs tracking-widest shadow-lg transition-all">Download Header</button>
                                            <button className="px-6 py-3 bg-[#5865F2] rounded-lg font-bold text-white uppercase text-xs tracking-widest shadow-lg opacity-50 cursor-not-allowed">Discord Profile (Coming Soon)</button>
                                        </div>
                                    </div>
                                 )}

                             </div>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 space-y-4">
                                 <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/50 animate-spin-slow"></div>
                                 <h3 className="text-2xl font-black text-white uppercase tracking-widest">Awaiting Fabrication</h3>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
        </div>
    );
};
