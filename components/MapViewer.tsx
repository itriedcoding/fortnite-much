
import React, { useEffect, useState, useRef } from 'react';
import { fetchCurrentMap } from '../services/fortniteApi';
import { MapData, MapPOI } from '../types';
import { CrosshairIcon, LoadingSpinner, MapIcon, RefreshIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

export const MapViewer: React.FC = () => {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'pois' | 'blank'>('pois');
    const [tacticalDrop, setTacticalDrop] = useState<MapPOI | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    // Map Interaction State
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const mapRef = useRef<HTMLDivElement>(null);

    // Advanced Tools
    const [toolMode, setToolMode] = useState<'none' | 'measure' | 'storm'>('none');
    const [measurePoints, setMeasurePoints] = useState<{x: number, y: number}[]>([]);
    const [stormCircle, setStormCircle] = useState<{x: number, y: number, r: number} | null>(null);

    useEffect(() => {
        const loadMap = async () => {
            setLoading(true);
            const data = await fetchCurrentMap();
            setMapData(data);
            setLoading(false);
        };
        loadMap();
    }, []);

    const handleSpinWheel = () => {
        if (!mapData || !mapData.pois.length) return;
        
        setIsSpinning(true);
        setTacticalDrop(null);

        let spins = 0;
        const maxSpins = 20;
        const interval = setInterval(() => {
            const randomPOI = mapData.pois[Math.floor(Math.random() * mapData.pois.length)];
            setTacticalDrop(randomPOI);
            spins++;
            
            if (spins >= maxSpins) {
                clearInterval(interval);
                setIsSpinning(false);
            }
        }, 100);
    };

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(Math.max(prev + delta, 1), 4));
        if (zoom + delta <= 1) setPan({ x: 0, y: 0 }); 
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (toolMode === 'measure') {
            const rect = mapRef.current?.getBoundingClientRect();
            if (rect) {
                const x = (e.clientX - rect.left - pan.x) / zoom;
                const y = (e.clientY - rect.top - pan.y) / zoom;
                
                setMeasurePoints(prev => {
                    if (prev.length >= 2) return [{x, y}];
                    return [...prev, {x, y}];
                });
            }
            return;
        }

        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1 && toolMode === 'none') {
            e.preventDefault();
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            
            const limit = (zoom - 1) * 300; 
            setPan({
                x: Math.min(Math.max(newX, -limit), limit),
                y: Math.min(Math.max(newY, -limit), limit)
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const generateStorm = () => {
        const x = Math.random() * 1000; 
        const y = Math.random() * 1000;
        const r = 100 + Math.random() * 200;
        setStormCircle({x, y, r});
        setToolMode('storm');
    }

    const calculateDistance = () => {
        if (measurePoints.length !== 2) return 0;
        const dx = measurePoints[1].x - measurePoints[0].x;
        const dy = measurePoints[1].y - measurePoints[0].y;
        return Math.round(Math.sqrt(dx*dx + dy*dy) * 2.5); // 2.5 arbitrary scale factor
    }

    const getTravelTime = (distance: number, type: 'run' | 'car' | 'fly') => {
        const speeds = { run: 4.1, car: 22, fly: 35 }; // m/s
        const seconds = distance / speeds[type];
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}m ${secs}s`;
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto animate-fade-in-up pb-20">
             {/* Header */}
             <div className="text-center space-y-6 mb-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[200px] bg-green-500/10 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
                <h2 className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <MapIcon className="w-16 h-16 text-green-500" />
                    <span>ISLAND</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-emerald-700 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]">INTEL</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <span className="bg-black/60 border border-green-500/30 text-green-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">Live Satellite Feed</span>
                     <span className="bg-black/60 border border-white/10 text-slate-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">Sector 6</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                     <div className="relative">
                         <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 animate-pulse"></div>
                         <LoadingSpinner className="w-24 h-24 text-green-500 relative z-10" />
                     </div>
                     <p className="text-white font-black tracking-[0.5em] text-xl mt-8 animate-pulse">ESTABLISHING UPLINK...</p>
                </div>
            ) : !mapData ? (
                 <div className="text-center py-20 bg-red-900/20 border border-red-500/30 rounded-3xl">
                     <p className="text-red-400 font-bold text-xl uppercase tracking-widest">Signal Lost. Map Offline.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANEL: MAP DISPLAY */}
                    <div className="lg:col-span-8 bg-[#0a0510] border border-white/10 rounded-[3rem] p-4 relative overflow-hidden shadow-2xl group">
                        
                        {/* Map Controls Overlay */}
                        <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-2 max-w-[70%]">
                            <button onClick={() => setViewMode('pois')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border backdrop-blur-md ${viewMode === 'pois' ? 'bg-green-500 text-black border-green-500' : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'}`}>Tactical View</button>
                            <button onClick={() => setViewMode('blank')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border backdrop-blur-md ${viewMode === 'blank' ? 'bg-green-500 text-black border-green-500' : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'}`}>Clean Feed</button>
                            
                            {/* New Tools */}
                            <button onClick={() => { setToolMode(toolMode === 'measure' ? 'none' : 'measure'); setMeasurePoints([]); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border backdrop-blur-md flex items-center gap-2 ${toolMode === 'measure' ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'}`}>
                                <span>📏 Measure</span>
                            </button>
                            <button onClick={generateStorm} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border backdrop-blur-md flex items-center gap-2 ${toolMode === 'storm' ? 'bg-purple-500 text-white border-purple-500' : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'}`}>
                                <span>⛈️ Storm Sim</span>
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                            <button onClick={() => handleZoom(0.5)} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomInIcon className="w-6 h-6"/></button>
                            <div className="h-[1px] bg-white/10 w-full"></div>
                            <button onClick={() => handleZoom(-0.5)} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomOutIcon className="w-6 h-6"/></button>
                        </div>

                        {/* HUD Overlay */}
                        <div className="absolute bottom-8 left-8 z-20 font-mono text-[10px] text-green-500 bg-black/80 px-4 py-2 rounded-lg border border-green-500/20 pointer-events-none">
                            <p>ZOOM: {(zoom * 100).toFixed(0)}%</p>
                            <p>PAN: {pan.x.toFixed(0)}, {pan.y.toFixed(0)}</p>
                            {toolMode === 'measure' && measurePoints.length === 2 && (
                                <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                    <p className="text-yellow-400 font-bold">DIST: {calculateDistance()}m</p>
                                    <p className="text-slate-300">🏃 RUN: {getTravelTime(calculateDistance(), 'run')}</p>
                                    <p className="text-slate-300">🚗 CAR: {getTravelTime(calculateDistance(), 'car')}</p>
                                    <p className="text-slate-300">🚁 FLY: {getTravelTime(calculateDistance(), 'fly')}</p>
                                </div>
                            )}
                        </div>

                        {/* The Map Image */}
                        <div 
                            className={`relative aspect-square w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#05020a] ${toolMode === 'measure' ? 'cursor-crosshair' : 'cursor-move'}`}
                            ref={mapRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                             {/* Scan Line Effect */}
                             <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,197,94,0.1)_50%,transparent_100%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30"></div>
                             <div className="absolute top-0 left-0 w-full h-[5px] bg-green-500/50 shadow-[0_0_20px_#22c55e] animate-[scan_4s_linear_infinite] z-20 pointer-events-none"></div>

                             <div style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, width: '100%', height: '100%', position: 'relative' }}>
                                 <img 
                                    src={viewMode === 'pois' ? mapData.images.pois : mapData.images.blank} 
                                    alt="Fortnite Map" 
                                    className="w-full h-full object-cover transition-transform duration-100 ease-out will-change-transform"
                                    draggable={false}
                                 />
                                 
                                 {/* Storm Overlay */}
                                 {toolMode === 'storm' && stormCircle && (
                                     <div 
                                        className="absolute rounded-full border-4 border-purple-500 bg-purple-500/20"
                                        style={{
                                            left: `${(stormCircle.x / 1000) * 100}%`, // Rough approx placement
                                            top: `${(stormCircle.y / 1000) * 100}%`,
                                            width: `${stormCircle.r}px`,
                                            height: `${stormCircle.r}px`,
                                            transform: 'translate(-50%, -50%)',
                                            boxShadow: '0 0 50px #a855f7'
                                        }}
                                     ></div>
                                 )}

                                 {/* Measure Lines */}
                                 {toolMode === 'measure' && measurePoints.map((pt, i) => (
                                     <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full z-30" style={{left: pt.x, top: pt.y, transform: 'translate(-50%, -50%)'}}></div>
                                 ))}
                                 
                                 {/* Draw line between points */}
                                 {toolMode === 'measure' && measurePoints.length === 2 && (
                                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                                         <line 
                                            x1={measurePoints[0].x} 
                                            y1={measurePoints[0].y} 
                                            x2={measurePoints[1].x} 
                                            y2={measurePoints[1].y} 
                                            stroke="#facc15" 
                                            strokeWidth="2" 
                                            strokeDasharray="5,5"
                                         />
                                     </svg>
                                 )}
                             </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: INTEL & DROPS */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 1. DROP ROULETTE CARD */}
                        <div className="bg-[#130b1c] rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full"></div>
                             
                             <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                 <CrosshairIcon className="w-6 h-6 text-green-500" />
                                 Tactical Drop
                             </h3>

                             <div className="bg-black/40 rounded-2xl p-6 border border-white/5 min-h-[120px] flex flex-col items-center justify-center mb-6 text-center relative overflow-hidden">
                                 {isSpinning && <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>}
                                 {tacticalDrop ? (
                                     <>
                                        <span className={`text-2xl font-black italic uppercase tracking-wider z-10 ${isSpinning ? 'text-slate-400' : 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]'}`}>
                                            {tacticalDrop.name}
                                        </span>
                                        {!isSpinning && (
                                            <span className="text-[10px] font-mono text-slate-500 mt-2 tracking-widest">
                                                COORDS: {Math.round(tacticalDrop.location.x)}, {Math.round(tacticalDrop.location.y)}
                                            </span>
                                        )}
                                     </>
                                 ) : (
                                     <span className="text-slate-600 font-black uppercase tracking-widest text-sm">Awaiting Orders...</span>
                                 )}
                             </div>

                             <button 
                                onClick={handleSpinWheel}
                                disabled={isSpinning}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                             >
                                 {isSpinning ? <RefreshIcon className="w-5 h-5 animate-spin"/> : <CrosshairIcon className="w-5 h-5"/>}
                                 <span>{isSpinning ? 'CALCULATING...' : 'GENERATE DROP'}</span>
                             </button>
                        </div>

                        {/* 2. POI LIST */}
                        <div className="bg-[#130b1c] rounded-[2.5rem] p-8 border border-white/10 flex flex-col h-[500px]">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Identified Locations ({mapData.pois.length})</h3>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {mapData.pois.sort((a,b) => a.name.localeCompare(b.name)).map((poi) => (
                                    <div key={poi.id} className="group flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-green-500/30 transition-all cursor-default">
                                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-wide">
                                            {poi.name}
                                        </span>
                                        <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-green-500 group-hover:shadow-[0_0_10px_#22c55e] transition-all"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
