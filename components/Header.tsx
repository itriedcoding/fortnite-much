
import React from 'react';
import { SparklesIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-5 px-6 border-b border-strawberry-500/20 bg-black/90 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_0_50px_rgba(255,23,68,0.1)]">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center space-x-4 group cursor-pointer select-none">
          <div className="relative">
             <div className="absolute inset-0 bg-strawberry-500 blur-[20px] opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-pulse-fast"></div>
             <div className="bg-gradient-to-br from-strawberry-600 to-black p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300 border border-strawberry-500/50 relative z-10">
                <SparklesIcon className="w-6 h-6 text-white drop-shadow-md" />
             </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-display tracking-widest text-white uppercase drop-shadow-md flex items-baseline gap-1">
              FORTNITE<span className="text-strawberry-500 drop-shadow-[0_0_15px_rgba(255,23,68,0.8)]">GENIUS</span>
            </h1>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-strawberry-500 animate-pulse shadow-[0_0_10px_#ff1744]"></div>
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase group-hover:text-strawberry-400 transition-colors">Pro Edition v3.0</p>
            </div>
          </div>
        </div>
        
        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center space-x-6">
           <div className="px-5 py-2 rounded-xl bg-void-800 border border-white/5 flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">System Status</span>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Online</span>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
           </div>
           <button className="relative overflow-hidden px-8 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] group">
             <span className="relative z-10">Get Pro</span>
             <div className="absolute inset-0 bg-strawberry-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             <span className="absolute inset-0 z-10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">Unlock</span>
           </button>
        </div>
      </div>
    </header>
  );
};
