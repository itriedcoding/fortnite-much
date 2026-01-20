import React, { useState } from 'react';
import { Header } from './components/Header';
import { ThumbnailForm } from './components/ThumbnailForm';
import { GeneratedImage } from './components/GeneratedImage';
import { ItemShop } from './components/ItemShop';
import { PlayerStats } from './components/PlayerStats';
import { NewsFeed } from './components/NewsFeed';
import { GeneratedImage as GeneratedImageType, ThumbnailConfig } from './types';
import { enhancePrompt, generateThumbnailImage } from './services/gemini';
import { ChartIcon, MagicWandIcon, ShopIcon, NewsIcon } from './components/Icons';

type ViewMode = 'generator' | 'shop' | 'stats' | 'news';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('generator');
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

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
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase italic tracking-wider transition-all duration-300 ${currentView === mode ? 'bg-fortnite-gold text-black shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
      >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-[#0f0518] text-slate-200 font-sans selection:bg-fortnite-purple selection:text-white overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-fortnite-purple/20 via-[#0f0518] to-[#05010a] pointer-events-none z-0"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fortnite-purple/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fortnite-blue/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      {/* Animated Particles */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <div className="container mx-auto px-4 mt-8 flex justify-center gap-4 flex-wrap">
            <NavButton mode="generator" icon={MagicWandIcon} label="Thumbnails" />
            <NavButton mode="shop" icon={ShopIcon} label="Item Shop" />
            <NavButton mode="stats" icon={ChartIcon} label="Player Stats" />
            <NavButton mode="news" icon={NewsIcon} label="News" />
        </div>

        <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
            
            {/* Error Display */}
            {error && (
                <div className="w-full max-w-2xl mb-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-200 flex items-center justify-between backdrop-blur-md animate-fade-in-up">
                    <span className="font-medium flex items-center gap-2">⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="text-sm bg-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/40 transition-colors">Dismiss</button>
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

                    {/* Session History */}
                    {history.length > 0 && (
                        <div className="w-full max-w-7xl mt-32 border-t border-white/5 pt-12 animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center tracking-wide">
                                <span className="w-1.5 h-6 bg-fortnite-gold rounded-full mr-4"></span>
                                RECENT DROPS
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {history.map((img) => (
                                    <div 
                                        key={img.id} 
                                        onClick={() => {
                                            setImageUrl(img.url);
                                            setEnhancedPrompt(img.prompt);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-fortnite-purple/50 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl group relative bg-[#1a0b2e]"
                                    >
                                        <img src={img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="History" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                            <span className="text-[10px] font-bold text-black uppercase tracking-widest bg-fortnite-gold px-2 py-1 rounded">Load</span>
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

        </main>

        <footer className="py-12 text-center text-slate-600 text-sm border-t border-white/5 mt-12 bg-[#0a0510]/80 backdrop-blur-lg">
            <p className="font-medium tracking-wide">&copy; {new Date().getFullYear()} FortniteGenius 2026. Powered by Gemini 2.5.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
