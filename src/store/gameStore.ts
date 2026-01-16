
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { level1Data, Word } from '../data/level1'; // Unused currently

interface UnitStatus {
    unitId: string;
    isCompleted: boolean;
    knownWords: string[]; // List of word strings that are marked as 'known'
}

interface GameState {
    xp: number;
    level: number;
    title: string;
    unitStatuses: UnitStatus[];

    // Actions
    addXp: (amount: number) => void;
    markWordKnown: (unitId: string, word: string) => void;
    markUnitCompleted: (unitId: string) => void;
    getUnitStatus: (unitId: string) => UnitStatus | undefined;
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

            addXp: (amount) => {
                const newXp = get().xp + amount;
                // Calculate new title/level based on XP
                const newTitleObj = [...TITLES].reverse().find(t => newXp >= t.xp) || TITLES[0];
                set({ xp: newXp, title: newTitleObj.title });
            },

            markWordKnown: (unitId, word) => {
                set((state) => {
                    const statuses = [...state.unitStatuses];
                    const existingIdx = statuses.findIndex(u => u.unitId === unitId);

                    if (existingIdx >= 0) {
                        if (!statuses[existingIdx].knownWords.includes(word)) {
                            statuses[existingIdx].knownWords.push(word);
                        }
                    } else {
                        statuses.push({ unitId, isCompleted: false, knownWords: [word] });
                    }
                    return { unitStatuses: statuses };
                });
            },

            markUnitCompleted: (unitId) => {
                set((state) => {
                    const statuses = [...state.unitStatuses];
                    const existingIdx = statuses.findIndex(u => u.unitId === unitId);
                    if (existingIdx >= 0) {
                        statuses[existingIdx].isCompleted = true;
                    } else {
                        // Should verify all words known first? adhering to MVP simplicity
                        statuses.push({ unitId, isCompleted: true, knownWords: [] });
                    }
                    return { unitStatuses: statuses };
                });
            },

            getUnitStatus: (unitId) => {
                return get().unitStatuses.find(u => u.unitId === unitId);
            }
        }),
        {
            name: 'word-saga-storage',
        }
    )
);
