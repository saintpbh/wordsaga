
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { BookOpen, Sword } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
    onSelectMode: (mode: 'word' | 'story') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectMode }) => {
    const { xp, title } = useGameStore();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center w-full max-w-2xl"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-neon-pink mb-8 glitch-text tracking-tighter">WORD SAGA</h1>

                {/* Retro Profile Card */}
                <div className="retro-card p-6 w-full mx-auto relative bg-navy-900">
                    <div className="absolute top-2 left-2 w-3 h-3 bg-neon-cyan animate-pulse"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-neon-cyan animate-pulse"></div>

                    <div className="flex justify-between items-end mb-4 border-b-2 border-dashed border-gray-600 pb-4">
                        <div className="text-left">
                            <p className="text-neon-lime text-xs mb-1">PLAYER 1</p>
                            <div className="text-2xl text-gold font-bold">{title}</div>
                        </div>
                        <div className="text-right">
                            <p className="text-neon-pink text-xs mb-1">SCORE</p>
                            <p className="text-xl text-white">{xp.toString().padStart(6, '0')}</p>
                        </div>
                    </div>

                    <div className="w-full bg-gray-900 h-4 border-2 border-white p-0.5">
                        <motion.div
                            className="bg-gradient-to-r from-yellow-400 to-red-500 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((xp % 100), 100)}%` }}
                        />
                    </div>
                    <p className="text-right text-[10px] text-gray-400 mt-1">NEXT LEVEL »</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <ModeCard
                    title="Word Training"
                    description="Master the vocabulary to gain power."
                    icon={<BookOpen size={48} />}
                    onClick={() => onSelectMode('word')}
                    color="border-neon-green"
                />
                <ModeCard
                    title="Story Dungeon"
                    description="Use your knowledge to defeat enemies."
                    icon={<Sword size={48} />}
                    onClick={() => onSelectMode('story')}
                    color="border-gold"
                />
            </div>
        </div>
    );
};


interface ModeCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}

const ModeCard: React.FC<ModeCardProps> = ({ title, description, icon, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`retro-btn p-8 bg-gray-800 ${color} flex flex-col items-center text-center group h-full justify-between`}
    >
        <div className="mb-4 text-white group-hover:text-neon-cyan transition-colors">{icon}</div>
        <h2 className="text-xl font-bold text-neon-green mb-2 tracking-widest leading-relaxed">{title}</h2>
        <p className="text-gray-400 text-xs font-pixel leading-loose">{description}</p>
    </motion.button>
);
