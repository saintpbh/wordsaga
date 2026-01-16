
import React from 'react';
import { motion } from 'framer-motion';
import { Castle, Trees, Skull, BookOpen, Globe, Zap, Flag, Lock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface WorldMapProps {
    onSelectNode: (mode: any, levelId?: string) => void;
}

interface MapNode {
    id: string;
    label: string;
    mode: 'dashboard' | 'word' | 'story' | 'etymology' | 'raid' | 'rhythm' | 'voice';
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    icon: React.ReactNode;
    color: string;
    requiredLevel: number;
}

export const WorldMap: React.FC<WorldMapProps> = ({ onSelectNode }) => {
    const { level, xp } = useGameStore();

    const nodes: MapNode[] = [
        { id: 'n1', label: 'My Kingdom', mode: 'dashboard', x: 50, y: 90, icon: <Castle />, color: 'text-yellow-400', requiredLevel: 1 },
        { id: 'n2', label: 'Whispering Woods', mode: 'word', x: 20, y: 75, icon: <Trees />, color: 'text-green-400', requiredLevel: 1 },
        { id: 'n3', label: 'Goblin Dungeon', mode: 'story', x: 80, y: 60, icon: <Skull />, color: 'text-red-400', requiredLevel: 1 },
        { id: 'n4', label: 'Ancient Ruins', mode: 'etymology', x: 30, y: 40, icon: <BookOpen />, color: 'text-amber-400', requiredLevel: 1 },
        { id: 'n5', label: 'Neon City', mode: 'rhythm', x: 70, y: 25, icon: <Zap />, color: 'text-cyan-400', requiredLevel: 1 },
        { id: 'n6', label: 'World Tower', mode: 'raid', x: 50, y: 10, icon: <Globe />, color: 'text-purple-400', requiredLevel: 1 },
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-hidden font-sans selection:bg-neon-green selection:text-black">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center pointer-events-none filter blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black pointer-events-none"></div>

            {/* Header */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800">
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

            {/* Map Container */}
            <div className="relative w-full h-screen max-w-4xl mx-auto">
                {/* Draw Path Lines (SVG) */}
                {/* Draw Path Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        d="M 50 90 Q 20 85 20 75 T 80 60 T 30 40 T 70 25 T 50 10"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5" // Reduced stroke width because coordinate space is small (100x100)
                        strokeDasharray="1 1"
                    />
                </svg>

                {/* Render Nodes */}
                {nodes.map((node, index) => {
                    const isLocked = level < node.requiredLevel;

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.2 }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            onClick={() => !isLocked && onSelectNode(node.mode, node.id)}
                        >
                            {/* Node Circle */}
                            <motion.div
                                whileHover={{ scale: 1.2, backgroundColor: '#222' }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center bg-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative z-10 transition-colors
                                ${isLocked ? 'border-gray-600 grayscale' : `border-white ${node.color} shadow-${node.color}/50`}
                            `}
                            >
                                {isLocked ? <Lock size={24} className="text-gray-500" /> : node.icon}
                            </motion.div>

                            {/* Label */}
                            <div className={`mt-2 px-3 py-1 bg-black/80 rounded border border-gray-700 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                                {node.label}
                                {isLocked && <span className="block text-[10px] text-red-500">Requires Lv.{node.requiredLevel}</span>}
                            </div>

                            {/* Pulsing effect for unlocked nodes */}
                            {!isLocked && (
                                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 bg-white`}></div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Player Avatar (Simple Indicator on Home for now) */}
                <motion.div
                    className="absolute text-4xl filter drop-shadow-lg"
                    style={{ left: '55%', top: '85%' }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    🧙‍♂️
                </motion.div>
            </div>
        </div>
    );
};
