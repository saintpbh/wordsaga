
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
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
        const regex = /\[(.*?)\]/g;
        const parts = unit.story.content.split(regex);

        setSegments(parts);
    }, [unit]);

    // Current logical step: 
    // 0 -> Intro text
    // 1 -> Blank 1
    // 2 -> Text after blank 1
    // ...
    // We only prompt input when the segment would be an answer.
    // Actually, split result: "Minjun is a ", "Brave", " student."
    // Even indices are text, Odd indices are answers (if starts with text).

    const isAnswerStep = currentSegmentIndex % 2 !== 0; // Assuming text starts first

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAnswerStep) return;

        const targetWord = segments[currentSegmentIndex];

        if (userInput.toLowerCase().trim() === targetWord.toLowerCase().trim()) {
            setFeedback('correct');
            addXp(50); // Big reward
            setTimeout(() => {
                setFeedback('neutral');
                setUserInput('');
                setCurrentSegmentIndex(prev => prev + 1);
            }, 1000);
        } else {
            setFeedback('wrong');
            setTimeout(() => setFeedback('neutral'), 500);
        }
    };

    const handleNextText = () => {
        if (!isAnswerStep) {
            setCurrentSegmentIndex(prev => prev + 1);
        }
    };

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

                <div className="retro-card p-6 bg-navy-900 max-w-2xl mx-auto mb-8 border-neon-cyan">
                    <p className="text-sm leading-loose text-white text-left font-sans">{unit.story.translation}</p>
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
                        Story Quest: {unit.story.title}
                    </div>

                    {isAnswerStep ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-white text-sm mb-2 blinking-cursor">COMMAND: ENTER MISSING DATA</p>
                            <form onSubmit={handleSubmit} className="flex gap-4">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="flex-1 bg-black border-4 border-double border-neon-lime p-4 text-xl outline-none text-neon-lime focus:shadow-[0_0_15px_#39FF14] transition-all font-pixel placeholder-gray-700"
                                    placeholder="Type word..."
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="retro-btn bg-gray-800 text-neon-lime px-8 flex items-center gap-2"
                                >
                                    ATTACK <Send size={20} />
                                </button>
                            </form>
                            <div className="text-xs text-gray-500 mt-2">HINT: {segments[currentSegmentIndex][0]}...</div>
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
