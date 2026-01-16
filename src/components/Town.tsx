
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HEROES } from '../data/heroes';

interface TownProps {
    onBack: () => void;
}

export const Town: React.FC<TownProps> = ({ onBack }) => {
    const { xp, level, unitStatuses, inventory } = useGameStore();

    const knownWordsCount = useMemo(() => {
        return unitStatuses.reduce((acc, unit) => acc + unit.knownWords.length, 0);
    }, [unitStatuses]);

    // Building Levels
    const castleLevel = Math.min(Math.floor(level / 2) + 1, 5);
    const libraryLevel = Math.min(Math.floor(knownWordsCount / 5) + 1, 5);
    const barracksLevel = Math.min(Math.floor(inventory.length / 3) + 1, 5);

    // Get Heroes for population
    const myHeroes = HEROES.filter(h => inventory.includes(h.id));

    return (
        <div className="min-h-screen bg-green-900/50 relative overflow-hidden flex flex-col items-center">
            {/* Background Pattern (Grass) */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#0f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <button onClick={onBack} className="absolute top-8 left-8 text-white z-50 hover:text-neon-pink transition-colors">
                <ArrowLeft size={32} />
            </button>

            {/* Header */}
            <div className="relative z-10 mt-8 mb-12 text-center">
                <h1 className="text-4xl font-bold text-gold text-shadow-glow mb-2">MY KINGDOM</h1>
                <p className="text-neon-lime text-xs tracking-widest">LEVEL {level} • POPULATION {inventory.length}</p>
            </div>

            {/* Village Area */}
            <div className="relative w-full max-w-4xl h-[600px] bg-green-800/80 rounded-xl border-4 border-green-600 shadow-2xl p-8 overflow-hidden group">

                {/* Buildings Grid */}
                <div className="grid grid-cols-3 gap-8 h-full place-items-center relative z-10">

                    {/* Barracks */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-6xl mb-2 relative"
                        >
                            {barracksLevel >= 5 ? '🏰' : barracksLevel >= 3 ? '🎪' : '⛺'}
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-[10px] px-1 rounded text-white border border-white">
                                Lv.{barracksLevel}
                            </div>
                        </motion.div>
                        <div className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Barracks</div>
                        <div className="text-[10px] text-gray-300">Heroes: {inventory.length}</div>
                    </div>

                    {/* Castle (Main) */}
                    <div className="flex flex-col items-center mb-24">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-8xl mb-2 relative drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                        >
                            {castleLevel >= 5 ? '🏯' : castleLevel >= 3 ? '🏰' : '🏠'}
                            <div className="absolute -bottom-2 -right-2 bg-gold text-black text-xs px-2 font-bold rounded border border-white">
                                Lv.{castleLevel}
                            </div>
                        </motion.div>
                        <div className="text-sm font-bold text-gold bg-black/50 px-3 py-1 rounded border border-gold">Main Castle</div>
                        <div className="text-[10px] text-gray-300">Player Lv.{level}</div>
                    </div>

                    {/* Library */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-6xl mb-2 relative"
                        >
                            {libraryLevel >= 5 ? '🏛️' : libraryLevel >= 3 ? '🏫' : '🏚️'}
                            <div className="absolute -bottom-2 -right-2 bg-purple-600 text-[10px] px-1 rounded text-white border border-white">
                                Lv.{libraryLevel}
                            </div>
                        </motion.div>
                        <div className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Library</div>
                        <div className="text-[10px] text-gray-300">Words: {knownWordsCount}</div>
                    </div>
                </div>

                {/* Hero Population (Roaming) */}
                {myHeroes.map((hero) => (
                    <motion.div
                        key={hero.id}
                        initial={{ x: Math.random() * 800, y: Math.random() * 500 }}
                        animate={{
                            x: [null, Math.random() * 800, Math.random() * 800],
                            y: [null, Math.random() * 500, Math.random() * 500]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 10 + Math.random() * 20,
                            repeatType: 'mirror',
                            ease: 'linear'
                        }}
                        className="absolute text-2xl z-0 select-none pointer-events-none opacity-80"
                    >
                        {hero.emoji}
                    </motion.div>
                ))}

            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-2xl text-center">
                <div className="bg-black/50 p-4 border border-gray-600 rounded">
                    <h3 className="text-gray-400 text-xs uppercase">Total XP</h3>
                    <p className="text-xl font-bold text-gold">{xp}</p>
                </div>
                <div className="bg-black/50 p-4 border border-gray-600 rounded">
                    <h3 className="text-gray-400 text-xs uppercase">Words Mastered</h3>
                    <p className="text-xl font-bold text-neon-cyan">{knownWordsCount}</p>
                </div>
                <div className="bg-black/50 p-4 border border-gray-600 rounded">
                    <h3 className="text-gray-400 text-xs uppercase">Heroes Recruited</h3>
                    <p className="text-xl font-bold text-neon-pink">{inventory.length}</p>
                </div>
            </div>
        </div>
    );
};
