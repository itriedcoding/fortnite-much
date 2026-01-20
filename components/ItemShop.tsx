
import React, { useEffect, useState, useMemo } from 'react';
import { ShopItem } from '../types';
import { fetchDailyShop } from '../services/fortniteApi';
import { LoadingSpinner, RefreshIcon, ShopIcon, HeartIcon } from './Icons';

const VBUCK_ICON_URL = "https://fortnite-api.com/images/vbuck.png";
const VBUCK_TO_USD_RATE = 0.00899;

export const ItemShop: React.FC = () => {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [isEmpty, setIsEmpty] = useState(false);
    
    // Filters & Cart
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<ShopItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [showWishlistOnly, setShowWishlistOnly] = useState(false);

    // INSPECTOR MODAL
    const [inspectItem, setInspectItem] = useState<ShopItem | null>(null);

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

    const toggleCart = (item: ShopItem) => {
        setCart(prev => {
            if (prev.find(i => i.id === item.id)) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price.finalPrice, 0);

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!showWishlistOnly || wishlist.includes(item.id))
        );
    }, [items, searchTerm, showWishlistOnly, wishlist]);

    const groupedItems = filteredItems.reduce((acc, item) => {
        const sectionName = item.section.name || 'Daily';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {} as Record<string, ShopItem[]>);

    const sortedSectionKeys = Object.keys(groupedItems).sort((a, b) => {
        const highPriority = ['Featured', 'Daily', 'Bundles', 'Star Wars', 'Marvel', 'Icon Series'];
        const idxA = highPriority.indexOf(a);
        const idxB = highPriority.indexOf(b);
        if (idxA > -1 && idxB > -1) return idxA - idxB;
        if (idxA > -1) return -1;
        if (idxB > -1) return 1;
        return a.localeCompare(b);
    });

    const getRarityConfig = (rarity: string) => {
        const r = rarity?.toLowerCase() || 'common';
        if (r.includes('marvel')) return { bg: 'from-red-700 to-red-900', border: 'border-red-500' };
        if (r.includes('icon')) return { bg: 'from-cyan-500 to-teal-600', border: 'border-cyan-300' };
        if (r.includes('starwars')) return { bg: 'from-slate-900 to-black', border: 'border-yellow-400' };
        if (r.includes('legendary')) return { bg: 'from-orange-400 to-orange-600', border: 'border-orange-300' };
        if (r.includes('epic')) return { bg: 'from-purple-500 to-purple-700', border: 'border-purple-400' };
        if (r.includes('rare')) return { bg: 'from-blue-400 to-blue-600', border: 'border-blue-300' };
        if (r.includes('uncommon')) return { bg: 'from-green-500 to-green-700', border: 'border-green-400' };
        return { bg: 'from-gray-500 to-gray-700', border: 'border-gray-400' };
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
                
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold font-mono z-20 relative">
                     {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH SHOP..."
                            className="bg-black/60 border border-white/20 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-fortnite-blue uppercase w-48 transition-all"
                        />
                        <button onClick={() => setShowWishlistOnly(!showWishlistOnly)} className={`px-6 py-4 rounded-xl font-display text-lg italic uppercase tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2 border ${showWishlistOnly ? 'bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-black/60 text-slate-300 border-white/20 hover:text-white'}`}>
                            <HeartIcon className={`w-5 h-5 ${showWishlistOnly ? 'fill-current' : ''}`} />
                            <span>Wishlist ({wishlist.length})</span>
                        </button>
                         <button onClick={() => setShowCart(!showCart)} className={`px-6 py-4 rounded-xl font-display text-lg italic uppercase tracking-wider transition-all hover:scale-105 shadow-lg flex items-center gap-2 border ${cart.length > 0 ? 'bg-green-600 text-white border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-black/60 text-slate-300 border-white/20 hover:text-white'}`}>
                            <span>🛒 Cart ({cart.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* INSPECTOR MODAL */}
            {inspectItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4" onClick={() => setInspectItem(null)}>
                    <div className="w-full max-w-5xl bg-[#130b1c] rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        
                        {/* Left: Image */}
                        <div className={`md:w-1/2 p-10 flex items-center justify-center bg-gradient-to-b ${getRarityConfig(inspectItem.rarity.id).bg} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-[url('https://fortnite-api.com/images/cosmetics/br/rarity/legendary.png')] bg-cover opacity-10 mix-blend-overlay"></div>
                            <img src={inspectItem.displayAssets[0].url} alt={inspectItem.displayName} className="w-full h-full object-contain z-10 drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform duration-500" />
                        </div>

                        {/* Right: Info */}
                        <div className="md:w-1/2 p-10 flex flex-col justify-between space-y-8">
                            <div>
                                <h2 className="text-5xl font-black text-white italic uppercase tracking-wider leading-[0.9] mb-4">{inspectItem.displayName}</h2>
                                <div className="flex gap-4 mb-6">
                                     <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getRarityConfig(inspectItem.rarity.id).border} text-white bg-black/20`}>
                                         {inspectItem.rarity.name}
                                     </span>
                                     <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 text-slate-400 bg-black/20">
                                         {inspectItem.section.name}
                                     </span>
                                </div>
                                <p className="text-slate-300 font-medium text-lg leading-relaxed border-l-2 border-white/10 pl-4">{inspectItem.displayDescription}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Price</span>
                                    <div className="flex items-center gap-2">
                                        <img src={VBUCK_ICON_URL} className="w-6 h-6" />
                                        <span className="text-3xl font-black text-white">{inspectItem.price.finalPrice}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => toggleCart(inspectItem)} className="py-4 bg-white text-black font-black uppercase rounded-xl hover:bg-green-400 transition-colors">
                                        {cart.some(i => i.id === inspectItem.id) ? 'Remove Cart' : 'Add to Cart'}
                                    </button>
                                    <button onClick={() => toggleWishlist(inspectItem.id)} className="py-4 bg-black/40 border border-white/10 text-white font-black uppercase rounded-xl hover:bg-red-500 hover:border-red-500 transition-colors">
                                        {wishlist.includes(inspectItem.id) ? 'Unwishlist' : 'Wishlist'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={() => setInspectItem(null)} className="absolute top-6 right-6 p-2 bg-black/40 rounded-full text-white hover:bg-white hover:text-black transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* CART OVERLAY */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowCart(false)}>
                    <div className="bg-[#130b1c] w-full max-w-lg rounded-3xl border border-white/10 p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-3xl font-black text-white italic uppercase mb-6 flex items-center gap-2">
                            <span>🛒 V-Bucks Calculator</span>
                        </h3>
                        {cart.length === 0 ? (
                            <p className="text-slate-500 font-bold text-center py-8">Your cart is empty.</p>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <img src={item.displayAssets[0].url} className="w-10 h-10 rounded-lg object-cover"/>
                                            <span className="font-bold text-sm text-white">{item.displayName}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-white font-black flex items-center gap-1">
                                                {item.price.finalPrice} <img src={VBUCK_ICON_URL} className="w-3 h-3"/>
                                            </span>
                                            <button onClick={() => toggleCart(item)} className="text-red-500 hover:text-white text-xs font-bold">REMOVE</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                             <div className="flex justify-between items-center text-xl font-black text-white">
                                 <span>Total V-Bucks:</span>
                                 <span className="flex items-center gap-2 text-fortnite-gold">{cartTotal.toLocaleString()} <img src={VBUCK_ICON_URL} className="w-5 h-5"/></span>
                             </div>
                             <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                 <span>Est. USD Cost:</span>
                                 <span className="text-green-400">${(cartTotal * VBUCK_TO_USD_RATE).toFixed(2)}</span>
                             </div>
                             <button className="w-full py-3 bg-fortnite-gold text-black font-black uppercase rounded-xl mt-4 hover:scale-[1.02] transition-transform">
                                 Simulate Gift to Friend
                             </button>
                        </div>
                        <button onClick={() => setShowCart(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                    </div>
                </div>
            )}

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
            ) : (
                <div className="space-y-24">
                    {sortedSectionKeys.map((sectionName) => (
                        <div key={sectionName} className="space-y-8 animate-fade-in-up">
                            <div className="flex items-center gap-6 mb-10 pl-2">
                                <div className="h-16 w-3 bg-gradient-to-b from-fortnite-gold to-orange-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] transform skew-x-12"></div>
                                <h3 className="text-5xl md:text-7xl font-display text-white uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black" style={{WebkitTextStroke: '2px black'}}>{sectionName}</h3>
                                <div className="h-[4px] flex-grow bg-white/20 rounded-full ml-8 skew-x-[-20deg]"></div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                {groupedItems[sectionName].map((item) => {
                                    const rarity = getRarityConfig(item.rarity.id);
                                    const isWishlisted = wishlist.includes(item.id);
                                    const isInCart = cart.some(i => i.id === item.id);

                                    return (
                                        <div onClick={() => setInspectItem(item)} key={item.id} className="group relative aspect-[3/4.2] rounded-2xl cursor-pointer bg-[#121212] z-0 select-none hover:-translate-y-2 transition-transform duration-300" style={{ transformStyle: 'preserve-3d' }}>
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

                                                 {/* Cart Toggle Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleCart(item); }}
                                                    className={`absolute top-2 left-2 z-30 p-2 rounded-full backdrop-blur-md transition-all ${isInCart ? 'bg-green-600 text-white shadow-[0_0_15px_green]' : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'}`}
                                                >
                                                    <span className="text-[10px] font-black">{isInCart ? 'IN CART' : '+ CART'}</span>
                                                </button>

                                                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex flex-col justify-end transform translate-z-20">
                                                    <h3 className="text-xl font-display text-white leading-[0.9] mb-3 drop-shadow-[0_2px_0_rgba(0,0,0,1)] uppercase truncate stroke-black" style={{ WebkitTextStroke: '1px black' }}>{item.displayName}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 group-hover:border-white/50 transition-colors shadow-lg">
                                                             <img src={VBUCK_ICON_URL} className="w-4 h-4 object-contain" alt="V-Bucks" />
                                                            <span className="text-white font-display text-lg tracking-wide drop-shadow-md pt-0.5">{item.price.finalPrice.toLocaleString()}</span>
                                                        </div>
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
