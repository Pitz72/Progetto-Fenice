import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { CombatState, Stat } from '../types';

const getEnemyHealthDescription = (hpState: Stat): string => {
    const ratio = hpState.current / hpState.max;
    if (ratio > 0.9) return "Illeso";
    if (ratio > 0.6) return "Leggermente Ferito";
    if (ratio > 0.3) return "Ferito";
    if (ratio > 0) return "In Fin di Vita";
    return "Sconfitto";
};

const CombatScreen: React.FC = () => {
    const { activeCombat, playerCombatAction } = useGameStore();
    const { hp } = useCharacterStore();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const combatLogRef = useRef<HTMLDivElement>(null);

    const availableActions = useMemo(() => {
        if (!activeCombat) return [];
        const baseActions = [{ type: 'attack', name: 'Attacca' }, { type: 'analyze', name: 'Analizza' }, { type: 'flee', name: 'Fuggi' }];
        const tacticalActions = activeCombat.availableTacticalActions.map(tactic => ({
            type: 'tactic',
            name: tactic.name,
            id: tactic.id
        }));
        return [...baseActions, ...tacticalActions];
    }, [activeCombat]);

    // Auto-scroll combat log
    useEffect(() => {
        if (combatLogRef.current) {
            combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
        }
    }, [activeCombat?.log]);
    
    // Reset selected index when actions change
    useEffect(() => {
        setSelectedIndex(0);
    }, [availableActions.length]);

    const handleNavigate = useCallback((direction: number) => {
        if (!activeCombat?.playerTurn) return;
        setSelectedIndex(prev => (prev + direction + availableActions.length) % availableActions.length);
    }, [activeCombat, availableActions.length]);

    const handleConfirm = useCallback(() => {
        if (!activeCombat?.playerTurn || !availableActions[selectedIndex]) return;
        
        const action = availableActions[selectedIndex];
        if (action.type === 'tactic') {
            playerCombatAction({ type: 'tactic', tacticId: action.id! });
        } else {
            playerCombatAction({ type: action.type as 'attack' | 'analyze' | 'flee' });
        }
    }, [activeCombat, selectedIndex, availableActions, playerCombatAction]);

    const handlerMap = useMemo(() => {
        if (!activeCombat?.playerTurn) return {};
        return {
            'w': () => handleNavigate(-1), 'ArrowUp': () => handleNavigate(-1),
            's': () => handleNavigate(1), 'ArrowDown': () => handleNavigate(1),
            'Enter': handleConfirm,
        }
    }, [handleNavigate, handleConfirm, activeCombat?.playerTurn]);

    useKeyboardInput(handlerMap);

    if (!activeCombat) return null;

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-7xl border-8 border-double border-red-500/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-4 text-red-500" style={{ textShadow: '0 0 8px #ef4444' }}>
                    ═══ COMBATTIMENTO ═══
                </h1>
                
                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Combat Log (Left Column) */}
                    <div ref={combatLogRef} className="w-3/5 h-full border-2 border-green-400/30 p-4 bg-black/30 overflow-y-auto text-3xl" style={{ scrollbarWidth: 'none' }}>
                        {activeCombat.log.map((entry, index) => (
                            <p key={index} style={{ color: entry.color || '#d1d5db' }} className="mb-1">{`> ${entry.text}`}</p>
                        ))}
                        {!activeCombat.playerTurn && <span className="animate-cursor-blink text-4xl">_</span>}
                    </div>

                    {/* Info & Actions (Right Column) */}
                    <div className="w-2/5 h-full flex flex-col space-y-4">
                        {/* Status Panel */}
                        <div className="border-2 border-red-500/30 p-4 text-3xl">
                             <div className="flex justify-between"><span>TU:</span> <span className="font-bold">{hp.current}/{hp.max} HP</span></div>
                             <div className="flex justify-between"><span>{activeCombat.enemy.name}:</span> <span className="font-bold">{getEnemyHealthDescription(activeCombat.enemyHp)}</span></div>
                        </div>

                        {/* Action Panel */}
                        <div className="flex-grow flex flex-col border-2 border-green-400/30 p-4">
                            <h2 className="text-3xl mb-2">AZIONI:</h2>
                            <div className="grid grid-cols-1 gap-y-2 text-4xl mt-auto">
                                {availableActions.map((action, index) => {
                                    const isSelected = index === selectedIndex;
                                    const isDisabled = !activeCombat.playerTurn;
                                    return (
                                        <div key={action.name} className={`${isSelected && !isDisabled ? 'bg-green-400 text-black' : ''} ${isDisabled ? 'text-gray-500' : ''} pl-2`}>
                                           {isSelected && !isDisabled ? '> ' : ''}{action.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [↑↓] Naviga | [INVIO] Conferma
                </div>
            </div>
        </div>
    );
};

export default CombatScreen;
