
import React, { useState, useEffect } from 'react';
import { DownloadIcon, ScissorsIcon, LoadingSpinner, EyeIcon, MagicWandIcon, SparklesIcon } from './Icons';
import { generateViralTitles, generateTags } from '../services/gemini';

interface GeneratedImageProps {
  imageUrl: string | null;
  enhancedPrompt: string | null;
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ imageUrl, enhancedPrompt }) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Post Processing State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // AI Generators
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatedTags, setGeneratedTags] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // YouTube Simulator State
  const [showPreview, setShowPreview] = useState(false);
  const [ytTitle, setYtTitle] = useState('I SURVIVED 100 DAYS IN RANKED!');
  const [ytChannel, setYtChannel] = useState('Pro Gamer');
  const [ytViews, setYtViews] = useState('1.2M views');
  const [ytTime, setYtTime] = useState('2 hours ago');
  
  // Reset states when new image comes in
  useEffect(() => {
    setProcessedImage(null);
    setCopied(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGeneratedTitles([]);
    setGeneratedTags('');
  }, [imageUrl]);

  if (!imageUrl) return null;

  const currentDisplayImage = processedImage || imageUrl;

  const handleDownload = () => {
    // To download with filters, we need to draw to canvas first
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentDisplayImage;
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `tubegenius-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
  };

  const handleGenerateMetadata = async () => {
      if(!enhancedPrompt) return;
      setIsLoadingAI(true);
      try {
        const titles = await generateViralTitles(enhancedPrompt.slice(0, 100)); // pass snippet
        setGeneratedTitles(titles);
        const tags = await generateTags(enhancedPrompt.slice(0, 100));
        setGeneratedTags(tags);
        if(titles.length > 0) setYtTitle(titles[0]);
      } catch(e) {
          console.error(e);
      } finally {
          setIsLoadingAI(false);
      }
  }

  const handleCopyPrompt = () => {
      if (enhancedPrompt) {
          navigator.clipboard.writeText(enhancedPrompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  }

  const removeGreenScreen = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple Green Screen Removal Algorithm
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect vibrant green
            if (g > 100 && g > r * 1.4 && g > b * 1.4) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedImage(canvas.toDataURL('image/png'));
        setIsProcessing(false);
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 animate-fade-in space-y-12 pb-20">
        
      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: MAIN IMAGE PREVIEW & EDITOR */}
          <div className="lg:w-2/3 space-y-6">
              <div className="relative group rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 bg-black/50 backdrop-blur-md">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}></div>

                {/* Image Display with Filters */}
                <div className="aspect-video w-full flex items-center justify-center overflow-hidden relative z-10 bg-black/20">
                    <img 
                        src={currentDisplayImage} 
                        alt="Generated Thumbnail" 
                        className="w-full h-full object-contain shadow-2xl transition-all duration-200"
                        style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}
                    />
                </div>

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm z-20 gap-6">
                    <h3 className="text-white font-black text-3xl tracking-tight">Your Masterpiece is Ready</h3>
                    <div className="flex gap-4">
                        <button
                        onClick={handleDownload}
                        className="bg-white text-slate-900 px-8 py-4 rounded-full font-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-fortnite-gold hover:scale-105 transition-all flex items-center space-x-2"
                        >
                        <DownloadIcon className="w-6 h-6" />
                        <span>DOWNLOAD 4K PNG</span>
                        </button>

                        {!processedImage && (
                            <button
                            onClick={removeGreenScreen}
                            disabled={isProcessing}
                            className="bg-green-600/20 text-green-400 px-6 py-4 rounded-full font-bold hover:bg-green-600 hover:text-white hover:scale-105 transition-all flex items-center space-x-2 border border-green-500/50 backdrop-blur-md"
                            >
                            {isProcessing ? <LoadingSpinner className="w-5 h-5"/> : <ScissorsIcon className="w-5 h-5" />}
                            <span>Remove Green Screen</span>
                            </button>
                        )}
                    </div>
                </div>
              </div>

              {/* POST PROCESSING CONTROLS */}
              <div className="bg-[#130b1c] rounded-3xl p-6 border border-white/5 flex flex-wrap gap-8 items-center justify-center">
                  <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filters:</span>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300 w-16">Bright</span>
                      <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-32 accent-fortnite-gold" />
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300 w-16">Contrast</span>
                      <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-32 accent-fortnite-blue" />
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-300 w-16">Sat</span>
                      <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-32 accent-red-500" />
                  </div>
                  <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }} className="text-[10px] font-bold text-slate-500 hover:text-white underline">RESET</button>
              </div>
          </div>

          {/* RIGHT: YOUTUBE METADATA AI SUITE */}
          <div className="lg:w-1/3 flex flex-col gap-6">
              
              {/* Simulator Card */}
              <div className="bg-[#130b1c] rounded-[2.5rem] border border-white/10 p-6 flex flex-col shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 blur-[60px] rounded-full pointer-events-none"></div>
                   
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-black text-white italic tracking-wider flex items-center gap-2">
                           <span className="text-red-600 text-2xl">▶</span> CTR Simulator
                       </h3>
                       <button onClick={() => setShowPreview(!showPreview)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${showPreview ? 'bg-red-600 text-white border-red-600' : 'bg-transparent text-slate-500 border-white/20'}`}>
                           {showPreview ? 'Live' : 'Off'}
                       </button>
                   </div>

                   {showPreview ? (
                       <div className="space-y-6 animate-fade-in">
                           <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5 shadow-inner">
                               <div className="flex flex-col gap-3 cursor-pointer group/card">
                                   <div className="relative aspect-video rounded-xl overflow-hidden">
                                       <img src={currentDisplayImage} className="w-full h-full object-cover" alt="Thumb" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}/>
                                       <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1 rounded">12:42</span>
                                       <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                                   </div>
                                   <div className="flex gap-3">
                                       <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shrink-0"></div>
                                       <div className="flex flex-col gap-1">
                                           <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{ytTitle}</h4>
                                           <div className="text-[#aaa] text-xs">
                                               <div className="flex items-center gap-1 hover:text-white transition-colors">{ytChannel} <span className="text-[8px]">✓</span></div>
                                               <div>{ytViews} • {ytTime}</div>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <div className="space-y-4">
                               <div className="space-y-1">
                                   <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Video Title</label>
                                   <input type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 outline-none font-bold" />
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 gap-4 py-12">
                           <EyeIcon className="w-12 h-12 text-slate-600"/>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-[200px]">
                               Toggle Live Preview to see how your thumbnail performs on the YouTube Homepage
                           </p>
                       </div>
                   )}
              </div>

              {/* AI Metadata Generator */}
              <div className="bg-gradient-to-br from-[#1a0b2e] to-[#0f0518] rounded-[2.5rem] p-6 border border-white/10 relative overflow-hidden flex-1">
                   <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                             <SparklesIcon className="w-4 h-4 text-fortnite-gold"/> AI Metadata
                        </h3>
                        <button 
                            onClick={handleGenerateMetadata} 
                            disabled={isLoadingAI}
                            className="text-[9px] font-bold bg-fortnite-gold text-black px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
                        >
                            {isLoadingAI ? 'Thinking...' : 'Generate Ideas'}
                        </button>
                   </div>
                   
                   {generatedTitles.length > 0 ? (
                       <div className="space-y-4 animate-fade-in">
                           <div className="space-y-2">
                               <label className="text-[9px] font-bold text-slate-500 uppercase">Viral Titles</label>
                               <div className="space-y-2">
                                   {generatedTitles.map((t, i) => (
                                       <div key={i} onClick={() => setYtTitle(t)} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-xs text-white cursor-pointer border border-white/5 transition-colors truncate">
                                           {t}
                                       </div>
                                   ))}
                               </div>
                           </div>
                           <div className="space-y-2">
                               <label className="text-[9px] font-bold text-slate-500 uppercase">SEO Tags</label>
                               <textarea readOnly value={generatedTags} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-slate-300 h-20 resize-none outline-none"/>
                           </div>
                       </div>
                   ) : (
                       <div className="text-center py-10 opacity-50">
                           <p className="text-[10px] uppercase font-bold text-slate-500">Generate titles & tags optimized for CTR</p>
                       </div>
                   )}
              </div>
          </div>
      </div>
      
      {/* Prompt Details */}
      {enhancedPrompt && (
        <div className="bg-[#111] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fortnite-gold to-transparent"></div>
           <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-black text-fortnite-gold uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-fortnite-gold animate-pulse"></div>
                   Prompt Engineer Logic
               </span>
               <button onClick={handleCopyPrompt} className="text-xs font-bold text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                   {copied ? 'COPIED!' : 'COPY PROMPT'}
               </button>
           </div>
           <p className="text-slate-300 text-sm font-mono leading-relaxed opacity-90 selection:bg-fortnite-gold/30 selection:text-white border-l-2 border-white/5 pl-4 ml-1">
               {enhancedPrompt}
           </p>
        </div>
      )}
    </div>
  );
};
