import React, { useState, useCallback, useMemo } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { MENU_ITEMS } from '../constants';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState } from '../types';

const MainMenuScreen: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const setGameState = useGameStore((state) => state.setGameState);
  const setMap = useGameStore((state) => state.setMap);
  const startCutscene = useGameStore((state) => state.startCutscene);
  const initCharacter = useCharacterStore((state) => state.initCharacter);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
  }, []);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
  }, []);
  
  const handleEnter = useCallback(() => {
    const selectedItem = MENU_ITEMS[selectedIndex];
    
    if (selectedItem === "Nuova Partita") {
      setMap(); // Resetta il mondo di gioco
      initCharacter(); // Resetta lo stato del personaggio a vuoto
      startCutscene('CS_OPENING'); // Avvia la cutscene di apertura
    } else if (selectedItem === "Istruzioni") {
      setGameState(GameState.INSTRUCTIONS_SCREEN);
    } else if (selectedItem === "Storia") {
      setGameState(GameState.STORY_SCREEN);
    } else if (selectedItem === "Opzioni") {
      setGameState(GameState.OPTIONS_SCREEN);
    } else if (selectedItem === "Esci") {
        // In a real app, you might close the window or go to a goodbye screen.
        // For this prototype, we'll just log it.
        console.log("Exiting game...");
    }
  }, [selectedIndex, setGameState, setMap, initCharacter, startCutscene]);

  const handlerMap = useMemo(() => ({
    ArrowUp: handleArrowUp,
    ArrowDown: handleArrowDown,
    Enter: handleEnter,
  }), [handleArrowUp, handleArrowDown, handleEnter]);

  useKeyboardInput(handlerMap);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
      <div className="mb-24 text-green-400" style={{ textShadow: '0 0 8px rgba(110, 231, 183, 0.4)'}}>
          <h2 className="text-4xl tracking-widest">THE SAFE PLACE CHRONICLES</h2>
          <h1 className="text-9xl font-black leading-none">THE ECHO</h1>
          <p className="text-2xl leading-none -mt-4">OF THE</p>
          <h1 className="text-9xl font-black leading-none -mt-4">JOURNEY</h1>
          <p className="text-4xl mt-6">Un GDR di Simone Pizzi</p>
      </div>
      
      <div className="text-3xl md:text-4xl lg:text-5xl space-y-2">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div
              key={item}
              className={`px-4 py-1 transition-colors duration-100 ${
                isSelected ? 'bg-green-400 text-black' : 'bg-transparent text-green-400'
              }`}
            >
              {item}
            </div>
          );
        })}
      </div>
      <div className="mt-auto pb-4">
        <p className="text-xl text-green-400/70">
            (C) 2025 Runtime Radio - gioco di ispirazione retrocomputazionale realizzato tramite supporto LLM
        </p>
      </div>
    </div>
  );
};

export default MainMenuScreen;