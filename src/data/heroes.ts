
export interface Hero {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'legendary';
    description: string;
    emoji: string;
    evolution?: {
        name: string;
        emoji: string;
        description: string;
        requiredWords: string[];
    };
}

export const HEROES: Hero[] = [
    // Common
    {
        id: 'h_slime',
        name: 'Green Slime',
        rarity: 'common',
        description: 'A sticky little friend.',
        emoji: '🦠',
        evolution: {
            name: 'King Slime',
            emoji: '👑',
            description: 'Ruler of the sticky puddle.',
            requiredWords: ['Clean', 'Recycle', 'Environment']
        }
    },
    {
        id: 'h_bat',
        name: 'Cave Bat',
        rarity: 'common',
        description: 'Screeches at high frequencies.',
        emoji: '🦇',
        evolution: {
            name: 'Vampire Bat',
            emoji: '🧛',
            description: 'Thirsty for knowledge (and blood).',
            requiredWords: ['Brave', 'Protect', 'Volunteer']
        }
    },
    {
        id: 'h_rat',
        name: 'Dungeon Rat',
        rarity: 'common',
        description: 'Likes cheese and darkness.',
        emoji: '🐀',
        evolution: {
            name: 'Master Splinter',
            emoji: '🥋',
            description: 'Sensei of the sewers.',
            requiredWords: ['Trash', 'Pick up', 'Park']
        }
    },

    // Rare
    { id: 'h_skeleton', name: 'Bone Warrior', rarity: 'rare', description: 'Rattles when it moves.', emoji: '💀' },
    { id: 'h_ghost', name: 'Lost Soul', rarity: 'rare', description: 'Boo!', emoji: '👻' },
    { id: 'h_goblin', name: 'Loot Goblin', rarity: 'rare', description: 'Obsessed with gold.', emoji: '👺' },

    // Legendary
    { id: 'h_dragon', name: 'Red Dragon', rarity: 'legendary', description: 'Breaths pixelated fire.', emoji: '🐉' },
    { id: 'h_ufo', name: 'Invader UFO', rarity: 'legendary', description: 'From a galaxy far away.', emoji: '🛸' },
    { id: 'h_wizard', name: 'Grand Wizard', rarity: 'legendary', description: 'Master of the arcane.', emoji: '🧙‍♂️' },
];
