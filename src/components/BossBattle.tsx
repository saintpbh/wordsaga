
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull } from 'lucide-react';
import type { Unit, Word } from '../data/level1';
import { useGameStore } from '../store/gameStore';

interface BossBattleProps {
    unit: Unit;
    onComplete: (success: boolean) => void;
    onBack: () => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({ unit, onComplete, onBack }) => {
    const { words } = unit;
    const [hp, setHp] = useState(3);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
    const [options, setOptions] = useState<Word[]>([]);
    const [bossState, setBossState] = useState<'idle' | 'attack' | 'hit' | 'dead'>('idle');
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const { addXp } = useGameStore();

    // Initialize game
    useEffect(() => {
        // Shuffle words for random question order
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(shuffled);
    }, [words]);

    // Generate options for current question
    useEffect(() => {
        if (shuffledWords.length === 0 || currentQuestionIndex >= shuffledWords.length) return;

        const target = shuffledWords[currentQuestionIndex];
        const distractors = words
            .filter(w => w.word !== target.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const allOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
    }, [currentQuestionIndex, shuffledWords, words]);

    const handleAnswer = (selectedWord: string) => {
        const target = shuffledWords[currentQuestionIndex];

        if (selectedWord === target.word) {
            // Correct
            setBossState('hit');
            setFeedback('correct');
            setTimeout(() => {
                setBossState('idle');
                setFeedback('none');
                if (currentQuestionIndex + 1 >= shuffledWords.length) {
                    // Win
                    setBossState('dead');
                    addXp(100); // Big reward for clearing boss
                    setTimeout(() => onComplete(true), 2000);
                } else {
                    setCurrentQuestionIndex(prev => prev + 1);
                }
            }, 1000);
        } else {
            // Wrong
            setBossState('attack');
            setFeedback('wrong');
            setHp(prev => prev - 1);
            setTimeout(() => {
                setBossState('idle');
                setFeedback('none');
                if (hp - 1 <= 0) {
                    // Game Over logic handled by effect or render
                }
            }, 1000);
        }
    };

    if (hp <= 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-8">
                <h2 className="text-4xl text-red-600 font-bold mb-4 glitch-text">GAME OVER</h2>
                <Skull size={64} className="text-red-600 mb-8 animate-bounce" />
                <p className="text-gray-400 mb-8">The Boss defeated you...</p>
                <button
                    onClick={onBack}
                    className="retro-btn bg-gray-800 text-white py-4 px-8"
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
            {/* HUD */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-gray-900 border-b-4 border-white p-4 sticky top-0 z-10">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            size={32}
                            className={`${i < hp ? 'text-neon-pink fill-neon-pink' : 'text-gray-700'}`}
                        />
                    ))}
                </div>
                <div className="text-neon-cyan font-bold text-xl">
                    BOSS HP: {shuffledWords.length - currentQuestionIndex} / {shuffledWords.length}
                </div>
            </div>

            {/* BOSS AREA */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mb-8 relative">
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 2, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-neon-green font-bold text-6xl z-20 pointer-events-none"
                            style={{ textShadow: '4px 4px 0 #000' }}
                        >
                            CRITICAL HIT!
                        </motion.div>
                    )}
                    {feedback === 'wrong' && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-neon-pink font-bold text-6xl z-20 pointer-events-none"
                            style={{ textShadow: '4px 4px 0 #000' }}
                        >
                            MISS!
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    animate={
                        bossState === 'hit' ? { x: [-10, 10, -10, 10, 0], filter: 'brightness(2)' } :
                            bossState === 'attack' ? { scale: [1, 1.2, 1] } :
                                bossState === 'dead' ? { opacity: 0, scale: 0 } :
                                    { y: [0, -10, 0] }
                    }
                    transition={bossState === 'idle' ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }}
                    className="text-9xl mb-4 relative"
                >
                    👾
                    {/* Health Bar above boss */}
                    <div className="absolute -top-8 left-0 w-full h-4 bg-gray-800 border-2 border-white">
                        <motion.div
                            className="h-full bg-red-600"
                            animate={{ width: `${((shuffledWords.length - currentQuestionIndex) / shuffledWords.length) * 100}%` }}
                        />
                    </div>
                </motion.div>

                {/* Question Bubble */}
                <div className="retro-card p-6 mb-8 w-full text-center relative mt-8">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-white transform rotate-180"></div>
                    <h2 className="text-2xl font-bold text-gold mb-2">"{target.meaning}"</h2>
                    <p className="text-sm text-gray-400">Which word matches this meaning?</p>
                </div>
            </div>

            {/* OPTIONS AREA */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option.word)}
                        disabled={feedback !== 'none'}
                        className={`retro-btn p-4 text-xl font-bold bg-navy-900 hover:bg-gray-800 ${feedback !== 'none' && option.word === target.word ? 'bg-neon-green/20 border-neon-green text-neon-green' :
                            'border-white text-white'
                            }`}
                    >
                        {option.word}
                    </button>
                ))}
            </div>
        </div>
    );
};
