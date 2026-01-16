
export interface Word {
    word: string;
    definition?: string;
    meaning: string;
    example?: string;
    wrongMeanings?: string[];
}

export interface Unit {
    id: string;
    title?: string;
    words: Word[];
    story?: {
        title: string;
        content: string;
        translation: string;
    } | null;
}

export interface LevelData {
    id?: string;
    level?: number;
    title?: string;
    description?: string;
    units: Unit[];
    story?: any;
}

export const level1Data: LevelData = {
    "level": 1,
    "units": [
        {
            "id": "U1",
            "words": [
                { "word": "Brave", "definition": "Not afraid of danger", "meaning": "용감한" },
                { "word": "Protect", "definition": "To keep something safe", "meaning": "보호하다" },
                { "word": "Volunteer", "definition": "A person who does something without being paid", "meaning": "자원봉사자" },
                { "word": "Environment", "definition": "The air, water, and land in or on which people, animals, and plants live", "meaning": "환경" },
                { "word": "Recycle", "definition": "To treat things that have already been used so that they can be used again", "meaning": "재활용하다" },
                { "word": "Pick up", "definition": "To lift something slightly", "meaning": "줍다" },
                { "word": "Trash", "definition": "Waste material", "meaning": "쓰레기" },
                { "word": "Park", "definition": "A large public garden", "meaning": "공원" },
                { "word": "Clean", "definition": "Free from dirt, marks, or stains", "meaning": "깨끗한" },
                { "word": "Proud", "definition": "Feeling pleasure and satisfaction", "meaning": "자랑스러운" }
            ],
            "story": {
                "title": "The Brave Volunteer",
                "content": "Minjun is a [Brave] student. He wants to [Protect] the [Environment]. One day, he decided to become a [Volunteer]. He went to the [Park] to [Pick up] [Trash]. He wanted to [Clean] the area and [Recycle] bottles. His parents were very [Proud] of him.",
                "translation": "민준은 용감한 학생입니다. 그는 환경을 보호하고 싶어 합니다. 어느 날, 그는 자원봉사자가 되기로 결심했습니다. 그는 공원에 가서 쓰레기를 주웠습니다. 그는 그 지역을 청소하고 병들을 재활용하고 싶었습니다. 그의 부모님은 그를 매우 자랑스러워했습니다."
            }
        }
    ]
};
