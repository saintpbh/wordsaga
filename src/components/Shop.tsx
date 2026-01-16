
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HEROES, type Hero } from '../data/heroes';

interface ShopProps {
    onBack: () => void;
}

export const Shop: React.FC<ShopProps> = ({ onBack }) => {
    const { xp, spendXp, addToInventory, inventory } = useGameStore();
    const [isSummoning, setIsSummoning] = useState(false);
    const [summonResult, setSummonResult] = useState<Hero | null>(null);

    const handleSummon = () => {
        if (xp < 100) return;

        if (spendXp(100)) {
            setIsSummoning(true);
            setSummonResult(null);

            // Random summon logic
            setTimeout(() => {
                const rand = Math.random();
                let rarity: 'common' | 'rare' | 'legendary' = 'common';
                if (rand > 0.95) rarity = 'legendary';
                else if (rand > 0.7) rarity = 'rare';

                const pool = HEROES.filter(h => h.rarity === rarity);
                const hero = pool[Math.floor(Math.random() * pool.length)];

                setSummonResult(hero);
                addToInventory(hero.id);
                setIsSummoning(false);
            }, 2000); // 2s animation duration
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 p-8 relative flex flex-col items-center">
            <button onClick={onBack} className="absolute top-8 left-8 text-white hover:text-neon-pink transition-colors">
                <ArrowLeft size={32} />
            </button>

            {/* Header */}
            <div className="flex justify-between items-center w-full max-w-2xl mb-12 border-b-4 border-white pb-4">
                <h1 className="text-4xl font-bold text-neon-pink glitch-text flex items-center gap-4">
                    <ShoppingBag size={40} /> HERO SHOP
                </h1>
                <div className="flex items-center gap-2 text-2xl text-gold">
                    <Coins /> {xp} XP
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
                {/* Summon Area */}
                <div className="flex flex-col items-center">
                    <div className="retro-card p-8 w-full h-80 flex flex-col items-center justify-center relative overflow-hidden bg-gray-900 border-neon-cyan">
                        <AnimatePresence>
                            {!isSummoning && !summonResult && (
                                <motion.div
                                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                    transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                                    className="text-9xl mb-4 cursor-pointer"
                                    onClick={handleSummon}
                                >
                                    📦
                                </motion.div>
                            )}
                            {isSummoning && (
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="text-9xl mb-4"
                                >
                                    📦
                                </motion.div>
                            )}
                            {summonResult && (
                                <motion.div
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="text-9xl mb-4 text-shadow-glow">{summonResult.emoji}</div>
                                    <h3 className={`text-2xl font-bold uppercase mb-1 ${summonResult.rarity === 'legendary' ? 'text-gold' :
                                        summonResult.rarity === 'rare' ? 'text-neon-pink' : 'text-white'
                                        }`}>
                                        {summonResult.name}
                                    </h3>
                                    <span className="text-xs text-gray-400 uppercase tracking-widest">{summonResult.rarity}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleSummon}
                        disabled={isSummoning || xp < 100}
                        className={`retro-btn mt-8 py-4 px-12 text-xl font-bold w-full ${xp < 100 ? 'opacity-50 cursor-not-allowed border-gray-500 text-gray-500' : 'bg-neon-lime text-black border-neon-lime'
                            }`}
                    >
                        {isSummoning ? 'SUMMONING...' : summonResult ? 'SUMMON AGAIN (100 XP)' : 'SUMMON HERO (100 XP)'}
                    </button>
                </div>

                {/* Inventory Area */}
                <div className="retro-card p-6 bg-gray-900 h-full max-h-[600px] overflow-y-auto">
                    <h3 className="text-xl text-white mb-6 uppercase tracking-widest border-b-2 border-gray-700 pb-2">My Collection</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {HEROES.map(hero => {
                            const isOwned = inventory.includes(hero.id);
                            return (
                                <div key={hero.id} className={`aspect-square border-2 flex flex-col items-center justify-center p-2 transition-all ${isOwned ?
                                    hero.rarity === 'legendary' ? 'border-gold bg-gold/10' :
                                        hero.rarity === 'rare' ? 'border-neon-pink bg-neon-pink/10' :
                                            'border-gray-500 bg-gray-800'
                                    : 'border-gray-800 bg-black opacity-30 grayscale'
                                    }`}>
                                    <div className="text-4xl mb-2">{isOwned ? hero.emoji : '?'}</div>
                                    {isOwned && <div className="text-[10px] text-center text-gray-300 leading-tight">{hero.name}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
