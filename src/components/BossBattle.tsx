import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull, Bomb, Zap } from 'lucide-react';
import type { Unit, Word } from '../data/level1';
import { useGameStore } from '../store/gameStore';

interface BossBattleProps {
    unit: Unit;
    onComplete: (success: boolean) => void;
    onBack: () => void;
}

// Procedural Sound Effects Helper
const playSound = (type: 'correct' | 'wrong' | 'tick' | 'explosion') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
};

export const BossBattle: React.FC<BossBattleProps> = ({ unit, onComplete, onBack }) => {
    const { words } = unit;
    const [hp, setHp] = useState(3);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
    const [options, setOptions] = useState<Word[]>([]);
    const [bossState, setBossState] = useState<'idle' | 'attack' | 'hit' | 'dead'>('idle');
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

    // Bomb State
    const [bombY, setBombY] = useState(0); // 0 to 100%
    const [isBombActive, setIsBombActive] = useState(true);
    const animationFrameRef = useRef<number>();

    const { addXp } = useGameStore();

    // Initialize game
    useEffect(() => {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
    }, [words]);

    // Generate options
    useEffect(() => {
        if (shuffledWords.length === 0 || currentQuestionIndex >= shuffledWords.length) return;

        const target = shuffledWords[currentQuestionIndex];
        const distractors = words
            .filter(w => w.word !== target.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(allOptions);

        // Reset Bomb on new question
        setBombY(0);
        setIsBombActive(true);
        setBossState('attack'); // Boss summons bomb
        setTimeout(() => setBossState('idle'), 500);

    }, [currentQuestionIndex, shuffledWords, words]);

    // Bomb Game Loop
    useEffect(() => {
        if (!isBombActive || feedback !== 'none' || hp <= 0) return;

        let lastTime = performance.now();
        const dropSpeed = 15; // Speed factor (increase for faster drop)

        const loop = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            setBombY(prev => {
                const nextY = prev + dropSpeed * dt;

                // Tick sound every 20%
                if (Math.floor(nextY) % 20 === 0 && Math.floor(nextY) > Math.floor(prev)) {
                    playSound('tick');
                }

                if (nextY >= 100) {
                    // Bomb Hit Floor!
                    playSound('explosion');
                    setHp(h => h - 1);
                    setFeedback('wrong'); // Briefly flash red

                    // Reset momentarily
                    setIsBombActive(false);
                    setTimeout(() => {
                        if (hp > 1) { // Check if still alive before resetting
                            setFeedback('none');
                            setBombY(0);
                            setIsBombActive(true);
                        }
                    }, 1000);
                    return 100;
                }
                return nextY;
            });

            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isBombActive, feedback, hp]);


    const handleAnswer = (selectedWord: string) => {
        if (feedback !== 'none') return;

        setIsBombActive(false); // Stop bomb logic immediately
        const target = shuffledWords[currentQuestionIndex];

        if (selectedWord === target.word) {
            // Correct
            setBossState('hit');
            setFeedback('correct');
            playSound('correct');

            setTimeout(() => {
                setBossState('idle');
                setFeedback('none');
                if (currentQuestionIndex + 1 >= shuffledWords.length) {
                    // Win
                    setBossState('dead');
                    addXp(100);
                    setTimeout(() => onComplete(true), 2000);
                } else {
                    setCurrentQuestionIndex(prev => prev + 1);
                }
            }, 1000);
        } else {
            // Wrong Answer (Clicking wrong button)
            setBossState('attack');
            setFeedback('wrong');
            playSound('wrong');
            setHp(prev => prev - 1);

            setTimeout(() => {
                setBossState('idle');
                setFeedback('none');
                setBombY(0); // Reset bomb for retry
                setIsBombActive(true); // Resume
            }, 1000);
        }
    };

    if (hp <= 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-8">
                <h2 className="text-6xl text-red-600 font-black mb-4 glitch-text">GAME OVER</h2>
                <Skull size={100} className="text-red-600 mb-8 animate-bounce" />
                <p className="text-gray-400 mb-8 text-xl">The bombs destroyed your defense...</p>
                <button
                    onClick={onBack}
                    className="retro-btn bg-gray-800 text-white py-4 px-12 text-2xl"
                >
                    TRY AGAIN
                </button>
            </div>
        );
    }

    if (shuffledWords.length === 0 || currentQuestionIndex >= shuffledWords.length) return null;
    const target = shuffledWords[currentQuestionIndex];

    return (
        <div className="flex flex-col items-center min-h-screen bg-navy-900 p-4 relative overflow-hidden">
            {/* Screen Flash on Hit */}
            {feedback === 'wrong' && (
                <div className="absolute inset-0 bg-red-500/30 z-0 animate-pulse pointer-events-none"></div>
            )}

            {/* HUD */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-black/60 backdrop-blur-md border-b-2 border-neon-pink p-4 sticky top-0 z-10 rounded-b-xl shadow-lg">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            size={32}
                            className={`${i < hp ? 'text-neon-pink fill-neon-pink animate-pulse' : 'text-gray-800'}`}
                        />
                    ))}
                </div>
                <div className="text-neon-cyan font-bold text-xl flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                    BOSS HP: {shuffledWords.length - currentQuestionIndex} / {shuffledWords.length}
                </div>
            </div>

            {/* BOSS & BOMB AREA */}
            <div className="flex-1 flex flex-col items-center justify-start w-full max-w-2xl mb-4 relative h-[400px]">

                {/* Boss Sprite */}
                <motion.div
                    animate={
                        bossState === 'hit' ? { x: [-20, 20, -20, 20, 0], filter: 'brightness(3) sepia(100%) saturate(300%) hue-rotate(-50deg)' } :
                            bossState === 'attack' ? { scale: [1, 1.5, 1], y: [0, 20, 0] } :
                                bossState === 'dead' ? { opacity: 0, scale: 0, rotate: 720 } :
                                    { y: [0, -20, 0] }
                    }
                    transition={bossState === 'idle' ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.4 }}
                    className="text-[120px] relative z-10"
                >
                    👾
                </motion.div>

                {/* Health Bar */}
                <div className="w-48 h-6 bg-gray-900 border-2 border-white mb-8 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold z-10">{shuffledWords.length - currentQuestionIndex} / {shuffledWords.length}</div>
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                        animate={{ width: `${((shuffledWords.length - currentQuestionIndex) / shuffledWords.length) * 100}%` }}
                    />
                </div>

                {/* THE FALLING BOMB */}
                <div className="absolute top-24 bottom-0 w-2 left-1/2 -translate-x-1/2 bg-white/10 rounded-full"></div>
                <motion.div
                    className="absolute z-20"
                    style={{
                        top: 100 + (bombY / 100) * 250, // Map 0-100% to pixel range
                        left: '50%',
                        x: '-50%'
                    }}
                >
                    <Bomb size={64} className={`text-white fill-black drop-shadow-[0_0_15px_rgba(255,0,0,1)] ${bombY > 70 ? 'animate-ping text-red-500' : 'animate-bounce'}`} />
                    <div className="text-center font-bold text-red-500 bg-black/50 rounded px-1 mt-1 text-xs">
                        {Math.max(0, (100 - bombY).toFixed(0))}%
                    </div>
                </motion.div>

                {/* Question */}
                <div className="absolute bottom-0 w-full">
                    <div className="retro-card p-6 w-full text-center relative border-4 border-gold shadow-[0_0_50px_rgba(255,215,0,0.2)] bg-black/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-10 duration-500">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-gold transform rotate-180"></div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3 drop-shadow-sm">"{target.meaning}"</h2>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Defuse the bomb by choosing the right word!</p>
                    </div>
                </div>

                {/* Feedback Overlays */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1.5, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neon-green font-black text-8xl z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,1)]"
                            style={{ WebkitTextStroke: '2px black' }}
                        >
                            DEFUSED!
                        </motion.div>
                    )}
                    {feedback === 'wrong' && (
                        <motion.div
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 font-black text-8xl z-50 pointer-events-none"
                            style={{ WebkitTextStroke: '2px white' }}
                        >
                            BOOM!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* OPTIONS AREA */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option.word)}
                        disabled={feedback !== 'none'}
                        className={`retro-btn p-6 text-xl font-bold transition-all transform hover:scale-105 active:scale-95
                            ${feedback !== 'none' && option.word === target.word
                                ? 'bg-neon-green border-neon-green text-black scale-105'
                                : feedback !== 'none' && feedback === 'wrong' // && option.word !== target.word 
                                    ? 'opacity-50 grayscale'
                                    : 'bg-navy-900 border-white text-white hover:border-neon-cyan hover:shadow-[0_0_15px_#0ff]'
                            }`}
                    >
                        {option.word}
                    </button>
                ))}
            </div>
        </div>
    );
};
