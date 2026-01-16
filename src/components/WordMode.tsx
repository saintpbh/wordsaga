
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
    const [contextSentence, setContextSentence] = useState<string>('');
    const [showBossBattle, setShowBossBattle] = useState(false);
    const { markWordKnown, addXp } = useGameStore();

    const currentWord = words[currentIndex];
    const isFinished = currentIndex >= words.length;

    useEffect(() => {
        if (!currentWord) return;
        // Find sentence containing the word (case-insensitive)
        const sentences = unit.story.content.match(/[^.!?]+[.!?]+/g) || [];
        const found = sentences.find(s => s.toLowerCase().includes(currentWord.word.toLowerCase()));
        setContextSentence(found || `Example sentence for ${currentWord.word}.`);
    }, [currentWord, unit]);

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

    // Example: "He wants to [Protect] the environment." -> "He wants to [?????] the environment."
    const maskedSentence = contextSentence.replace(
        new RegExp(`\\b${currentWord.word}\\b`, 'gi'),
        '[ ????? ]'
    );

    // Clean sentence for TTS (remove brackets if any remained from regex)
    const cleanSentence = contextSentence.replace(/\[/g, '').replace(/\]/g, '');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
            <button onClick={onBack} className="absolute top-8 left-8 text-white hover:text-neon-pink transition-colors">
                <ArrowLeft size={32} />
            </button>

            <div className="mb-8 text-neon-cyan font-bold tracking-widest border-b-2 border-neon-cyan pb-2">
                WORD {String(currentIndex + 1).padStart(2, '0')} / {String(words.length).padStart(2, '0')}
            </div>

            <div className="perspective-1000 w-full max-w-md h-96 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden retro-card bg-navy-900 flex flex-col items-center justify-center p-8 group hover:border-neon-pink transition-colors">
                        <h2 className="text-xl font-bold mb-6 text-white leading-relaxed text-center font-sans tracking-wide">
                            {maskedSentence}
                        </h2>

                        <div className="bg-gray-800 p-4 rounded border border-gray-600 w-full">
                            <p className="text-neon-lime text-xs text-center uppercase mb-1">HINT (Definition)</p>
                            <p className="text-sm text-gray-300 text-center italic">"{currentWord.definition}"</p>
                        </div>

                        <p className="mt-8 text-neon-lime text-xs animate-pulse absolute bottom-8">PRESS TO REVEAL</p>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden retro-card bg-navy-900 flex flex-col items-center justify-center p-8 rotate-y-180 border-gold">
                        <h3 className="text-3xl font-bold text-white mb-2 pixel-text text-center">{currentWord.word}</h3>
                        <p className="text-xl text-gold mb-6 font-bold">{currentWord.meaning}</p>

                        <div className="bg-gray-800 p-4 rounded border border-gray-600 w-full mb-4">
                            <p className="text-white text-sm text-center font-sans leading-relaxed">
                                {cleanSentence}
                            </p>
                        </div>

                        <button
                            onClick={(e) => playAudio(e, cleanSentence)}
                            className="p-3 bg-gray-700 rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                            <Volume2 />
                        </button>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-8 mt-12"
                    >
                        <button
                            onClick={() => handleNext(false)}
                            className="retro-btn bg-red-900 border-red-500 text-white py-4 px-8 min-w-[140px] hover:text-red-500 hover:border-red-500"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <X size={24} />
                                <span className="text-xs">RETRY</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleNext(true)}
                            className="retro-btn bg-neon-green/20 border-neon-green text-neon-green py-4 px-8 min-w-[140px]"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Check size={24} />
                                <span className="text-xs">CLEAR</span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
