
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, BookOpen } from 'lucide-react';
import type { Unit } from '../data/level1';
import { useGameStore } from '../store/gameStore';

interface StoryModeProps {
    unit: Unit;
    onBack: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ unit, onBack }) => {
    const [segments, setSegments] = useState<string[]>([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
    const { addXp } = useGameStore();

    useEffect(() => {
        // Parse the story content: "Text [Answer] Text" -> segments and answers
        const content = unit.story?.content || "Story content missing.";
        const regex = /\[(.*?)\]/g;
        const parts = content.split(regex);

        setSegments(parts);
    }, [unit]);

    // Current logical step: 
    // 0 -> Intro text
    // 1 -> Blank 1 (Answer Step)
    // 2 -> Text after blank 1
    // ...

    // Distractor Generation Logic
    // We need 3 options total: 1 correct, 2 distractors.
    const [options, setOptions] = useState<string[]>([]);

    // Initialize options when entering an answer step
    useEffect(() => {
        if (!segments || segments.length === 0) return;
        if (currentSegmentIndex >= segments.length) return;

        const isAnswerStep = currentSegmentIndex % 2 !== 0;
        if (isAnswerStep) {
            const targetWord = segments[currentSegmentIndex];
            if (!targetWord) return;

            // Pick 2 random words from the same unit that are NOT the target word
            const otherWords = unit.words.filter(w => w.word.toLowerCase() !== targetWord.toLowerCase());
            const shuffledOther = otherWords.sort(() => 0.5 - Math.random()).slice(0, 2).map(w => w.word);

            // Combine and shuffle
            const allOptions = [targetWord, ...shuffledOther].sort(() => 0.5 - Math.random());
            setOptions(allOptions);
        }
    }, [currentSegmentIndex, segments, unit]);

    const isAnswerStep = currentSegmentIndex % 2 !== 0;

    const handleOptionClick = (selectedWord: string) => {
        if (!isAnswerStep || feedback !== 'neutral') return;

        const targetWord = segments[currentSegmentIndex];

        if (selectedWord.toLowerCase().trim() === targetWord.toLowerCase().trim()) {
            setFeedback('correct');
            addXp(50);
            setTimeout(() => {
                setFeedback('neutral');
                setCurrentSegmentIndex(prev => prev + 1);
            }, 1000);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback('neutral'), 800);
        }
    };

    const handleNextText = () => {
        if (!isAnswerStep) {
            setCurrentSegmentIndex(prev => prev + 1);
        }
    };

    const renderStoryText = () => {
        return (
            <p className="text-lg leading-relaxed text-white text-left font-sans">
                {segments.map((seg, idx) => {
                    if (idx % 2 !== 0) { // This is an answer segment
                        return <span key={idx} className="text-neon-green font-bold mx-1">{seg}</span>;
                    }
                    return <span key={idx}>{seg}</span>;
                })}
            </p>
        );
    };

    const storyTranslation = unit.story?.translation || "No translation available.";

    const isFinished = currentSegmentIndex >= segments.length;

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-black">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-gold mb-8"
                >
                    <h2 className="text-4xl font-bold text-neon-lime glitch-text">MISSION COMPLETE</h2>
                    <div className="text-6xl mt-6 animate-bounce">🏆</div>
                </motion.div>

                {/* Story Panel */}
                <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 mb-6 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="mb-4">
                            {renderStoryText()}
                        </div>
                        <div className="mt-4 p-4 bg-black/40 rounded-lg border-l-4 border-neon-blue">
                            <p className="text-sm leading-loose text-white text-left font-sans">{storyTranslation}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="retro-btn bg-neon-pink text-white py-4 px-8"
                >
                    RETURN TO BASE
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 relative flex flex-col">
            <button onClick={onBack} className="absolute top-8 left-8 text-white hover:text-neon-green z-10">
                <ArrowLeft size={32} />
            </button>

            {/* Visual Novel Scene */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                {/* Simple Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-50 z-0"></div>
                {feedback === 'correct' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
                    >
                        <div className="text-9xl text-gold opacity-20 font-bold">CRITICAL HIT!</div>
                    </motion.div>
                )}

                <div className="z-10 max-w-3xl w-full text-2xl leading-relaxed">
                    {/* Render accumulated text up to current point */}
                    {segments.map((seg, idx) => {
                        if (idx > currentSegmentIndex) return null;
                        if (idx === currentSegmentIndex && isAnswerStep) return <span key={idx} className="bg-gray-700 px-4 py-1 rounded min-w-[100px] inline-block mx-1 border-b-2 border-neon-green animate-pulse">?</span>;
                        if (idx % 2 !== 0) return <span key={idx} className="text-neon-green font-bold mx-1">{seg}</span>;
                        return <span key={idx}>{seg}</span>;
                    })}
                </div>
            </div>

            {/* Control Area */}
            <motion.div
                className={`bg-navy-900 border-t-4 border-white p-8 relative z-20 shadow-[0_-10px_0_0_rgba(0,0,0,0.5)]`}
                animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
            >
                <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
                    <div className="text-neon-pink font-bold mb-4 uppercase tracking-widest text-sm border-b-2 border-neon-pink w-fit pb-1">
                        Story Quest: {unit.story?.title || "Unknown Quest"}
                    </div>

                    {isAnswerStep ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-white text-sm mb-2 blinking-cursor">COMMAND: CHOOSE THE MISSING DATA</p>

                            {/* Options Container */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(opt)}
                                        className="retro-btn bg-gray-800 border-neon-cyan text-neon-cyan py-4 px-2 hover:bg-neon-cyan hover:text-black text-lg transition-all active:scale-95"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <div className="text-xs text-gray-500 mt-2">HINT: Context Clue Detected...</div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-700 cursor-pointer hover:border-white transition-colors" onClick={handleNextText}>
                            <p className="text-neon-cyan animate-pulse text-sm">PRESS TO CONTINUE &gt;&gt;</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
