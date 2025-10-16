import { create } from 'zustand';
// FIX: Added EnemyTactic and Enemy to the import list to be used for explicit typing.
import { GameState, GameStoreState, TileInfo, WeatherType, WeatherState, JournalEntry, ActionMenuState, JournalEntryType, GameTime, RefugeMenuState, Position, EventResult, CraftingMenuState, GameEvent, AttributeName, CombatState, EnemyTactic, Enemy } from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useEventDatabaseStore } from '../data/eventDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { useEnemyDatabaseStore } from '../data/enemyDatabase';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS, JOURNAL_ENTRY_COLORS } from '../constants';
import * as N from '../data/combatNarrative';

// --- Constants for Game Logic ---
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);
const IMPASSABLE_TILES = new Set(['M']);
const EVENT_TRIGGER_PROBABILITY = 0.20; // 20% chance to trigger an event on a valid tile
const COMBAT_TRIGGER_PROBABILITY = 0.10; // 10% chance to trigger combat
const GLOBAL_ENCOUNTER_COOLDOWN_MINUTES = 360; // 6 hours

const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};

const BASE_TIME_COST_PER_MOVE = 10; // minutes

// --- Helper Functions ---
const timeToMinutes = (time: GameTime): number => {
    return (time.day - 1) * 1440 + time.hour * 60 + time.minute; // 1440 = 24 * 60
};

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];


// --- Weather System Engine ---
export const WEATHER_DATA: Record<WeatherType, { name: string; color: string; }> = {
    [WeatherType.SERENO]: { name: 'Sereno', color: 'text-yellow-400' },
    [WeatherType.NUVOLOSO]: { name: 'Nuvoloso', color: 'text-gray-400' },
    [WeatherType.PIOGGIA]: { name: 'Pioggia', color: 'text-cyan-400' },
    [WeatherType.TEMPESTA]: { name: 'Tempesta', color: 'text-gray-500 font-bold' },
    [WeatherType.NEBBIA]: { name: 'Nebbia', color: 'text-white/80' },
};

const WEATHER_DURATIONS: Record<WeatherType, { min: number; max: number }> = {
    [WeatherType.SERENO]: { min: 6 * 60, max: 18 * 60 },   // 6-18 hours
    [WeatherType.NUVOLOSO]: { min: 4 * 60, max: 12 * 60 },  // 4-12 hours
    [WeatherType.PIOGGIA]: { min: 2 * 60, max: 6 * 60 },    // 2-6 hours
    [WeatherType.TEMPESTA]: { min: 1 * 60, max: 4 * 60 },   // 1-4 hours
    [WeatherType.NEBBIA]: { min: 2 * 60, max: 8 * 60 },     // 2-8 hours
};

const WEATHER_TRANSITIONS: Record<WeatherType, { to: WeatherType; probability: number }[]> = {
    [WeatherType.SERENO]: [
        { to: WeatherType.SERENO, probability: 0.80 },
        { to: WeatherType.NUVOLOSO, probability: 0.15 },
        { to: WeatherType.PIOGGIA, probability: 0.05 },
    ],
    [WeatherType.NUVOLOSO]: [
        { to: WeatherType.NUVOLOSO, probability: 0.60 },
        { to: WeatherType.SERENO, probability: 0.20 },
        { to: WeatherType.PIOGGIA, probability: 0.20 },
    ],
    [WeatherType.PIOGGIA]: [
        { to: WeatherType.PIOGGIA, probability: 0.50 },
        { to: WeatherType.NUVOLOSO, probability: 0.30 },
        { to: WeatherType.TEMPESTA, probability: 0.20 },
    ],
    [WeatherType.TEMPESTA]: [
        { to: WeatherType.TEMPESTA, probability: 0.40 },
        { to: WeatherType.PIOGGIA, probability: 0.50 },
        { to: WeatherType.NUVOLOSO, probability: 0.10 },
    ],
    [WeatherType.NEBBIA]: [
        { to: WeatherType.NEBBIA, probability: 0.70 },
        { to: WeatherType.NUVOLOSO, probability: 0.30 },
    ],
};

const pickNextWeather = (current: WeatherType): WeatherType => {
    const transitions = WEATHER_TRANSITIONS[current];
    const roll = Math.random();
    let cumulativeProbability = 0;
    for (const transition of transitions) {
        cumulativeProbability += transition.probability;
        if (roll < cumulativeProbability) {
            return transition.to;
        }
    }
    return transitions[0].to; // Fallback
};

// FIX: Added a type for the player combat action payload to fix type inference errors.
type PlayerCombatActionPayload =
  | { type: 'attack' | 'analyze' | 'flee' }
  | { type: 'tactic'; tacticId: string }
  | { type: 'use_item'; itemId: string };

export const useGameStore = create<GameStoreState>((set, get) => ({
  // --- State ---
  gameState: GameState.INITIAL_BLACK_SCREEN,
  map: [],
  playerPos: { x: 0, y: 0 },
  gameTime: { day: 1, hour: 8, minute: 0 },
  weather: { type: WeatherType.SERENO, duration: WEATHER_DURATIONS[WeatherType.SERENO].max },
  playerStatus: { isExitingWater: false },
  journal: [],
  isInventoryOpen: false,
  isInRefuge: false,
  isCraftingOpen: false,
  inventorySelectedIndex: 0,
  actionMenuState: { isOpen: false, options: [], selectedIndex: 0 },
  refugeMenuState: { isOpen: false, options: [], selectedIndex: 0 },
  craftingMenuState: { selectedIndex: 0 },
  refugeActionMessage: null,
  refugeJustSearched: false,
  currentBiome: '',
  lastRestTime: null,
  lastEncounterTime: null,
  lastLoreEventDay: null,
  lootedRefuges: [],
  visitedRefuges: [],
  activeEvent: null,
  eventHistory: [],
  eventResolutionText: null,
  activeCombat: null,


  // --- Actions ---
  setGameState: (newState) => set({ gameState: newState }),
  
  addJournalEntry: (entry) => {
    set(state => ({
        journal: [{ ...entry, time: state.gameTime }, ...state.journal].slice(0, 100) // Keep last 100 entries
    }));
  },

  setMap: () => {
    const newMap = MAP_DATA;
    let startPos = { x: 0, y: 0 };
    for (let y = 0; y < newMap.length; y++) {
      const x = newMap[y].indexOf('S');
      if (x !== -1) {
        startPos = { x, y };
        break;
      }
    }
    const initialWeather = WeatherType.SERENO;
    const initialDuration = Math.floor(Math.random() * (WEATHER_DURATIONS[initialWeather].max - WEATHER_DURATIONS[initialWeather].min + 1)) + WEATHER_DURATIONS[initialWeather].min;
    
    set({ 
        map: newMap, 
        playerPos: startPos,
        gameTime: { day: 1, hour: 8, minute: 0 },
        weather: { type: initialWeather, duration: initialDuration },
        playerStatus: { isExitingWater: false },
        journal: [], // Reset journal
        currentBiome: 'S',
        lastRestTime: null,
        lastEncounterTime: null,
        lastLoreEventDay: 0, // Set to 0 to allow lore event on day 1
        lootedRefuges: [],
        visitedRefuges: [],
        activeEvent: null,
        eventHistory: [],
        activeCombat: null,
    });
    get().addJournalEntry({ text: "Benvenuto in The Safe Place. La tua avventura inizia ora.", type: JournalEntryType.GAME_START });
    get().addJournalEntry({ text: BIOME_MESSAGES['S'], type: JournalEntryType.NARRATIVE, color: BIOME_COLORS['S'] });
  },

  advanceTime: (minutes: number, bypassPause: boolean = false) => {
    if ((get().isInventoryOpen || get().isInRefuge) && !bypassPause) return;

    // --- Update Game Time ---
    let newMinute = get().gameTime.minute + minutes;
    let newHour = get().gameTime.hour;
    let newDay = get().gameTime.day;
    while (newMinute >= 60) { newMinute -= 60; newHour += 1; }
    while (newHour >= 24) { newHour -= 24; newDay += 1; }
    set({ gameTime: { day: newDay, hour: newHour, minute: newMinute } });

    // --- Update Weather ---
    let newWeather = { ...get().weather };
    newWeather.duration -= minutes;
    if (newWeather.duration <= 0) {
        const nextWeatherType = pickNextWeather(newWeather.type);
        const { min, max } = WEATHER_DURATIONS[nextWeatherType];
        const newDuration = Math.floor(Math.random() * (max - min + 1)) + min;
        newWeather = { type: nextWeatherType, duration: newDuration };
        get().addJournalEntry({ text: `Il tempo sta cambiando... Ora è ${WEATHER_DATA[nextWeatherType].name.toLowerCase()}.`, type: JournalEntryType.NARRATIVE });
    }
    set({ weather: newWeather });
    
    // --- Update Character Survival Stats ---
    const currentActivityWeather = get().isInRefuge ? WeatherType.SERENO : get().weather.type;
    useCharacterStore.getState().updateSurvivalStats(minutes, currentActivityWeather);
  },

  movePlayer: (dx, dy) => {
    const { map, playerPos, playerStatus, weather, gameTime, advanceTime, addJournalEntry, enterRefuge, visitedRefuges } = get();
    
    if (playerStatus.isExitingWater) {
        set({ playerStatus: { ...playerStatus, isExitingWater: false } });
        advanceTime(BASE_TIME_COST_PER_MOVE * 2); // Increased cost for exiting water
        addJournalEntry({ text: "Con fatica, esci dall'acqua.", type: JournalEntryType.NARRATIVE });
        return;
    }

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };

    if ( newPos.y < 0 || newPos.y >= map.length || newPos.x < 0 || newPos.x >= map[newPos.y].length ) return;
    
    const destinationTile = map[newPos.y][newPos.x];
    if (IMPASSABLE_TILES.has(destinationTile)) {
        const message = MOUNTAIN_MESSAGES[Math.floor(Math.random() * MOUNTAIN_MESSAGES.length)];
        addJournalEntry({ text: message, type: JournalEntryType.ACTION_FAILURE });
        return;
    }
    
    // --- REFUGE LOGIC ---
    if (destinationTile === 'R') {
        const isVisited = visitedRefuges.some(pos => pos.x === newPos.x && pos.y === newPos.y);
        if (isVisited) {
            addJournalEntry({ text: "Hai già usato questo rifugio. Non offre più riparo.", type: JournalEntryType.ACTION_FAILURE });
            return;
        }
        set({ playerPos: newPos });
        enterRefuge();
        return;
    }

    if (!TRAVERSABLE_TILES.has(destinationTile)) return;
    
    const previousBiome = get().currentBiome;
    if (destinationTile !== previousBiome) {
        const biomeMessage = BIOME_MESSAGES[destinationTile];
        if (biomeMessage) {
            const biomeColor = BIOME_COLORS[destinationTile];
            addJournalEntry({ text: biomeMessage, type: JournalEntryType.NARRATIVE, color: biomeColor });
            set({ currentBiome: destinationTile });
        }
    }

    if (destinationTile === '~') {
        const skillCheck = useCharacterStore.getState().performSkillCheck('atletica', 12);
        if(skillCheck.success) {
            addJournalEntry({ text: "Riesci a contrastare la corrente e ad entrare in acqua senza problemi.", type: JournalEntryType.SKILL_CHECK_SUCCESS });
        } else {
            const damage = 2;
            addJournalEntry({ text: "La corrente è più forte del previsto. Scivoli e urti una roccia.", type: JournalEntryType.SKILL_CHECK_FAILURE });
            useCharacterStore.getState().takeDamage(damage);
            addJournalEntry({ text: `Subisci ${damage} danni.`, type: JournalEntryType.COMBAT });
        }
        set({ playerStatus: { ...get().playerStatus, isExitingWater: true } });
    }

    let timeCost = BASE_TIME_COST_PER_MOVE;
    if (destinationTile === 'F') timeCost += 10;
    
    let weatherPenalty = 0;
    if (weather.type === WeatherType.PIOGGIA) weatherPenalty = 5;
    if (weather.type === WeatherType.TEMPESTA) weatherPenalty = 10;
    if (weatherPenalty > 0) {
        timeCost += weatherPenalty;
        addJournalEntry({ text: `${weather.type} rallenta i tuoi movimenti. (+${weatherPenalty} min)`, type: JournalEntryType.SYSTEM_WARNING });
    }

    // --- Environmental Damage ---
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    if (isNight && Math.random() < 0.20) {
        useCharacterStore.getState().takeDamage(1);
        addJournalEntry({ text: "L'oscurità ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === WeatherType.TEMPESTA && Math.random() < 0.15) {
        useCharacterStore.getState().takeDamage(1);
        addJournalEntry({ text: "Il vento violento ti fa inciampare. (-1 HP)", type: JournalEntryType.COMBAT });
    }
    if (weather.type === WeatherType.PIOGGIA && Math.random() < 0.08) {
        useCharacterStore.getState().takeDamage(1);
        addJournalEntry({ text: "Il terreno scivoloso ti fa cadere. (-1 HP)", type: JournalEntryType.COMBAT });
    }

    set({ playerPos: newPos });
    advanceTime(timeCost);
    useCharacterStore.getState().gainExplorationXp(); // Gain XP for moving

    // Event & Combat Trigger Logic
    get().triggerEncounter();
    if (get().activeEvent || get().activeCombat) return;

    if (Math.random() < 0.15) {
        const { weather: current_weather, currentBiome } = get();
        const biomeMessages = ATMOSPHERIC_MESSAGES[currentBiome];
        
        if (biomeMessages) {
            let possibleMessages: string[] = [];
            
            if ((current_weather.type === WeatherType.PIOGGIA || current_weather.type === WeatherType.TEMPESTA) && biomeMessages.rain) {
                possibleMessages.push(...biomeMessages.rain);
            }

            if (isNight) {
                possibleMessages.push(...biomeMessages.night);
            } else {
                possibleMessages.push(...biomeMessages.day);
            }
            
            if (possibleMessages.length > 0) {
                const message = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
                addJournalEntry({ text: message, type: JournalEntryType.NARRATIVE });
            }
        }
    }
  },

  getTileInfo: (x: number, y: number): TileInfo => {
    const { map } = get();
    if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
        return { char: ' ', name: 'Sconosciuto' };
    }
    const char = map[y][x];
    return { char, name: TILE_NAMES[char] || 'Terreno Misterioso' };
  },

  toggleInventory: () => {
    set(state => {
        if (state.actionMenuState.isOpen) {
            return { actionMenuState: { ...state.actionMenuState, isOpen: false } };
        }
        if (state.isCraftingOpen) return {}; // Can't open inventory while crafting
        const isOpen = !state.isInventoryOpen;
        return { isInventoryOpen: isOpen, inventorySelectedIndex: 0 };
    });
  },

  setInventorySelectedIndex: (updater) => {
    const inventory = useCharacterStore.getState().inventory;
    if (inventory.length === 0) { set({ inventorySelectedIndex: 0 }); return; }
    set(state => {
        const newIndex = updater(state.inventorySelectedIndex);
        if (newIndex < 0) return { inventorySelectedIndex: inventory.length - 1 };
        if (newIndex >= inventory.length) return { inventorySelectedIndex: 0 };
        return { inventorySelectedIndex: newIndex };
    });
  },

  openActionMenu: () => {
      const { inventorySelectedIndex } = get();
      const { inventory, equippedWeapon, equippedArmor } = useCharacterStore.getState();
      const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
      if (!inventory[inventorySelectedIndex]) return;
      
      const selectedItemId = inventory[inventorySelectedIndex].itemId;
      const itemDetails = itemDatabase[selectedItemId];
      if (!itemDetails) return;
      
      let options: string[] = [];
      const isEquipped = equippedWeapon === selectedItemId || equippedArmor === selectedItemId;

      switch(itemDetails.type) {
          case 'consumable': options = ['Usa', 'Scarta', 'Annulla']; break;
          case 'manual': options = ['Leggi', 'Scarta', 'Annulla']; break;
          case 'weapon': case 'armor':
              if (isEquipped) { options = ['Togli', 'Scarta', 'Annulla']; } 
              else { options = ['Equipaggia', 'Scarta', 'Annulla']; }
              break;
          default: options = ['Esamina', 'Scarta', 'Annulla']; break;
      }
      set({ actionMenuState: { isOpen: true, options, selectedIndex: 0 } });
  },

  closeActionMenu: () => set({ actionMenuState: { isOpen: false, options: [], selectedIndex: 0 } }),

  navigateActionMenu: (direction) => {
      set(state => {
          const { options, selectedIndex } = state.actionMenuState;
          let newIndex = selectedIndex + direction;
          if (newIndex < 0) newIndex = options.length - 1;
          if (newIndex >= options.length) newIndex = 0;
          return { actionMenuState: { ...state.actionMenuState, selectedIndex: newIndex } };
      });
  },
  
  confirmActionMenuSelection: () => {
      const { actionMenuState, inventorySelectedIndex, addJournalEntry, closeActionMenu } = get();
      const charState = useCharacterStore.getState();
      const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
      const selectedAction = actionMenuState.options[actionMenuState.selectedIndex];
      
      if (!charState.inventory[inventorySelectedIndex]) { closeActionMenu(); return; }
      
      const itemToActOn = charState.inventory[inventorySelectedIndex];
      const itemDetails = itemDatabase[itemToActOn.itemId];
      if (!itemDetails) { closeActionMenu(); return; }
      
      switch (selectedAction) {
          case 'Usa':
              if (itemDetails.type === 'consumable' && itemDetails.effects) {
                  let baseMessage = `Hai usato: ${itemDetails.name}.`;
                  let effectMessages: string[] = [];
                  itemDetails.effects.forEach(effect => {
                      switch(effect.type) {
                          case 'heal': charState.heal(effect.value as number); effectMessages.push(`Recuperi ${effect.value} HP.`); break;
                          case 'satiety': charState.restoreSatiety(effect.value as number); effectMessages.push(`Recuperi ${effect.value} sazietà.`); break;
                          case 'hydration': charState.restoreHydration(effect.value as number); effectMessages.push(`Recuperi ${effect.value} idratazione.`); break;
                          case 'cureStatus':
                            if (charState.status === effect.value) {
                                charState.setStatus(null);
                                effectMessages.push(`Ti senti meglio. Lo stato ${effect.value} è svanito.`);
                            } else {
                                effectMessages.push(`Non ha avuto alcun effetto...`);
                            }
                            break;
                          default: effectMessages.push(`Senti un effetto strano...`); break;
                      }
                  });
                  addJournalEntry({ text: [baseMessage, ...effectMessages].join(' '), type: JournalEntryType.NARRATIVE });
                  charState.removeItem(itemToActOn.itemId, 1);
              }
              break;
          case 'Leggi':
              if (itemDetails.type === 'manual' && itemDetails.unlocksRecipe) {
                  charState.learnRecipe(itemDetails.unlocksRecipe);
                  charState.removeItem(itemToActOn.itemId, 1);
              }
              break;
          case 'Equipaggia': charState.equipItem(itemToActOn.itemId); addJournalEntry({ text: `Hai equipaggiato: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); break;
          case 'Togli': charState.unequipItem(itemDetails.type === 'weapon' ? 'weapon' : 'armor'); addJournalEntry({ text: `Hai tolto: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); break;
          case 'Scarta':
              charState.discardItem(itemToActOn.itemId, 1);
              addJournalEntry({ text: `Hai scartato: ${itemDetails.name}.`, type: JournalEntryType.NARRATIVE }); 
              break;
          case 'Esamina': addJournalEntry({ text: `Esamini: ${itemDetails.name}. ${itemDetails.description}`, type: JournalEntryType.NARRATIVE }); break;
      }
      
      closeActionMenu();
      // Adjust selected index if the item was removed
      if (useCharacterStore.getState().inventory.length <= inventorySelectedIndex) {
          set({ inventorySelectedIndex: Math.max(0, useCharacterStore.getState().inventory.length - 1) });
      }
  },

  performQuickRest: () => {
    if (get().isInventoryOpen || get().isInRefuge) return;

    const { gameTime, lastRestTime, addJournalEntry } = get();

    if (lastRestTime) {
        const currentTimeInMinutes = timeToMinutes(gameTime);
        const lastRestTimeInMinutes = timeToMinutes(lastRestTime);
        if (currentTimeInMinutes - lastRestTimeInMinutes < 1440) {
            addJournalEntry({ text: "Troppo presto per riposare di nuovo. Devi aspettare.", type: JournalEntryType.ACTION_FAILURE });
            return;
        }
    }

    const restDurationMinutes = 60;
    const hpRecoveryAmount = 20;

    addJournalEntry({ text: "Ti fermi per riposare per un'ora.", type: JournalEntryType.NARRATIVE });
    
    get().advanceTime(restDurationMinutes, true);
    set({ lastRestTime: get().gameTime });

    useCharacterStore.getState().heal(hpRecoveryAmount);
    
    addJournalEntry({ text: `Un breve riposo ti ridona un po' di energie. Hai recuperato ${hpRecoveryAmount} HP.`, type: JournalEntryType.SKILL_CHECK_SUCCESS });
  },

  clearRefugeActionMessage: () => set({ refugeActionMessage: null }),

  enterRefuge: () => {
    const { gameTime, playerPos, lootedRefuges, refugeJustSearched } = get();
    const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
    const isLooted = lootedRefuges.some(pos => pos.x === playerPos.x && pos.y === playerPos.y);

    const options = [ isNight ? "Dormi fino all'alba" : "Aspetta un'ora" ];
    if (!isLooted && !refugeJustSearched) {
        options.push("Cerca nei dintorni");
    }
    options.push("Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio");

    set({
      isInRefuge: true,
      refugeJustSearched: false, // Reset search status on new entry
      refugeMenuState: { isOpen: true, options, selectedIndex: 0 }
    });
    get().addJournalEntry({ text: "Sei entrato in un rifugio. Sei al sicuro.", type: JournalEntryType.NARRATIVE });
  },

  leaveRefuge: () => {
    set(state => ({
      isInRefuge: false,
      refugeMenuState: { isOpen: false, options: [], selectedIndex: 0 },
      visitedRefuges: [...state.visitedRefuges, state.playerPos],
      refugeActionMessage: null,
      refugeJustSearched: false,
    }));
    get().addJournalEntry({ text: "Lasci la sicurezza del rifugio.", type: JournalEntryType.NARRATIVE });
  },

  navigateRefugeMenu: (direction) => {
    get().clearRefugeActionMessage();
    set(state => {
      if (!state.isInRefuge) return {};
      const { options, selectedIndex } = state.refugeMenuState;
      let newIndex = selectedIndex + direction;
      if (newIndex < 0) newIndex = options.length - 1;
      if (newIndex >= options.length) newIndex = 0;
      return { refugeMenuState: { ...state.refugeMenuState, selectedIndex: newIndex } };
    });
  },

  searchRefuge: () => {
      const { advanceTime, addJournalEntry, playerPos } = get();
      const searchTimeCost = 30;
      advanceTime(searchTimeCost, true);

      const skillCheckResult = useCharacterStore.getState().performSkillCheck('percezione', 10);
      let journalText = `Prova di Percezione (CD ${skillCheckResult.dc}): ${skillCheckResult.roll} (d20) + ${skillCheckResult.bonus} (mod) = ${skillCheckResult.total}. `;

      if (skillCheckResult.success) {
          journalText += "SUCCESSO. ";
          const lootTable = ['CONS_001', 'CONS_002', 'CONS_003'];
          const foundItemId = lootTable[Math.floor(Math.random() * lootTable.length)];
          const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
          const itemDetails = itemDatabase[foundItemId];

          if(itemDetails) {
              useCharacterStore.getState().addItem(foundItemId, 1);
              journalText += `Frugando sotto un'asse del pavimento, trovi: ${itemDetails.name} (x1).`;
              addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
              set(state => ({ lootedRefuges: [...state.lootedRefuges, playerPos] }));
          } else {
             journalText += "Non trovi nulla di valore.";
             addJournalEntry({ text: journalText, type: JournalEntryType.ACTION_FAILURE });
          }
      } else {
          journalText += "FALLIMENTO. Hai cercato ovunque, ma non trovi nulla di utile.";
          addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_FAILURE });
      }

      set({ refugeActionMessage: journalText, refugeJustSearched: true });

      // Rebuild menu to remove search option for this visit
      const isNight = get().gameTime.hour >= 20 || get().gameTime.hour < 6;
      const newOptions = [
        isNight ? "Dormi fino all'alba" : "Aspetta un'ora",
        "Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio"
      ];
      set(state => ({
        refugeMenuState: { ...state.refugeMenuState, options: newOptions, selectedIndex: 0 }
      }));
  },

  confirmRefugeMenuSelection: () => {
    get().clearRefugeActionMessage();
    const { refugeMenuState, gameTime, addJournalEntry, leaveRefuge, toggleInventory, advanceTime, searchRefuge, toggleCrafting } = get();
    const selectedAction = refugeMenuState.options[refugeMenuState.selectedIndex];
    const { satiety, hydration } = useCharacterStore.getState();

    switch(selectedAction) {
      case "Aspetta un'ora": {
        const restTime = 60;
        const hpRecovery = 5;
        addJournalEntry({ text: "Decidi di riposare per un'ora.", type: JournalEntryType.NARRATIVE });
        advanceTime(restTime, true);
        useCharacterStore.getState().heal(hpRecovery);
        const successMessage = `Hai recuperato ${hpRecovery} HP.`;
        addJournalEntry({ text: successMessage, type: JournalEntryType.SKILL_CHECK_SUCCESS });
        set({ refugeActionMessage: successMessage });
        break;
      }
      case "Dormi fino all'alba": {
        let hoursToRest = (24 - gameTime.hour) + 6;
        if (gameTime.hour < 6) hoursToRest = 6 - gameTime.hour;
        const minutesToRest = (hoursToRest * 60) - gameTime.minute;
        const { satietyCost, hydrationCost } = useCharacterStore.getState().calculateSurvivalCost(minutesToRest);
        
        if (satiety.current < satietyCost || hydration.current < hydrationCost) {
            const message = "Sei troppo affamato o assetato per dormire così a lungo.";
            addJournalEntry({ text: message, type: JournalEntryType.ACTION_FAILURE });
            set({ refugeActionMessage: message });
            return;
        }
        addJournalEntry({ text: "Ti addormenti profondamente, al sicuro dalle minacce della notte.", type: JournalEntryType.NARRATIVE });
        advanceTime(minutesToRest, true);
        useCharacterStore.getState().heal(useCharacterStore.getState().hp.max);
        const successMessage = "Ti svegli all'alba, completamente rinvigorito.";
        addJournalEntry({ text: successMessage, type: JournalEntryType.SKILL_CHECK_SUCCESS });
        set({ refugeActionMessage: successMessage });
        break;
      }
      case "Cerca nei dintorni":
          searchRefuge();
          return;
      case "Banco di Lavoro":
        toggleCrafting();
        break;
      case "Gestisci Inventario":
        toggleInventory();
        break;
      case "Esci dal Rifugio":
        leaveRefuge();
        break;
    }
    
    // After a time-passing action, rebuild menu options
    if (get().isInRefuge) {
        const { gameTime: newGameTime, playerPos, lootedRefuges, refugeJustSearched } = get();
        const isNight = newGameTime.hour >= 20 || newGameTime.hour < 6;
        const isLooted = lootedRefuges.some(pos => pos.x === playerPos.x && pos.y === playerPos.y);
        
        const newOptions = [ isNight ? "Dormi fino all'alba" : "Aspetta un'ora" ];
        if (!isLooted && !refugeJustSearched) {
            newOptions.push("Cerca nei dintorni");
        }
        newOptions.push("Banco di Lavoro", "Gestisci Inventario", "Esci dal Rifugio");
        
        set(state => ({
            refugeMenuState: { ...state.refugeMenuState, options: newOptions }
        }));
    }
  },

  triggerEncounter: () => {
    const { 
        gameTime, 
        lastEncounterTime, 
        currentBiome, 
        eventHistory, 
        lastLoreEventDay,
        startCombat 
    } = get();

    const biomeCharToName: Record<string, string> = {
        '.': 'Pianura', 'F': 'Foresta', 'V': 'Villaggio', 'C': 'Città', '~': 'Acqua'
    };
    const currentBiomeName = biomeCharToName[currentBiome] || 'Global';

    // --- PRIORITY 1: LORE EVENTS ---
    // Can a lore event trigger today?
    if (gameTime.day > (lastLoreEventDay || 0)) {
        const { loreEvents } = useEventDatabaseStore.getState();
        
        // FIX: Explicitly type 'event' as GameEvent to ensure correct type inference.
        const possibleLoreEvents = loreEvents.filter((event: GameEvent) => 
            (event.biomes.includes(currentBiomeName) || event.biomes.includes("Global")) &&
            !eventHistory.includes(event.id)
        );

        if (possibleLoreEvents.length > 0) {
            // FIX: Explicitly type `eventToTrigger` as `GameEvent` to resolve type inference issue.
            const eventToTrigger: GameEvent = getRandom(possibleLoreEvents);
            set({
                activeEvent: eventToTrigger,
                gameState: GameState.EVENT_SCREEN,
                eventResolutionText: null,
                lastEncounterTime: gameTime,
                lastLoreEventDay: gameTime.day,
            });
            get().addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
            return; // Lore event triggered, exit.
        }
    }

    // --- PRIORITY 2: GENERAL ENCOUNTERS (WITH COOLDOWN) ---
    const isPlains = currentBiome === '.';
    const cooldownMinutes = isPlains ? 240 : 90; // 4 hours for plains, 1.5 hours for others.

    if (lastEncounterTime) {
        const currentTimeInMinutes = timeToMinutes(gameTime);
        const lastEncounterTimeInMinutes = timeToMinutes(lastEncounterTime);
        if (currentTimeInMinutes - lastEncounterTimeInMinutes < cooldownMinutes) {
            return; // Cooldown is active.
        }
    }

    // Roll to see IF an encounter happens at all
    const ENCOUNTER_PROBABILITY = 0.20;
    if (Math.random() > ENCOUNTER_PROBABILITY) {
        return; // No encounter this time.
    }

    // If an encounter happens, decide what kind
    const COMBAT_CHANCE = 0.35;
    
    if (Math.random() > COMBAT_CHANCE) {
        // --- NARRATIVE EVENT ---
        const { biomeEvents, globalEncounters } = useEventDatabaseStore.getState();
        
        const allPossibleEvents = [
            // FIX: Explicitly type 'e' as GameEvent to ensure correct type inference.
            ...biomeEvents.filter((e: GameEvent) => e.biomes.includes(currentBiomeName)),
            ...globalEncounters
        ];

        // FIX: Explicitly type 'e' as GameEvent to ensure correct type inference.
        const unseenUniqueEvents = allPossibleEvents.filter((e: GameEvent) => e.isUnique && !eventHistory.includes(e.id));
        // FIX: Explicitly type 'e' as GameEvent to ensure correct type inference.
        const repeatableEvents = allPossibleEvents.filter((e: GameEvent) => !e.isUnique);

        let eventToTrigger: GameEvent | null = null;
        
        // Prioritize unique events to ensure they are all seen eventually
        if (unseenUniqueEvents.length > 0) {
            eventToTrigger = getRandom(unseenUniqueEvents);
        } else if (repeatableEvents.length > 0) {
            eventToTrigger = getRandom(repeatableEvents);
        }

        if (eventToTrigger) {
            set({
                activeEvent: eventToTrigger,
                gameState: GameState.EVENT_SCREEN,
                eventResolutionText: null,
                lastEncounterTime: gameTime,
            });
            get().addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
        }
    } else {
        // --- COMBAT ENCOUNTER ---
        if (currentBiome === 'R' || currentBiome === 'S') return; // No combat in safe zones

        const enemyDb = useEnemyDatabaseStore.getState().enemyDatabase;
        const possibleEnemies = Object.values(enemyDb).filter((enemy: Enemy) => 
            enemy.biomes.includes("Global") || (currentBiomeName && enemy.biomes.includes(currentBiomeName))
        );

        if (possibleEnemies.length > 0) {
            const enemy = getRandom(possibleEnemies);
            startCombat(enemy.id); // This already sets lastEncounterTime
        }
    }
  },

  dismissEventResolution: () => {
    // FIX: Explicitly cast `activeEvent` to `GameEvent | null` to resolve type inference issue.
    const activeEvent = get().activeEvent as GameEvent | null;
    const activeEventId = activeEvent?.id;
    if (!activeEventId) { // Failsafe
         set({
            activeEvent: null,
            eventResolutionText: null,
            gameState: GameState.IN_GAME,
        });
        return;
    }
    set(state => ({
        eventHistory: [...state.eventHistory, activeEventId],
        activeEvent: null,
        eventResolutionText: null,
        gameState: GameState.IN_GAME,
    }));
  },

  resolveEventChoice: (choiceIndex: number) => {
    const { activeEvent, addJournalEntry, advanceTime } = get();
    const { addItem, removeItem, addXp, takeDamage, performSkillCheck, changeAlignment, heal, setStatus, boostAttribute } = useCharacterStore.getState();
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;

    if (!activeEvent) return;

    const choice = activeEvent.choices[choiceIndex];
    if (!choice) return;

    addJournalEntry({ text: `Hai scelto: "${choice.text}"`, type: JournalEntryType.NARRATIVE });

    let resolutionSummary: string[] = [];

    const applyResult = (result: EventResult): string | null => {
      let message: string | null = null;
      switch (result.type) {
          case 'addItem':
              addItem(result.value.itemId, result.value.quantity);
              const item = itemDatabase[result.value.itemId];
              if (item) {
                const text = `Hai ottenuto: ${item.name} x${result.value.quantity}.`;
                addJournalEntry({ text, type: JournalEntryType.ITEM_ACQUIRED });
                message = text;
              }
              break;
          case 'removeItem':
              removeItem(result.value.itemId, result.value.quantity);
              const removedItem = itemDatabase[result.value.itemId];
               if (removedItem) {
                  const text = `Hai perso: ${removedItem.name} x${result.value.quantity}.`;
                  addJournalEntry({ text, type: JournalEntryType.ACTION_FAILURE });
                  message = text;
               }
              break;
          case 'addXp':
              addXp(result.value);
              const textXp = `Hai guadagnato ${result.value} XP.`;
              addJournalEntry({ text: textXp, type: JournalEntryType.XP_GAIN });
              message = textXp;
              break;
          case 'takeDamage':
              takeDamage(result.value);
              const textDmg = `Subisci ${result.value} danni.`;
              addJournalEntry({ text: textDmg, type: JournalEntryType.COMBAT });
              message = textDmg;
              break;
          case 'advanceTime':
              advanceTime(result.value, true);
              const textTime = `Passano ${result.value} minuti.`;
              addJournalEntry({ text: textTime, type: JournalEntryType.NARRATIVE });
              message = textTime;
              break;
          case 'journalEntry':
              if (result.text) {
                addJournalEntry({ text: result.text, type: JournalEntryType.NARRATIVE });
                message = result.text;
              }
              break;
          case 'alignmentChange':
              changeAlignment(result.value.type, result.value.amount);
              const textAl = `La tua bussola morale si sposta verso ${result.value.type}.`;
               addJournalEntry({ text: textAl, type: JournalEntryType.NARRATIVE, color: '#facc15' });
               message = textAl;
              break;
          case 'statusChange':
              setStatus(result.value);
              const textStatus = `Sei ora in stato: ${result.value}.`;
              addJournalEntry({ text: textStatus, type: JournalEntryType.SYSTEM_WARNING });
              message = textStatus;
              break;
           case 'statBoost': {
              const { stat, amount } = result.value as { stat: AttributeName; amount: number };
              boostAttribute(stat, amount);
              const textStat = `La tua statistica ${stat.toUpperCase()} è aumentata permanentemente di ${amount}!`;
              addJournalEntry({ text: textStat, type: JournalEntryType.XP_GAIN });
              message = textStat;
              break;
            }
          case 'revealMapPOI':
               const textPoi = "Hai scoperto un nuovo punto di interesse sulla mappa!";
               addJournalEntry({ text: textPoi, type: JournalEntryType.NARRATIVE, color: '#60a5fa' });
               message = textPoi;
              break;
          case 'heal':
              heal(result.value);
              const textHeal = `Recuperi ${result.value} HP.`;
              addJournalEntry({ text: textHeal, type: JournalEntryType.SKILL_CHECK_SUCCESS });
              message = textHeal;
              break;
          case 'special':
              const textSpecial = result.text || `Si è verificato un evento speciale.`;
              addJournalEntry({ text: textSpecial, type: JournalEntryType.EVENT });
              message = textSpecial;
              break;
      }
      return message;
    };

    for (const outcome of choice.outcomes) {
        if (outcome.type === 'direct' && outcome.results) {
            outcome.results.forEach(result => {
                const msg = applyResult(result);
                if (msg) resolutionSummary.push(msg);
            });
        } else if (outcome.type === 'skillCheck' && outcome.skill && outcome.dc !== undefined) {
            const skillCheck = performSkillCheck(outcome.skill, outcome.dc);
            let checkText = `Prova di ${skillCheck.skill} (CD ${skillCheck.dc}): ${skillCheck.roll} (d20) + ${skillCheck.bonus} (mod) = ${skillCheck.total}. `;

            if (skillCheck.success) {
                checkText += "SUCCESSO. ";
                addJournalEntry({ text: checkText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
                if (outcome.successText) resolutionSummary.push(outcome.successText);
                if (outcome.success) {
                    outcome.success.forEach(result => {
                        const msg = applyResult(result);
                        if (msg) resolutionSummary.push(msg);
                    });
                }
            } else {
                checkText += "FALLIMENTO. ";
                addJournalEntry({ text: checkText, type: JournalEntryType.SKILL_CHECK_FAILURE });
                if (outcome.failureText) resolutionSummary.push(outcome.failureText);
                if (outcome.failure) {
                    outcome.failure.forEach(result => {
                        const msg = applyResult(result);
                        if (msg) resolutionSummary.push(msg);
                    });
                }
            }
        }
    }
    set({ eventResolutionText: resolutionSummary.join('\n') });
  },

  toggleCrafting: () => {
    set(state => {
      if (state.isInventoryOpen) return {};
      return { isCraftingOpen: !state.isCraftingOpen, craftingMenuState: { selectedIndex: 0 }};
    });
  },

  navigateCraftingMenu: (direction: number) => {
    const knownRecipes = useCharacterStore.getState().knownRecipes;
    const allRecipes = useRecipeDatabaseStore.getState().recipes;
    const displayableRecipes = allRecipes.filter(r => knownRecipes.includes(r.id));
    if (displayableRecipes.length === 0) return;

    set(state => {
      let newIndex = state.craftingMenuState.selectedIndex + direction;
      if (newIndex < 0) newIndex = displayableRecipes.length - 1;
      if (newIndex >= displayableRecipes.length) newIndex = 0;
      return { craftingMenuState: { selectedIndex: newIndex } };
    });
  },
  
  performCrafting: () => {
    const { craftingMenuState, addJournalEntry, advanceTime } = get();
    const { inventory, knownRecipes, performSkillCheck, removeItem, addItem } = useCharacterStore.getState();
    const allRecipes = useRecipeDatabaseStore.getState().recipes;
    const itemDatabase = useItemDatabaseStore.getState().itemDatabase;

    const displayableRecipes = allRecipes.filter(r => knownRecipes.includes(r.id));
    const recipe = displayableRecipes[craftingMenuState.selectedIndex];
    if (!recipe) return;

    const hasIngredients = recipe.ingredients.every(ing => {
        const playerItem = inventory.find(i => i.itemId === ing.itemId);
        return playerItem && playerItem.quantity >= ing.quantity;
    });

    if (!hasIngredients) {
        addJournalEntry({ text: "Ingredienti insufficienti.", type: JournalEntryType.ACTION_FAILURE });
        return;
    }

    advanceTime(recipe.timeCost, true);
    const skillCheck = performSkillCheck(recipe.skill, recipe.dc);
    let journalText = `Tenti di creare: ${recipe.name}. Prova di ${skillCheck.skill} (CD ${skillCheck.dc}): ${skillCheck.roll} + ${skillCheck.bonus} = ${skillCheck.total}. `;
    
    if (skillCheck.success) {
        journalText += "SUCCESSO.";
        recipe.ingredients.forEach(ing => removeItem(ing.itemId, ing.quantity));
        addItem(recipe.result.itemId, recipe.result.quantity);
        const resultItem = itemDatabase[recipe.result.itemId];
        journalText += ` Hai creato: ${resultItem.name} x${recipe.result.quantity}.`;
        addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
    } else {
        journalText += "FALLIMENTO.";
        let lostItemsText: string[] = [];
        recipe.ingredients.forEach(ing => {
            const quantityToRemove = Math.max(1, Math.floor(ing.quantity / 2));
            removeItem(ing.itemId, quantityToRemove);
            const item = itemDatabase[ing.itemId];
            lostItemsText.push(`${item.name} x${quantityToRemove}`);
        });
        journalText += ` Hai sprecato parte dei materiali: ${lostItemsText.join(', ')}.`;
        addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_FAILURE });
    }
  },

  openLevelUpScreen: () => {
      if (useCharacterStore.getState().levelUpPending) {
          set({ gameState: GameState.LEVEL_UP_SCREEN });
      } else {
          get().addJournalEntry({ text: "Non hai abbastanza XP per salire di livello.", type: JournalEntryType.SYSTEM_WARNING });
      }
  },

  startCombat: (enemyId: string) => {
    const enemyDb = useEnemyDatabaseStore.getState().enemyDatabase;
    const enemy = enemyDb[enemyId];
    if (!enemy) return;

    const combatState: CombatState = {
        enemy: { ...enemy },
        enemyHp: { current: enemy.hp, max: enemy.hp },
        playerTurn: true,
        log: [{ text: `Sei stato attaccato da un ${enemy.name}!`, color: '#facc15' }],
        revealedTactics: false,
        availableTacticalActions: [],
        victory: false
    };

    set({ activeCombat: combatState, gameState: GameState.COMBAT, lastEncounterTime: get().gameTime });
  },

  endCombat: (result) => {
    const { addJournalEntry } = get();
    if (result === 'flee') {
        addJournalEntry({ text: "Sei fuggito dal combattimento.", type: JournalEntryType.NARRATIVE });
    } else if (result === 'lose') {
        addJournalEntry({ text: "Sei stato sconfitto...", type: JournalEntryType.SYSTEM_ERROR });
    }
    set({ activeCombat: null, gameState: GameState.IN_GAME });
  },

  cleanupCombat: () => {
    set({ activeCombat: null, gameState: GameState.IN_GAME });
  },

  playerCombatAction: (action: PlayerCombatActionPayload) => {
    const combatState = get().activeCombat;
    if (!combatState || !combatState.playerTurn || combatState.victory) return;

    const { getPlayerAC, performSkillCheck, takeDamage, getAttributeModifier, equippedWeapon, removeItem, addItem, heal, addXp } = useCharacterStore.getState();
    const itemDb = useItemDatabaseStore.getState().itemDatabase;
    
    let newLog = [...combatState.log];
    let newEnemyHp = { ...combatState.enemyHp };
    let newPlayerTurn = false;
    let victory = false;
    let revealedTactics = combatState.revealedTactics;
    let availableTacticalActions = [...combatState.availableTacticalActions];
    
    const addLog = (text: string, color?: string) => newLog.push({ text, color });

    switch (action.type) {
      case 'attack': {
        addLog(getRandom(N.PLAYER_ATTACK_DESCRIPTIONS));
        const attackRoll = Math.floor(Math.random() * 20) + 1;
        const weapon = equippedWeapon ? itemDb[equippedWeapon] : null;
        const attackBonus = getAttributeModifier(weapon?.weaponType === 'ranged' ? 'des' : 'for');
        const totalAttack = attackRoll + attackBonus;
        addLog(`Tiro per colpire: ${attackRoll} + ${attackBonus} = ${totalAttack} vs CA ${combatState.enemy.ac}`, '#a3a3a3');

        if (totalAttack >= combatState.enemy.ac) {
            const baseDamage = weapon?.damage || 2;
            const damage = baseDamage + getAttributeModifier(weapon?.weaponType === 'ranged' ? 'des' : 'for') + Math.floor(Math.random() * 4) - 2;
            newEnemyHp.current = Math.max(0, newEnemyHp.current - damage);
            addLog(`${getRandom(N.PLAYER_HIT_DESCRIPTIONS)} Infliggi ${damage} danni.`, '#60BF77');
        } else {
            addLog(getRandom(N.PLAYER_MISS_DESCRIPTIONS), '#ff8c00');
        }
        break;
      }
      case 'analyze': {
        addLog("Passi il turno a studiare il nemico...");
        const check = performSkillCheck('percezione', combatState.enemy.tactics.revealDc);
        addLog(`Prova di Percezione (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
        if (check.success) {
            addLog("SUCCESSO! " + combatState.enemy.tactics.description, '#38bdf8');
            revealedTactics = true;
            availableTacticalActions = combatState.enemy.tactics.actions;
        } else {
            addLog("FALLIMENTO. Non noti nulla di particolare.", '#ff8c00');
        }
        break;
      }
      case 'flee': {
        addLog("Tenti di fuggire...");
        const check = performSkillCheck('furtivita', 12);
        addLog(`Prova di Furtività (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
        if (check.success) {
            addLog("Riesci a dileguarti nell'ombra!", '#60BF77');
            get().endCombat('flee');
            return;
        } else {
            addLog("FALLIMENTO. Il nemico ti blocca la strada e approfitta della tua distrazione!", '#ff8c00');
        }
        break;
      }
      case 'tactic': {
        const tactic = combatState.enemy.tactics.actions.find(t => t.id === action.tacticId);
        if(tactic && tactic.skillCheck) {
            addLog(tactic.description);
            const check = performSkillCheck(tactic.skillCheck.skill, tactic.skillCheck.dc);
            addLog(`Prova di ${check.skill} (CD ${check.dc}): ${check.roll} + ${check.bonus} = ${check.total}.`);
            if (check.success) {
                const bonusDamage = 15;
                addLog(`SUCCESSO! Il nemico è sbilanciato e vulnerabile! Infliggi ${bonusDamage} danni extra.`, '#38bdf8');
                newEnemyHp.current = Math.max(0, newEnemyHp.current - bonusDamage);
            } else {
                addLog("FALLIMENTO! La tua mossa non riesce.", '#ff8c00');
            }
        }
        break;
      }
      case 'use_item': {
          const item = itemDb[action.itemId];
          if(item) {
              addLog(`Usi ${item.name}...`);
              removeItem(action.itemId, 1);
              if(item.effects) {
                  item.effects.forEach(effect => {
                      if (effect.type === 'heal') {
                          heal(effect.value as number);
                          addLog(`Recuperi ${effect.value} HP.`, '#60BF77');
                      }
                  });
              }
          }
        break;
      }
    }
    
    if (newEnemyHp.current <= 0) {
      addLog(getRandom(N.ENEMY_DEATH_DESCRIPTIONS).replace('{enemy}', combatState.enemy.name), '#f59e0b');
      addXp(combatState.enemy.xp);
      addLog(`Hai guadagnato ${combatState.enemy.xp} XP.`, JOURNAL_ENTRY_COLORS[JournalEntryType.XP_GAIN]);
      victory = true;
      newPlayerTurn = false;
    }

    set({ activeCombat: { ...combatState, log: newLog, enemyHp: newEnemyHp, playerTurn: newPlayerTurn, victory, revealedTactics, availableTacticalActions } });

    if (!victory && !get().activeCombat?.playerTurn) {
        setTimeout(() => {
            const currentCombatState = get().activeCombat;
            if(!currentCombatState || currentCombatState.victory) return;

            const enemy = currentCombatState.enemy;
            let enemyLog = [...currentCombatState.log];
            const addEnemyLog = (text: string, color?: string) => enemyLog.push({ text, color });

            addEnemyLog(getRandom(N.ENEMY_ATTACK_DESCRIPTIONS).replace('{enemy}', enemy.name));
            const enemyAttackRoll = Math.floor(Math.random() * 20) + 1;
            const totalEnemyAttack = enemyAttackRoll + enemy.attack.bonus;
            const playerAC = getPlayerAC();
            addEnemyLog(`Tiro per colpire del nemico: ${enemyAttackRoll} + ${enemy.attack.bonus} = ${totalEnemyAttack} vs CA ${playerAC}`, '#a3a3a3');

            if (totalEnemyAttack >= playerAC) {
                const damage = enemy.attack.damage + Math.floor(Math.random() * 3) - 1;
                takeDamage(damage);
                addEnemyLog(`${getRandom(N.ENEMY_HIT_DESCRIPTIONS)} Subisci ${damage} danni.`, '#ef4444');
            } else {
                addEnemyLog(getRandom(N.ENEMY_MISS_DESCRIPTIONS), '#60BF77');
            }

            if (useCharacterStore.getState().hp.current <= 0) {
                addEnemyLog("Sei stato sconfitto...", '#ff0000');
                get().endCombat('lose');
            } else {
                 set(state => ({
                    activeCombat: { ...state.activeCombat!, log: enemyLog, playerTurn: true }
                }));
            }
        }, 1500);
    }
  },
}));