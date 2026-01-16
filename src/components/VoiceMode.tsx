
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Flame } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { level1Data } from '../data/level1';

interface VoiceModeProps {
    onBack: () => void;
}

// Minimal type definition for Web Speech API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onBack }) => {
    const { addXp } = useGameStore();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');
    const [currentWord, setCurrentWord] = useState('');
    const [score, setScore] = useState(0);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Get random words from known list or fallback to all words
    const wordPool = level1Data.units.flatMap(u => u.words.map(w => w.word));

    const pickNewWord = () => {
        const word = wordPool[Math.floor(Math.random() * wordPool.length)];
        setCurrentWord(word);
        setTranscript('');
        setFeedback('idle');
    };

    useEffect(() => {
        pickNewWord();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');

                setTranscript(transcript);

                if (event.results[0].isFinal) {
                    checkMatch(transcript, currentWord);
                }
            };

            recognition.onerror = (event: any) => {
                console.error(event.error);
                setIsListening(false);
                setFeedback('fail');
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            alert("Your browser does not support speech recognition.");
        }
    }, []);

    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setTranscript(transcript);
                if (event.results[0].isFinal) {
                    checkMatch(transcript, currentWord);
                }
            };
        }
    }, [currentWord]);


    const checkMatch = (spoken: string, target: string) => {
        // Simple normalization
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalize(spoken).includes(normalize(target))) {
            setFeedback('success');
            setScore(prev => prev + 50);
            addXp(50);
            setTimeout(() => {
                pickNewWord();
            }, 1500);
        } else {
            setFeedback('fail');
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setFeedback('listening');
                setTranscript('');
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Magic Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900 to-black pointer-events-none"></div>

            <button onClick={onBack} className="absolute top-8 left-8 text-white z-50 hover:text-neon-pink transition-colors">
                <ArrowLeft size={32} />
            </button>

            {/* Score */}
            <div className="absolute top-8 right-8 text-2xl font-bold text-gold">
                SCORE: {score}
            </div>

            {/* Battle Scene */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-lg">

                {/* Monster */}
                <motion.div
                    animate={feedback === 'success' ? { x: [0, 10, -10, 0], opacity: [1, 0.5, 0], scale: [1, 1.2, 0] } : { y: [0, -10, 0] }}
                    transition={{ duration: feedback === 'success' ? 0.5 : 2, repeat: feedback === 'success' ? 0 : Infinity }}
                    className="text-9xl mb-12 filter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                >
                    👾
                </motion.div>

                {/* Spell Target */}
                <div className="bg-black/80 border-2 border-purple-500 p-8 rounded-xl text-center w-full mb-8 relative">
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Cast this Spell</p>
                    <h2 className="text-5xl font-bold text-white text-shadow-glow">{currentWord}</h2>

                    {feedback === 'success' && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-xl"
                        >
                            <div className="text-neon-green text-3xl font-bold flex items-center gap-2">
                                <Flame className="text-orange-500" /> CAST!
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Microphone Trigger */}
                <button
                    onClick={toggleListening}
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${isListening
                            ? 'bg-red-600 border-red-400 shadow-[0_0_30px_#f00] scale-110'
                            : 'bg-gray-800 border-gray-600 hover:border-white'
                        }`}
                >
                    {isListening ? <Mic size={40} className="text-white animate-pulse" /> : <MicOff size={40} className="text-gray-400" />}
                </button>

                <p className="mt-4 text-gray-400 h-6">
                    {isListening ? 'Listening...' : 'Tap Mic to Speak'}
                </p>

                {/* Transcript Feedback */}
                <div className="mt-8 h-16 text-2xl font-mono text-neon-cyan text-center">
                    {transcript}
                </div>

            </div>
        </div>
    );
};
