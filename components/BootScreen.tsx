
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { BOOT_TEXT } from '../constants';

const BootScreen: React.FC = () => {
  const { gameState, setGameState } = useGameStore();
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (gameState === GameState.INITIAL_BLACK_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.PRESENTS_SCREEN), 2000);
      return () => clearTimeout(timer);
    }
    if (gameState === GameState.PRESENTS_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.INTERSTITIAL_BLACK_SCREEN), 3000);
      return () => clearTimeout(timer);
    }
    if (gameState === GameState.INTERSTITIAL_BLACK_SCREEN) {
      const timer = setTimeout(() => setGameState(GameState.BOOTING_SCREEN), 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.BOOTING_SCREEN) {
      let lineIndex = 0;
      const interval = setInterval(() => {
        if (lineIndex < BOOT_TEXT.length) {
          setBootLines(prev => [...prev, BOOT_TEXT[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setGameState(GameState.MAIN_MENU), 1000);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  if (gameState === GameState.INITIAL_BLACK_SCREEN || gameState === GameState.INTERSTITIAL_BLACK_SCREEN) {
    return null; // Renders black background from Monitor
  }

  if (gameState === GameState.PRESENTS_SCREEN) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-5xl animate-pulse">Runtime Radio Presenta</h1>
      </div>
    );
  }

  if (gameState === GameState.BOOTING_SCREEN) {
    return (
      <div className="w-full h-full font-mono text-left">
        {bootLines.map((line, index) => (
          <p key={index} className="whitespace-pre">{line}</p>
        ))}
        {showCursor && <span className="bg-green-400 w-4 h-6 inline-block"></span>}
      </div>
    );
  }

  return null;
};

export default BootScreen;
