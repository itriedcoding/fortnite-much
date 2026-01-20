import React from 'react';
import { SparklesIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-4 sm:px-8 border-b border-white/5 bg-[#0a0510]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 group cursor-pointer select-none">
          <div className="relative">
             <div className="absolute inset-0 bg-fortnite-gold blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse-fast"></div>
             <div className="bg-gradient-to-br from-fortnite-purple to-[#4c1d95] p-3 rounded-2xl group-hover:rotate-[10deg] transition-transform duration-300 shadow-[0_0_20px_rgba(126,34,206,0.5)] border border-white/10 relative z-10">
                <SparklesIcon className="w-8 h-8 text-white drop-shadow-md" />
             </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-display tracking-wider text-white uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)] flex items-baseline gap-1" style={{ WebkitTextStroke: '1.5px black' }}>
              FORTNITE<span className="text-fortnite-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">GENIUS</span>
            </h1>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[10px] text-fortnite-blue font-black tracking-[0.4em] uppercase shadow-black drop-shadow-sm">v2.5 AI Engine Online</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
           <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Server Status</span>
                    <span className="text-xs font-black text-green-400 uppercase tracking-widest">Operational</span>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
           </div>
           <button className="px-6 py-2.5 rounded-full bg-fortnite-gold text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,191,36,0.4)] border-2 border-white/20">
             Get Pro
           </button>
        </div>
      </div>
    </header>
  );
};
