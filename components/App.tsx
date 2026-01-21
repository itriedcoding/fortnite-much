
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ThumbnailForm } from './components/ThumbnailForm';
import { GeneratedImage } from './components/GeneratedImage';
import { ItemShop } from './components/ItemShop';
import { PlayerStats } from './components/PlayerStats';
import { NewsFeed } from './components/NewsFeed';
import { MapViewer } from './components/MapViewer';
import { VoiceoverStudio } from './components/VideoGenerator';
import { BrandStudio } from './components/BrandStudio';
import { TacticalOS } from './components/TacticalOS';
import { CreativeArchitect } from './components/CreativeArchitect';
import { CatSoundboard } from './components/CatSoundboard';
import { GeneratedImage as GeneratedImageType, ThumbnailConfig } from './types';
import { enhancePrompt, generateThumbnailImage } from './services/gemini';
import { ChartIcon, MagicWandIcon, ShopIcon, NewsIcon, MapIcon, MicrophoneIcon, ShieldIcon, BrainIcon, BlueprintIcon, PawIcon } from './components/Icons';

type ViewMode = 'generator' | 'shop' | 'stats' | 'news' | 'map' | 'voiceover' | 'brand' | 'tactical' | 'creative' | 'cats';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('generator');
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('fg_history');
    if (savedHistory) {
        try {
            setHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Failed to parse history", e);
        }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
      localStorage.setItem('fg_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (config: ThumbnailConfig) => {
    setIsGenerating(true);
    setImageUrl(null);
    setEnhancedPrompt(null);
    setError(null);

    try {
      let finalPrompt = config.topic;

      // Step 1: Enhance Prompt with Dynamic Context Engine
      setStatusMessage('Strategy Engine: Analyzing Meta...');
      finalPrompt = await enhancePrompt(config);
      setEnhancedPrompt(finalPrompt);

      // Step 2: Generate Image
      setStatusMessage('Unreal Engine 5: Rendering 8K Assets...');
      await new Promise(r => setTimeout(r, 800)); // Cinematic pause
      
      const base64Image = await generateThumbnailImage(finalPrompt, config.referenceImage, config.advanced.aspectRatio);
      setImageUrl(base64Image);

      // Add to history
      const newImage: GeneratedImageType = {
          id: Date.now().toString(),
          url: base64Image,
          prompt: finalPrompt,
          timestamp: Date.now()
      };
      setHistory(prev => [newImage, ...prev]);

    } catch (err) {
      console.error(err);
      setError('Connection interrupted. Please verify your API key and try again.');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const NavButton = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
      <button 
        onClick={() => setCurrentView(mode)}
        className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase italic tracking-wider transition-all duration-300 group overflow-hidden ${currentView === mode ? 'text-black shadow-[0_0_30px_rgba(255,23,68,0.4)] scale-105' : 'bg-void-800/50 border border-white/5 text-zinc-500 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
      >
          {currentView === mode && (
              <div className="absolute inset-0 bg-gradient-to-br from-strawberry-500 to-red-600"></div>
          )}
          <Icon className={`w-5 h-5 relative z-10 ${currentView === mode ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
          <span className={`relative z-10 text-xs sm:text-sm whitespace-nowrap ${currentView === mode ? 'text-white' : ''}`}>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-strawberry-500 selection:text-white overflow-x-hidden relative">
      
      {/* --- CINEMATIC BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Deep Void Base */}
          <div className="absolute inset-0 bg-[#000000]"></div>
          
          {/* Moving Aurora Borealis Gradients */}
          <div className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-strawberry-600/10 blur-[180px] rounded-full animate-float opacity-30"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 blur-[150px] rounded-full animate-pulse-slow opacity-20"></div>
          
          {/* Digital Mesh Overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `
                  linear-gradient(to right, #222 1px, transparent 1px),
                  linear-gradient(to bottom, #222 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}></div>

          {/* Floating Particles */}
          <div className="absolute w-2 h-2 bg-strawberry-500 rounded-full blur-[2px] opacity-40 top-1/4 left-1/4 animate-ping"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 top-3/4 right-1/3 animate-pulse"></div>
          <div className="absolute w-3 h-3 bg-purple-500 rounded-full blur-[4px] opacity-20 bottom-10 left-10 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        {/* Navigation Bar */}
        <div className="sticky top-[80px] z-40 py-6 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex justify-center gap-4 flex-wrap">
                <div className="p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl flex flex-wrap justify-center gap-2 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
                    <NavButton mode="generator" icon={MagicWandIcon} label="Studio" />
                    <NavButton mode="creative" icon={BlueprintIcon} label="Architect" />
                    <NavButton mode="tactical" icon={BrainIcon} label="Tactical OS" />
                    <NavButton mode="brand" icon={ShieldIcon} label="Clan Forge" />
                    <NavButton mode="cats" icon={PawIcon} label="Cat Sounds" />
                    <NavButton mode="shop" icon={ShopIcon} label="Item Shop" />
                    <NavButton mode="voiceover" icon={MicrophoneIcon} label="Hype VO" />
                    <NavButton mode="map" icon={MapIcon} label="Map Intel" />
                    <NavButton mode="stats" icon={ChartIcon} label="Career" />
                    <NavButton mode="news" icon={NewsIcon} label="Updates" />
                </div>
            </div>
        </div>

        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center min-h-[800px]">
            
            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-10 right-10 z-50 p-6 bg-red-950/90 border border-red-500 text-white rounded-2xl shadow-[0_0_50px_rgba(255,23,68,0.4)] flex items-center gap-4 backdrop-blur-xl animate-fade-in-up">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center font-black text-xl">!</div>
                    <div>
                        <h4 className="font-black uppercase tracking-wider text-sm">System Error</h4>
                        <p className="text-xs text-red-200">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="ml-4 text-white/50 hover:text-white">✕</button>
                </div>
            )}

            {currentView === 'generator' && (
                <>
                    <ThumbnailForm 
                        onGenerate={handleGenerate} 
                        isGenerating={isGenerating}
                        statusMessage={statusMessage}
                    />

                    <GeneratedImage 
                        imageUrl={imageUrl} 
                        enhancedPrompt={enhancedPrompt}
                    />

                    {/* Session History Gallery */}
                    {history.length > 0 && (
                        <div className="w-full max-w-7xl mt-40 border-t border-white/5 pt-16 animate-fade-in">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-white flex items-center tracking-wider italic">
                                    <span className="w-2 h-8 bg-gradient-to-b from-strawberry-500 to-red-900 rounded-sm mr-4 shadow-[0_0_20px_rgba(255,23,68,0.6)]"></span>
                                    SESSION GALLERY
                                </h3>
                                <div className="flex gap-4 items-center">
                                     <button onClick={() => { setHistory([]); localStorage.removeItem('fg_history'); }} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors">Clear All</button>
                                     <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">{history.length} Renders</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {history.map((img) => (
                                    <div 
                                        key={img.id} 
                                        onClick={() => {
                                            setImageUrl(img.url);
                                            setEnhancedPrompt(img.prompt);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-strawberry-500 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,23,68,0.2)] group relative bg-void-800"
                                    >
                                        <img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" alt="History" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute bottom-3 left-3 flex gap-2">
                                            <span className="text-[9px] font-black text-white bg-strawberry-600 px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">LOAD</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {currentView === 'shop' && <ItemShop />}
            {currentView === 'stats' && <PlayerStats />}
            {currentView === 'news' && <NewsFeed />}
            {currentView === 'map' && <MapViewer />}
            {currentView === 'voiceover' && <VoiceoverStudio />}
            {currentView === 'brand' && <BrandStudio />}
            {currentView === 'tactical' && <TacticalOS />}
            {currentView === 'creative' && <CreativeArchitect />}
            {currentView === 'cats' && <CatSoundboard />}

        </main>

        <footer className="py-16 text-center border-t border-white/5 bg-black relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-strawberry-500/50 to-transparent"></div>
            <p className="font-display tracking-widest text-zinc-600 text-sm uppercase">
                FortniteGenius &copy; 2026 <span className="mx-2 text-white/10">|</span> Powered by Gemini 2.5
            </p>
            <p className="text-[10px] text-zinc-700 mt-2 tracking-wide font-mono">Not affiliated with Epic Games</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
