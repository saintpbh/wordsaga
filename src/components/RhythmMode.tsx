
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { level1Data } from '../data/level1';

interface RhythmModeProps {
    onBack: () => void;
}

interface FallingWord {
    id: number;
    word: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    speed: number;
}

export const RhythmMode: React.FC<RhythmModeProps> = ({ onBack }) => {
    const { addXp } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
    const [words, setWords] = useState<FallingWord[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    const gameLoopRef = useRef<number>(0);
    const lastSpawnRef = useRef<number>(0);
    const wordIdRef = useRef(0);

    // Pool of words to spawn
    const wordPool = level1Data.units.flatMap(u => u.words.map(w => w.word));

    const spawnWord = () => {
        const word = wordPool[Math.floor(Math.random() * wordPool.length)];
        const newWord: FallingWord = {
            id: wordIdRef.current++,
            word,
            x: Math.random() * 80 + 10, // 10% to 90% width
            y: -10,
            speed: 0.2 + (Math.random() * 0.3), // Random speed
        };
        setWords(prev => [...prev, newWord]);
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        const loop = (timestamp: number) => {
            // Spawn logic
            if (timestamp - lastSpawnRef.current > 1000) { // Spawn every 1s
                spawnWord();
                lastSpawnRef.current = timestamp;
            }

            // Update positions
            setWords(prev => {
                const nextWords = prev.map(w => ({
                    ...w,
                    y: w.y + w.speed
                })).filter(w => w.y < 110); // Remove if off screen

                // Check for missed words (optional penalty logic could go here)
                return nextWords;
            });

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(gameLoopRef.current!);
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameState('ended');
            addXp(score);
        }
    }, [gameState, timeLeft, addXp, score]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Check match
        const matchIndex = words.findIndex(w => w.word.toLowerCase() === val.toLowerCase());
        if (matchIndex !== -1) {
            // Hit!
            const word = words[matchIndex];
            setWords(prev => prev.filter(w => w.id !== word.id));
            setInputValue('');
            setScore(prev => prev + 10 * (1 + Math.floor(combo / 5)));
            setCombo(prev => prev + 1);
        }
    };

    if (gameState === 'intro') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-neon-green font-mono">
                <h1 className="text-6xl font-bold mb-8 glitch-text">DATA RAIN</h1>
                <p className="mb-4 text-xl">Type the falling words before they vanish.</p>
                <p className="mb-8 text-gray-500">Combo increases Score Multiplier!</p>
                <button
                    onClick={() => { setGameState('playing'); setTimeLeft(30); setScore(0); setCombo(0); }}
                    className="retro-btn bg-neon-green text-black py-4 px-12 text-xl font-bold"
                >
                    INITIATE LINK
                </button>
            </div>
        );
    }

    if (gameState === 'ended') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <Trophy className="text-gold w-24 h-24 mb-4 animate-bounce" />
                <h1 className="text-5xl font-bold text-white mb-4">SYSTEM SECURE</h1>
                <div className="text-4xl text-neon-green mb-2">SCORE: {score}</div>
                <div className="text-xl text-gray-400 mb-8">XP GAINED: +{score}</div>
                <button onClick={onBack} className="retro-btn bg-white text-black py-4 px-12">
                    JACK OUT
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden font-mono">
            {/* Matrix Background Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
            </div>

            {/* HUD */}
            <div className="absolute top-4 left-4 text-neon-green text-xl flex flex-col gap-2">
                <div>SCORE: {score}</div>
                <div className="text-neon-pink">COMBO: {combo}x</div>
            </div>
            <div className="absolute top-4 right-4 text-red-500 text-3xl font-bold flex items-center gap-2">
                <Timer /> {timeLeft}s
            </div>

            {/* Falling Words */}
            <AnimatePresence>
                {words.map(w => (
                    <motion.div
                        key={w.id}
                        initial={{ top: '-10%' }}
                        animate={{ top: `${w.y}%` }}
                        className="absolute text-neon-green font-bold text-lg text-shadow-glow"
                        style={{ left: `${w.x}%`, top: `${w.y}%` }}
                    >
                        {w.word}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Input Area */}
            <div className="absolute bottom-10 w-full flex justify-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInput}
                    autoFocus
                    className="bg-black border-b-4 border-neon-green text-neon-green text-center text-4xl p-2 outline-none w-1/2 focus:shadow-[0_0_20px_#39FF14]"
                    placeholder="TYPE..."
                />
            </div>
        </div>
    );
};
