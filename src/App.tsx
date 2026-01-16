
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { WordMode } from './components/WordMode';
import { StoryMode } from './components/StoryMode';
import { Shop } from './components/Shop';
import { DefenseMode } from './components/DefenseMode';
import { Town } from './components/Town';
import { DungeonEditor } from './components/DungeonEditor';
import { RhythmMode } from './components/RhythmMode';
import { VoiceMode } from './components/VoiceMode';
import { HeroCollection } from './components/HeroCollection';
import { RaidMode } from './components/RaidMode';
import { EtymologyMode } from './components/EtymologyMode';
import { WorldMap } from './components/WorldMap';
import { ALL_LEVELS } from './data/allLevels';
import { useGameStore } from './store/gameStore';

function App() {
  const [currentMode, setCurrentMode] = useState<'map' | 'dashboard' | 'word' | 'story' | 'shop' | 'defense' | 'town' | 'dungeon' | 'rhythm' | 'voice' | 'collection' | 'raid' | 'etymology'>('map');
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const { level, advanceLevel } = useGameStore();

  const currentLevelData = selectedLevelId
    ? ALL_LEVELS.find(l => l.id === selectedLevelId) || ALL_LEVELS[0]
    : ALL_LEVELS[Math.max(0, Math.min(level - 1, ALL_LEVELS.length - 1))];

  const unit = currentLevelData?.units[0] || ALL_LEVELS[0].units[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-neon-green selection:text-black">

      {currentMode === 'map' && (
        <WorldMap onSelectNode={(mode, levelId) => {
          if (levelId) setSelectedLevelId(levelId);
          setCurrentMode(mode);
        }} />
      )}

      {currentMode === 'dashboard' && (
        <Dashboard
          onSelectMode={(mode: any) => setCurrentMode(mode)}
          onBack={() => setCurrentMode('map')}
        />
      )}

      {currentMode === 'word' && (
        <WordMode
          unit={unit}
          onBack={() => setCurrentMode('story')}
        />
      )}

      {currentMode === 'story' && (
        <StoryMode
          unit={unit}
          onBack={() => {
            // If this was the current level, advance!
            if (currentLevelData.id === `level_${level}`) { // Assuming id format matches
              advanceLevel();
            }
            setCurrentMode('map');
          }}
        />
      )}

      {currentMode === 'shop' && (
        <Shop onBack={() => setCurrentMode('dashboard')} />
      )}

      {currentMode === 'defense' && (
        <DefenseMode onBack={() => setCurrentMode('dashboard')} />
      )}

      {currentMode === 'town' && (
        <Town onBack={() => setCurrentMode('dashboard')} />
      )}

      {currentMode === 'dungeon' && (
        <DungeonEditor onBack={() => setCurrentMode('dashboard')} />
      )}

      {currentMode === 'rhythm' && (
        <RhythmMode onBack={() => setCurrentMode('map')} />
      )}

      {currentMode === 'voice' && (
        <VoiceMode onBack={() => setCurrentMode('map')} />
      )}

      {currentMode === 'collection' && (
        <HeroCollection onBack={() => setCurrentMode('dashboard')} />
      )}

      {currentMode === 'raid' && (
        <RaidMode onBack={() => setCurrentMode('map')} />
      )}

      {currentMode === 'etymology' && (
        <EtymologyMode onBack={() => setCurrentMode('map')} />
      )}

      {/* Version Indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-600 font-pixel opacity-50 select-none">
        v0.9
      </div>
    </div>
  );
}

export default App;
