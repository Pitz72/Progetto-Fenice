import React, { useState, useCallback } from 'react';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { ASCII_TITLE, MENU_ITEMS } from '../constants';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';

const MainMenuScreen: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const setGameState = useGameStore((state) => state.setGameState);

  const handleArrowUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
  }, []);

  const handleArrowDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
  }, []);
  
  const handleEnter = useCallback(() => {
    const selectedItem = MENU_ITEMS[selectedIndex];
    console.log(`Selected: ${selectedItem}`);
    
    if (selectedItem === "Nuova Partita") {
      setGameState(GameState.CHARACTER_CREATION);
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
  }, [selectedIndex, setGameState]);

  useKeyboardInput({
    ArrowUp: handleArrowUp,
    ArrowDown: handleArrowDown,
    Enter: handleEnter,
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <pre className="text-green-400 text-[0.5em] sm:text-[0.6em] md:text-[0.7em] lg:text-[0.5em] leading-tight">
        {ASCII_TITLE}
      </pre>
      
      <div className="mt-8 md:mt-12 lg:mt-16 text-3xl md:text-4xl lg:text-5xl space-y-2">
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
    </div>
  );
};

export default MainMenuScreen;