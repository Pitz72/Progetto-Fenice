import React, { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

const MENU_ITEMS = [
    "Continua",
    "Salva Partita",
    "Carica Partita",
    "Opzioni",
    "Menu Principale",
];

const InGameMenuScreen: React.FC = () => {
    const { gameState, setGameState } = useGameStore();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleNavigate = useCallback((direction: number) => {
        setSelectedIndex(prev => (prev + direction + MENU_ITEMS.length) % MENU_ITEMS.length);
    }, []);

    const handleConfirm = useCallback(() => {
        const selectedItem = MENU_ITEMS[selectedIndex];
        switch (selectedItem) {
            case "Continua":
                setGameState(GameState.IN_GAME);
                break;
            case "Salva Partita":
                setGameState(GameState.SAVE_GAME);
                break;
            case "Carica Partita":
                setGameState(GameState.LOAD_GAME);
                break;
            case "Opzioni":
                setGameState(GameState.OPTIONS_SCREEN);
                break;
            case "Menu Principale":
                setGameState(GameState.MAIN_MENU);
                break;
        }
    }, [selectedIndex, setGameState]);

    const handlerMap = useMemo(() => {
        if (gameState !== GameState.PAUSE_MENU) return {};
        return {
            'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
            's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
            'Enter': handleConfirm,
            'Escape': () => setGameState(GameState.IN_GAME),
        };
    }, [gameState, handleNavigate, handleConfirm, setGameState]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl border-8 border-double border-green-400/50 flex flex-col p-6 bg-black">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-8">═══ PAUSA ═══</h1>
                
                <div className="w-full max-w-lg mx-auto text-4xl space-y-3">
                    {MENU_ITEMS.map((option, index) => (
                        <div
                            key={option}
                            className={`pl-4 py-1 transition-colors duration-100 ${
                                index === selectedIndex ? 'bg-green-400 text-black' : 'bg-transparent'
                            }`}
                        >
                            {index === selectedIndex && '> '}{option}
                        </div>
                    ))}
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-10 border-t-4 border-double border-green-400/50 pt-4">
                    [W/S / ↑↓] Seleziona | [INVIO] Conferma | [ESC] Continua
                </div>
            </div>
        </div>
    );
};

export default InGameMenuScreen;
