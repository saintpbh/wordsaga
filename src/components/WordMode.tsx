
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, ArrowLeft } from 'lucide-react';
import type { Unit } from '../data/level1';
import { useGameStore } from '../store/gameStore';
import { BossBattle } from './BossBattle';

interface WordModeProps {
    unit: Unit;
    onBack: () => void;
}

export const WordMode: React.FC<WordModeProps> = ({ unit, onBack }) => {
    const { words, id: unitId } = unit;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sentences, setSentences] = useState<string[]>([]);
    const [showBossBattle, setShowBossBattle] = useState(false);
    const { markWordKnown, addXp } = useGameStore();

    const currentWord = unit.words[currentIndex];
    const isFinished = currentIndex >= unit.words.length;

    useEffect(() => {
        if (unit.story) {
            const s = unit.story.content.match(/[^.!?]+[.!?]+/g) || [];
            setSentences(s);
        } else {
            // Fallback: Use examples from words
            const s = unit.words.map(w => w.example || `The word is ${w.word}.`);
            setSentences(s);
        }
    }, [unit]);

    const getContextSentence = () => {
        if (!currentWord) return "";
        // If story exists, find sentence containing the word
        if (unit.story) {
            const sentence = sentences.find(s => s.toLowerCase().includes(currentWord.word.toLowerCase()));
            return sentence || `Context for "${currentWord.word}" not found in story.`;
        }
        // If no story, return the word's example
        return currentWord.example || `No example available for "${currentWord.word}".`;
    };

    const handleNext = (known: boolean) => {
        if (known) {
            markWordKnown(unitId, currentWord.word);
            addXp(10);
        }
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
    };

    const playAudio = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    if (isFinished) {
        if (showBossBattle) {
            return <BossBattle unit={unit} onComplete={(success) => success && onBack()} onBack={() => setShowBossBattle(false)} />;
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-black">
                <h2 className="text-4xl font-bold text-neon-pink mb-8 glitch-text">TRAINING COMPLETE</h2>
                <p className="text-xl mb-8 text-neon-cyan">READY FOR BATTLE?</p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setShowBossBattle(true)}
                        className="retro-btn bg-red-600 text-white py-4 px-8 font-bold text-xl animate-pulse"
                    >
                        ⚔️ CHALLENGE BOSS
                    </button>
                    <button
                        onClick={onBack}
                        className="retro-btn bg-gray-800 text-gray-400 py-4 px-8 font-bold text-sm"
                    >
                        RETURN TO BASE
                    </button>
                </div>
            </div>
        );
    }

    const contextSentence = getContextSentence();

    // Example: "He wants to [Protect] the environment." -> "He wants to [?????] the environment."
    const maskedSentence = contextSentence.replace(
        new RegExp(`\\b${currentWord.word}\\b`, 'gi'),
        '[ ??? ]'
    );

    // Clean sentence for TTS (remove brackets if any remained from regex)
    const cleanSentence = contextSentence.replace(/\[/g, '').replace(/\]/g, '');

    return (
        <div className="h-screen bg-gray-900 text-white relative flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="text-neon-cyan font-bold tracking-widest text-sm">
                    WORD {String(currentIndex + 1).padStart(2, '0')} <span className="text-gray-600">/</span> {String(words.length).padStart(2, '0')}
                </div>
                <div className="w-6"></div> {/* Spacer for balance */}
            </div>

            {/* Main Content - Card Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                <div className="perspective-1000 w-full max-w-sm md:max-w-md aspect-[3/4] max-h-[60vh] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <motion.div
                        className="w-full h-full relative preserve-3d transition-all duration-500"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                    >
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden retro-card bg-navy-900 flex flex-col items-center justify-center p-8 group hover:border-neon-pink transition-colors rounded-2xl border-2 border-gray-700 shadow-2xl">
                            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white leading-relaxed text-center font-sans tracking-wide drop-shadow-lg">
                                {maskedSentence}
                            </h2>

                            <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-600/50 w-full backdrop-blur-md">
                                <p className="text-neon-lime text-[10px] text-center uppercase mb-2 tracking-wider">HINT (Meaning)</p>
                                <p className="text-lg text-white text-center font-bold">{currentWord.meaning}</p>
                            </div>

                            <p className="mt-8 text-neon-lime/50 text-xs animate-pulse absolute bottom-8 tracking-widest">TAP TO FLIP</p>
                        </div>

                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden retro-card bg-navy-900 flex flex-col items-center justify-center p-8 rotate-y-180 border-2 border-gold rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 pixel-text text-center">{currentWord.word}</h3>
                            <p className="text-xl text-gold mb-8 font-bold tracking-wide">{currentWord.meaning}</p>

                            <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600/50 w-full mb-6 backdrop-blur-md">
                                <p className="text-gray-200 text-lg text-center font-sans leading-relaxed italic">
                                    "{cleanSentence}"
                                </p>
                            </div>

                            <button
                                onClick={(e) => playAudio(e, cleanSentence)}
                                className="p-4 bg-gray-700/50 rounded-full hover:bg-white hover:text-black transition-all border border-white/10 group"
                            >
                                <Volume2 size={24} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer - Controls */}
            <div className="h-32 flex items-center justify-center bg-black/20 backdrop-blur-sm border-t border-white/5">
                <div className="w-full max-w-md px-4 h-full flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isFlipped ? (
                            <motion.div
                                key="controls"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex gap-4 w-full"
                            >
                                <button
                                    onClick={() => handleNext(false)}
                                    className="flex-1 bg-red-900/20 border border-red-500/50 text-red-500 py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                                >
                                    <X size={20} />
                                    <span className="text-[10px] font-bold tracking-wider">HARD</span>
                                </button>
                                <button
                                    onClick={() => handleNext(true)}
                                    className="flex-1 bg-neon-green/10 border border-neon-green/50 text-neon-green py-4 rounded-xl hover:bg-neon-green hover:text-black transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                                >
                                    <Check size={20} />
                                    <span className="text-[10px] font-bold tracking-wider">EASY</span>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="prompt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-gray-500 text-sm font-mono tracking-widest"
                            >
                                STUDYING MEMORY MATRIX...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
