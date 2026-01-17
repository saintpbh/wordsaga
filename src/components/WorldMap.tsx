import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Castle, Trees, Skull, BookOpen, Globe, Zap, Flag, Lock, Star, MapPin } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ALL_LEVELS } from '../data/allLevels';

interface WorldMapProps {
    onSelectNode: (mode: any, levelId?: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectNode }) => {
    const { level, xp } = useGameStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate dynamic positions for levels
    const levelsData = ALL_LEVELS.map((lvl, idx) => ({
        ...lvl,
        mode: 'word', // Default mode for levels
        x: 50 + Math.sin(idx * 0.8) * 35, // Zigzag pattern
        y: 10 + (idx * 15) // Vertical progression
    }));

    // Generate SVG path for the road
    const pathData = levelsData.reduce((acc, curr, i) => {
        const point = `${curr.x} ${curr.y}`;
        return i === 0 ? `M ${point}` : `${acc} L ${point}`;
    }, '');

    // Auto-scroll to current level on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const currentLevelIndex = Math.max(0, level - 1);
            // Calculate approximate scroll position (percentage to pixels approximation or just scrollIntoView if we had refs)
            // Simple approximation:
            const scrollHeight = scrollContainerRef.current.scrollHeight;
            const targetY = (10 + (currentLevelIndex * 15)) / 100 * scrollHeight; // Roughly
            // Center it
            scrollContainerRef.current.scrollTop = targetY - (window.innerHeight / 2);
        }
    }, [level]);

    return (
        <div
            ref={scrollContainerRef}
            className="min-h-screen bg-black relative overflow-y-auto overflow-x-hidden font-sans selection:bg-neon-green selection:text-black custom-scrollbar"
        >
            {/* Animated Background - Fixed to viewport */}
            <div className="fixed inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center pointer-events-none filter blur-sm"></div>
            <div className="fixed inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black pointer-events-none"></div>

            {/* Header - Fixed at top */}
            <div className="fixed top-0 w-full p-4 flex justify-between items-center z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Flag className="text-neon-pink" /> WORLD MAP
                    </h1>
                    <p className="text-xs text-gray-400">Level {level} Hero</p>
                </div>
                <div className="text-right">
                    <div className="text-gold font-bold">XP: {xp.toLocaleString()}</div>
                </div>
            </div>

            {/* Map Content Container */}
            {/* Height scales with number of levels to allow scrolling */}
            <div
                className="relative w-full max-w-4xl mx-auto mt-20 mb-20"
                style={{ height: `${Math.max(100, levelsData.length * 15)}vh` }} // Dynamic height
            >
                {/* Draw Path Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox={`0 0 100 ${levelsData.length * 15}`} preserveAspectRatio="none">
                    <path
                        d={pathData}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                        strokeDasharray="1 1"
                    />
                </svg>

                {/* Render Nodes */}
                {levelsData.map((lvlStats, idx) => {
                    const isLocked = idx + 1 > level;
                    const isCurrent = idx + 1 === level;
                    const isCleared = idx + 1 < level;

                    // Assign icon based on index or randomness for variety, utilizing Lucide icons
                    const Icons = [Castle, Trees, Skull, BookOpen, Globe, Zap];
                    const LevelIcon = Icons[idx % Icons.length];

                    return (
                        <motion.div
                            key={lvlStats.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                            style={{ left: `${lvlStats.x}%`, top: `${lvlStats.y}%` }}
                            onClick={() => !isLocked && onSelectNode(lvlStats.mode, lvlStats.id)}
                            whileHover={!isLocked ? { scale: 1.1 } : {}}
                        >
                            {/* Node Circle */}
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 relative z-10
                                            ${isCleared
                                        ? 'bg-gold border-white text-black shadow-[0_0_20px_#FFD700]'
                                        : isCurrent
                                            ? 'bg-navy-900 border-neon-green text-neon-green shadow-[0_0_20px_#39FF14] animate-pulse-slow'
                                            : 'bg-gray-800 border-gray-600 text-gray-500 opacity-80'}`}
                            >
                                {isLocked ? (
                                    <Lock size={20} />
                                ) : isCleared ? (
                                    <Star size={24} fill="black" />
                                ) : (
                                    <LevelIcon size={24} />
                                )}

                                {/* Current Indicator Pointer */}
                                {isCurrent && (
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-neon-green animate-bounce">
                                        <MapPin size={32} fill="#39FF14" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className={`mt-2 font-bold text-sm md:text-base px-3 py-1 rounded-full backdrop-blur-md border 
                                        ${isCleared
                                    ? 'bg-gold/20 text-gold border-gold/50'
                                    : isCurrent
                                        ? 'bg-neon-green/10 text-neon-green border-neon-green/50'
                                        : 'bg-black/50 text-gray-500 border-gray-700'
                                }`}>
                                {lvlStats.title}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
