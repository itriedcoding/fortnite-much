
import React, { useState } from 'react';
import { BlueprintIcon, HammerIcon, CpuIcon, LoadingSpinner, DownloadIcon } from './Icons';
import { generateCreativeBlueprint, generateBlueprintImage } from '../services/gemini';
import { CreativeBlueprint } from '../types';

export const CreativeArchitect: React.FC = () => {
    const [concept, setConcept] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [blueprint, setBlueprint] = useState<CreativeBlueprint | null>(null);
    const [blueprintImage, setBlueprintImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!concept.trim()) return;
        setIsGenerating(true);
        setBlueprint(null);
        setBlueprintImage(null);

        try {
            // Parallel execution for speed
            const [data, image] = await Promise.all([
                generateCreativeBlueprint(concept),
                generateBlueprintImage(concept)
            ]);
            setBlueprint(data);
            setBlueprintImage(image);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto animate-fade-in-up pb-32">
            
            {/* Header */}
            <div className="text-center space-y-6 mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[250px] bg-blue-900/10 blur-[100px] -z-10 rounded-full animate-pulse-slow"></div>
                 <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <BlueprintIcon className="w-20 h-20 text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                    <span>CREATIVE</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">ARCHITECT</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <span className="bg-black/60 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">
                        Unreal Editor Integration
                     </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* INPUT PANEL */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#080b14] rounded-[2.5rem] p-8 border border-blue-500/20 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><HammerIcon className="w-24 h-24 text-white"/></div>
                        
                        <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <HammerIcon className="w-4 h-4"/> Concept Engine
                        </h3>

                        <div className="space-y-4">
                            <textarea
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                placeholder="Describe your map idea (e.g. 'Only Up style parkour but with low gravity moon physics')"
                                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-600"
                            />
                            
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !concept}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <LoadingSpinner className="w-5 h-5"/> : <CpuIcon className="w-5 h-5"/>}
                                <span>{isGenerating ? 'COMPILING ASSETS...' : 'GENERATE BLUEPRINT'}</span>
                            </button>
                        </div>
                    </div>

                    {blueprint && (
                        <div className="bg-blue-900/10 border border-blue-500/20 rounded-3xl p-6 animate-fade-in">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Project Specs</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Template</span>
                                    <span className="text-xs text-white font-mono">{blueprint.islandTemplate}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Memory</span>
                                    <span className="text-xs text-green-400 font-mono">{blueprint.memoryUsage}</span>
                                </div>
                                <div className="mt-4">
                                    <span className="text-xs text-slate-400 font-bold uppercase block mb-2">Game Loop</span>
                                    <p className="text-xs text-white leading-relaxed italic opacity-80">"{blueprint.flowSummary}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* OUTPUT PANEL */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Visual Blueprint */}
                    <div className="relative aspect-video bg-[#001529] rounded-[2.5rem] border border-blue-500/30 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] group">
                        {/* Grid Background */}
                        <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2}}></div>
                        
                        {blueprintImage ? (
                            <>
                                <img src={blueprintImage} className="w-full h-full object-contain p-8 relative z-10 mix-blend-screen opacity-90" alt="Blueprint" />
                                <div className="absolute bottom-6 right-6 z-20">
                                    <a href={blueprintImage} download="map_schematic.png" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all">
                                        <DownloadIcon className="w-4 h-4"/> Export Schematic
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                <BlueprintIcon className="w-24 h-24 text-blue-400 mb-4"/>
                                <p className="text-blue-400 font-black uppercase tracking-widest">Awaiting Input</p>
                            </div>
                        )}
                    </div>

                    {/* Logic & Devices */}
                    {blueprint && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            {blueprint.devices.map((device, i) => (
                                <div key={i} className="bg-[#080b14] border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-sm font-black text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">{device.name}</h4>
                                        <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">{device.location}</span>
                                    </div>
                                    <div className="space-y-2 bg-black/40 rounded-lg p-3 font-mono text-[10px]">
                                        {device.settings.map((setting, j) => (
                                            <div key={j} className="flex justify-between">
                                                <span className="text-slate-400">{setting.key}:</span>
                                                <span className="text-green-400">{setting.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Verse Code Snippet */}
                            {blueprint.codeSnippet && (
                                <div className="md:col-span-2 bg-[#080b14] border border-white/5 rounded-2xl p-5">
                                    <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CpuIcon className="w-3 h-3"/> Verse Script
                                    </h4>
                                    <pre className="bg-black/60 p-4 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto border border-white/5 leading-relaxed">
                                        {blueprint.codeSnippet}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
