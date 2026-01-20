
import React, { useState } from 'react';
import { fetchPlayerStats, searchCosmetic } from '../services/fortniteApi';
import { PlayerStats as PlayerStatsType, InputStats, ModeStats, CosmeticItem } from '../types';
import { LoadingSpinner, SparklesIcon, CrosshairIcon } from './Icons';

export const PlayerStats: React.FC = () => {
    // Mode
    const [compareMode, setCompareMode] = useState(false);

    // Player 1 State
    const [username1, setUsername1] = useState('');
    const [stats1, setStats1] = useState<PlayerStatsType | null>(null);
    const [loading1, setLoading1] = useState(false);
    const [error1, setError1] = useState('');
    
    // Player 2 State (Comparison)
    const [username2, setUsername2] = useState('');
    const [stats2, setStats2] = useState<PlayerStatsType | null>(null);
    const [loading2, setLoading2] = useState(false);
    const [error2, setError2] = useState('');

    const [activeTab, setActiveTab] = useState<'all' | 'keyboardMouse' | 'gamepad'>('all');
    
    // Skin Selector (Only for Player 1 in solo mode)
    const [skinQuery, setSkinQuery] = useState('');
    const [selectedSkin, setSelectedSkin] = useState<CosmeticItem | null>(null);
    const [skinLoading, setSkinLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent, playerNum: 1 | 2) => {
        e.preventDefault();
        const username = playerNum === 1 ? username1 : username2;
        if (!username.trim()) return;

        if (playerNum === 1) {
            setLoading1(true); setError1(''); setStats1(null);
        } else {
            setLoading2(true); setError2(''); setStats2(null);
        }

        try {
            const data = await fetchPlayerStats(username);
            if (playerNum === 1) setStats1(data);
            else setStats2(data);
        } catch (err: any) {
            const msg = err.message || 'Failed to retrieve stats.';
            if (playerNum === 1) setError1(msg);
            else setError2(msg);
        } finally {
            if (playerNum === 1) setLoading1(false);
            else setLoading2(false);
        }
    };

    const handleInput1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername1(e.target.value);
        if (error1) setError1('');
    };

    const handleInput2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername2(e.target.value);
        if (error2) setError2('');
    };

    const handleSkinSearch = async () => {
        if (!skinQuery.trim()) return;
        setSkinLoading(true);
        const skin = await searchCosmetic(skinQuery);
        if (skin) {
            setSelectedSkin(skin);
            setSkinQuery(''); 
        } 
        setSkinLoading(false);
    }

    const getActiveStats = (stats: PlayerStatsType | null): InputStats | undefined => {
        if (!stats) return undefined;
        if (activeTab === 'keyboardMouse') return stats.stats.keyboardMouse || stats.stats.all;
        if (activeTab === 'gamepad') return stats.stats.gamepad || stats.stats.all;
        return stats.stats.all;
    };

    // --- COMPONENT: STAT CARD ---
    const StatCard = ({ label, value, subValue, color, icon, highlight }: { label: string, value: string | number, subValue?: string, color: string, icon?: string, highlight?: boolean }) => (
        <div className={`bg-void-800 border ${highlight ? 'border-fortnite-gold shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 z-10' : 'border-white/5'} p-6 rounded-[2rem] flex flex-col relative overflow-hidden group transition-all duration-300 hover:bg-void-700`}>
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                 <span className="text-6xl">{icon || '📊'}</span>
             </div>
             {highlight && <div className="absolute top-2 right-2 text-xs font-black bg-fortnite-gold text-black px-2 py-0.5 rounded-full">WINNER</div>}
             <div className={`w-8 h-1 ${color} rounded-full mb-4 shadow-[0_0_10px_currentColor]`}></div>
             <span className="text-3xl lg:text-4xl font-black italic text-white z-10 drop-shadow-md font-display tracking-wide">{value}</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-2 z-10">{label}</span>
        </div>
    );

    // --- RENDER COMPARISON ---
    const renderComparison = () => {
        const s1 = getActiveStats(stats1);
        const s2 = getActiveStats(stats2);

        if (!stats1 || !stats2 || !s1 || !s2) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {/* Player 1 Col */}
                <div className="space-y-6">
                    <h3 className="text-3xl font-black text-strawberry-400 text-center uppercase italic">{stats1.account.name}</h3>
                    <StatCard label="Wins" value={s1.overall.wins} color="bg-strawberry-500" highlight={s1.overall.wins > s2.overall.wins} />
                    <StatCard label="Win Rate" value={s1.overall.winRate.toFixed(1) + '%'} color="bg-strawberry-500" highlight={s1.overall.winRate > s2.overall.winRate} />
                    <StatCard label="K/D" value={s1.overall.kd.toFixed(2)} color="bg-strawberry-500" highlight={s1.overall.kd > s2.overall.kd} />
                </div>

                {/* VS Column */}
                <div className="flex flex-col items-center justify-center">
                    <div className="text-6xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse-fast">VS</div>
                    <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent my-4"></div>
                </div>

                {/* Player 2 Col */}
                <div className="space-y-6">
                    <h3 className="text-3xl font-black text-purple-500 text-center uppercase italic">{stats2.account.name}</h3>
                    <StatCard label="Wins" value={s2.overall.wins} color="bg-purple-500" highlight={s2.overall.wins > s1.overall.wins} />
                    <StatCard label="Win Rate" value={s2.overall.winRate.toFixed(1) + '%'} color="bg-purple-500" highlight={s2.overall.winRate > s1.overall.winRate} />
                    <StatCard label="K/D" value={s2.overall.kd.toFixed(2)} color="bg-purple-500" highlight={s2.overall.kd > s1.overall.kd} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-20">
            
            <div className="text-center space-y-6 mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[200px] bg-strawberry-600/10 blur-[100px] -z-10 rounded-full animate-pulse-fast"></div>
                <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <span>CAREER</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-strawberry-400 via-strawberry-500 to-red-600 drop-shadow-[0_0_30px_rgba(255,23,68,0.6)]">STATS</span>
                </h2>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setCompareMode(false)}
                        className={`px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all ${!compareMode ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 hover:text-white'}`}
                    >
                        Solo View
                    </button>
                    <button 
                        onClick={() => setCompareMode(true)}
                        className={`px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-2 ${compareMode ? 'bg-strawberry-600 text-white' : 'bg-black/40 text-zinc-500 hover:text-white'}`}
                    >
                        <CrosshairIcon className="w-4 h-4"/> Rivalry Mode
                    </button>
                </div>
            </div>

            <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-12 max-w-5xl mx-auto`}>
                {/* Search 1 */}
                <form onSubmit={(e) => handleSearch(e, 1)} className="relative group z-20">
                    <input 
                        type="text" 
                        value={username1}
                        onChange={handleInput1Change}
                        placeholder={compareMode ? "PLAYER 1" : "SEARCH EPIC USERNAME..."}
                        className={`w-full bg-void-800 border-2 rounded-full py-4 pl-8 pr-32 text-white font-black text-xl outline-none transition-all placeholder:text-zinc-700 uppercase italic ${error1 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-white/10 focus:border-strawberry-500 focus:shadow-[0_0_30px_rgba(255,23,68,0.3)]'}`}
                    />
                    <button type="submit" disabled={loading1} className="absolute right-2 top-2 bottom-2 bg-white text-black rounded-full px-6 font-black uppercase italic hover:bg-strawberry-500 hover:text-white transition-all disabled:opacity-50">
                        {loading1 ? <LoadingSpinner className="w-5 h-5"/> : 'GO'}
                    </button>
                    {error1 && (
                        <div className="absolute top-full mt-4 left-0 w-full animate-fade-in z-30">
                            <div className="bg-red-500/10 border border-red-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 backdrop-blur-md">
                                <span className="text-xl">⚠️</span>
                                <span className="font-bold uppercase tracking-wide text-xs">{error1}</span>
                            </div>
                        </div>
                    )}
                </form>

                {/* Search 2 (Comparison) */}
                {compareMode && (
                    <form onSubmit={(e) => handleSearch(e, 2)} className="relative group z-20">
                        <input 
                            type="text" 
                            value={username2}
                            onChange={handleInput2Change}
                            placeholder="PLAYER 2 (OPPONENT)"
                            className={`w-full bg-void-800 border-2 rounded-full py-4 pl-8 pr-32 text-white font-black text-xl outline-none transition-all placeholder:text-zinc-700 uppercase italic ${error2 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-white/10 focus:border-purple-500 focus:shadow-[0_0_30px_rgba(168,85,247,0.3)]'}`}
                        />
                        <button type="submit" disabled={loading2} className="absolute right-2 top-2 bottom-2 bg-white text-black rounded-full px-6 font-black uppercase italic hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50">
                            {loading2 ? <LoadingSpinner className="w-5 h-5"/> : 'VS'}
                        </button>
                        {error2 && (
                             <div className="absolute top-full mt-4 left-0 w-full animate-fade-in z-30">
                                <div className="bg-red-500/10 border border-red-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 backdrop-blur-md">
                                    <span className="text-xl">⚠️</span>
                                    <span className="font-bold uppercase tracking-wide text-xs">{error2}</span>
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </div>

            {/* RENDER CONTENT */}
            {compareMode ? (
                // --- COMPARISON VIEW ---
                (stats1 && stats2) ? (
                    <div className="bg-void-800/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-fade-in">
                        {renderComparison()}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-30">
                        <p className="text-xl font-black uppercase text-zinc-500">Enter two usernames to begin analysis</p>
                    </div>
                )
            ) : (
                // --- SOLO VIEW ---
                stats1 && getActiveStats(stats1) ? (
                    <div className="bg-void-800/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 sm:p-12 shadow-[0_0_100px_rgba(255,23,68,0.1)] animate-fade-in relative overflow-hidden">
                        {/* Background Detail */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-strawberry-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-white/5 pb-10">
                             <div className="relative group shrink-0">
                                <div className={`w-40 h-40 md:w-48 md:h-48 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden ${selectedSkin ? 'bg-[#1a0b2e]' : 'bg-gradient-to-br from-void-700 to-black'}`}>
                                    {selectedSkin ? (
                                        <img src={selectedSkin.images.icon} alt={selectedSkin.name} className="w-full h-full object-cover z-10" />
                                    ) : (
                                        <span className="text-6xl font-black text-white italic z-10 group-hover:scale-110 transition-transform">{stats1.account.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[120%] z-20">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={skinQuery}
                                            onChange={(e) => setSkinQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSkinSearch()}
                                            placeholder="Set Skin..." 
                                            className="w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-[10px] font-bold text-white text-center focus:border-strawberry-500 outline-none shadow-lg uppercase tracking-wider"
                                        />
                                        {skinLoading && <LoadingSpinner className="absolute right-2 top-2 w-3 h-3 text-white"/>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-left space-y-2">
                                <h3 className="text-6xl font-black text-white italic uppercase">{stats1.account.name}</h3>
                                <div className="flex gap-4 justify-center md:justify-start">
                                    <span className="bg-white/10 px-4 py-1 rounded text-xs font-bold uppercase tracking-widest text-zinc-300">Level {stats1.battlePass.level}</span>
                                    <span className="bg-fortnite-gold/10 text-fortnite-gold px-4 py-1 rounded text-xs font-bold uppercase tracking-widest">Progress {stats1.battlePass.progress}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Matches" value={getActiveStats(stats1)?.overall.matches.toLocaleString() || 0} color="bg-purple-500" icon="🎮" />
                            <StatCard label="Wins" value={getActiveStats(stats1)?.overall.wins.toLocaleString() || 0} color="bg-fortnite-gold" icon="👑" />
                            <StatCard label="Kills" value={getActiveStats(stats1)?.overall.kills.toLocaleString() || 0} color="bg-strawberry-500" icon="🎯" />
                            <StatCard label="K/D" value={getActiveStats(stats1)?.overall.kd.toFixed(2) || 0} color="bg-blue-500" icon="📈" />
                        </div>
                    </div>
                ) : null
            )}
        </div>
    );
};
