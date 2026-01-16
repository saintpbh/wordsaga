
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Siren } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { level1Data } from '../data/level1';

interface DefenseModeProps {
    onBack: () => void;
}

export const DefenseMode: React.FC<DefenseModeProps> = ({ onBack }) => {
    const { getDueWords, markWordKnown } = useGameStore();
    const [dueWords, setDueWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [hp, setHp] = useState(3);
    const [options, setOptions] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'victory' | 'defeat'>('intro');

    useEffect(() => {
        // Determine due words. For demo purposes, if none are due, pick random ones.
        let words = getDueWords();
        if (words.length === 0) {
            // Fallback for testing: Pick random 5 words
            words = level1Data.units[0].words.slice(0, 5).map(w => w.word);
        }
        setDueWords(words);
    }, []);

    const currentWord = dueWords[currentWordIndex];
    const targetWordObj = level1Data.units[0].words.find(w => w.word === currentWord);

    useEffect(() => {
        if (!currentWord || !targetWordObj) return;

        // Generate options
        const distractors = level1Data.units[0].words
            .filter(w => w.word !== currentWord)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.meaning);

        const allOptions = [targetWordObj.meaning, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
    }, [currentWord, targetWordObj]);


    const handleAnswer = (selectedMeaning: string) => {
        if (!targetWordObj) return;

        if (selectedMeaning === targetWordObj.meaning) {
            // Correct -> Grade 5 (Perfect!)
            markWordKnown(level1Data.units[0].id, currentWord, 5);

            if (currentWordIndex + 1 >= dueWords.length) {
                setGameState('victory');
            } else {
                setCurrentWordIndex(prev => prev + 1);
            }
        } else {
            // Wrong -> Grade 1 (Forgot)
            markWordKnown(level1Data.units[0].id, currentWord, 1);
            setHp(prev => prev - 1);
            if (hp - 1 <= 0) {
                setGameState('defeat');
            }
        }
    };

    if (gameState === 'intro') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-900/20 animate-pulse pointer-events-none"></div>
                <Siren className="text-red-500 mb-8 w-24 h-24 animate-bounce" />
                <h1 className="text-5xl font-bold text-red-500 glitch-text mb-4">WARNING</h1>
                <h2 className="text-2xl text-white mb-8">EMERGENCY DEFENSE REQUIRED</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Slimes are attacking the village because you forgot these words!
                    Repel them by recalling the correct meanings!
                </p>
                <button
                    onClick={() => setGameState('playing')}
                    className="retro-btn bg-red-600 text-white py-4 px-12 text-xl font-bold animate-pulse"
                >
                    START DEFENSE
                </button>
            </div>
        );
    }

    if (gameState === 'victory') {
        return (
            <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-5xl font-bold text-neon-green mb-8">DEFENSE SUCCESSFUL!</h1>
                <p className="text-xl text-white mb-8">The village is safe... for now.</p>
                <button onClick={onBack} className="retro-btn bg-neon-cyan text-black py-4 px-12 text-xl">
                    RETURN TO BASE
                </button>
            </div>
        );
    }

    if (gameState === 'defeat') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-5xl font-bold text-red-600 mb-8">DEFEAT...</h1>
                <p className="text-xl text-gray-400 mb-8">The words have been forgotten.</p>
                <button onClick={onBack} className="retro-btn bg-gray-700 text-white py-4 px-12 text-xl">
                    RETREAT
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
            {/* HUD */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-12 border-b-2 border-red-500 pb-4">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Heart key={i} className={`w-8 h-8 ${i < hp ? 'text-red-500 fill-red-500' : 'text-gray-800'}`} />
                    ))}
                </div>
                <div className="text-red-500 font-bold flashing-text flex items-center gap-2">
                    <Shield /> WAVE {currentWordIndex + 1} / {dueWords.length}
                </div>
            </div>

            {/* Enemy */}
            <div className="flex-1 flex flex-col items-center justify-center mb-12">
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-9xl mb-8 relative"
                >
                    🦠
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-red-500 px-4 py-1 rounded text-red-500 font-bold">
                        {currentWord}
                    </div>
                </motion.div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(opt)}
                        className="retro-btn bg-navy-900 border-white text-white py-6 text-lg hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};
