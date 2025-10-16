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
import RefugeScreen from './components/RefugeScreen';
import EventScreen from './components/EventScreen';
import CraftingScreen from './components/CraftingScreen';
import LevelUpScreen from './components/LevelUpScreen';
import CombatScreen from './components/CombatScreen';
import { useItemDatabaseStore } from './data/itemDatabase';
import { useEventDatabaseStore } from './data/eventDatabase';
import { useRecipeDatabaseStore } from './data/recipeDatabase';
import { useEnemyDatabaseStore } from './data/enemyDatabase';
import { useMainQuestDatabaseStore } from './data/mainQuestDatabase';
import MainQuestScreen from './components/MainQuestScreen';

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const isInventoryOpen = useGameStore((state) => state.isInventoryOpen);
  const isInRefuge = useGameStore((state) => state.isInRefuge);
  const isCraftingOpen = useGameStore((state) => state.isCraftingOpen);
  const setMap = useGameStore((state) => state.setMap);
  const initCharacter = useCharacterStore((state) => state.initCharacter);
  const scaleStyle = useGameScale();

  const { loadDatabase: loadItemDatabase, isLoaded: itemsLoaded } = useItemDatabaseStore();
  const { loadDatabase: loadEventDatabase, isLoaded: eventsLoaded } = useEventDatabaseStore();
  const { loadDatabase: loadRecipeDatabase, isLoaded: recipesLoaded } = useRecipeDatabaseStore();
  const { loadDatabase: loadEnemyDatabase, isLoaded: enemiesLoaded } = useEnemyDatabaseStore();
  const { loadDatabase: loadMainQuestDatabase, isLoaded: mainQuestLoaded } = useMainQuestDatabaseStore();


  useEffect(() => {
    loadItemDatabase();
    loadEventDatabase();
    loadRecipeDatabase();
    loadEnemyDatabase();
    loadMainQuestDatabase();
  }, [loadItemDatabase, loadEventDatabase, loadRecipeDatabase, loadEnemyDatabase, loadMainQuestDatabase]);

  useEffect(() => {
    if (itemsLoaded && eventsLoaded && recipesLoaded && enemiesLoaded && mainQuestLoaded) {
      setMap();
      initCharacter();
    }
  }, [itemsLoaded, eventsLoaded, recipesLoaded, enemiesLoaded, mainQuestLoaded, setMap, initCharacter]);

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
      case GameState.EVENT_SCREEN:
        return <EventScreen />;
      case GameState.LEVEL_UP_SCREEN:
        return <LevelUpScreen />;
       case GameState.MAIN_QUEST:
        return <MainQuestScreen />;
      case GameState.COMBAT:
        return (
          <>
            <GameScreen />
            <CombatScreen />
          </>
        );
      case GameState.IN_GAME:
        return (
          <>
            <GameScreen />
            {isInventoryOpen && <InventoryScreen />}
            {isInRefuge && !isInventoryOpen && !isCraftingOpen && <RefugeScreen />}
            {isCraftingOpen && <CraftingScreen />}
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
          border: '2px solid rgba(110, 231, 183, 0.2)',
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