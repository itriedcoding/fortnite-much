import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { fetchNews } from '../services/fortniteApi';
import { LoadingSpinner, NewsIcon } from './Icons';

export const NewsFeed: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            setLoading(true);
            const data = await fetchNews();
            setNews(data);
            setLoading(false);
        };
        loadNews();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in-up pb-20">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,0,0,0.6)] stroke-black stroke-2 flex items-center justify-center gap-4">
                    <NewsIcon className="w-12 h-12 text-red-500" />
                    BATTLE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500">NEWS</span>
                </h2>
                <p className="text-slate-400 font-medium max-w-lg mx-auto uppercase tracking-widest text-xs">
                    Live Updates • Patch Notes • Events
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <LoadingSpinner className="w-16 h-16 text-red-500 mb-4" />
                    <p className="text-white font-bold tracking-widest animate-pulse">FETCHING INTEL...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <div key={item.id} className={`group relative rounded-[2rem] overflow-hidden shadow-2xl bg-[#1a0b2e] border border-white/10 hover:border-red-500/50 transition-all duration-300 ${index === 0 ? 'md:col-span-2 lg:col-span-2 row-span-2 min-h-[500px]' : 'min-h-[400px]'}`}>
                            
                            {/* Media Background */}
                            <div className="absolute inset-0 z-0">
                                {item.image && (
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" 
                                    />
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 opacity-90"></div>
                            </div>
                            
                            {/* Video Loop (if available) - Plays on Hover */}
                            {item.video && (
                                <video
                                    src={item.video}
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    onMouseOver={(e) => e.currentTarget.play()}
                                    onMouseOut={(e) => e.currentTarget.pause()}
                                />
                            )}

                            {/* Tags */}
                            <div className="absolute top-6 left-6 z-20 flex gap-2">
                                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg tracking-widest backdrop-blur-md">
                                    {item.tabTitle || 'NEWS'}
                                </span>
                                {item.video && (
                                    <span className="bg-white/10 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md flex items-center gap-1">
                                        ▶ Video
                                    </span>
                                )}
                            </div>
                            
                            {/* Date */}
                            <div className="absolute top-6 right-6 z-20">
                                <span className="text-xs font-bold text-slate-300 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    {formatDate(item.date)}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end">
                                <h3 className={`font-black italic text-white uppercase leading-[0.9] mb-4 drop-shadow-xl ${index === 0 ? 'text-5xl md:text-6xl' : 'text-3xl'}`}>
                                    {item.title}
                                </h3>
                                <p className={`text-slate-300 font-medium drop-shadow-md leading-relaxed ${index === 0 ? 'text-lg line-clamp-4' : 'text-sm line-clamp-3'}`}>
                                    {item.body}
                                </p>
                                
                                <div className="mt-6 w-full h-[1px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
                            </div>
                        </div>
                    ))}
                    
                    {news.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-white text-xl font-bold">No news available at the moment.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
