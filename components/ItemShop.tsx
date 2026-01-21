
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ShopItem } from '../types';
import { fetchDailyShop } from '../services/fortniteApi';
import { LoadingSpinner, RefreshIcon, ShopIcon, HeartIcon } from './Icons';

const VBUCK_ICON_URL = "https://fortnite-api.com/images/vbuck.png";

// --- 3D TILT CARD COMPONENT ---
const ShopCard = ({ item, onClick, isWishlisted, isInCart, onToggleWishlist, onToggleCart }: any) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    };

    const rarity = getRarityConfig(item.rarity.id);

    return (
        <div 
            ref={cardRef}
            onClick={onClick} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            className="group relative aspect-[3/4.2] rounded-2xl cursor-pointer bg-[#121212] z-0 select-none transition-all duration-200 ease-out"
            style={{ transform, transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
            <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-b ${rarity.bg} opacity-0 group-hover:opacity-80 blur-md transition-opacity duration-300 -z-10 translate-z-[-20px]`}></div>
            <div className={`absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b ${rarity.bg} border-2 ${rarity.border} shadow-2xl backface-hidden`}>
                <img src={item.displayAssets[0]?.url || ''} alt={item.displayName} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 ease-out" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-90"></div>
                
                {/* Controls */}
                <div className="absolute top-2 right-2 z-30 translate-z-[40px]">
                    <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(item.id); }} className={`p-2 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-red-600 text-white shadow-[0_0_15px_red]' : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'}`}>
                        <HeartIcon className="w-4 h-4" filled={isWishlisted} />
                    </button>
                </div>
                <div className="absolute top-2 left-2 z-30 translate-z-[40px]">
                    <button onClick={(e) => { e.stopPropagation(); onToggleCart(item); }} className={`p-2 rounded-full backdrop-blur-md transition-all ${isInCart ? 'bg-green-600 text-white shadow-[0_0_15px_green]' : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white'}`}>
                        <span className="text-[10px] font-black">{isInCart ? 'IN CART' : '+ CART'}</span>
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex flex-col justify-end translate-z-[30px]">
                    <h3 className="text-xl font-display text-white leading-[0.9] mb-3 drop-shadow-[0_2px_0_rgba(0,0,0,1)] uppercase truncate stroke-black" style={{ WebkitTextStroke: '1px black' }}>{item.displayName}</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg">
                                <img src={VBUCK_ICON_URL} className="w-4 h-4 object-contain" alt="V-Bucks" />
                            <span className="text-white font-display text-lg tracking-wide drop-shadow-md pt-0.5">{item.price.finalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

export const ItemShop: React.FC = () => {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [isRotating, setIsRotating] = useState(false);
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

    const loadShop = async () => {
        setLoading(true);
        setIsEmpty(false);
        try {
            const shopItems = await fetchDailyShop();
            if (shopItems.length === 0) setIsEmpty(true);
            setItems(shopItems);
        } catch (e) {
            setIsEmpty(true);
        } finally {
            setLoading(false);
            setIsRotating(false);
        }
    };

    const handleRefresh = () => {
        loadShop();
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Calculate next rotation (00:00 UTC Tomorrow)
            const nextRotation = new Date(now);
            nextRotation.setUTCDate(now.getUTCDate() + 1);
            nextRotation.setUTCHours(0, 0, 0, 0);
            
            const diff = nextRotation.getTime() - now.getTime();
            
            // Check if we are within the "rotation window" (e.g. 00:00:00 - 00:01:00 UTC)
            // If diff is close to 24h, it means we just rotated.
            // Let's use a simpler check: if diff is very small, we are about to rotate.
            
            if (diff <= 1000) {
                 // Shop rotates at 00:00 UTC. Wait 30s to be safe.
                 setIsRotating(true);
                 setTimeLeft("ROTATING...");
                 setTimeout(loadShop, 30000); 
            } else {
                 if (isRotating && diff > 86300000) {
                    // We just rotated (diff is near 24h)
                    // Keep isRotating true until loadShop finishes
                 } else {
                     const hours = Math.floor(diff / (1000 * 60 * 60));
                     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                     const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                     setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                 }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isRotating]);

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
                
                <div className="flex flex-col items-center gap-4 z-20 relative">
                    {/* Timer & Refresh */}
                    <div className={`flex items-center gap-4 px-6 py-2 rounded-full border transition-all duration-300 ${isRotating ? 'bg-fortnite-gold/20 border-fortnite-gold' : 'bg-black/40 backdrop-blur-md border-white/10'}`}>
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Next Rotation:</span>
                        <span className={`text-lg font-black font-mono tracking-widest ${isRotating ? 'text-white animate-pulse' : 'text-fortnite-gold'}`}>
                            {timeLeft || 'CALCULATING...'}
                        </span>
                        <button onClick={handleRefresh} className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors group" title="Force Refresh">
                            <RefreshIcon className={`w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                     {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
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

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <LoadingSpinner className="w-32 h-32 text-fortnite-gold mb-10" />
                    <p className="text-white text-3xl font-display italic tracking-widest animate-pulse drop-shadow-lg">
                        {isRotating ? 'REFRESHING SHOP DATA...' : 'SYNCING SHOP DATA...'}
                    </p>
                </div>
            ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center h-[50vh] bg-red-950/20 rounded-[3rem] border border-red-500/30 p-12 backdrop-blur-sm max-w-4xl mx-auto">
                     <p className="text-red-500 font-display text-5xl mb-4 italic">SERVER ERROR</p>
                     <p className="text-slate-300 text-xl mb-8 text-center leading-relaxed">Could not retrieve Shop Data from the Island. The API might be down or rotating.</p>
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

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8 perspective-1000">
                                {groupedItems[sectionName].map((item) => (
                                    <ShopCard 
                                        key={item.id} 
                                        item={item} 
                                        onClick={() => setInspectItem(item)}
                                        isWishlisted={wishlist.includes(item.id)}
                                        isInCart={cart.some(i => i.id === item.id)}
                                        onToggleWishlist={toggleWishlist}
                                        onToggleCart={toggleCart}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
