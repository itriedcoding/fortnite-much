import React, { useState, useEffect } from 'react';
import { fetchPlayerStats, searchCosmetic } from '../services/fortniteApi';
import { PlayerStats as PlayerStatsType, InputStats, ModeStats, CosmeticItem } from '../types';
import { ChartIcon, LoadingSpinner, ControllerIcon, SparklesIcon } from './Icons';

export const PlayerStats: React.FC = () => {
    const [username, setUsername] = useState('');
    const [stats, setStats] = useState<PlayerStatsType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'keyboardMouse' | 'gamepad'>('all');
    
    // Skin Selector State
    const [skinQuery, setSkinQuery] = useState('');
    const [selectedSkin, setSelectedSkin] = useState<CosmeticItem | null>(null);
    const [skinLoading, setSkinLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setError('');
        setStats(null);
        setSelectedSkin(null); // Reset skin on new user search

        try {
            const data = await fetchPlayerStats(username);
            if (data) {
                setStats(data);
                // Try to auto-find a skin if the name matches a skin name? No, usually not the case.
            }
        } catch (err: any) {
            setError(err.message || 'Failed to retrieve stats. Check spelling or privacy settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkinSearch = async () => {
        if (!skinQuery.trim()) return;
        setSkinLoading(true);
        const skin = await searchCosmetic(skinQuery);
        if (skin) {
            setSelectedSkin(skin);
            setSkinQuery(''); // Clear input on success
        } else {
            // Optional: Show simple toast for skin not found
        }
        setSkinLoading(false);
    }

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        return `${hours}h ${minutes % 60}m`;
    };

    const getActiveStats = (): InputStats | undefined => {
        if (!stats) return undefined;
        if (activeTab === 'keyboardMouse') return stats.stats.keyboardMouse || stats.stats.all;
        if (activeTab === 'gamepad') return stats.stats.gamepad || stats.stats.all;
        return stats.stats.all;
    };

    const currentStats = getActiveStats();

    const StatCard = ({ label, value, subValue, color, icon }: { label: string, value: string | number, subValue?: string, color: string, icon?: string }) => (
        <div className={`bg-[#130b1c] border border-white/5 p-6 rounded-[2rem] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-xl`}>
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                 <span className="text-6xl">{icon || '📊'}</span>
             </div>
             <div className={`w-8 h-1 ${color} rounded-full mb-4 shadow-[0_0_10px_currentColor]`}></div>
             <span className="text-4xl font-black italic text-white z-10 drop-shadow-md font-display tracking-wide">{value}</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 z-10">{label}</span>
             {subValue && <span className="text-xs font-bold text-slate-500 mt-1">{subValue}</span>}
        </div>
    );

    const ModeCard = ({ title, data }: { title: string, data?: ModeStats }) => {
        if (!data) return null;
        return (
             <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 hover:border-fortnite-blue/30 transition-all hover:bg-black/60 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-fortnite-blue/10 blur-[30px] rounded-full group-hover:bg-fortnite-blue/20 transition-colors"></div>
                
                <h5 className="text-lg font-black text-white italic uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <span className="w-1.5 h-4 bg-fortnite-blue rounded-sm"></span>
                    {title}
                </h5>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wins</span>
                        <span className="text-2xl font-black text-fortnite-gold drop-shadow-sm">{data.wins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">KD Ratio</span>
                        <div className="px-3 py-1 rounded bg-white/5 border border-white/5 text-sm font-black text-white group-hover:border-fortnite-blue/50 transition-colors">
                            {data.kd.toFixed(2)}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Win Rate</span>
                        <span className="text-sm font-black text-green-400">{data.winRate.toFixed(1)}%</span>
                    </div>
                     <div className="flex justify-between items-center pt-2 opacity-60">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Matches</span>
                        <span className="text-xs font-bold text-slate-300">{data.matches.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }

    const CircleProgress = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        return (
            <div className="flex flex-col items-center gap-4 relative group">
                <div className="relative w-32 h-32">
                    {/* Glow */}
                    <div className="absolute inset-0 rounded-full blur-[20px] opacity-20" style={{backgroundColor: color}}></div>
                    
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                        <circle cx="64" cy="64" r={radius} stroke="#1a0b2e" strokeWidth="8" fill="transparent" />
                        <circle cx="64" cy="64" r={radius} stroke={color} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out drop-shadow-lg" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-2xl font-black text-white italic">{percentage}%</span>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">{label}</span>
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-20">
            <div className="text-center space-y-6 mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[200px] bg-fortnite-blue/20 blur-[100px] -z-10 rounded-full animate-pulse-fast"></div>
                <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <span>CAREER</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-fortnite-blue via-cyan-400 to-blue-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">STATS</span>
                </h2>
                <p className="text-fortnite-blue text-xs font-bold uppercase tracking-[0.3em] bg-black/40 inline-block px-4 py-2 rounded-full border border-white/5">
                    Live Epic Games Tracker
                </p>
            </div>

            <form onSubmit={handleSearch} className="mb-16 relative max-w-3xl mx-auto z-20">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-fortnite-blue via-purple-500 to-cyan-400 rounded-full opacity-50 group-hover:opacity-100 blur-lg transition duration-500 animate-pulse-slow"></div>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="SEARCH EPIC USERNAME..."
                        className="relative w-full bg-[#0a0510] border-2 border-white/10 rounded-full py-6 pl-10 pr-40 text-white font-black text-2xl focus:border-white focus:shadow-[0_0_30px_rgba(255,255,255,0.2)] focus:outline-none transition-all placeholder:text-slate-700 uppercase tracking-widest italic"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 bg-white text-black rounded-full px-10 font-black uppercase italic hover:bg-fortnite-blue hover:text-white transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] text-lg active:scale-95"
                    >
                        {loading ? <LoadingSpinner className="w-6 h-6"/> : 'CHECK'}
                    </button>
                </div>
                {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-200 text-center font-bold animate-bounce-short backdrop-blur-md max-w-md mx-auto">{error}</div>}
            </form>

            {loading && (
                <div className="flex flex-col items-center gap-8 py-24">
                     <div className="relative">
                         <div className="absolute inset-0 bg-fortnite-blue blur-xl opacity-40 animate-pulse"></div>
                         <LoadingSpinner className="w-24 h-24 text-white relative z-10" />
                     </div>
                     <p className="text-white font-black tracking-[0.5em] text-xl animate-pulse">CONNECTING TO EPIC SERVERS...</p>
                </div>
            )}

            {stats && currentStats && (
                <div className="bg-[#0a0510]/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-fade-in relative overflow-hidden">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fortnite-blue/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fortnite-purple/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                    {/* --- HEADER SECTION: AVATAR & INFO --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mb-12 border-b border-white/5 pb-10">
                        
                        {/* LEFT: Player Identity & Skin Selector */}
                        <div className="xl:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                            
                            {/* ACTIVE SKIN DISPLAY (Advanced Feature) */}
                            <div className="relative group shrink-0">
                                <div className={`w-40 h-40 md:w-48 md:h-48 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden ${selectedSkin ? 'bg-[#1a0b2e]' : 'bg-gradient-to-br from-[#1a0b2e] to-[#0a0510]'}`}>
                                    {selectedSkin ? (
                                        <>
                                            <img src={selectedSkin.images.icon} alt={selectedSkin.name} className="w-full h-full object-cover z-10" />
                                            <div className="absolute inset-0 bg-[url('https://fortnite-api.com/images/cosmetics/br/rarity/legendary.png')] bg-cover opacity-20 mix-blend-overlay"></div>
                                        </>
                                    ) : (
                                        <span className="text-6xl font-black text-white italic z-10 group-hover:scale-110 transition-transform drop-shadow-lg">{stats.account.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                
                                {/* Skin Search Bar (Overlay on hover/focus or always visible for utility) */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[120%] z-20">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={skinQuery}
                                            onChange={(e) => setSkinQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSkinSearch()}
                                            placeholder="Set Skin..." 
                                            className="w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-[10px] font-bold text-white text-center focus:border-fortnite-gold outline-none shadow-lg uppercase tracking-wider"
                                        />
                                        {skinLoading && <LoadingSpinner className="absolute right-2 top-2 w-3 h-3 text-white"/>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-grow space-y-3 text-center md:text-left mt-4">
                                <h3 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg break-all leading-[0.9] stroke-black" style={{WebkitTextStroke: '1px black'}}>{stats.account.name}</h3>
                                {selectedSkin && (
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/5">
                                        <SparklesIcon className="w-3 h-3 text-fortnite-gold" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-fortnite-gold">{selectedSkin.name} Main</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">ID: {stats.account.id.substring(0, 8)}</span>
                                    {stats.battlePass.level > 100 && <span className="text-fortnite-gold text-xs font-black uppercase tracking-widest bg-fortnite-gold/10 px-4 py-1.5 rounded-lg border border-fortnite-gold/20">Overlevel {stats.battlePass.level}</span>}
                                </div>
                                
                                {/* Battle Pass Bar */}
                                <div className="w-full max-w-md bg-black/40 p-3 rounded-2xl border border-white/5 mx-auto md:mx-0">
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                                        <span>Season Level {stats.battlePass.level}</span>
                                        <span className="text-white">{stats.battlePass.progress}%</span>
                                    </div>
                                    <div className="h-3 bg-[#1a0b2e] rounded-full overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer z-10"></div>
                                        <div className="h-full bg-gradient-to-r from-fortnite-gold to-yellow-600 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" style={{width: `${stats.battlePass.progress}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT: Input Tabs */}
                        <div className="xl:col-span-4 flex items-center justify-center xl:justify-end">
                            <div className="flex flex-col gap-2 w-full max-w-xs">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Input Device Data</span>
                                <div className="flex bg-black/40 p-1.5 rounded-[1.5rem] border border-white/10 shadow-xl">
                                    {(['all', 'keyboardMouse', 'gamepad'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {tab === 'all' && 'ALL'}
                                            {tab === 'keyboardMouse' && 'KBM'}
                                            {tab === 'gamepad' && 'PAD'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check if specific input stats exist */}
                    {!currentStats.overall ? (
                        <div className="text-center py-32 text-slate-600 font-black uppercase tracking-[0.3em] bg-black/20 rounded-3xl">
                            No combat data found for this input.
                        </div>
                    ) : (
                        <>
                            {/* Main Overview Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                <StatCard label="Total Matches" value={currentStats.overall.matches.toLocaleString()} color="bg-purple-500" icon="🎮" />
                                <StatCard label="Victory Royales" value={currentStats.overall.wins.toLocaleString()} color="bg-fortnite-gold" icon="👑" />
                                <StatCard label="Eliminations" value={currentStats.overall.kills.toLocaleString()} color="bg-red-500" icon="🎯" />
                                <StatCard label="K/D Ratio" value={currentStats.overall.kd.toFixed(2)} color="bg-blue-500" icon="📈" />
                            </div>

                            {/* Deep Dive Section */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                
                                {/* 1. Performance Circles */}
                                <div className="bg-[#130b1c] rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-center gap-10 xl:col-span-1 shadow-xl">
                                    <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] opacity-70 border-b border-white/5 pb-4">Combat Efficiency</h4>
                                    <div className="flex flex-col gap-10 items-center justify-center h-full">
                                        <div className="flex gap-8">
                                            <CircleProgress percentage={currentStats.overall.winRate} color="#fbbf24" label="Win %" />
                                            <div className="w-[1px] bg-white/5 h-32"></div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                 <span className="text-5xl font-black text-blue-500 italic drop-shadow-md">{Math.round(currentStats.overall.scorePerMatch)}</span>
                                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score / Match</span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-black/30 p-4 rounded-2xl flex justify-between items-center px-8 border border-white/5">
                                            <div className="text-center">
                                                <span className="block text-2xl font-black text-white">{formatTime(currentStats.overall.minutesPlayed)}</span>
                                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Playtime</span>
                                            </div>
                                            <div className="h-8 w-[1px] bg-white/10"></div>
                                            <div className="text-center">
                                                <span className="block text-2xl font-black text-white">{currentStats.overall.playersOutlived.toLocaleString()}</span>
                                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Outlived</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Mode Breakdown & Placements */}
                                <div className="xl:col-span-2 space-y-8">
                                    {/* Modes */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <ModeCard title="SOLO" data={currentStats.solo} />
                                        <ModeCard title="DUO" data={currentStats.duo} />
                                        <ModeCard title="SQUAD" data={currentStats.squad} />
                                    </div>

                                    {/* Placement Grid */}
                                    <div className="bg-[#130b1c] rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
                                         <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 opacity-70">Global Placements</h4>
                                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-2xl font-black text-fortnite-gold">{currentStats.overall.top3.toLocaleString()}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Top 3</span>
                                             </div>
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-2xl font-black text-white">{currentStats.overall.top5.toLocaleString()}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Top 5</span>
                                             </div>
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-2xl font-black text-slate-300">{currentStats.overall.top10.toLocaleString()}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Top 10</span>
                                             </div>
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-2xl font-black text-slate-400">{currentStats.overall.top25.toLocaleString()}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Top 25</span>
                                             </div>
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-2xl font-black text-red-400">{currentStats.overall.killsPerMatch.toFixed(2)}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">K/Match</span>
                                             </div>
                                             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                                 <span className="text-xl font-black text-green-400 truncate w-full text-center">{currentStats.overall.score.toLocaleString()}</span>
                                                 <span className="text-[9px] font-bold text-slate-500 uppercase">Score</span>
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
