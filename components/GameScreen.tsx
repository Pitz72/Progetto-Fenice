import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, Stat } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import CanvasMap from './CanvasMap';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { WEATHER_DATA } from '../store/gameStore';
import { JOURNAL_ENTRY_COLORS } from '../constants';
import Panel from './Panel';
import AlignmentPanel from './AlignmentPanel';

// --- Left Column Panels ---
const SurvivalPanel: React.FC = () => {
    const hp = useCharacterStore((state) => state.hp);
    const satiety = useCharacterStore((state) => state.satiety);
    const hydration = useCharacterStore((state) => state.hydration);
    const status = useCharacterStore((state) => state.status);

    const isCritical = (stat: Stat) => stat.current / stat.max <= 0.25;

    return (
        <Panel title="SOPRAVVIVENZA">
            <div>
                <div className={isCritical(hp) ? 'text-red-500 animate-pulse' : ''}>HP: {Math.floor(hp.current)}/{hp.max}</div>
                <div className={isCritical(satiety) ? 'text-red-500 animate-pulse' : ''}>Sazietà: {Math.floor(satiety.current)}/{satiety.max}</div>
                <div className={isCritical(hydration) ? 'text-red-500 animate-pulse' : ''}>Idratazione: {Math.floor(hydration.current)}/{hydration.max}</div>
                <div>Status: {status || 'Normale'}</div>
            </div>
        </Panel>
    );
};

const InventoryPanel: React.FC = () => {
  const inventory = useCharacterStore((state) => state.inventory);
  const equippedWeapon = useCharacterStore((state) => state.equippedWeapon);
  const equippedArmor = useCharacterStore((state) => state.equippedArmor);
  const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);
  const isLoaded = useItemDatabaseStore((state) => state.isLoaded);

  return (
    <Panel title="INVENTARIO" className="flex-grow">
      <div className="border border-green-400/30 p-2 h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {isLoaded && inventory.length > 0 ? (
          <ul className="space-y-1.5">
            {inventory.map((invItem, index) => {
              const itemDetails = itemDatabase[invItem.itemId];
              if (!itemDetails) return null;
              
              const isEquipped = invItem.itemId === equippedWeapon || invItem.itemId === equippedArmor;
              const displayName = `${itemDetails.name}${invItem.quantity > 1 ? ` x${invItem.quantity}`: ''}${isEquipped ? ' (E)' : ''}`;
              
              return (
                <li key={`${invItem.itemId}-${index}`} style={{ color: itemDetails.color }}>
                  {displayName}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-green-400/50">-- Vuoto --</div>
        )}
      </div>
    </Panel>
  );
};

const CommandsPanel: React.FC = () => (
  <Panel title="COMANDI">
    <div className="space-y-1.5">
      <div className="flex justify-between"><span>[WASD/↑↓←→]</span> <span>Movimento/Navigazione</span></div>
      <div className="flex justify-between"><span>[I]</span> <span>Inventario</span></div>
      <div className="flex justify-between"><span>[R]</span> <span>Riposo Breve</span></div>
      <div className="flex justify-between"><span>[L]</span> <span>Level Up</span></div>
      <div className="flex justify-between"><span>[ESC]</span> <span>Menu/Indietro</span></div>
    </div>
  </Panel>
);


// --- Right Column Panels ---
const InfoPanel: React.FC = () => {
    const playerPos = useGameStore((state) => state.playerPos);
    const gameTime = useGameStore((state) => state.gameTime);
    const weather = useGameStore((state) => state.weather);
    const getTileInfo = useGameStore((state) => state.getTileInfo);
    
    const tileInfo = getTileInfo(playerPos.x, playerPos.y);
    const formattedTime = `${String(gameTime.hour).padStart(2, '0')}:${String(gameTime.minute).padStart(2, '0')}`;
    const weatherInfo = WEATHER_DATA[weather.type];
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;

    return (
        <Panel title="INFORMAZIONI">
            <div className="space-y-2">
                <div>
                    <div className="flex justify-between">
                        <span>Posizione:</span> 
                        <span>({playerPos.x}, {playerPos.y})</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Luogo:</span> 
                        <span>{tileInfo.name}</span>
                    </div>
                    <div className={`flex justify-between ${isNight ? 'text-cyan-400' : ''}`}>
                        <span>{formattedTime}</span> 
                        <span>Giorno {gameTime.day}</span>
                    </div>
                    <div className="border-t border-green-400/20 my-1"></div>
                    <div className="flex justify-between items-center">
                        <span className={weatherInfo.color}>* {weatherInfo.name}</span>
                         <div className="text-right">
                        </div>
                    </div>
                     <div>effetti: Nessun effetto</div>
                </div>
            </div>
        </Panel>
    );
};

const EquipmentPanel: React.FC = () => {
    const equippedWeapon = useCharacterStore((state) => state.equippedWeapon);
    const equippedArmor = useCharacterStore((state) => state.equippedArmor);
    const itemDatabase = useItemDatabaseStore((state) => state.itemDatabase);

    const weapon = equippedWeapon ? itemDatabase[equippedWeapon] : null;
    const armor = equippedArmor ? itemDatabase[equippedArmor] : null;

    return (
        <Panel title="EQUIPAGGIAMENTO">
            <div>
                <div>ARMA: {weapon ? weapon.name : 'Nessuna'}</div>
                <div>ARMATURA: {armor ? armor.name : 'Nessuna'}</div>
            </div>
        </Panel>
    );
};

const StatsPanel: React.FC = () => {
    const level = useCharacterStore((state) => state.level);
    const xp = useCharacterStore((state) => state.xp);
    const attributes = useCharacterStore((state) => state.attributes);
    const getAttributeModifier = useCharacterStore((state) => state.getAttributeModifier);
    const levelUpPending = useCharacterStore((state) => state.levelUpPending);
    
    const renderModifier = (attr: 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car') => {
        const mod = getAttributeModifier(attr);
        return `(${mod >= 0 ? '+' : ''}${mod})`;
    };

    return (
        <Panel title="STATISTICHE">
            <div className="space-y-2">
                <div>Livello: {level}</div>
                <div>
                    XP: {xp.current} / {xp.next}
                    {levelUpPending && <span className="text-yellow-400 animate-yellow-flash ml-2">*</span>}
                </div>
                <div className="border-t border-green-400/20 my-1"></div>
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="flex justify-between"><span>FOR:</span><span>{attributes.for} {renderModifier('for')}</span></div>
                    <div className="flex justify-between"><span>DES:</span><span>{attributes.des} {renderModifier('des')}</span></div>
                    <div className="flex justify-between"><span>COS:</span><span>{attributes.cos} {renderModifier('cos')}</span></div>
                    <div className="flex justify-between"><span>INT:</span><span>{attributes.int} {renderModifier('int')}</span></div>
                    <div className="flex justify-between"><span>SAG:</span><span>{attributes.sag} {renderModifier('sag')}</span></div>
                    <div className="flex justify-between"><span>CAR:</span><span>{attributes.car} {renderModifier('car')}</span></div>
                </div>
            </div>
        </Panel>
    );
};


// --- Bottom Panel ---
const TravelJournalPanel: React.FC = () => {
    const journal = useGameStore((state) => state.journal);
    const journalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the top (to show the latest message)
    useEffect(() => {
        if (journalRef.current) {
            journalRef.current.scrollTop = 0;
        }
    }, [journal]);

    return (
        <Panel title="DIARIO DI VIAGGIO" className="h-full">
            <div ref={journalRef} className="h-full overflow-y-auto space-y-2" style={{ scrollbarWidth: 'none' }}>
                {journal.length > 0 ? (
                    journal.map((entry, index) => (
                        <div key={index}>
                           <span className="text-green-400/60 mr-2">
                                [{String(entry.time.hour).padStart(2, '0')}:{String(entry.time.minute).padStart(2, '0')}]
                           </span>
                           <span style={{ color: entry.color || JOURNAL_ENTRY_COLORS[entry.type] || '#d1d5db' }}>
                                {entry.text}
                           </span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-green-400/60 text-center">
                        <p className="text-4xl">Il tuo viaggio inizierà presto...</p>
                        <p className="text-2xl">Le tue avventure saranno registrate qui</p>
                    </div>
                )}
            </div>
        </Panel>
    );
};


const GameScreen: React.FC = () => {
  const { setGameState, movePlayer, isInventoryOpen, toggleInventory, performQuickRest, isInRefuge, openLevelUpScreen } = useGameStore();

  const handleExit = useCallback(() => {
    setGameState(GameState.MAIN_MENU);
  }, [setGameState]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (!isInventoryOpen && !isInRefuge) {
      movePlayer(dx, dy);
    }
  }, [isInventoryOpen, isInRefuge, movePlayer]);

  const handleQuickRest = useCallback(() => {
    if (!isInventoryOpen && !isInRefuge) {
      performQuickRest();
    }
  }, [isInventoryOpen, isInRefuge, performQuickRest]);

  const keyHandlerMap = useMemo(() => {
    const map: { [key: string]: () => void } = {
      i: toggleInventory,
      I: toggleInventory,
      r: handleQuickRest,
      R: handleQuickRest,
      l: openLevelUpScreen,
      L: openLevelUpScreen,
      ArrowUp: () => handleMove(0, -1),
      w: () => handleMove(0, -1),
      ArrowDown: () => handleMove(0, 1),
      s: () => handleMove(0, 1),
      ArrowLeft: () => handleMove(-1, 0),
      a: () => handleMove(-1, 0),
      ArrowRight: () => handleMove(1, 0),
      d: () => handleMove(1, 0),
    };

    if (!isInventoryOpen && !isInRefuge) {
      map['Escape'] = handleExit;
    }
    return map;
  }, [toggleInventory, handleQuickRest, handleMove, isInventoryOpen, isInRefuge, handleExit, openLevelUpScreen]);
  
  useKeyboardInput(keyHandlerMap);


  return (
    <div className="w-full h-full flex p-2 space-x-2 text-green-400" style={{ textShadow: '0 0 5px rgba(110, 231, 183, 0.3)'}}>
      {/* Left Column (25%) */}
      <div className="w-1/4 h-full flex flex-col space-y-2">
        <SurvivalPanel />
        <InventoryPanel />
        <CommandsPanel />
      </div>

      {/* Main Content Area (Center + Right Columns & Journal) (75%) */}
      <div className="w-3/4 h-full flex flex-col space-y-2">
        {/* Top part of Main Content (Map + Right Panels) */}
        <div className="flex-grow flex space-x-2 overflow-hidden">
          {/* Center Column (50% of total width) */}
          <div className="w-2/3 h-full flex flex-col border border-green-400/30 bg-black/20">
             <h2 className="text-center bg-green-400/10 py-1 font-bold tracking-widest uppercase text-2xl flex-shrink-0">MAPPA DEL MONDO</h2>
             <div className="flex-grow relative">
                <CanvasMap />
             </div>
          </div>

          {/* Right Column (25% of total width) */}
          <div className="w-1/3 h-full flex flex-col space-y-2">
            <InfoPanel />
            <EquipmentPanel />
            <StatsPanel />
            <AlignmentPanel />
          </div>
        </div>
        
        {/* Bottom part of Main Content (Journal) */}
        <div className="h-1/4 flex-shrink-0">
          <TravelJournalPanel />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;