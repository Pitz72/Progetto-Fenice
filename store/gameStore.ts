import { create } from 'zustand';
import { GameState, GameStoreState, TileInfo, WeatherType, WeatherState, JournalEntry, ActionMenuState, JournalEntryType, GameTime, RefugeMenuState, Position, EventResult, CraftingMenuState, GameEvent, AttributeName } from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { useItemDatabaseStore } from '../data/itemDatabase';
import { useEventDatabaseStore } from '../data/eventDatabase';
import { useRecipeDatabaseStore } from '../data/recipeDatabase';
import { MOUNTAIN_MESSAGES, BIOME_MESSAGES, ATMOSPHERIC_MESSAGES, BIOME_COLORS } from '../constants';

// --- Constants for Game Logic ---
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);
const IMPASSABLE_TILES = new Set(['M']);
const EVENT_TRIGGER_PROBABILITY = 0.20; // 20% chance to trigger an event on a valid tile

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
  lootedRefuges: [],
  visitedRefuges: [],
  activeEvent: null,
  eventHistory: [],
  eventResolutionText: null,


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
        lootedRefuges: [],
        visitedRefuges: [],
        activeEvent: null,
        eventHistory: [],
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
    const { map, playerPos, playerStatus, weather, gameTime, advanceTime, addJournalEntry, enterRefuge, visitedRefuges, triggerRandomEvent } = get();
    
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

    // Event Trigger Logic
    triggerRandomEvent();
    if (get().activeEvent) return; // Stop further processing if an event is triggered
    
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
                          case 'heal': charState.heal(effect.value); effectMessages.push(`Recuperi ${effect.value} HP.`); break;
                          case 'satiety': charState.restoreSatiety(effect.value); effectMessages.push(`Recuperi ${effect.value} sazietà.`); break;
                          case 'hydration': charState.restoreHydration(effect.value); effectMessages.push(`Recuperi ${effect.value} idratazione.`); break;
                          // ... other effects
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

  triggerRandomEvent: () => {
    const { currentBiome, eventHistory } = get();
    if (Math.random() > EVENT_TRIGGER_PROBABILITY) return;

    const { biomeEvents, globalEncounters, loreEvents } = useEventDatabaseStore.getState();

    const biomeCharToName: Record<string, string> = {
        '.': 'Pianura', 'F': 'Foresta', 'V': 'Villaggio', 'C': 'Città', '~': 'Acqua'
    };
    const currentBiomeName = biomeCharToName[currentBiome] || currentBiome;

    // --- LORE EVENT TRIGGER LOGIC ---
    const LORE_EVENT_PROBABILITY = 0.15; // 15% chance to trigger a lore event if one is available
    if (Math.random() < LORE_EVENT_PROBABILITY) {
      const possibleLoreEvents = loreEvents.filter(event => 
          event.biomes.includes(currentBiomeName) &&
          (!event.isUnique || !eventHistory.includes(event.id))
      );

      if (possibleLoreEvents.length > 0) {
        const eventToTrigger = possibleLoreEvents[Math.floor(Math.random() * possibleLoreEvents.length)];
        set({ activeEvent: eventToTrigger, gameState: GameState.EVENT_SCREEN, eventResolutionText: null });
        get().addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
        return; // Lore event triggered, exit function
      }
    }
    
    // --- STANDARD EVENT TRIGGER LOGIC (Fallback) ---
    // Filter biome-specific events
    const possibleBiomeEvents = biomeEvents.filter(event => 
        event.biomes.includes(currentBiomeName) &&
        (!event.isUnique || !eventHistory.includes(event.id))
    );

    // Filter global encounters
    const possibleGlobalEncounters = globalEncounters.filter(event => 
        !event.isUnique || !eventHistory.includes(event.id)
    );
    
    const hasBiomeEvents = possibleBiomeEvents.length > 0;
    const hasGlobalEncounters = possibleGlobalEncounters.length > 0;

    if (!hasBiomeEvents && !hasGlobalEncounters) return;

    let eventToTrigger: GameEvent | null = null;
    
    // Decide which pool to draw from. 50% chance for a biome event if available.
    const roll = Math.random();
    if (hasBiomeEvents && (!hasGlobalEncounters || roll < 0.50)) {
        eventToTrigger = possibleBiomeEvents[Math.floor(Math.random() * possibleBiomeEvents.length)];
    } else if (hasGlobalEncounters) {
        eventToTrigger = possibleGlobalEncounters[Math.floor(Math.random() * possibleGlobalEncounters.length)];
    }
    
    if (eventToTrigger) {
        set({ activeEvent: eventToTrigger, gameState: GameState.EVENT_SCREEN, eventResolutionText: null });
        get().addJournalEntry({ text: `EVENTO: ${eventToTrigger.title}`, type: JournalEntryType.EVENT });
    }
  },

  dismissEventResolution: () => {
    const activeEventId = get().activeEvent?.id;
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
              const textSpecial = `Effetto speciale: ${result.value.effect || 'attivato'}.`;
              addJournalEntry({ text: textSpecial, type: JournalEntryType.NARRATIVE, color: '#a78bfa'});
              message = textSpecial;
              break;
      }
      return message;
    };
    
    choice.outcomes.forEach(outcome => {
        if (outcome.type === 'direct' && outcome.results) {
            outcome.results.forEach(result => {
                const msg = applyResult(result);
                if (msg) resolutionSummary.push(msg);
            });
        } else if (outcome.type === 'skillCheck' && outcome.skill && outcome.dc) {
            const skillCheck = performSkillCheck(outcome.skill, outcome.dc);
            let journalText = `Prova di ${outcome.skill} (CD ${skillCheck.dc}): ${skillCheck.roll} (d20) + ${skillCheck.bonus} (mod) = ${skillCheck.total}. `;
            
            if (skillCheck.success) {
                journalText += "SUCCESSO.";
                addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
                if (outcome.successText) {
                  resolutionSummary.push(outcome.successText);
                  addJournalEntry({ text: outcome.successText, type: JournalEntryType.NARRATIVE });
                }
                outcome.success?.forEach(result => {
                  const msg = applyResult(result);
                  if (msg && !outcome.successText) resolutionSummary.push(msg);
                });
            } else {
                journalText += "FALLIMENTO.";
                addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_FAILURE });
                if (outcome.failureText) {
                  resolutionSummary.push(outcome.failureText);
                  addJournalEntry({ text: outcome.failureText, type: JournalEntryType.NARRATIVE });
                }
                outcome.failure?.forEach(result => {
                  const msg = applyResult(result);
                  if (msg && !outcome.failureText) resolutionSummary.push(msg);
                });
            }
        }
    });
    
    set({ eventResolutionText: resolutionSummary.join('\n') });
  },

  toggleCrafting: () => {
    set(state => {
        if (state.isInventoryOpen) return {};
        return {
            isCraftingOpen: !state.isCraftingOpen,
            craftingMenuState: { selectedIndex: 0 }
        };
    });
  },

  navigateCraftingMenu: (direction: number) => {
    const recipes = useRecipeDatabaseStore.getState().recipes;
    if (recipes.length === 0) return;
    set(state => {
        let newIndex = state.craftingMenuState.selectedIndex + direction;
        if (newIndex < 0) newIndex = recipes.length - 1;
        if (newIndex >= recipes.length) newIndex = 0;
        return { craftingMenuState: { selectedIndex: newIndex } };
    });
  },

  performCrafting: () => {
    const { craftingMenuState, addJournalEntry, advanceTime } = get();
    const { inventory, removeItem, addItem, performSkillCheck } = useCharacterStore.getState();
    const { recipes } = useRecipeDatabaseStore.getState();
    const { itemDatabase } = useItemDatabaseStore.getState();

    const selectedRecipe = recipes[craftingMenuState.selectedIndex];
    if (!selectedRecipe) return;

    // Check ingredients
    for (const ingredient of selectedRecipe.ingredients) {
        const playerItem = inventory.find(i => i.itemId === ingredient.itemId);
        if (!playerItem || playerItem.quantity < ingredient.quantity) {
            addJournalEntry({ text: `Creazione fallita: mancano gli ingredienti. (${itemDatabase[ingredient.itemId]?.name})`, type: JournalEntryType.ACTION_FAILURE });
            return;
        }
    }
    
    // Perform skill check
    const skillCheck = performSkillCheck(selectedRecipe.skill, selectedRecipe.dc);
    let journalText = `Prova di ${selectedRecipe.skill} (CD ${skillCheck.dc}): ${skillCheck.roll} (d20) + ${skillCheck.bonus} (mod) = ${skillCheck.total}. `;
    
    advanceTime(selectedRecipe.timeCost, true);

    if (skillCheck.success) {
        journalText += "SUCCESSO.";
        // Consume ingredients
        selectedRecipe.ingredients.forEach(ing => removeItem(ing.itemId, ing.quantity));
        // Add result
        addItem(selectedRecipe.result.itemId, selectedRecipe.result.quantity);
        const resultItem = itemDatabase[selectedRecipe.result.itemId];
        journalText += ` Hai creato: ${resultItem.name} x${selectedRecipe.result.quantity}.`;
        addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_SUCCESS });
    } else {
        journalText += "FALLIMENTO.";
        // Consume half of the ingredients on failure (rounded down)
        selectedRecipe.ingredients.forEach(ing => {
            const quantityToRemove = Math.max(1, Math.floor(ing.quantity / 2));
            removeItem(ing.itemId, quantityToRemove);
        });
        journalText += " Hai sprecato parte dei materiali nel tentativo.";
        addJournalEntry({ text: journalText, type: JournalEntryType.SKILL_CHECK_FAILURE });
    }
  },
  
  openLevelUpScreen: () => {
    if (useCharacterStore.getState().levelUpPending) {
        set({ gameState: GameState.LEVEL_UP_SCREEN });
    } else {
        get().addJournalEntry({ text: "Non hai ancora abbastanza esperienza per salire di livello.", type: JournalEntryType.SYSTEM_WARNING });
    }
  },

}));