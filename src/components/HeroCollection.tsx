
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Star, Sparkles, Flame, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HEROES } from '../data/heroes';
import type { Hero } from '../data/heroes';

interface HeroCollectionProps {
    onBack: () => void;
}

export const HeroCollection: React.FC<HeroCollectionProps> = ({ onBack }) => {
    const { inventory, heroEvolutions, evolveHero, unitStatuses } = useGameStore();
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    // Check if a word is known (mastered)
    const isWordKnown = (word: string) => {
        return unitStatuses.some(u => u.knownWords.some(w => w.toLowerCase() === word.toLowerCase()));
    };

    const handleEvolve = () => {
        if (!selectedHero || !selectedHero.evolution) return;
        evolveHero(selectedHero.id);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 relative overflow-hidden font-sans">
            <button onClick={onBack} className="absolute top-8 left-8 text-white z-50 hover:text-red-400 transition-colors">
                <ArrowLeft size={32} />
            </button>

            <h1 className="text-4xl text-center mb-8 font-bold text-shadow-glow text-gold">HERO BARRACKS</h1>

            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto h-[80vh] bg-gray-800 rounded-xl border-4 border-gray-600 p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                {/* Hero List */}
                <div className="w-full md:w-1/2 overflow-y-auto grid grid-cols-3 gap-4 auto-rows-min pr-4 custom-scrollbar">
                    {HEROES.map(hero => {
                        const isOwned = inventory.includes(hero.id);
                        const isEvolved = heroEvolutions[hero.id];
                        const currentEmoji = isEvolved && hero.evolution ? hero.evolution.emoji : hero.emoji;

                        return (
                            <motion.div
                                key={hero.id}
                                onClick={() => isOwned && setSelectedHero(hero)}
                                whileHover={isOwned ? { scale: 1.05, borderColor: '#FFF' } : {}}
                                whileTap={isOwned ? { scale: 0.95 } : {}}
                                className={`aspect-square rounded-xl border-4 flex items-center justify-center text-5xl relative cursor-pointer transition-all
                                ${isOwned
                                        ? isEvolved ? 'bg-purple-900 border-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-gray-700 border-gray-500'
                                        : 'bg-gray-900 border-gray-800 opacity-50 grayscale'
                                    }
                                ${selectedHero?.id === hero.id ? 'ring-4 ring-gold' : ''}
                            `}
                            >
                                {!isOwned && <Lock className="absolute opacity-50" size={32} />}
                                {currentEmoji}
                                {isEvolved && <div className="absolute -top-2 -right-2 text-yellow-400"><Star fill="currentColor" size={20} /></div>}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Hero Detail / Evolution Panel */}
                <div className="w-full md:w-1/2 bg-black/40 rounded-xl border-2 border-gray-700 p-8 flex flex-col items-center justify-center text-center relative">
                    {selectedHero ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedHero.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full h-full flex flex-col items-center"
                            >
                                {(() => {
                                    const isEvolved = heroEvolutions[selectedHero.id];
                                    const evolution = selectedHero.evolution;
                                    const displayName = isEvolved && evolution ? evolution.name : selectedHero.name;
                                    const displayEmoji = isEvolved && evolution ? evolution.emoji : selectedHero.emoji;
                                    const displayDesc = isEvolved && evolution ? evolution.description : selectedHero.description;

                                    // Evolution Logic
                                    const canEvolve = evolution && !isEvolved && evolution.requiredWords.every(w => isWordKnown(w));

                                    return (
                                        <>
                                            <div className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse">
                                                {displayEmoji}
                                            </div>
                                            <h2 className="text-3xl font-bold text-neon-cyan mb-2">{displayName}</h2>
                                            <div className={`px-3 py-1 rounded text-sm font-bold uppercase mb-4 ${selectedHero.rarity === 'legendary' ? 'bg-gold text-black' : selectedHero.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                                {selectedHero.rarity}
                                            </div>
                                            <p className="text-gray-400 mb-8 italic">"{displayDesc}"</p>

                                            {/* Evolution Tree */}
                                            {evolution && !isEvolved && (
                                                <div className="w-full bg-gray-900 p-6 rounded-lg border-2 border-gray-700">
                                                    <h3 className="text-gold font-bold mb-4 flex items-center justify-center gap-2">
                                                        <Sparkles size={20} /> EVOLUTION REQUIREMENTS
                                                    </h3>
                                                    <div className="flex flex-col gap-2 mb-6">
                                                        {evolution.requiredWords.map(word => {
                                                            const done = isWordKnown(word);
                                                            return (
                                                                <div key={word} className={`flex items-center justify-between p-2 rounded ${done ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                                    <span>{word}</span>
                                                                    {done ? <Check size={16} /> : <Lock size={16} />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <button
                                                        onClick={handleEvolve}
                                                        disabled={!canEvolve}
                                                        className={`w-full py-4 text-xl font-bold rounded flex items-center justify-center gap-2 transition-all
                                                        ${canEvolve
                                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 shadow-[0_0_20px_#d946ef]'
                                                                : 'bg-gray-700 opacity-50 cursor-not-allowed'
                                                            }
                                                    `}
                                                    >
                                                        {canEvolve ? <><Flame /> AWAKEN HERO</> : "LOCKED"}
                                                    </button>
                                                </div>
                                            )}

                                            {isEvolved && (
                                                <div className="w-full bg-purple-900/20 p-6 rounded-lg border-2 border-purple-500 text-purple-300 font-bold flex items-center justify-center gap-2">
                                                    <Star fill="currentColor" /> FULLY EVOLVED
                                                </div>
                                            )}
                                            {!evolution && (
                                                <div className="text-gray-600">No further evolution available.</div>
                                            )}
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <Lock size={64} className="mb-4 opacity-50" />
                            <p>Select a Hero to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
