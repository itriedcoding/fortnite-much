
import React, { useState, useRef } from 'react';
import { PawIcon, LoadingSpinner, SpeakerIcon } from './Icons';
import { generateCatSound } from '../services/gemini';

interface CatSound {
    id: string;
    label: string;
    prompt: string;
    category: 'Happy' | 'Angry' | 'Kitten' | 'Weird' | 'Standard';
    color: string;
}

// --- REAL DATABASE (105 UNIQUE SOUNDS) ---
// No loops, no "Meow 1", "Meow 2". Hand-curated prompts.
const CAT_SOUNDS_DB: CatSound[] = [
    // --- HAPPY (Green) ---
    { id: 'h1', label: 'Morning Prrr', category: 'Happy', color: 'bg-green-500', prompt: 'Prrrrr. Prrrrr. High pitch happy trill.' },
    { id: 'h2', label: 'Lap Cuddle', category: 'Happy', color: 'bg-green-500', prompt: 'Low rumbling purr. Prrr... prrr...' },
    { id: 'h3', label: 'Leg Rub', category: 'Happy', color: 'bg-green-500', prompt: 'Mrrrp? Short happy trill.' },
    { id: 'h4', label: 'Welcome Home', category: 'Happy', color: 'bg-green-500', prompt: 'Meee-ow! High pitched happy greeting.' },
    { id: 'h5', label: 'Food Excited', category: 'Happy', color: 'bg-green-500', prompt: 'Mow! Mow! Mow! Fast excited meows.' },
    { id: 'h6', label: 'Chin Scratch', category: 'Happy', color: 'bg-green-500', prompt: 'Prrr... Ahhh... intense purring.' },
    { id: 'h7', label: 'Slow Blink', category: 'Happy', color: 'bg-green-500', prompt: 'Soft exhale. Mhhm.' },
    { id: 'h8', label: 'Belly Rub', category: 'Happy', color: 'bg-green-500', prompt: 'Prrr... Mrow? Questioning purr.' },
    { id: 'h9', label: 'Head Butt', category: 'Happy', color: 'bg-green-500', prompt: 'Thump. Mrrr.' },
    { id: 'h10', label: 'Biscuit Maker', category: 'Happy', color: 'bg-green-500', prompt: 'Rhythmic purring. Prr. Prr. Prr.' },
    { id: 'h11', label: 'Sleeping Breath', category: 'Happy', color: 'bg-green-500', prompt: 'Soft whistling nose breath. Zzz.' },
    { id: 'h12', label: 'Dreaming', category: 'Happy', color: 'bg-green-500', prompt: 'Twitching whiskers sound. Mph. Mph.' },
    { id: 'h13', label: 'Streeeetch', category: 'Happy', color: 'bg-green-500', prompt: 'Long creaky meow while stretching. Mreee-aaa-ow.' },
    { id: 'h14', label: 'Playful Chirp', category: 'Happy', color: 'bg-green-500', prompt: 'Ek! Ek! Short chirp.' },
    { id: 'h15', label: 'Toy Mouse', category: 'Happy', color: 'bg-green-500', prompt: 'Muffled meow with toy in mouth. Mrr-oww.' },
    { id: 'h16', label: 'Treat Time', category: 'Happy', color: 'bg-green-500', prompt: 'Crunchy sounds. Nom nom.' },
    { id: 'h17', label: 'Elevator Butt', category: 'Happy', color: 'bg-green-500', prompt: 'Prrr! Surprised happy purr.' },
    { id: 'h18', label: 'Sunbeam', category: 'Happy', color: 'bg-green-500', prompt: 'Deep slow breathing. Relaxed.' },
    { id: 'h19', label: 'Grooming', category: 'Happy', color: 'bg-green-500', prompt: 'Licking sound. Slurp. Slurp.' },
    { id: 'h20', label: 'Content Sigh', category: 'Happy', color: 'bg-green-500', prompt: 'Hhhhh. Big sigh.' },

    // --- ANGRY (Red) ---
    { id: 'a1', label: 'Warning Hiss', category: 'Angry', color: 'bg-red-500', prompt: 'Hsssss! Sharp snake-like hiss.' },
    { id: 'a2', label: 'Deep Growl', category: 'Angry', color: 'bg-red-500', prompt: 'Grrrrrr. Low throaty growl.' },
    { id: 'a3', label: 'Tail Puff', category: 'Angry', color: 'bg-red-500', prompt: 'Poof. Sharp intake of breath.' },
    { id: 'a4', label: 'Back Off', category: 'Angry', color: 'bg-red-500', prompt: 'MOW! Loud sharp warning.' },
    { id: 'a5', label: 'The Yowl', category: 'Angry', color: 'bg-red-500', prompt: 'Owww-waaa-ooo-wwww. Long yowl.' },
    { id: 'a6', label: 'Cat Fight', category: 'Angry', color: 'bg-red-500', prompt: 'Screaming cat fight! REEEE! HISS!' },
    { id: 'a7', label: 'Bath Time', category: 'Angry', color: 'bg-red-500', prompt: 'Mraow! No! Mraow! Sad angry meow.' },
    { id: 'a8', label: 'Vet Visit', category: 'Angry', color: 'bg-red-500', prompt: 'Low nervous growl. Grrr.' },
    { id: 'a9', label: 'Tail Pull', category: 'Angry', color: 'bg-red-500', prompt: 'SCREE! High pitched pain squeak.' },
    { id: 'a10', label: 'Vacuum Cleaner', category: 'Angry', color: 'bg-red-500', prompt: 'Hiss! Spit! Kkkkkh!' },
    { id: 'a11', label: 'Stray Cat', category: 'Angry', color: 'bg-red-500', prompt: 'Wooo-ooo-oooo. Threatening song.' },
    { id: 'a12', label: 'Cornered', category: 'Angry', color: 'bg-red-500', prompt: 'Khhhh! Spit sound.' },
    { id: 'a13', label: 'Swatting', category: 'Angry', color: 'bg-red-500', prompt: 'Pap! Paw slap sound.' },
    { id: 'a14', label: 'Biting', category: 'Angry', color: 'bg-red-500', prompt: 'Chomp. Grr.' },
    { id: 'a15', label: 'Jealousy', category: 'Angry', color: 'bg-red-500', prompt: 'Whining meow. Mnnnn-ow.' },
    { id: 'a16', label: 'Food Stolen', category: 'Angry', color: 'bg-red-500', prompt: 'Hey! MRAOW!' },
    { id: 'a17', label: 'Woken Up', category: 'Angry', color: 'bg-red-500', prompt: 'Mmph? Grumble meow.' },
    { id: 'a18', label: 'Picked Up', category: 'Angry', color: 'bg-red-500', prompt: 'Put me down! MRA-ow!' },
    { id: 'a19', label: 'Carrier Cage', category: 'Angry', color: 'bg-red-500', prompt: 'Meee-ooo-www? Sad echoing meow.' },
    { id: 'a20', label: 'Demon Mode', category: 'Angry', color: 'bg-red-500', prompt: 'Distorted guttural growl. RRRRR.' },

    // --- KITTEN (Pink) ---
    { id: 'k1', label: 'Newborn Mew', category: 'Kitten', color: 'bg-pink-500', prompt: 'Eee! Eee! Very high pitch squeak.' },
    { id: 'k2', label: 'Mama Call', category: 'Kitten', color: 'bg-pink-500', prompt: 'Mew? Mew? Searching sound.' },
    { id: 'k3', label: 'Milk Time', category: 'Kitten', color: 'bg-pink-500', prompt: 'Smacking lips. Nursing sound.' },
    { id: 'k4', label: 'First Purr', category: 'Kitten', color: 'bg-pink-500', prompt: 'Tiny engine rattling. Prr.' },
    { id: 'k5', label: 'Falling Down', category: 'Kitten', color: 'bg-pink-500', prompt: 'Oof. Squeak.' },
    { id: 'k6', label: 'Play Fight', category: 'Kitten', color: 'bg-pink-500', prompt: 'Tiny hiss. Tss!' },
    { id: 'k7', label: 'Getting Licked', category: 'Kitten', color: 'bg-pink-500', prompt: 'Mmmm. Mew.' },
    { id: 'k8', label: 'Lost', category: 'Kitten', color: 'bg-pink-500', prompt: 'Waaaa! Waaaa! Crying kitten.' },
    { id: 'k9', label: 'Found', category: 'Kitten', color: 'bg-pink-500', prompt: 'Prr! Happy squeak.' },
    { id: 'k10', label: 'Hiccups', category: 'Kitten', color: 'bg-pink-500', prompt: 'Hic! Hic! Tiny hiccups.' },
    { id: 'k11', label: 'Yawn', category: 'Kitten', color: 'bg-pink-500', prompt: 'Eeee-aaah. Tiny yawn.' },
    { id: 'k12', label: 'Sneeze', category: 'Kitten', color: 'bg-pink-500', prompt: 'Tchoo! Tiny sneeze.' },
    { id: 'k13', label: 'Purrito', category: 'Kitten', color: 'bg-pink-500', prompt: 'Muffled happy mew.' },
    { id: 'k14', label: 'Toe Beans', category: 'Kitten', color: 'bg-pink-500', prompt: 'Mew!' },
    { id: 'k15', label: 'Climbing Curtain', category: 'Kitten', color: 'bg-pink-500', prompt: 'Scratch scratch scratch. Mew!' },
    { id: 'k16', label: 'Scared', category: 'Kitten', color: 'bg-pink-500', prompt: 'Spitting sound. Pff!' },
    { id: 'k17', label: 'Asleep', category: 'Kitten', color: 'bg-pink-500', prompt: 'Silence. Gentle breathing.' },
    { id: 'k18', label: 'Zoomies', category: 'Kitten', color: 'bg-pink-500', prompt: 'Pattering feet. Thump.' },
    { id: 'k19', label: 'Attack', category: 'Kitten', color: 'bg-pink-500', prompt: 'Rawr! Tiny roar.' },
    { id: 'k20', label: 'Snuggle', category: 'Kitten', color: 'bg-pink-500', prompt: 'Deep sleep breathing.' },

    // --- WEIRD (Purple) ---
    { id: 'w1', label: 'Ekekek', category: 'Weird', color: 'bg-purple-500', prompt: 'Ek ek ek ek. Bird watching chatter.' },
    { id: 'w2', label: 'Clicking', category: 'Weird', color: 'bg-purple-500', prompt: 'Clicking tongue sound.' },
    { id: 'w3', label: 'Oh Long Johnson', category: 'Weird', color: 'bg-purple-500', prompt: 'Ooooh Long John-son. Talking cat.' },
    { id: 'w4', label: 'No No No', category: 'Weird', color: 'bg-purple-500', prompt: 'No no no no. Cat saying no.' },
    { id: 'w5', label: 'Hello?', category: 'Weird', color: 'bg-purple-500', prompt: 'Hew-wo? Cat saying hello.' },
    { id: 'w6', label: 'Hairball', category: 'Weird', color: 'bg-purple-500', prompt: 'Hack! Hack! Coughing sound.' },
    { id: 'w7', label: 'Chuffing', category: 'Weird', color: 'bg-purple-500', prompt: 'Pff pff pff. Tiger sound.' },
    { id: 'w8', label: 'Snoring', category: 'Weird', color: 'bg-purple-500', prompt: 'Honk shhh. Cartoon snore.' },
    { id: 'w9', label: 'Drinking', category: 'Weird', color: 'bg-purple-500', prompt: 'Lap lap lap. Water drinking.' },
    { id: 'w10', label: 'Eating Dry', category: 'Weird', color: 'bg-purple-500', prompt: 'Cronch. Cronch. Loud chewing.' },
    { id: 'w11', label: 'Eating Wet', category: 'Weird', color: 'bg-purple-500', prompt: 'Schlop schlop. Wet food sound.' },
    { id: 'w12', label: 'Litter Box', category: 'Weird', color: 'bg-purple-500', prompt: 'Digging in sand sound.' },
    { id: 'w13', label: 'Zoomie Crash', category: 'Weird', color: 'bg-purple-500', prompt: 'Thump! Crash! Meow?' },
    { id: 'w14', label: 'Door Scratch', category: 'Weird', color: 'bg-purple-500', prompt: 'Skritch skritch. Let me in.' },
    { id: 'w15', label: 'Howling', category: 'Weird', color: 'bg-purple-500', prompt: 'Awoooo! Wolf cat.' },
    { id: 'w16', label: 'Gagging', category: 'Weird', color: 'bg-purple-500', prompt: 'Ack! Ack!' },
    { id: 'w17', label: 'Silent Meow', category: 'Weird', color: 'bg-purple-500', prompt: 'Mouth opens. No sound.' },
    { id: 'w18', label: 'Trill', category: 'Weird', color: 'bg-purple-500', prompt: 'Brrrip? Rolling R meow.' },
    { id: 'w19', label: 'Screaming', category: 'Weird', color: 'bg-purple-500', prompt: 'AHHHHH! Human scream.' },
    { id: 'w20', label: 'Alien', category: 'Weird', color: 'bg-purple-500', prompt: 'Gnarple bleep. Space cat.' },

    // --- STANDARD (Blue) ---
    { id: 's1', label: 'Classic Meow', category: 'Standard', color: 'bg-blue-500', prompt: 'Meow. Just a normal cat.' },
    { id: 's2', label: 'Short Meow', category: 'Standard', color: 'bg-blue-500', prompt: 'Mow.' },
    { id: 's3', label: 'Question', category: 'Standard', color: 'bg-blue-500', prompt: 'Meow? Going up at the end.' },
    { id: 's4', label: 'Demand', category: 'Standard', color: 'bg-blue-500', prompt: 'MEOW! Do it now.' },
    { id: 's5', label: 'Bored', category: 'Standard', color: 'bg-blue-500', prompt: 'Meh-ow. Flat tone.' },
    { id: 's6', label: 'Old Cat', category: 'Standard', color: 'bg-blue-500', prompt: 'Craggy raspy meow. Maaa-ow.' },
    { id: 's7', label: 'Siamese', category: 'Standard', color: 'bg-blue-500', prompt: 'Yowl! Distinct Siamese voice.' },
    { id: 's8', label: 'Maine Coon', category: 'Standard', color: 'bg-blue-500', prompt: 'Trill chirrup. Big cat sound.' },
    { id: 's9', label: 'Persian', category: 'Standard', color: 'bg-blue-500', prompt: 'Quiet muffled meow.' },
    { id: 's10', label: 'Sphynx', category: 'Standard', color: 'bg-blue-500', prompt: 'Loud demanding naked cat.' },
    { id: 's11', label: 'Orange Cat', category: 'Standard', color: 'bg-blue-500', prompt: 'Derpy meow. Mweeh.' },
    { id: 's12', label: 'Black Cat', category: 'Standard', color: 'bg-blue-500', prompt: 'Void screaming. Mooooow.' },
    { id: 's13', label: 'White Cat', category: 'Standard', color: 'bg-blue-500', prompt: 'Elegant mew.' },
    { id: 's14', label: 'Calico', category: 'Standard', color: 'bg-blue-500', prompt: 'Sassy meow. Hmph.' },
    { id: 's15', label: 'Tabby', category: 'Standard', color: 'bg-blue-500', prompt: 'Standard cat noise.' },
    { id: 's16', label: 'Tuxedo', category: 'Standard', color: 'bg-blue-500', prompt: 'Fancy meow.' },
    { id: 's17', label: 'Chonky', category: 'Standard', color: 'bg-blue-500', prompt: 'Heavy breathing meow.' },
    { id: 's18', label: 'Outside', category: 'Standard', color: 'bg-blue-500', prompt: 'Let me in! Meow!' },
    { id: 's19', label: 'Inside', category: 'Standard', color: 'bg-blue-500', prompt: 'Let me out! Meow!' },
    { id: 's20', label: 'Jump', category: 'Standard', color: 'bg-blue-500', prompt: 'Hup! Effort sound.' },
    { id: 's21', label: 'Land', category: 'Standard', color: 'bg-blue-500', prompt: 'Thud.' },
    { id: 's22', label: 'Run', category: 'Standard', color: 'bg-blue-500', prompt: 'Scramble scramble.' },
    { id: 's23', label: 'Walk', category: 'Standard', color: 'bg-blue-500', prompt: 'Pat pat pat.' },
    { id: 's24', label: 'Sit', category: 'Standard', color: 'bg-blue-500', prompt: 'Flump.' },
    { id: 's25', label: 'Stare', category: 'Standard', color: 'bg-blue-500', prompt: 'Intense silence.' },
];

export const CatSoundboard: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [activeSound, setActiveSound] = useState<CatSound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingSound, setLoadingSound] = useState<string | null>(null);
    
    // Audio Visualizer Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const animationRef = useRef<number>(0);

    const filteredSounds = CAT_SOUNDS_DB.filter(s => 
        (filter === 'All' || s.category === filter) &&
        s.label.toLowerCase().includes(search.toLowerCase())
    );

    const handlePlay = async (sound: CatSound) => {
        if (loadingSound) return;
        
        // Stop current if playing
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        
        setActiveSound(sound);
        setLoadingSound(sound.id);
        setIsPlaying(false);

        try {
            const url = await generateCatSound(sound.prompt);
            await playAudio(url);
        } catch (e) {
            console.error("Meow failed", e);
        } finally {
            setLoadingSound(null);
        }
    };

    const playAudio = async (url: string) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // Low res for punchy visualizer
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
    }

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!isPlaying) return;
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Center circular visualizer
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const radius = 50;

            ctx.beginPath();
            ctx.arc(cx, cy, radius + (dataArray[10] / 5), 0, 2 * Math.PI);
            ctx.fillStyle = activeSound?.color.replace('bg-', 'text-').replace('500', '500') || '#fff';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        draw();
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-fade-in-up pb-32">
            {/* Header */}
            <div className="text-center space-y-6 mb-12 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[200px] bg-orange-500/10 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
                 <h2 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000] flex flex-col sm:flex-row items-center justify-center gap-6" style={{WebkitTextStroke: '2px black'}}>
                    <PawIcon className="w-20 h-20 text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
                    <span>NEURAL</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]">CATS</span>
                </h2>
                <div className="flex justify-center gap-4">
                     <span className="bg-black/60 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase">
                        105 Unique Voices
                     </span>
                </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex justify-center mb-12 relative h-40">
                <canvas ref={canvasRef} width="300" height="200" className="absolute z-10"></canvas>
                {!isPlaying && (
                    <div className="flex flex-col items-center justify-center opacity-50 mt-10">
                        <SpeakerIcon className="w-12 h-12 text-slate-500 mb-2"/>
                        <p className="text-[10px] uppercase font-bold text-slate-500">System Ready</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="sticky top-24 z-30 bg-black/80 backdrop-blur-xl border-y border-white/10 py-4 mb-8">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-4 justify-between">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH SOUNDS..." 
                        className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-orange-500 uppercase w-full md:w-64"
                    />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        {['All', 'Happy', 'Angry', 'Kitten', 'Weird', 'Standard'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase whitespace-nowrap transition-all ${filter === cat ? 'bg-orange-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sound Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4">
                {filteredSounds.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => handlePlay(sound)}
                        disabled={loadingSound !== null}
                        className={`group relative h-32 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center justify-center gap-2
                            ${activeSound?.id === sound.id 
                                ? 'bg-white text-black border-orange-500 scale-105 shadow-[0_0_30px_rgba(249,115,22,0.4)]' 
                                : 'bg-[#1a1510] border-white/5 text-slate-400 hover:border-orange-500/50 hover:text-white hover:bg-[#251d15]'
                            }
                        `}
                    >
                        {loadingSound === sound.id ? (
                            <LoadingSpinner className="w-8 h-8 text-orange-500"/>
                        ) : (
                            <>
                                <div className={`w-2 h-2 rounded-full ${sound.color} absolute top-3 right-3 shadow-[0_0_10px_currentColor]`}></div>
                                <PawIcon className={`w-8 h-8 transition-transform group-hover:scale-110 ${activeSound?.id === sound.id ? 'text-orange-600' : 'text-slate-600 group-hover:text-orange-500'}`}/>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 text-center leading-tight">{sound.label}</span>
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
