
import React, { useState } from 'react';
import { fetchPlayerStats, searchCosmetic } from '../services/fortniteApi';
import { PlayerStats as PlayerStatsType, InputStats, ModeStats, CosmeticItem } from '../types';
import { LoadingSpinner, SparklesIcon, CrosshairIcon, ControllerIcon, RobotIcon, ChartIcon } from './Icons';

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

    const [activeTab, setActiveTab] = useState<'all' | 'keyboardMouse' | 'gamepad' | 'touch'>('all');
    
    // Skin Selector
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
        // Auto-detect best input if 'all' is empty or user manually selects
        if (activeTab === 'keyboardMouse' && stats.stats.keyboardMouse) return stats.stats.keyboardMouse;
        if (activeTab === 'gamepad' && stats.stats.gamepad) return stats.stats.gamepad;
        if (activeTab === 'touch' && stats.stats.touch) return stats.stats.touch;
        return stats.stats.all;
    };

    const calculateThreatLevel = (stats: InputStats) => {
        if (!stats || !stats.overall) return { label: 'Unknown', color: 'text-zinc-500', percent: 0, score: 0 };

        const kd = stats.overall.kd;
        const winRate = stats.overall.winRate;
        const matches = stats.overall.matches;
        
        let score = (kd * 15) + (winRate * 2);
        if (matches > 5000) score += 10;
        if (matches > 10000) score += 10;

        // Max possible casual score approx 100.
        // Pro score > 150
        
        let label = "Casual";
        let color = "text-slate-400";
        let percent = Math.min(score, 100);

        if (score > 30) { label = "Grinder"; color = "text-blue-400"; }
        if (score > 60) { label = "Sweat"; color = "text-purple-400"; }
        if (score > 90) { label = "Demon"; color = "text-red-500"; }
        if (score > 120) { label = "FNCS Pro"; color = "text-fortnite-gold"; percent = 100; }

        return { label, color, percent, score };
    }

    const formatPlaytime = (minutes: number) => {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        return `${days}d ${hours}h`;
    }

    const SweatMeter = ({ stats }: { stats: InputStats }) => {
        const threat = calculateThreatLevel(stats);
        return (
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-white/10" fill="none"/>
                        <circle 
                            cx="64" cy="64" r="56" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            className={`${threat.color} transition-all duration-1000 ease-out`} 
                            fill="none" 
                            strokeDasharray="351.86" 
                            strokeDashoffset={351.86 - (351.86 * threat.percent) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-black ${threat.color}`}>{Math.round(threat.score)}</span>
                        <span className="text-[8px] font-bold uppercase text-slate-500">RATING</span>
                    </div>
                </div>
                <span className={`mt-2 text-xl font-black uppercase italic ${threat.color} drop-shadow-md`}>{threat.label}</span>
            </div>
        );
    }

    const StatCard = ({ label, value, color, icon, subValue, highlight }: any) => (
        <div className={`bg-void-800 border ${highlight ? 'border-fortnite-gold shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 z-10' : 'border-white/5'} p-5 rounded-[2rem] flex flex-col relative overflow-hidden group transition-all duration-300 hover:bg-void-700`}>
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                 <span className="text-5xl">{icon || '📊'}</span>
             </div>
             {highlight && <div className="absolute top-2 right-2 text-[9px] font-black bg-fortnite-gold text-black px-2 py-0.5 rounded-full">LEADER</div>}
             <div className={`w-6 h-1 ${color} rounded-full mb-3 shadow-[0_0_10px_currentColor]`}></div>
             <span className="text-2xl lg:text-3xl font-black italic text-white z-10 drop-shadow-md font-display tracking-wide">{value}</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1 z-10">{label}</span>
             {subValue && <span className="text-[10px] font-bold text-zinc-500 mt-1 z-10">{subValue}</span>}
        </div>
    );

    const ModeCard = ({ title, stats }: { title: string, stats?: ModeStats }) => {
        if (!stats) return null;
        return (
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-1">{title}</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Wins</span>
                        <span className="text-lg font-black text-white">{stats.wins}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">K/D</span>
                        <span className="text-lg font-black text-fortnite-gold">{stats.kd.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Win %</span>
                        <span className="text-lg font-black text-blue-400">{stats.winRate.toFixed(1)}%</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Kills</span>
                        <span className="text-lg font-black text-white">{stats.kills.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderComparison = () => {
        const s1 = getActiveStats(stats1);
        const s2 = getActiveStats(stats2);

        if (!stats1 || !stats2 || !s1 || !s2) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-6">
                    <h3 className="text-3xl font-black text-strawberry-400 text-center uppercase italic">{stats1.account.name}</h3>
                    <div className="flex justify-center mb-6"><SweatMeter stats={s1}/></div>
                    <StatCard label="Wins" value={s1.overall.wins} color="bg-strawberry-500" highlight={s1.overall.wins > s2.overall.wins} />
                    <StatCard label="Win Rate" value={s1.overall.winRate.toFixed(1) + '%'} color="bg-strawberry-500" highlight={s1.overall.winRate > s2.overall.winRate} />
                    <StatCard label="K/D" value={s1.overall.kd.toFixed(2)} color="bg-strawberry-500" highlight={s1.overall.kd > s2.overall.kd} />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="text-6xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse-fast">VS</div>
                    <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent my-4"></div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-3xl font-black text-purple-500 text-center uppercase italic">{stats2.account.name}</h3>
                    <div className="flex justify-center mb-6"><SweatMeter stats={s2}/></div>
                    <StatCard label="Wins" value={s2.overall.wins} color="bg-purple-500" highlight={s2.overall.wins > s1.overall.wins} />
                    <StatCard label="Win Rate" value={s2.overall.winRate.toFixed(1) + '%'} color="bg-purple-500" highlight={s2.overall.winRate > s1.overall.winRate} />
                    <StatCard label="K/D" value={s2.overall.kd.toFixed(2)} color="bg-purple-500" highlight={s2.overall.kd > s1.overall.kd} />
                </div>
            </div>
        );
    }

    const currentStats = getActiveStats(stats1);

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-20">
            
            <div className="text-center space-y-6 mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[200px] bg-strawberry-600/10 blur-[100px] -z-10 rounded-full animate-pulse-fast"></div>
                <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <span>CAREER</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-strawberry-400 via-strawberry-500 to-red-600 drop-shadow-[0_0_30px_rgba(255,23,68,0.6)]">STATS</span>
                </h2>
                
                <div className="flex justify-center gap-4">
                    <button onClick={() => setCompareMode(false)} className={`px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all ${!compareMode ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 hover:text-white'}`}>Solo View</button>
                    <button onClick={() => setCompareMode(true)} className={`px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-2 ${compareMode ? 'bg-strawberry-600 text-white' : 'bg-black/40 text-zinc-500 hover:text-white'}`}><CrosshairIcon className="w-4 h-4"/> Rivalry Mode</button>
                </div>
            </div>

            <div className={`grid ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-12 max-w-5xl mx-auto`}>
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
                </form>

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
                    </form>
                )}
            </div>

            {compareMode ? (
                (stats1 && stats2) ? (
                    <div className="bg-void-800/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl animate-fade-in">
                        {renderComparison()}
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-30"><p className="text-xl font-black uppercase text-zinc-500">Enter two usernames to begin analysis</p></div>
                )
            ) : (
                stats1 && currentStats ? (
                    <div className="bg-void-800/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 sm:p-12 shadow-[0_0_100px_rgba(255,23,68,0.1)] animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-strawberry-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
                        
                        {/* --- HEADER SECTION: SKIN & LEVEL --- */}
                        <div className="flex flex-col xl:flex-row gap-12 mb-12 border-b border-white/5 pb-10">
                             
                             {/* SKIN SELECTOR / HOLO LOADER */}
                             <div className="relative group shrink-0 mx-auto xl:mx-0">
                                <div className={`w-56 h-56 xl:w-64 xl:h-64 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 relative overflow-hidden transition-all duration-500 ${selectedSkin ? 'bg-[#100818]' : 'bg-gradient-to-br from-void-700 to-black'}`}>
                                    {selectedSkin ? (
                                        <>
                                            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl" style={{backgroundImage: `url(${selectedSkin.images.background || selectedSkin.images.icon})`}}></div>
                                            <img src={selectedSkin.images.featured || selectedSkin.images.icon} alt={selectedSkin.name} className="w-full h-full object-contain z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-300" />
                                            {/* Rarity Stripe */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-30">
                                            <span className="text-8xl font-black text-white italic z-10 group-hover:scale-110 transition-transform select-none">{stats1.account.name.charAt(0).toUpperCase()}</span>
                                            <span className="text-[9px] uppercase font-bold tracking-widest mt-2">No Loadout Detected</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Input Search Overlay */}
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[110%] z-20">
                                    <div className="relative group/search">
                                        <div className="absolute inset-0 bg-strawberry-600 blur-lg opacity-20 group-hover/search:opacity-40 transition-opacity"></div>
                                        <input 
                                            type="text" 
                                            value={skinQuery}
                                            onChange={(e) => setSkinQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSkinSearch()}
                                            placeholder="EQUIP SKIN..." 
                                            className="w-full bg-black/90 backdrop-blur-xl border border-white/20 rounded-full px-4 py-3 text-[10px] font-bold text-white text-center focus:border-strawberry-500 outline-none shadow-2xl uppercase tracking-widest transition-all"
                                        />
                                        {skinLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><LoadingSpinner className="w-3 h-3 text-strawberry-500"/></div>}
                                    </div>
                                </div>
                            </div>
                            
                            {/* PLAYER INFO & META */}
                            <div className="flex-1 flex flex-col space-y-6 text-center xl:text-left">
                                <div>
                                    <h3 className="text-5xl sm:text-7xl font-black text-white italic uppercase tracking-tighter drop-shadow-xl flex flex-col xl:flex-row gap-3 items-center xl:items-baseline justify-center xl:justify-start">
                                        {stats1.account.name}
                                        {stats1.battlePass && (
                                            <span className="bg-gradient-to-r from-fortnite-gold to-yellow-600 text-black px-4 py-1 rounded-lg text-sm font-bold uppercase tracking-widest transform -skew-x-12 shadow-lg inline-block">
                                                LVL {stats1.battlePass.level}
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                                    {/* Platform Tabs */}
                                    <div className="p-1 bg-black/40 rounded-xl border border-white/10 flex gap-1">
                                        {[
                                            { id: 'all', label: 'ALL INPUTS', icon: ChartIcon },
                                            { id: 'keyboardMouse', label: 'KBM', icon: CrosshairIcon },
                                            { id: 'gamepad', label: 'CONTROLLER', icon: ControllerIcon },
                                            { id: 'touch', label: 'TOUCH', icon: RobotIcon }
                                        ].map((tab) => (
                                            <button 
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                disabled={!stats1.stats[tab.id as keyof typeof stats1.stats]} // Disable if no data
                                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-500'}`}
                                            >
                                                <tab.icon className="w-3 h-3"/> {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sweat Analysis */}
                                <div className="bg-gradient-to-r from-black/60 to-transparent p-6 rounded-2xl border-l-4 border-strawberry-500 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
                                    <SweatMeter stats={currentStats} />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Combat Efficiency Report</h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto sm:mx-0">
                                            This player demonstrates <span className="text-white font-bold">{currentStats.overall.kd > 3 ? 'Elite' : currentStats.overall.kd > 1.5 ? 'Above Average' : 'Standard'}</span> mechanical skill.
                                            Win rate indicates {currentStats.overall.winRate > 10 ? 'high strategic placement' : 'aggressive w-key playstyle'}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- MAIN STATS GRID --- */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <StatCard label="Matches Played" value={currentStats.overall.matches.toLocaleString()} color="bg-purple-500" icon="🎮" subValue={formatPlaytime(currentStats.overall.minutesPlayed)} />
                            <StatCard label="Victory Royales" value={currentStats.overall.wins.toLocaleString()} color="bg-fortnite-gold" icon="👑" subValue={`Top 10: ${currentStats.overall.top10.toLocaleString()}`} />
                            <StatCard label="Eliminations" value={currentStats.overall.kills.toLocaleString()} color="bg-strawberry-500" icon="🎯" subValue={`Per Match: ${currentStats.overall.killsPerMatch.toFixed(1)}`} />
                            <StatCard label="K/D Ratio" value={currentStats.overall.kd.toFixed(2)} color="bg-blue-500" icon="📈" subValue={`Win Rate: ${currentStats.overall.winRate.toFixed(1)}%`} />
                        </div>

                        {/* --- MODE BREAKDOWN --- */}
                        <div>
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-strawberry-500 rounded-full"></span> Mode Analytics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ModeCard title="Solo Queue" stats={currentStats.solo} />
                                <ModeCard title="Duos" stats={currentStats.duo} />
                                <ModeCard title="Squads" stats={currentStats.squad} />
                            </div>
                        </div>

                    </div>
                ) : null
            )}
        </div>
    );
};
