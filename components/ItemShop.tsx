
import React, { useEffect, useState } from 'react';
import { ShopItem } from '../types';
import { fetchDailyShop } from '../services/fortniteApi';
import { LoadingSpinner, RefreshIcon, ShopIcon, HeartIcon } from './Icons';

const VBUCK_ICON_URL = "https://fortnite-api.com/images/vbuck.png";

export const ItemShop: React.FC = () => {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [isEmpty, setIsEmpty] = useState(false);
    
    // Wishlist Logic
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [showWishlistOnly, setShowWishlistOnly] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('fortnite_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
        loadShop();
    }, []);

    const toggleWishlist = (id: string) => {
        setWishlist(prev => {
            const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            localStorage.setItem('fortnite_wishlist', JSON.stringify(next));
            return next;
        });
    };

    const groupedItems = items.reduce((acc, item) => {
        const sectionName = item.section.name || 'Daily';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {} as Record<string, ShopItem[]>);

    const sortedSectionKeys = Object.keys(groupedItems).sort((a, b) => {
        const priority = ['Jam Tracks', 'Bundles', 'Featured', 'Daily', 'Special', 'Cars', 'Gear', 'Offers'];
        const highPriority = ['Featured', 'Daily', 'Bundles'];
        const idxA = highPriority.indexOf(a);
        const idxB = highPriority.indexOf(b);
        if (idxA > -1 && idxB > -1) return idxA - idxB;
        if (idxA > -1) return -1;
        if (idxB > -1) return 1;
        return a.localeCompare(b);
    });

    const getRarityConfig = (rarity: string) => {
        const r = rarity?.toLowerCase() || 'common';
        if (r.includes('gaminglegends')) return { bg: 'from-indigo-900 to-purple-800', border: 'border-indigo-400', text: 'text-indigo-200', glow: 'shadow-indigo-500/50' };
        if (r.includes('marvel')) return { bg: 'from-red-700 to-red-900', border: 'border-red-500', text: 'text-red-200', glow: 'shadow-red-500/50' };
        if (r.includes('dc')) return { bg: 'from-blue-800 to-slate-900', border: 'border-blue-500', text: 'text-blue-200', glow: 'shadow-blue-500/50' };
        if (r.includes('icon')) return { bg: 'from-cyan-500 to-teal-600', border: 'border-cyan-300', text: 'text-cyan-100', glow: 'shadow-cyan-400/50' };
        if (r.includes('starwars')) return { bg: 'from-slate-900 to-black', border: 'border-yellow-400', text: 'text-yellow-400', glow: 'shadow-yellow-400/50' };
        if (r.includes('slurp')) return { bg: 'from-teal-400 to-cyan-500', border: 'border-cyan-200', text: 'text-cyan-100', glow: 'shadow-cyan-400/50' };
        if (r.includes('frozen')) return { bg: 'from-sky-300 to-blue-500', border: 'border-sky-200', text: 'text-sky-100', glow: 'shadow-sky-400/50' };
        if (r.includes('lava')) return { bg: 'from-orange-600 to-red-700', border: 'border-orange-400', text: 'text-orange-200', glow: 'shadow-orange-500/50' };
        if (r.includes('transcendent')) return { bg: 'from-red-900 via-black to-red-900', border: 'border-red-500', text: 'text-red-500', glow: 'shadow-red-600/50' };
        if (r.includes('mythic')) return { bg: 'from-yellow-400 to-orange-500', border: 'border-yellow-300', text: 'text-yellow-100', glow: 'shadow-yellow-400/50' };
        if (r.includes('legendary')) return { bg: 'from-orange-400 to-orange-600', border: 'border-orange-300', text: 'text-orange-100', glow: 'shadow-orange-400/50' };
        if (r.includes('epic')) return { bg: 'from-purple-500 to-purple-700', border: 'border-purple-400', text: 'text-purple-100', glow: 'shadow-purple-500/50' };
        if (r.includes('rare')) return { bg: 'from-blue-400 to-blue-600', border: 'border-blue-300', text: 'text-blue-100', glow: 'shadow-blue-400/50' };
        if (r.includes('uncommon')) return { bg: 'from-green-500 to-green-700', border: 'border-green-400', text: 'text-green-100', glow: 'shadow-green-400/50' };
        return { bg: 'from-gray-500 to-gray-700', border: 'border-gray-400', text: 'text-gray-200', glow: 'shadow-gray-500/20' };
    };

    const loadShop = async () => {
        setLoading(true);
        setIsEmpty(false);
        const shopItems = await fetchDailyShop();
        if (shopItems.length === 0) setIsEmpty(true);
        setItems(shopItems);
        setLoading(false);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            tomorrow.setUTCHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    // Filter logic for display
    const visibleSections = showWishlistOnly 
        ? sortedSectionKeys.filter(key => groupedItems[key].some(item => wishlist.includes(item.id)))
        : sortedSectionKeys;

    return (
        <div className="w-full max-w-[1920px] mx-auto animate-fade-in-up px-4 sm:px-8 pb-32">
             <div className="text-center space-y-8 mb-16 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[200px] bg-fortnite-gold/10 blur-[100px] -z-10 rounded-full animate-pulse-fast"></div>
                <div className="relative inline-block group cursor-default">
                    <h2 className="text-6xl sm:text-9xl font-display text-white italic tracking-wider drop-shadow-[0_4px_0_#000] flex items-center justify-center gap-6 flex-wrap z-10 relative stroke-black" style={{WebkitTextStroke: '2px black'}}>
                        <ShopIcon className="w-16 h-16 sm:w-24 sm:h-24 text-fortnite-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                        <span className="text-white drop-shadow-xl">ITEM SHOP</span>
                    </h2>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold font-mono">
                    <div className="px-8 py-4 bg-black/60 border border-white/20 rounded-xl backdrop-blur-xl shadow-2xl flex items-center gap-4">
                        <span className="text-fortnite-gold uppercase tracking-widest text-xs font-display">Refresh In</span>
                        <span className="text-white text-3xl tracking-widest tabular-nums font-display">{timeLeft}</span>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex gap-4">
                        <button onClick={loadShop} className="px-6 py-4 bg-fortnite-blue hover:bg-blue-500 rounded-xl font-display text-lg italic uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-2 group border border-blue-400">
                            <RefreshIcon className={`w-5 h-5 text-white ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                            <span>Sync</span>
                        </button>
                        <button onClick={() => setShowWishlistOnly(!showWishlistOnly)} className={`px-6 py-4 rounded-xl font-display text-lg italic uppercase tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2 border ${showWishlistOnly ? 'bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-black/60 text-slate-300 border-white/20 hover:text-white'}`}>
                            <HeartIcon className={`w-5 h-5 ${showWishlistOnly ? 'fill-current' : ''}`} />
                            <span>Wishlist ({wishlist.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <LoadingSpinner className="w-32 h-32 text-fortnite-gold mb-10" />
                    <p className="text-white text-3xl font-display italic tracking-widest animate-pulse drop-shadow-lg">SYNCING SHOP DATA...</p>
                </div>
            ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center h-[50vh] bg-red-950/20 rounded-[3rem] border border-red-500/30 p-12 backdrop-blur-sm max-w-4xl mx-auto">
                     <p className="text-red-500 font-display text-5xl mb-4 italic">SERVER ERROR</p>
                     <p className="text-slate-300 text-xl mb-8 text-center leading-relaxed">Could not retrieve Shop Data from the Island.</p>
                     <button onClick={loadShop} className="px-10 py-5 bg-red-600 text-white font-display italic rounded-2xl hover:bg-red-500 transition-all hover:scale-105 shadow-xl text-xl">RETRY CONNECTION</button>
                </div>
            ) : showWishlistOnly && visibleSections.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[30vh] text-center opacity-50">
                     <HeartIcon className="w-24 h-24 text-slate-700 mb-6" />
                     <h3 className="text-3xl font-black text-slate-500 uppercase">Wishlist Empty</h3>
                     <p className="text-slate-600 font-bold mt-2">None of your tracked items are currently in the shop.</p>
                 </div>
            ) : (
                <div className="space-y-24">
                    {visibleSections.map((sectionName) => (
                        <div key={sectionName} className="space-y-8 animate-fade-in-up">
                            <div className="flex items-center gap-6 mb-10 pl-2">
                                <div className="h-16 w-3 bg-gradient-to-b from-fortnite-gold to-orange-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] transform skew-x-12"></div>
                                <h3 className="text-5xl md:text-7xl font-display text-white uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black" style={{WebkitTextStroke: '2px black'}}>{sectionName}</h3>
                                <div className="h-[4px] flex-grow bg-white/20 rounded-full ml-8 skew-x-[-20deg]"></div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                {groupedItems[sectionName].filter(item => !showWishlistOnly || wishlist.includes(item.id)).map((item) => {
                                    const rarity = getRarityConfig(item.rarity.id);
                                    const isWishlisted = wishlist.includes(item.id);
                                    return (
                                        <div key={item.id} className="group relative aspect-[3/4.2] rounded-2xl cursor-pointer bg-[#121212] z-0 select-none hover:-translate-y-2 transition-transform duration-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transformStyle: 'preserve-3d' }}>
                                            <div className={`absolute -inset-[3px] rounded-2xl bg-gradient-to-b ${rarity.bg} opacity-0 group-hover:opacity-80 blur-lg transition-opacity duration-300 -z-10`}></div>
                                            <div className={`absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b ${rarity.bg} border-2 ${rarity.border} shadow-2xl`}>
                                                <img src={item.displayAssets[0]?.url || ''} alt={item.displayName} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500 ease-out" loading="lazy" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-90"></div>
                                                
                                                {/* Wishlist Toggle Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id); }}
                                                    className={`absolute top-2 right-2 z-30 p-2 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-red-600 text-white shadow-[0_0_15px_red]' : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'}`}
                                                >
                                                    <HeartIcon className="w-4 h-4" filled={isWishlisted} />
                                                </button>

                                                {item.banner && (
                                                    <div className="absolute top-3 left-0 bg-fortnite-gold text-black text-[10px] font-display uppercase px-3 py-1 shadow-lg z-20 skew-x-[-10deg] ml-[-5px] border-r-2 border-white/20">
                                                        <span className="block skew-x-[10deg] tracking-wider">{item.banner.value}</span>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex flex-col justify-end transform translate-z-20">
                                                    <h3 className="text-xl font-display text-white leading-[0.9] mb-3 drop-shadow-[0_2px_0_rgba(0,0,0,1)] uppercase truncate stroke-black" style={{ WebkitTextStroke: '1px black' }}>{item.displayName}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 group-hover:border-white/50 transition-colors shadow-lg">
                                                             <img src={VBUCK_ICON_URL} className="w-4 h-4 object-contain" alt="V-Bucks" />
                                                            <span className="text-white font-display text-lg tracking-wide drop-shadow-md pt-0.5">{item.price.finalPrice.toLocaleString()}</span>
                                                        </div>
                                                        {item.price.finalPrice < item.price.regularPrice && (
                                                            <div className="flex flex-col items-end">
                                                                <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase transform rotate-3 shadow-lg border border-white/20">-{Math.round((1 - item.price.finalPrice/item.price.regularPrice)*100)}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
