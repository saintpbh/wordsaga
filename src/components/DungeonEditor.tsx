
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Skull, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HEROES } from '../data/heroes';

interface DungeonEditorProps {
    onBack: () => void;
}

export const DungeonEditor: React.FC<DungeonEditorProps> = ({ onBack }) => {
    const { unitStatuses, inventory, myDungeon, updateDungeon } = useGameStore();
    const [selectedWords, setSelectedWords] = useState<string[]>(myDungeon.trapWords);
    const [selectedBoss, setSelectedBoss] = useState<string | null>(myDungeon.bossId);
    const [isTestRun, setIsTestRun] = useState(false);
    const [dungeonCode, setDungeonCode] = useState<string | null>(myDungeon.isVerified ? 'DUNGEON-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null);

    const knownWords = useMemo(() => {
        return unitStatuses.flatMap(u => u.knownWords);
    }, [unitStatuses]);

    const myHeroes = HEROES.filter(h => inventory.includes(h.id));

    const toggleWord = (word: string) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(w => w !== word));
        } else {
            if (selectedWords.length < 5) {
                setSelectedWords(prev => [...prev, word]);
            }
        }
    };

    const handleSave = () => {
        updateDungeon({
            trapWords: selectedWords,
            bossId: selectedBoss,
            isVerified: false // Must re-verify on change
        });
        setDungeonCode(null);
        setIsTestRun(true);
    };

    // Mock Test Run (Simply a success for MVP)
    const completeTestRun = () => {
        updateDungeon({ isVerified: true });
        setIsTestRun(false);
        setDungeonCode('DUNGEON-' + Math.random().toString(36).substr(2, 9).toUpperCase());
    };

    if (isTestRun) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white">
                <h1 className="text-4xl text-red-600 font-bold mb-4">TESTING DUNGEON...</h1>
                <p className="mb-8">Prove you can survive your own trap!</p>
                <div className="flex gap-4">
                    <div className="text-6xl animate-bounce">
                        {HEROES.find(h => h.id === selectedBoss)?.emoji || '💀'}
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-sm text-gray-400 mb-2">Traps Active:</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {selectedWords.map(w => (
                            <span key={w} className="bg-red-900 border border-red-500 px-2 py-1 text-xs">{w}</span>
                        ))}
                    </div>
                </div>

                <button
                    onClick={completeTestRun}
                    className="retro-btn bg-neon-green text-black mt-12 py-4 px-8"
                >
                    SIMULATE CLEAR (MVP)
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8 relative flex flex-col items-center">
            <button onClick={onBack} className="absolute top-8 left-8 text-white hover:text-neon-pink transition-colors">
                <ArrowLeft size={32} />
            </button>

            {/* Header */}
            <div className="flex justify-between items-center w-full max-w-2xl mb-8 border-b-4 border-white pb-4">
                <h1 className="text-4xl font-bold text-red-500 glitch-text flex items-center gap-4">
                    <Skull size={40} /> DUNGEON MAKER
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl">

                {/* STEP 1: Select Traps */}
                <div className="flex flex-col">
                    <h2 className="text-xl text-neon-cyan mb-4">1. SELECT TRAPS ({selectedWords.length}/5)</h2>
                    <div className="retro-card bg-black h-96 overflow-y-auto p-4 grid grid-cols-2 gap-2">
                        {knownWords.map(word => (
                            <button
                                key={word}
                                onClick={() => toggleWord(word)}
                                className={`p-2 text-sm border-2 text-left ${selectedWords.includes(word)
                                    ? 'border-red-500 bg-red-900/50 text-white'
                                    : 'border-gray-700 text-gray-400 hover:border-white'
                                    }`}
                            >
                                {word}
                            </button>
                        ))}
                        {knownWords.length === 0 && <p className="text-gray-500 col-span-2 text-center p-4">No words mastered yet.</p>}
                    </div>
                </div>

                {/* STEP 2: Assign Boss */}
                <div className="flex flex-col">
                    <h2 className="text-xl text-neon-pink mb-4">2. ASSIGN BOSS</h2>
                    <div className="retro-card bg-black h-48 mb-8 p-4 flex items-center justify-center gap-4 overflow-x-auto">
                        {myHeroes.map(hero => (
                            <button
                                key={hero.id}
                                onClick={() => setSelectedBoss(hero.id)}
                                className={`flex flex-col items-center p-4 border-2 transition-all ${selectedBoss === hero.id
                                    ? 'border-gold bg-gold/20 scale-110'
                                    : 'border-gray-700 grayscale hover:grayscale-0'
                                    }`}
                            >
                                <div className="text-4xl mb-2">{hero.emoji}</div>
                                <div className="text-[10px]">{hero.name}</div>
                            </button>
                        ))}
                        {myHeroes.length === 0 && <p className="text-gray-500">No heroes recruited.</p>}
                    </div>

                    {/* Action Area */}
                    <div className="retro-card p-6 bg-gray-800 text-center">
                        {dungeonCode ? (
                            <div>
                                <p className="text-green-400 mb-2">DUNGEON VERIFIED!</p>
                                <div className="bg-black border-2 border-green-500 p-4 font-mono text-2xl tracking-widest text-green-500 mb-4 select-all">
                                    {dungeonCode}
                                </div>
                                <p className="text-xs text-gray-400">Share this code with friends!</p>
                                <button
                                    onClick={handleSave} // Resharing basically acts like a re-save here or we could just add a "Reset"
                                    className="text-gray-500 text-xs mt-4 underline"
                                >
                                    Edit Dungeon
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={selectedWords.length === 0 || !selectedBoss}
                                className={`retro-btn w-full py-4 text-xl font-bold flex items-center justify-center gap-2 ${selectedWords.length > 0 && selectedBoss
                                    ? 'bg-gold text-black'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Play size={24} /> TEST & PUBLISH
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
