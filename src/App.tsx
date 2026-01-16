
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { WordMode } from './components/WordMode';
import { StoryMode } from './components/StoryMode';
import { level1Data } from './data/level1';

function App() {
  const [currentMode, setCurrentMode] = useState<'dashboard' | 'word' | 'story'>('dashboard');

  const unit = level1Data.units[0]; // MVP: Load unit 1

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-neon-green selection:text-black">
      {currentMode === 'dashboard' && (
        <Dashboard onSelectMode={setCurrentMode} />
      )}

      {currentMode === 'word' && (
        <WordMode
          unit={unit}
          onBack={() => setCurrentMode('dashboard')}
        />
      )}

      {currentMode === 'story' && (
        <StoryMode
          unit={unit}
          onBack={() => setCurrentMode('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
