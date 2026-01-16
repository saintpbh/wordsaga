
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shovel, Hammer, Pickaxe, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ROOTS, ARTIFACTS, DISCOVERIES } from '../data/etymology';
import type { Root, Artifact } from '../data/etymology';

interface EtymologyModeProps {
    onBack: () => void;
}

// Grid Cell for Excavation
interface Cell {
    id: number;
    isRevealed: boolean;
    hasItem: boolean;
    itemType?: 'root' | 'artifact' | 'rubble';
    contentId?: string;
}

export const EtymologyMode: React.FC<EtymologyModeProps> = ({ onBack }) => {
    const { addXp } = useGameStore();
    const [grid, setGrid] = useState<Cell[]>([]);
    const [foundRoots, setFoundRoots] = useState<Root[]>([]);
    const [foundArtifacts, setFoundArtifacts] = useState<Artifact[]>([]);
    const [selectedRoot, setSelectedRoot] = useState<Root | null>(null);
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [message, setMessage] = useState("Tap tiles to excavate the ruins!");
    const [unlockedWords, setUnlockedWords] = useState<string[]>([]);

    // Initialize Excavation Site
    useEffect(() => {
        initGrid();
    }, []);

    const initGrid = () => {
        let newGrid: Cell[] = Array(25).fill(null).map((_, i) => ({
            id: i,
            isRevealed: false,
            hasItem: false
        }));

        // Plant Roots
        ROOTS.forEach(root => {
            placeItem(newGrid, 'root', root.id);
        });

        // Plant Artifacts
        ARTIFACTS.forEach(art => {
            placeItem(newGrid, 'artifact', art.id);
        });

        // Fill some rubble
        for (let i = 0; i < 5; i++) {
            placeItem(newGrid, 'rubble', 'rubble');
        }

        setGrid(newGrid);
    };

    const placeItem = (grid: Cell[], type: 'root' | 'artifact' | 'rubble', contentId: string) => {
        let placed = false;
        while (!placed) {
            const idx = Math.floor(Math.random() * 25);
            if (!grid[idx].hasItem) {
                grid[idx].hasItem = true;
                grid[idx].itemType = type;
                grid[idx].contentId = contentId;
                placed = true;
            }
        }
    };

    const handleDig = (index: number) => {
        if (grid[index].isRevealed) return;

        const newGrid = [...grid];
        newGrid[index].isRevealed = true;
        setGrid(newGrid);

        const cell = newGrid[index];
        if (cell.hasItem) {
            if (cell.itemType === 'root') {
                const root = ROOTS.find(r => r.id === cell.contentId);
                if (root && !foundRoots.find(r => r.id === root.id)) {
                    setFoundRoots([...foundRoots, root]);
                    setMessage(`Found Root: ${root.root} (${root.meaning})!`);
                    addXp(20);
                }
            } else if (cell.itemType === 'artifact') {
                const artifact = ARTIFACTS.find(a => a.id === cell.contentId);
                if (artifact && !foundArtifacts.find(a => a.id === artifact.id)) {
                    setFoundArtifacts([...foundArtifacts, artifact]);
                    setMessage(`Found Artifact: ${artifact.prefix} (${artifact.meaning})!`);
                    addXp(15);
                }
            } else {
                setMessage("Just some rubble...");
            }
        } else {
            setMessage("Nothing here.");
        }
    };

    const handleCombine = () => {
        if (!selectedRoot || !selectedArtifact) return;

        const discovery = DISCOVERIES.find(d => d.rootId === selectedRoot.id && d.artifactId === selectedArtifact.id);

        if (discovery) {
            if (!unlockedWords.includes(discovery.targetWord)) {
                setUnlockedWords([...unlockedWords, discovery.targetWord]);
                setMessage(`DISCOVERY! ${discovery.targetWord} : ${discovery.description}`);
                addXp(100);
            } else {
                setMessage(`You already discovered ${discovery.targetWord}.`);
            }
        } else {
            setMessage("These parts don't fit together...");
        }

        setSelectedRoot(null);
        setSelectedArtifact(null);
    };

    return (
        <div className="min-h-screen bg-amber-900 flex flex-col items-center p-4 relative font-sans text-amber-50 selection:bg-amber-200 selection:text-amber-900">
            <button onClick={onBack} className="absolute top-4 left-4 text-amber-200 hover:text-white z-50">
                <ArrowLeft size={32} />
            </button>

            <h1 className="text-4xl font-bold mt-4 mb-2 text-amber-200 flex items-center gap-2" style={{ fontFamily: 'serif' }}>
                <Pickaxe /> ANCIENT RUINS
            </h1>
            <p className="mb-8 text-amber-300 italic">{message}</p>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">

                {/* Excavation Site */}
                <div className="w-full md:w-1/2 p-4 bg-amber-950 rounded-xl border-4 border-amber-800 shadow-2xl">
                    <h2 className="text-xl mb-4 font-bold text-center text-amber-400">EXCAVATION SITE</h2>
                    <div className="grid grid-cols-5 gap-2 aspect-square">
                        {grid.map((cell) => (
                            <motion.div
                                key={cell.id}
                                onClick={() => handleDig(cell.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`rounded cursor-pointer flex items-center justify-center font-bold text-sm select-none transition-colors
                                ${!cell.isRevealed
                                        ? 'bg-amber-700 hover:bg-amber-600 border-2 border-amber-600'
                                        : cell.hasItem
                                            ? cell.itemType === 'root' ? 'bg-stone-800 text-gold border-2 border-gold'
                                                : cell.itemType === 'artifact' ? 'bg-slate-800 text-cyan-400 border-2 border-cyan-400'
                                                    : 'bg-stone-600 text-stone-400'
                                            : 'bg-amber-900/50'
                                    }
                            `}
                            >
                                {cell.isRevealed && cell.hasItem && (
                                    cell.itemType === 'root' ? ROOTS.find(r => r.id === cell.contentId)?.root
                                        : cell.itemType === 'artifact' ? ARTIFACTS.find(a => a.id === cell.contentId)?.prefix
                                            : '..'
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Research Lab */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">

                    {/* Inventory */}
                    <div className="bg-amber-950/80 p-4 rounded-xl border-2 border-amber-700 h-1/2 overflow-y-auto">
                        <h3 className="text-lg font-bold mb-2 text-amber-300 flex items-center gap-2"><Shovel size={18} /> COLLECTED FOSSILS</h3>

                        <div className="mb-4">
                            <h4 className="text-xs uppercase text-stone-500 mb-1">Roots (Stems)</h4>
                            <div className="flex flex-wrap gap-2">
                                {foundRoots.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedRoot(r)}
                                        className={`px-3 py-1 rounded text-sm border font-bold ${selectedRoot?.id === r.id ? 'bg-gold text-black border-white' : 'bg-stone-800 text-gold border-stone-600'}`}
                                    >
                                        {r.root}
                                    </button>
                                ))}
                                {foundRoots.length === 0 && <span className="text-stone-600 text-sm">Dig to find roots...</span>}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase text-stone-500 mb-1">Artifacts (Prefixes)</h4>
                            <div className="flex flex-wrap gap-2">
                                {foundArtifacts.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedArtifact(a)}
                                        className={`px-3 py-1 rounded text-sm border font-bold ${selectedArtifact?.id === a.id ? 'bg-cyan-500 text-black border-white' : 'bg-slate-800 text-cyan-400 border-slate-600'}`}
                                    >
                                        {a.prefix}
                                    </button>
                                ))}
                                {foundArtifacts.length === 0 && <span className="text-stone-600 text-sm">Dig to find artifacts...</span>}
                            </div>
                        </div>
                    </div>

                    {/* Crafting Table */}
                    <div className="bg-stone-900 p-6 rounded-xl border-4 border-stone-700 flex flex-col items-center justify-center flex-grow relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-center p-2 ${selectedArtifact ? 'border-cyan-500 bg-slate-800/50 text-cyan-400' : 'border-stone-600 text-stone-600'}`}>
                                {selectedArtifact ? <div><div className="text-xl font-bold">{selectedArtifact.prefix}</div><div className="text-xs">{selectedArtifact.meaning}</div></div> : "Prefix"}
                            </div>
                            <div className="text-2xl text-stone-500">+</div>
                            <div className={`w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-center p-2 ${selectedRoot ? 'border-gold bg-stone-800/50 text-gold' : 'border-stone-600 text-stone-600'}`}>
                                {selectedRoot ? <div><div className="text-xl font-bold">{selectedRoot.root}</div><div className="text-xs">{selectedRoot.meaning}</div></div> : "Root"}
                            </div>
                        </div>

                        <button
                            onClick={handleCombine}
                            className={`px-8 py-3 rounded font-bold text-lg flex items-center gap-2 transition-all ${selectedRoot && selectedArtifact ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_#22c55e]' : 'bg-stone-700 text-stone-500 cursor-not-allowed'}`}
                        >
                            <Hammer /> RESTORE
                        </button>

                    </div>
                </div>
            </div>

            {/* Discovery Log */}
            <div className="w-full max-w-5xl mt-8">
                <h3 className="text-lg font-bold mb-2 text-amber-300">RESTORATION LOG</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedWords.map(word => {
                        const d = DISCOVERIES.find(x => x.targetWord === word);
                        if (!d) return null;
                        return (
                            <div key={word} className="bg-amber-100/10 border border-amber-500/30 p-3 rounded flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-full text-green-400"><Check size={16} /></div>
                                <div>
                                    <div className="font-bold text-amber-200">{d.targetWord}</div>
                                    <div className="text-xs text-amber-400/80">{d.meaning} - {d.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
