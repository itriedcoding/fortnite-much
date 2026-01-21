
import React, { useState, useRef } from 'react';
import { TargetIcon, ScanIcon, BrainIcon, UploadIcon, LoadingSpinner, MapIcon, CrosshairIcon } from './Icons';
import { analyzeLoadoutImage, generateDropStrategy } from '../services/gemini';
import { LoadoutAnalysis, DropStrategy, FortnitePOI } from '../types';

export const TacticalOS: React.FC = () => {
    const [activeModule, setActiveModule] = useState<'vision' | 'drop'>('vision');
    
    // --- VISION MODULE STATE ---
    const [visionImage, setVisionImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<LoadoutAnalysis | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- DROP MODULE STATE ---
    const [selectedPOI, setSelectedPOI] = useState<string>(FortnitePOI.NEO_TILTED);
    const [calculatingDrop, setCalculatingDrop] = useState(false);
    const [dropStrategy, setDropStrategy] = useState<DropStrategy | null>(null);

    // --- VISION HANDLERS ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVisionImage(reader.result as string);
                setAnalysisResult(null); // Reset prev result
            };
            reader.readAsDataURL(file);
        }
    };

    const runVisionScan = async () => {
        if (!visionImage) return;
        setAnalyzing(true);
        try {
            const result = await analyzeLoadoutImage(visionImage);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    // --- DROP HANDLERS ---
    const runDropSimulation = async () => {
        setCalculatingDrop(true);
        try {
            const strategy = await generateDropStrategy(selectedPOI);
            setDropStrategy(strategy);
        } catch (e) {
            console.error(e);
        } finally {
            setCalculatingDrop(false);
        }
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-32">
            
            {/* HEADS UP DISPLAY HEADER */}
            <div className="text-center space-y-6 mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[250px] bg-green-900/10 blur-[100px] -z-10 rounded-full animate-pulse-slow"></div>
                 <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <TargetIcon className="w-20 h-20 text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]" />
                    <span>TACTICAL</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]">OS</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <button onClick={() => setActiveModule('vision')} className={`px-6 py-2 rounded-full text-xs font-mono font-bold tracking-widest uppercase border transition-all flex items-center gap-2 ${activeModule === 'vision' ? 'bg-green-600 text-black border-green-500 shadow-lg' : 'bg-black/60 border-white/10 text-slate-500 hover:text-white'}`}>
                         <ScanIcon className="w-4 h-4"/> Inventory Vision
                     </button>
                     <button onClick={() => setActiveModule('drop')} className={`px-6 py-2 rounded-full text-xs font-mono font-bold tracking-widest uppercase border transition-all flex items-center gap-2 ${activeModule === 'drop' ? 'bg-green-600 text-black border-green-500 shadow-lg' : 'bg-black/60 border-white/10 text-slate-500 hover:text-white'}`}>
                         <BrainIcon className="w-4 h-4"/> Drop Commander
                     </button>
                </div>
            </div>

            {/* --- MODULE: INVENTORY VISION --- */}
            {activeModule === 'vision' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* UPLOAD / SCAN AREA */}
                    <div className="bg-[#050905] rounded-[2.5rem] border border-green-500/20 p-8 shadow-2xl relative overflow-hidden group">
                        {/* Scanner Overlay Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,197,94,0.05)_50%,transparent_100%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-50"></div>
                        <div className={`absolute top-0 left-0 w-full h-[2px] bg-green-500/50 shadow-[0_0_20px_#22c55e] z-20 pointer-events-none ${analyzing ? 'animate-[scan_1s_linear_infinite]' : 'hidden'}`}></div>

                        <div className="flex justify-between items-center mb-6 relative z-30">
                            <h3 className="text-sm font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ScanIcon className="w-4 h-4"/> Optical Loadout Sensor
                            </h3>
                            {visionImage && (
                                <button onClick={() => setVisionImage(null)} className="text-[10px] font-bold text-red-500 hover:text-white uppercase">Reset Feed</button>
                            )}
                        </div>

                        <div 
                            onClick={() => !visionImage && fileInputRef.current?.click()}
                            className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden bg-black/40 ${visionImage ? 'border-green-500/50' : 'border-white/10 hover:border-green-500/50 hover:bg-green-900/10'}`}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            
                            {visionImage ? (
                                <img src={visionImage} className="w-full h-full object-contain z-10" alt="Loadout" />
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
                                        <UploadIcon className="w-8 h-8 text-green-500"/>
                                    </div>
                                    <p className="text-green-500 font-bold uppercase tracking-widest text-xs">Upload Loadout Screenshot</p>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-wide">Supports 1080p / 4K Captures</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={runVisionScan} 
                            disabled={!visionImage || analyzing}
                            className="w-full mt-6 py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-30"
                        >
                            {analyzing ? <LoadingSpinner className="w-5 h-5 text-black"/> : <BrainIcon className="w-5 h-5"/>}
                            <span>{analyzing ? 'ANALYZING PIXELS...' : 'RUN TACTICAL ANALYSIS'}</span>
                        </button>
                    </div>

                    {/* ANALYSIS RESULTS */}
                    <div className="space-y-6">
                        {analysisResult ? (
                            <>
                                {/* Score Card */}
                                <div className="bg-[#050905] rounded-[2rem] border border-green-500/20 p-8 relative overflow-hidden flex items-center justify-between">
                                    <div className="absolute inset-0 bg-green-500/5"></div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Combat Viability Score</h4>
                                        <div className="text-6xl font-black text-white italic tracking-tighter">{analysisResult.score}<span className="text-2xl text-green-500">/100</span></div>
                                    </div>
                                    <div className={`px-6 py-2 rounded-lg border font-black uppercase tracking-widest text-sm ${
                                        analysisResult.viability === 'META' ? 'bg-green-500 text-black border-green-500' : 
                                        analysisResult.viability === 'TRASH' ? 'bg-red-500 text-white border-red-500' : 'bg-yellow-500 text-black border-yellow-500'
                                    }`}>
                                        {analysisResult.viability} TIER
                                    </div>
                                </div>

                                {/* Items Detected */}
                                <div className="bg-black/40 rounded-2xl border border-white/10 p-6">
                                    <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ScanIcon className="w-3 h-3"/> Identified Assets
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.identifiedItems.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-slate-300 uppercase">{item}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Tactical Advice */}
                                <div className="bg-black/40 rounded-2xl border border-white/10 p-6">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BrainIcon className="w-3 h-3"/> AI Coach Advice
                                    </h4>
                                    <p className="text-sm font-medium text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-4">
                                        {analysisResult.advice}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-full bg-black/20 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <ScanIcon className="w-16 h-16 text-slate-600 mb-6"/>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">Awaiting Data</h3>
                                <p className="text-xs text-slate-500 uppercase mt-2">Upload screenshot to begin analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODULE: DROP COMMANDER --- */}
            {activeModule === 'drop' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: CONTROLS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#050905] rounded-[2.5rem] p-8 border border-green-500/20 relative overflow-hidden">
                             <h3 className="text-sm font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <MapIcon className="w-4 h-4"/> Mission Parameters
                             </h3>
                             
                             <div className="space-y-4">
                                 <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Target POI</label>
                                 <select 
                                    value={selectedPOI}
                                    onChange={(e) => setSelectedPOI(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-green-500 transition-all uppercase appearance-none"
                                 >
                                     {Object.values(FortnitePOI).map(poi => <option key={poi} value={poi}>{poi}</option>)}
                                 </select>

                                 <button 
                                    onClick={runDropSimulation}
                                    disabled={calculatingDrop}
                                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                 >
                                    {calculatingDrop ? <LoadingSpinner className="w-5 h-5 text-black"/> : <CrosshairIcon className="w-5 h-5"/>}
                                    <span>{calculatingDrop ? 'SIMULATING...' : 'GENERATE STRATEGY'}</span>
                                 </button>
                             </div>
                        </div>

                        {/* Quick Legend */}
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Threat Index Legend</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div> <span className="text-xs font-bold text-slate-400 uppercase">Low (Safe Farm)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> <span className="text-xs font-bold text-slate-400 uppercase">Medium (1-2 Contests)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div> <span className="text-xs font-bold text-slate-400 uppercase">High (Aggro)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: STRATEGY OUTPUT */}
                    <div className="lg:col-span-8">
                        {dropStrategy ? (
                            <div className="bg-[#0a100a] rounded-[3rem] border border-green-500/20 p-8 relative overflow-hidden animate-fade-in shadow-2xl">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><BrainIcon className="w-32 h-32 text-white"/></div>
                                
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                    <div>
                                        <h2 className="text-3xl font-black text-white italic uppercase tracking-wider">{dropStrategy.poi}</h2>
                                        <span className="text-[10px] font-mono text-green-500 tracking-widest">CHAPTER 6 • SEASON 1 • META</span>
                                    </div>
                                    <div className={`px-6 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${
                                        dropStrategy.threatLevel === 'EXTREME' ? 'bg-red-600 text-white border-red-500' :
                                        dropStrategy.threatLevel === 'HIGH' ? 'bg-orange-500 text-black border-orange-500' : 'bg-green-600 text-black border-green-500'
                                    }`}>
                                        THREAT: {dropStrategy.threatLevel}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    
                                    {/* Rotation Path */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapIcon className="w-4 h-4 text-green-500"/> Optimal Rotation</h4>
                                        <div className="space-y-2">
                                            {dropStrategy.rotationPath.map((step, i) => (
                                                <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold border border-green-500/30">{i+1}</div>
                                                    <span className="text-sm font-bold text-white uppercase">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Loot Priority */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TargetIcon className="w-4 h-4 text-yellow-500"/> Loot Priority</h4>
                                        <div className="space-y-2">
                                            {dropStrategy.lootPriority.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                    <span className="text-sm font-medium text-slate-300">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Early Game Plan */}
                                    <div className="md:col-span-2 bg-green-900/10 border border-green-500/20 p-6 rounded-2xl">
                                        <h4 className="text-xs font-black text-green-400 uppercase tracking-widest mb-2">Tactical Overview</h4>
                                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{dropStrategy.earlyGamePlan}</p>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="h-full bg-black/20 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center p-12 text-center opacity-40 min-h-[500px]">
                                <MapIcon className="w-24 h-24 text-slate-600 mb-6"/>
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Select LZ</h3>
                                <p className="text-sm text-slate-500 uppercase mt-2">Initialize Strategic Computer</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};
