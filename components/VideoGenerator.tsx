
import React, { useState, useRef, useEffect } from 'react';
import { generateHypeVoiceover, generateDirectorScript, VoiceLine } from '../services/gemini';
import { LoadingSpinner, MicrophoneIcon, PlayIcon, DownloadIcon, SparklesIcon, SpeakerIcon, RobotIcon, PlusIcon, TrashIcon, MusicNoteIcon } from './Icons';

const VOICES = [
    { id: 'Fenrir', name: 'The Caster', desc: 'Deep, Hype, Intense', color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500' },
    { id: 'Puck', name: 'The Streamer', desc: 'Fast, Energetic, Friendly', color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500' },
    { id: 'Kore', name: 'The Villain', desc: 'Low, Menacing, Serious', color: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500' },
    { id: 'Zephyr', name: 'The Pro', desc: 'Calm, Confident, Smooth', color: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500' },
];

export const VoiceoverStudio: React.FC = () => {
    // Mode State
    const [mode, setMode] = useState<'editor' | 'director' | 'studio'>('director');
    
    // Director State
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Hype');
    const [isWriting, setIsWriting] = useState(false);

    // Editor State
    const [lines, setLines] = useState<VoiceLine[]>([
        { speaker: 'Fenrir', text: 'Welcome back to the channel!' }
    ]);

    // Studio State
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Audio Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const animationRef = useRef<number>(0);

    // --- DIRECTOR LOGIC ---
    const handleAutoWrite = async () => {
        if (!topic.trim()) return;
        setIsWriting(true);
        try {
            const script = await generateDirectorScript(topic, tone);
            setLines(script);
            setMode('editor');
        } catch (e) {
            setError("Script generation failed.");
        } finally {
            setIsWriting(false);
        }
    };

    // --- EDITOR LOGIC ---
    const addLine = () => setLines([...lines, { speaker: 'Puck', text: '' }]);
    const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));
    const updateLine = (idx: number, field: keyof VoiceLine, value: string) => {
        const newLines = [...lines];
        newLines[idx] = { ...newLines[idx], [field]: value };
        setLines(newLines);
    };

    // --- GENERATION LOGIC ---
    const handleGenerateAudio = async () => {
        setIsGenerating(true);
        setAudioUrl(null);
        setError(null);
        try {
            const url = await generateHypeVoiceover(lines);
            setAudioUrl(url);
            setMode('studio');
        } catch (e) {
            setError("Audio generation failed. Try simpler text.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- VISUALIZER LOGIC ---
    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#0a0510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#7f1d1d');
                gradient.addColorStop(0.5, '#ef4444');
                gradient.addColorStop(1, '#fca5a5');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);

                x += barWidth + 1;
            }
        };
        draw();
    };

    const togglePlay = async () => {
        if (isPlaying) {
            // Stop
            if (sourceRef.current) {
                sourceRef.current.stop();
                sourceRef.current = null;
            }
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
            return;
        }

        if (!audioUrl) return;

        // Init Audio Context if needed
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        
        // Fetch and Decode
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        // Setup Source & Analyser
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(ctx.destination);
        
        source.onended = () => {
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
        };

        sourceRef.current = source;
        source.start();
        setIsPlaying(true);
        drawVisualizer();
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto animate-fade-in-up pb-20">
             {/* Dynamic Header */}
             <div className="text-center space-y-4 mb-8">
                <div className="flex items-center justify-center gap-4">
                    <MicrophoneIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    <h2 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter uppercase">
                        HYPE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">VO STUDIO</span>
                    </h2>
                </div>
                <div className="flex justify-center gap-2">
                    {['Director', 'Editor', 'Studio'].map((m) => (
                        <button 
                            key={m}
                            onClick={() => setMode(m.toLowerCase() as any)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${mode === m.toLowerCase() ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-black/40 text-slate-500 border-white/10 hover:text-white'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#130b1c] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
                
                {/* MODE: DIRECTOR (AI SCRIPT) */}
                {mode === 'director' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-4">
                            <RobotIcon className="w-12 h-12 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider">AI Script Director</h3>
                        <p className="text-slate-400 max-w-md text-sm">Enter a topic and let Gemini 3 Flash write a high-energy dialogue script for you.</p>
                        
                        <div className="w-full max-w-md space-y-4">
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Topic (e.g. New Battle Pass Reveal)"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-red-500"
                            />
                            <div className="flex gap-2 justify-center">
                                {['Hype', 'Funny', 'Serious', 'Toxic'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${tone === t ? 'bg-white text-black border-white' : 'bg-transparent text-slate-500 border-white/10'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleAutoWrite}
                                disabled={isWriting}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50"
                            >
                                {isWriting ? <LoadingSpinner className="w-5 h-5 mx-auto"/> : '✨ Auto-Write Script'}
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: EDITOR (MANUAL) */}
                {mode === 'editor' && (
                    <div className="flex-1 flex flex-col p-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Script Editor
                            </h3>
                            <button onClick={addLine} className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                                <PlusIcon className="w-4 h-4"/> Add Line
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {lines.map((line, idx) => (
                                <div key={idx} className="flex gap-3 items-start animate-fade-in-up">
                                    <div className="shrink-0 w-32">
                                        <select 
                                            value={line.speaker}
                                            onChange={(e) => updateLine(idx, 'speaker', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-3 text-xs font-black text-white uppercase outline-none focus:border-red-500"
                                        >
                                            {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                    <textarea 
                                        value={line.text}
                                        onChange={(e) => updateLine(idx, 'text', e.target.value)}
                                        className="flex-1 bg-black/20 border border-white/5 rounded-lg p-3 text-sm text-slate-300 font-medium resize-none focus:bg-black/40 focus:border-white/20 outline-none transition-all h-[50px]"
                                    />
                                    <button onClick={() => removeLine(idx)} className="mt-2 text-slate-600 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/5">
                            <button 
                                onClick={handleGenerateAudio}
                                disabled={isGenerating}
                                className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                            >
                                {isGenerating ? <LoadingSpinner className="w-6 h-6 mx-auto text-black"/> : '🎙️ Generate Master Track'}
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: STUDIO (PLAYBACK & VISUALIZER) */}
                {mode === 'studio' && (
                    <div className="flex-1 flex flex-col animate-fade-in relative">
                        {/* Canvas Visualizer Background */}
                        <canvas ref={canvasRef} width="800" height="400" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-screen"></canvas>
                        
                        <div className="flex-1 flex flex-col items-center justify-center z-10 p-8 space-y-10">
                            {audioUrl ? (
                                <>
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1a0b2e] to-black border-4 border-white/10 flex items-center justify-center relative shadow-[0_0_60px_rgba(220,38,38,0.3)]">
                                        <div className={`absolute inset-0 rounded-full border-2 border-red-500 ${isPlaying ? 'animate-ping opacity-40' : 'opacity-0'}`}></div>
                                        <SpeakerIcon className={`w-20 h-20 text-white transition-transform duration-100 ${isPlaying ? 'scale-110' : 'scale-100'}`} />
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={togglePlay}
                                            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                                        >
                                            {isPlaying ? (
                                                <><span>❚❚</span> <span>PAUSE</span></>
                                            ) : (
                                                <><PlayIcon className="w-6 h-6"/> <span>PLAY TRACK</span></>
                                            )}
                                        </button>
                                        <a 
                                            href={audioUrl} 
                                            download="hype-vo-master.wav"
                                            className="px-6 py-5 bg-white text-black hover:bg-slate-200 rounded-full font-black uppercase tracking-widest shadow-xl transition-all"
                                        >
                                            <DownloadIcon className="w-6 h-6"/>
                                        </a>
                                    </div>
                                    
                                    <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                            MASTER_OUTPUT_V1.WAV • 24kHz • MONO
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center opacity-50">
                                    <MusicNoteIcon className="w-20 h-20 mx-auto text-slate-600 mb-4"/>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest">No Audio Loaded</p>
                                    <button onClick={() => setMode('editor')} className="mt-4 text-white underline text-xs font-bold uppercase">Go to Editor</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #00000040; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffffff20; border-radius: 3px; }
            `}</style>
        </div>
    );
};
