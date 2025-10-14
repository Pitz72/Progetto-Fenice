import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { useCharacterStore } from './store/characterStore';
import { GameState } from './types';
import { useGameScale } from './hooks/useGameScale';
import BootScreen from './components/BootScreen';
import MainMenuScreen from './components/MainMenuScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoryScreen from './components/StoryScreen';
import OptionsScreen from './components/OptionsScreen';
import GameScreen from './components/GameScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import InventoryScreen from './components/InventoryScreen';
import { useItemDatabaseStore } from './data/itemDatabase';

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const isInventoryOpen = useGameStore((state) => state.isInventoryOpen);
  const setMap = useGameStore((state) => state.setMap);
  const initCharacter = useCharacterStore((state) => state.initCharacter);
  const scaleStyle = useGameScale();

  const { loadDatabase, isLoaded } = useItemDatabaseStore();

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  useEffect(() => {
    if (isLoaded) {
      setMap();
      initCharacter();
    }
  }, [isLoaded, setMap, initCharacter]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.INITIAL_BLACK_SCREEN:
      case GameState.PRESENTS_SCREEN:
      case GameState.INTERSTITIAL_BLACK_SCREEN:
      case GameState.BOOTING_SCREEN:
        return <BootScreen />;
      case GameState.MAIN_MENU:
        return <MainMenuScreen />;
      case GameState.INSTRUCTIONS_SCREEN:
        return <InstructionsScreen />;
      case GameState.STORY_SCREEN:
        return <StoryScreen />;
      case GameState.OPTIONS_SCREEN:
        return <OptionsScreen />;
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen />;
      case GameState.IN_GAME:
        return (
          <>
            <GameScreen />
            {isInventoryOpen && <InventoryScreen />}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen relative bg-black">
      {/* Il Monitor Virtuale */}
      <div 
        id="game-container" 
        className="bg-black text-green-400 overflow-hidden"
        style={{ 
          width: '1920px', 
          height: '1080px',
          ...scaleStyle
        }}
      >
        <div className="w-full h-full relative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
