
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Crown, Clock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { level1Data } from '../data/level1';

interface RaidModeProps {
    onBack: () => void;
}

interface RaidLog {
    id: number;
    user: string;
    damage: number;
    timestamp: number;
}

export const RaidMode: React.FC<RaidModeProps> = ({ onBack }) => {
    const { addXp } = useGameStore();

    // Raid State
    const [bossHp, setBossHp] = useState(1000000);
    const maxHp = 1000000;
    const [myContribution, setMyContribution] = useState(0);
    const [logs, setLogs] = useState<RaidLog[]>([]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    // Quiz State
    const wordPool = level1Data.units.flatMap(u => u.words);
    const [currentWord, setCurrentWord] = useState(wordPool[0]);
    const [options, setOptions] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'active' | 'victory' | 'defeat'>('active');

    // Simulation Refs
    const logIdRef = useRef(0);

    // Initialize Quiz
    useEffect(() => {
        generateQuiz();
    }, []);

    // Simulate Global Damage & Logs
    useEffect(() => {
        if (gameState !== 'active') return;

        const interval = setInterval(() => {
            // Randomly damage boss
            const incomingDmg = Math.floor(Math.random() * 500) + 100;
            damageBoss(incomingDmg, false);

            // Add log
            const names = ['Player99', 'DragonSlayer', 'StudyKing', 'WordMaster', 'Guest_12', 'SeoulWarrior'];
            const randomName = names[Math.floor(Math.random() * names.length)];

            addLog({
                id: logIdRef.current++,
                user: randomName,
                damage: incomingDmg,
                timestamp: Date.now()
            });

        }, 200); // Fast updates

        return () => clearInterval(interval);
    }, [gameState]);

    // Timer
    useEffect(() => {
        if (gameState !== 'active') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('defeat');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    const damageBoss = (amount: number, isMe: boolean) => {
        setBossHp(prev => {
            const next = Math.max(0, prev - amount);
            if (next === 0) setGameState('victory');
            return next;
        });
        if (isMe) setMyContribution(prev => prev + amount);
    };

    const addLog = (log: RaidLog) => {
        setLogs(prev => [log, ...prev].slice(0, 5)); // Keep last 5
    };

    const generateQuiz = () => {
        const target = wordPool[Math.floor(Math.random() * wordPool.length)];
        setCurrentWord(target);

        // Generate options (1 correct, 3 wrong definitions)
        const wrong = wordPool
            .filter(w => w.word !== target.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.meaning);

        const allOptions = [target.meaning, ...wrong].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
    };

    const handleAnswer = (selectedMeaning: string) => {
        if (selectedMeaning === currentWord.meaning) {
            // Critical Hit!
            const dmg = 1000 + Math.floor(Math.random() * 500);
            damageBoss(dmg, true);
            addXp(10);
            generateQuiz();
        } else {
            // Miss (No damage)
            // Ideally feedback shake, but for speed just next word
            generateQuiz();
        }
    };

    if (gameState === 'victory') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <Crown className="text-gold w-32 h-32 mb-4 animate-bounce" />
                <h1 className="text-6xl font-bold text-shadow-glow mb-4">RAID COMPLETE!</h1>
                <p className="text-2xl mb-8">Boss Defeated!</p>
                <div className="bg-gray-800 p-8 rounded-xl border-4 border-gold text-center">
                    <h2 className="text-xl text-gray-400">YOUR CONTRIBUTION</h2>
                    <p className="text-4xl text-neon-cyan font-bold">{myContribution.toLocaleString()}</p>
                    <p className="mt-4 text-green-400">+5000 XP BONUS</p>
                </div>
                <button onClick={() => { addXp(5000); onBack(); }} className="mt-8 retro-btn bg-white text-black">
                    CLAIM REWARD
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden font-sans">
            {/* Top Bar */}
            <div className="absolute top-0 w-full h-16 bg-black/50 border-b border-gray-700 flex items-center justify-between px-4 z-50">
                <button onClick={onBack} className="text-gray-400 hover:text-white"><ArrowLeft /></button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                        <Clock size={20} />
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-2 text-neon-cyan">
                        <Users size={20} />
                        1,240 Online
                    </div>
                </div>
            </div>

            {/* Global Boss Scene */}
            <div className="relative pt-20 pb-80 flex flex-col items-center">
                {/* Health Bar */}
                <div className="w-full max-w-4xl px-4 mb-4">
                    <div className="flex justify-between text-sm mb-1 font-bold">
                        <span className="text-red-500">WORLD EATER DRAGON</span>
                        <span>{(bossHp / maxHp * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600 relative">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${(bossHp / maxHp) * 100}%` }}
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        />
                    </div>
                    <p className="text-center text-xs mt-1 text-gray-500">{bossHp.toLocaleString()} / {maxHp.toLocaleString()}</p>
                </div>

                {/* Dragon Visual */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[150px] leading-none filter drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]"
                >
                    🐲
                </motion.div>

                {/* Live Logs */}
                <div className="absolute left-4 top-32 w-64 h-48 overflow-hidden pointer-events-none opacity-70 mask-image-gradient-to-b">
                    <AnimatePresence>
                        {logs.map(log => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm mb-1 text-shadow-sm"
                            >
                                <span className="text-neon-cyan font-bold">{log.user}</span>
                                <span className="text-gray-300"> dealt </span>
                                <span className="text-orange-400 font-bold">-{log.damage}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Player Action Area */}
            <div className="absolute bottom-0 w-full h-80 bg-gray-900 border-t-4 border-gray-700 flex flex-col items-center p-4">
                <div className="flex justify-between w-full max-w-2xl mb-4 text-sm text-gray-400">
                    <span>My Contribution: <b className="text-white">{myContribution.toLocaleString()}</b></span>
                    <span>Combo: <b className="text-yellow-400">3x</b></span>
                </div>

                <div className="text-3xl font-bold mb-6 text-neon-green">{currentWord.word}</div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            className="bg-gray-800 hover:bg-gray-700 border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
