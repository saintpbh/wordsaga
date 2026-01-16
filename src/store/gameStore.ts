
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UnitStatus {
    unitId: string;
    isCompleted: boolean;
    knownWords: string[]; // List of word strings that are marked as 'known'
}

interface SRSStats {
    word: string;
    repetition: number;
    interval: number; // days
    easeFactor: number;
    nextReviewDate: number; // timestamp
}

interface DungeonConfig {
    trapWords: string[];
    bossId: string | null;
    isVerified: boolean;
}

interface GameState {
    xp: number;
    level: number;
    title: string;
    unitStatuses: UnitStatus[];
    inventory: string[];
    srsStats: Record<string, SRSStats>;
    myDungeon: DungeonConfig; // User's created dungeon
    heroEvolutions: Record<string, boolean>; // heroId -> isEvolved

    // Actions
    addXp: (amount: number) => void;
    markWordKnown: (unitId: string, word: string, grade?: number) => void;
    markUnitCompleted: (unitId: string) => void;
    getUnitStatus: (unitId: string) => UnitStatus | undefined;
    spendXp: (amount: number) => boolean;
    addToInventory: (itemId: string) => void;
    getDueWords: () => string[];
    updateDungeon: (config: Partial<DungeonConfig>) => void;
    evolveHero: (heroId: string) => void;
    advanceLevel: () => void; // New action
}

const TITLES = [
    { xp: 0, title: '중1 용사' },
    { xp: 100, title: '중2 모험가' },
    { xp: 300, title: '전설의 암기왕' },
];

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            title: '중1 용사',
            unitStatuses: [],
            inventory: [],
            srsStats: {},
            myDungeon: { trapWords: [], bossId: null, isVerified: false },
            heroEvolutions: {},

            addXp: (amount) => {
                const newXp = get().xp + amount;
                const newTitleObj = [...TITLES].reverse().find(t => newXp >= t.xp) || TITLES[0];
                set({ xp: newXp, title: newTitleObj.title });
            },

            markWordKnown: (unitId, word, grade = 4) => {
                set((state) => {
                    // Update Unit Status
                    const statuses = [...state.unitStatuses];
                    const existingIdx = statuses.findIndex(u => u.unitId === unitId);

                    if (existingIdx >= 0) {
                        if (!statuses[existingIdx].knownWords.includes(word)) {
                            statuses[existingIdx].knownWords.push(word);
                        }
                    } else {
                        statuses.push({ unitId, isCompleted: false, knownWords: [word] });
                    }

                    // Update SRS Stats (SM-2 Algorithm)
                    const currentStats = state.srsStats[word] || {
                        word,
                        repetition: 0,
                        interval: 0,
                        easeFactor: 2.5,
                        nextReviewDate: Date.now()
                    };

                    let { repetition, interval, easeFactor } = currentStats;

                    if (grade >= 3) {
                        if (repetition === 0) interval = 1;
                        else if (repetition === 1) interval = 6;
                        else interval = Math.round(interval * easeFactor);

                        repetition += 1;
                        easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
                        if (easeFactor < 1.3) easeFactor = 1.3;
                    } else {
                        repetition = 0;
                        interval = 1;
                    }

                    const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000); // days to ms

                    return {
                        unitStatuses: statuses,
                        srsStats: {
                            ...state.srsStats,
                            [word]: { word, repetition, interval, easeFactor, nextReviewDate }
                        }
                    };
                });
            },

            markUnitCompleted: (unitId) => {
                set((state) => {
                    const statuses = [...state.unitStatuses];
                    const existingIdx = statuses.findIndex(u => u.unitId === unitId);
                    if (existingIdx >= 0) {
                        statuses[existingIdx].isCompleted = true;
                    } else {
                        statuses.push({ unitId, isCompleted: true, knownWords: [] });
                    }
                    return { unitStatuses: statuses };
                });
            },

            getUnitStatus: (unitId) => {
                return get().unitStatuses.find(u => u.unitId === unitId);
            },

            spendXp: (amount) => {
                const currentXp = get().xp;
                if (currentXp >= amount) {
                    set((state) => ({ xp: state.xp - amount }));
                    return true;
                }
                return false;
            },

            addToInventory: (itemId) => {
                set((state) => {
                    if (state.inventory.includes(itemId)) return state;
                    return { inventory: [...state.inventory, itemId] };
                });
            },

            getDueWords: () => {
                const now = Date.now();
                const { srsStats } = get();
                return Object.values(srsStats)
                    .filter(stat => stat.nextReviewDate <= now)
                    .map(stat => stat.word);
            },

            updateDungeon: (config) => {
                set((state) => ({
                    myDungeon: { ...state.myDungeon, ...config }
                }));
            },

            evolveHero: (heroId) => {
                set((state) => ({
                    heroEvolutions: { ...state.heroEvolutions, [heroId]: true }
                }));
            },

            advanceLevel: () => {
                set((state) => ({ level: state.level + 1 }));
            }
        }),
        {
            name: 'word-saga-storage',
        }
    )
);
