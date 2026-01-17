
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, BookOpen } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
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

    // Sound Effect Helper
    const playSound = (type: 'correct' | 'wrong') => {
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
        }
    };

    const isAnswerStep = currentSegmentIndex % 2 !== 0;

    // Auto-advance text segments (skip "Click to Proceed")
    useEffect(() => {
        if (!segments || segments.length === 0) return;

        // If it's a text segment (not an answer step) and not finished, advance automatically
        // But we need to ensure we don't advance past the end immediately or skip visual updates too fast.
        // Actually, for "visual novel" feel, usually text prints then waits. 
        // But the user specifically asked "Without click to process button, just go next".
        // This implies they want to see the Question immediately with the text.

        if (!isAnswerStep && currentSegmentIndex < segments.length) {
            // Check if it's the LAST segment (just text ending). If so, maybe keep it?
            // But usually story mode ends with "Mission Complete".
            // So if !isAnswerStep, we increment.

            // We use a small timeout to allow state to settle or visual transition if needed, 
            // but effectively instant for the user.
            const timer = setTimeout(() => {
                setCurrentSegmentIndex(prev => prev + 1);
            }, 50); // Very short delay to ensure rendering happens then moves on

            return () => clearTimeout(timer);
        }
    }, [currentSegmentIndex, isAnswerStep, segments.length]);

    const handleOptionClick = (selectedWord: string) => {
        if (!isAnswerStep || feedback !== 'neutral') return;

        const targetWord = segments[currentSegmentIndex];

        if (selectedWord.toLowerCase().trim() === targetWord.toLowerCase().trim()) {
            setFeedback('correct');
            playSound('correct');
            addXp(50);
            setTimeout(() => {
                setFeedback('neutral');
                setCurrentSegmentIndex(prev => prev + 1);
            }, 1000);
        } else {
            setFeedback('wrong');
            playSound('wrong');
            setTimeout(() => setFeedback('neutral'), 800);
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
        <div className="h-screen bg-gray-900 text-white relative flex flex-col overflow-hidden">
            {/* Header / Back Button - Absolute */}
            <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between pointer-events-none">
                <button
                    onClick={onBack}
                    className="text-white/50 hover:text-white pointer-events-auto transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-neon-green">
                    STORY SEGMENT: {currentSegmentIndex + 1} / {segments.length}
                </div>
            </div>

            {/* Visual Novel Scene - Fixed Top 60% */}
            <div className="h-[60%] relative flex items-center justify-center p-8 overflow-y-auto custom-scrollbar">
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 opacity-50 z-0"></div>

                {/* Critical Hit Effect */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                        >
                            <div className="text-6xl md:text-9xl text-gold opacity-20 font-bold tracking-tighter">PERFECT</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="z-10 max-w-4xl w-full text-2xl md:text-3xl leading-relaxed font-medium">
                    {/* Render accumulated text up to current point */}
                    {segments.map((seg, idx) => {
                        // Allow seeing the next sentence context when answering (isAnswerStep)
                        // If currentSegmentIndex is 1 (Answer), show up to index 2 (Context after answer)
                        const visibleLimit = currentSegmentIndex + (isAnswerStep ? 1 : 0);
                        if (idx > visibleLimit) return null;

                        // Current Active Blank
                        if (idx === currentSegmentIndex && isAnswerStep) {
                            return (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800 px-4 py-1 rounded-md min-w-[120px] inline-block mx-2 border-b-4 border-neon-green/50 animate-pulse text-neon-green text-center align-middle"
                                >
                                    ?
                                </motion.span>
                            );
                        }

                        // Answered Blank (Green)
                        if (idx % 2 !== 0) {
                            return <span key={idx} className="text-neon-green font-bold mx-1 drop-shadow-lg">{seg}</span>;
                        }

                        // Normal Text
                        return <span key={idx} className="text-gray-100">{seg}</span>;
                    })}
                </div>
            </div>

            {/* Control Area - Fixed Bottom 40% */}
            <div className="h-[40%] bg-navy-900 border-t-2 border-neon-blue/30 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="max-w-4xl mx-auto w-full h-full p-6 flex flex-col">
                    {/* Quest Title */}
                    <div className="flex items-center gap-3 mb-6 opacity-70">
                        <div className="h-1 w-8 bg-neon-pink"></div>
                        <span className="text-xs font-mono tracking-[0.2em] text-neon-pink uppercase">
                            Mission: {unit.story?.title || "Unknown Quest"}
                        </span>
                    </div>

                    {/* Interaction Area - Centered */}
                    <div className="flex-1 flex items-center justify-center w-full">
                        <AnimatePresence mode="wait">
                            {isAnswerStep ? (
                                <motion.div
                                    key="options"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full flex flex-col gap-4"
                                >
                                    <p className="text-center text-xs text-neon-cyan/80 font-mono tracking-widest mb-2 animate-pulse">
                                        &lt; SELECT SYSTEM DETECTED &gt;
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        {options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(opt)}
                                                className="group relative bg-black/40 border border-neon-cyan/30 text-neon-cyan py-4 px-6 
                                                         hover:bg-neon-cyan hover:text-black hover:border-neon-cyan 
                                                         active:scale-95 transition-all duration-200 ease-out
                                                         flex items-center justify-center overflow-hidden rounded-sm"
                                            >
                                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan transition-all group-hover:w-full opacity-10"></span>
                                                <span className="relative font-bold text-lg tracking-wide">{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-gray-500 text-sm animate-pulse">
                                    PROCESSING DATA STREAM...
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
