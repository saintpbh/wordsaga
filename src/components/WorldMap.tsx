import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Castle, Trees, Skull, BookOpen, Globe, Zap, Flag, Lock, Star, MapPin, ChevronRight, ChevronLeft, Mountain, Flame } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ALL_LEVELS } from '../data/allLevels';

interface WorldMapProps {
    onSelectNode: (mode: any, levelId?: string) => void;
}

const MAP_STAGES = [
    {
        id: 1,
        name: "The Shire Lands",
        range: [1, 10],
        bg: "/wordsaga/maps/stage_1.png",
        theme: "text-amber-900",
        border: "border-amber-700",
        icon: Trees
    },
    {
        id: 2,
        name: "The Golden Plains",
        range: [11, 20],
        bg: "/wordsaga/maps/stage_2.png",
        theme: "text-yellow-900",
        border: "border-yellow-700",
        icon: Mountain
    },
    {
        id: 3,
        name: "The Dark Realms",
        range: [21, 30],
        bg: "/wordsaga/maps/stage_3.png",
        theme: "text-red-900",
        border: "border-red-900",
        icon: Flame
    }
];

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectNode }) => {
    const { level, xp } = useGameStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Determine initial map based on player level
    const initialMapId = MAP_STAGES.find(stage => level >= stage.range[0] && level <= stage.range[1])?.id ||
        (level > 30 ? 3 : 1);

    const [currentMapId, setCurrentMapId] = useState(initialMapId);

    const currentStage = MAP_STAGES.find(s => s.id === currentMapId)!;

    // Filter levels for current stage
    const currentLevels = ALL_LEVELS.filter((_, idx) => {
        const levelNum = idx + 1;
        return levelNum >= currentStage.range[0] && levelNum <= currentStage.range[1];
    }).map((lvl, idx) => ({
        ...lvl,
        mode: 'word',
        // Recalculate local index for positioning
        localIdx: idx,
        // Path generation logic preserved but local to the map
        x: 50 + Math.sin(idx * 0.8) * 35,
        y: 15 + (idx * 12)  // Slightly more compact vertical
    }));

    // SVG Path
    const pathData = currentLevels.reduce((acc, curr, i) => {
        const point = `${curr.x} ${curr.y}`;
        return i === 0 ? `M ${point}` : `${acc} L ${point}`;
    }, '');

    // Navigation handlers
    const canGoNext = level > currentStage.range[1];
    const canGoPrev = currentMapId > 1;

    const handleNext = () => {
        if (canGoNext && currentMapId < 3) setCurrentMapId(curr => curr + 1);
    };

    const handlePrev = () => {
        if (canGoPrev) setCurrentMapId(curr => curr - 1);
    };

    // Auto-scroll on mount/change
    useEffect(() => {
        if (scrollContainerRef.current) {
            // If current level is in this map, scroll to it. Otherwise scroll top or bottom.
            const isCurrentMap = level >= currentStage.range[0] && level <= currentStage.range[1];

            if (isCurrentMap) {
                const relativeIndex = level - currentStage.range[0];
                const scrollHeight = scrollContainerRef.current.scrollHeight;
                // 10 items, roughly 10-15% per item height logic from y calculation
                const targetY = (15 + (relativeIndex * 12)) / 100 * scrollHeight;
                scrollContainerRef.current.scrollTo({ top: targetY - window.innerHeight / 2, behavior: 'smooth' });
            } else {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [currentMapId, level]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#1a1a1a] font-serif">
            {/* Main Background with transition */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentMapId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${currentStage.bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'sepia(0.3) contrast(1.1) brightness(0.9)'
                    }}
                />
            </AnimatePresence>

            {/* Parchment Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-[2] bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>

            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center text-[#e8dcc0] drop-shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 border-2 border-[#ccb06a] rounded-full bg-black/70 backdrop-blur-md">
                        <currentStage.icon size={24} className="text-[#ccb06a]" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-widest uppercase text-[#ccb06a] drop-shadow-black">
                            {currentStage.name}
                        </h1>
                        <p className="text-sm opacity-80 font-sans tracking-wider">Map {currentMapId} of 3</p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-[#ffd700] drop-shadow-sm flex items-center gap-2">
                        <Star className="fill-[#ffd700]" size={20} />
                        {xp.toLocaleString()} XP
                    </div>
                    <div className="text-xs text-[#ccb06a]/80 font-sans uppercase tracking-widest">Current Journey</div>
                </div>
            </div>

            {/* Map Interaction Layer */}
            <div
                ref={scrollContainerRef}
                className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden custom-scrollbar pt-24 pb-24"
            >
                <div className="relative w-full max-w-3xl mx-auto" style={{ height: '150vh' }}>
                    {/* Dashed Path Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60 filter drop-shadow-lg" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#5c4033" // Dark brown ink color
                            strokeWidth="0.8"
                            strokeDasharray="2 2"
                            className="drop-shadow-md"
                        />
                    </svg>

                    {/* Level Nodes */}
                    {currentLevels.map((lvlStats, i) => {
                        const globalLevel = currentStage.range[0] + i;
                        const isLocked = globalLevel > level;
                        const isCurrent = globalLevel === level;
                        const isCleared = globalLevel < level;

                        // Alternate icons
                        const NodeIcons = [Castle, Trees, Skull, BookOpen, Globe, Zap];
                        const NodeIcon = NodeIcons[globalLevel % NodeIcons.length];

                        return (
                            <motion.div
                                key={lvlStats.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                                style={{ left: `${lvlStats.x}%`, top: `${lvlStats.y}%` }}
                            >
                                <motion.button
                                    whileHover={!isLocked ? { scale: 1.15 } : {}}
                                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                                    onClick={() => !isLocked && onSelectNode(lvlStats.mode, lvlStats.id)}
                                    className={`
                                        relative w-16 h-16 rounded-full flex items-center justify-center 
                                        border-[3px] shadow-2xl transition-all duration-300
                                        ${isCleared
                                            ? 'bg-[#ccb06a] border-[#ffd700] text-black shadow-[0_0_20px_#ffd700]'
                                            : isCurrent
                                                ? 'bg-[#8b0000] border-[#ff4500] text-white shadow-[0_0_30px_#ff4500] animate-pulse'
                                                : 'bg-[#2a2a2a] border-[#4a4a4a] text-[#555] cursor-not-allowed grayscale'}
                                    `}
                                >
                                    {isLocked ? <Lock size={20} /> : <NodeIcon size={28} strokeWidth={1.5} />}

                                    {/* Ring Decoration for Current */}
                                    {isCurrent && (
                                        <div className="absolute inset-0 rounded-full border-4 border-[#ff4500] opacity-50 animate-ping"></div>
                                    )}
                                </motion.button>

                                {/* Interactive Label */}
                                <div className={`
                                    mt-3 px-4 py-2 rounded-md border backdrop-blur-xl transition-all duration-300
                                    ${isCurrent
                                        ? 'bg-black/80 border-[#ccb06a] text-[#ffd700] scale-110'
                                        : 'bg-black/60 border-white/10 text-[#e8dcc0]'}
                                `}>
                                    <div className="text-xs uppercase tracking-widest opacity-70 mb-0.5">Level {globalLevel}</div>
                                    <div className="font-serif font-bold whitespace-nowrap">{lvlStats.title}</div>
                                </div>

                                {isCurrent && (
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-12 text-[#ff4500] drop-shadow-[0_0_10px_rgba(255,69,0,0.8)]"
                                    >
                                        <MapPin size={40} fill="currentColor" />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Map Navigation Overlay */}
            <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center items-center gap-8 pointer-events-none">
                <AnimatePresence>
                    {canGoPrev && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={handlePrev}
                            className="pointer-events-auto group flex items-center gap-2 pl-4 pr-6 py-3 bg-black/80 border border-[#ccb06a] rounded-r-full hover:bg-[#ccb06a] hover:text-black text-[#ccb06a] transition-all"
                        >
                            <ChevronLeft size={24} />
                            <span className="font-serif font-bold uppercase tracking-widest text-sm">Prev Map</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="h-1 w-16 bg-[#ccb06a]/30 rounded-full"></div>

                <AnimatePresence>
                    {currentMapId < 3 && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={handleNext}
                            disabled={!canGoNext}
                            className={`
                                pointer-events-auto group flex items-center gap-2 pl-6 pr-4 py-3 border rounded-l-full transition-all
                                ${canGoNext
                                    ? 'bg-black/80 border-[#ccb06a] text-[#ccb06a] hover:bg-[#ccb06a] hover:text-black cursor-pointer'
                                    : 'bg-black/50 border-gray-700 text-gray-600 grayscale cursor-not-allowed'}
                            `}
                        >
                            <span className="font-serif font-bold uppercase tracking-widest text-sm">
                                {canGoNext ? "Next Map" : "Locked"}
                            </span>
                            {canGoNext ? <ChevronRight size={24} /> : <Lock size={16} />}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
