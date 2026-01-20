import React, { useRef, useState } from 'react';
import { DownloadIcon, ScissorsIcon, LoadingSpinner } from './Icons';

interface GeneratedImageProps {
  imageUrl: string | null;
  enhancedPrompt: string | null;
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ imageUrl, enhancedPrompt }) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Reset processed image when new image comes in
  React.useEffect(() => {
    setProcessedImage(null);
    setCopied(false);
  }, [imageUrl]);

  if (!imageUrl) return null;

  const currentDisplayImage = processedImage || imageUrl;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentDisplayImage;
    link.download = `tubegenius-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            // If Green is dominant and significantly brighter than Red and Blue
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
    <div className="w-full max-w-5xl mx-auto mt-24 animate-fade-in space-y-12">
        
      <div className="relative group rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 bg-black/50 backdrop-blur-md">
         {/* Background Grid for Transparency */}
         <div className="absolute inset-0 z-0 opacity-20" style={{
             backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
         }}></div>

         {/* Image Display */}
        <div className="aspect-video w-full flex items-center justify-center overflow-hidden relative z-10 bg-black/20">
          <img 
            src={currentDisplayImage} 
            alt="Generated Thumbnail" 
            className="w-full h-full object-contain shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm z-20 gap-6">
            <h3 className="text-white font-black text-3xl tracking-tight">Your Masterpiece is Ready</h3>
            <div className="flex gap-4">
                <button
                onClick={handleDownload}
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-banana-400 hover:scale-105 transition-all flex items-center space-x-2"
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
      
      {/* Prompt Details */}
      {enhancedPrompt && (
        <div className="bg-[#111] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-banana-500 to-transparent"></div>
           <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-black text-banana-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-banana-500 animate-pulse"></div>
                   Prompt Engineer Logic
               </span>
               <button onClick={handleCopyPrompt} className="text-xs font-bold text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                   {copied ? 'COPIED!' : 'COPY PROMPT'}
               </button>
           </div>
           <p className="text-slate-300 text-sm font-mono leading-relaxed opacity-90 selection:bg-banana-500/30 selection:text-white border-l-2 border-white/5 pl-4 ml-1">
               {enhancedPrompt}
           </p>
        </div>
      )}
    </div>
  );
};