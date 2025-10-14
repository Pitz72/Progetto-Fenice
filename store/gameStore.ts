import { create } from 'zustand';
import { GameState, GameStoreState, TileInfo, WeatherType, WeatherState, JournalEntry, ActionMenuState } from '../types';
import { MAP_DATA } from '../data/mapData';
import { useCharacterStore } from './characterStore';
import { itemDatabase } from '../src/data/itemDatabase';

// --- Constants for Game Logic ---
const TRAVERSABLE_TILES = new Set(['.', 'R', 'C', 'V', 'F', 'S', 'E', '~']);
const IMPASSABLE_TILES = new Set(['M']);

const TILE_NAMES: Record<string, string> = {
    '.': 'Pianura', 'F': 'Foresta', '~': 'Acqua', 'M': 'Montagna',
    'R': 'Rifugio', 'C': 'Città', 'V': 'Villaggio',
    'S': 'Punto di Partenza', 'E': 'Destinazione', '@': 'Tu'
};

const BASE_TIME_COST_PER_MOVE = 10; // minutes

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
  inventorySelectedIndex: 0,
  actionMenuState: {
      isOpen: false,
      options: [],
      selectedIndex: 0,
  },


  // --- Actions ---
  setGameState: (newState) => set({ gameState: newState }),
  
  addJournalEntry: (message) => {
    set(state => ({
        journal: [{ message, time: state.gameTime }, ...state.journal].slice(0, 100) // Keep last 100 entries
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
        journal: [{ message: "Il tuo viaggio ha inizio.", time: { day: 1, hour: 8, minute: 0 } }]
    });
  },

  advanceTime: (minutes: number) => {
    if (get().isInventoryOpen) return; // Game is paused when inventory is open

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
        get().addJournalEntry(`Il tempo sta cambiando... Ora è ${WEATHER_DATA[nextWeatherType].name.toLowerCase()}.`);
    }
    set({ weather: newWeather });
    
    // --- Update Character Survival Stats ---
    useCharacterStore.getState().updateSurvivalStats(minutes, get().weather.type);
  },

  movePlayer: (dx, dy) => {
    const { map, playerPos, playerStatus, weather, advanceTime, addJournalEntry } = get();
    
    if (playerStatus.isExitingWater) {
        set({ playerStatus: { ...playerStatus, isExitingWater: false } });
        advanceTime(BASE_TIME_COST_PER_MOVE); 
        addJournalEntry("Esci dall'acqua, scrollandoti di dosso il freddo.");
        return;
    }

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };

    if ( newPos.y < 0 || newPos.y >= map.length || newPos.x < 0 || newPos.x >= map[newPos.y].length ) return;
    
    const destinationTile = map[newPos.y][newPos.x];
    if (IMPASSABLE_TILES.has(destinationTile)) return;
    if (!TRAVERSABLE_TILES.has(destinationTile)) return;

    // --- Calculate Time Cost ---
    let timeCost = BASE_TIME_COST_PER_MOVE;
    if (destinationTile === 'F') timeCost += 10; // Forest penalty
    
    // Weather penalty
    let weatherPenalty = 0;
    if (weather.type === WeatherType.PIOGGIA) weatherPenalty = 5;
    if (weather.type === WeatherType.TEMPESTA) weatherPenalty = 10;
    if (weatherPenalty > 0) {
        timeCost += weatherPenalty;
        addJournalEntry(`${weather.type} rallenta i tuoi movimenti. (+${weatherPenalty} min)`);
    }
    
    // --- Weather Damage ---
    if (weather.type === WeatherType.TEMPESTA && Math.random() < 0.15) { // 15% chance
        useCharacterStore.getState().takeDamage(1);
        addJournalEntry("Il vento violento ti fa inciampare. (-1 HP)");
    }
    if (weather.type === WeatherType.PIOGGIA && Math.random() < 0.08) { // 8% chance
        useCharacterStore.getState().takeDamage(1);
        addJournalEntry("Il terreno scivoloso ti fa cadere. (-1 HP)");
    }

    // --- Update State ---
    set({ playerPos: newPos });
    if (destinationTile === '~') {
        set({ playerStatus: { ...get().playerStatus, isExitingWater: true } });
        addJournalEntry("Entri nell'acqua gelida.");
    }

    advanceTime(timeCost);
  },

  getTileInfo: (x: number, y: number): TileInfo => {
    const { map } = get();
    if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
        return { char: ' ', name: 'Sconosciuto' };
    }
    const char = map[y][x];
    return { char, name: TILE_NAMES[char] || 'Terreno Misterioso' };
  },

  // --- Inventory & Action Menu Actions ---
  toggleInventory: () => {
    set(state => {
        if (state.actionMenuState.isOpen) {
            return { actionMenuState: { ...state.actionMenuState, isOpen: false } };
        }
        const isOpen = !state.isInventoryOpen;
        return { isInventoryOpen: isOpen, inventorySelectedIndex: 0 };
    });
  },

  setInventorySelectedIndex: (updater) => {
    const inventory = useCharacterStore.getState().inventory;
    const { equippedWeapon, equippedArmor } = useCharacterStore.getState();
    const displayInventory = inventory.filter(i => i.itemId !== equippedWeapon && i.itemId !== equippedArmor);
    
    if (displayInventory.length === 0) {
        set({ inventorySelectedIndex: 0 });
        return;
    }
    set(state => {
        const newIndex = updater(state.inventorySelectedIndex);
        // Wrap around logic
        if (newIndex < 0) return { inventorySelectedIndex: displayInventory.length - 1 };
        if (newIndex >= displayInventory.length) return { inventorySelectedIndex: 0 };
        return { inventorySelectedIndex: newIndex };
    });
  },

  openActionMenu: () => {
      const { inventorySelectedIndex } = get();
      const { inventory, equippedWeapon, equippedArmor } = useCharacterStore.getState();
      const displayInventory = inventory.filter(i => i.itemId !== equippedWeapon && i.itemId !== equippedArmor);

      if (!displayInventory[inventorySelectedIndex]) return;
      
      const selectedItemId = displayInventory[inventorySelectedIndex].itemId;
      const itemDetails = itemDatabase[selectedItemId];
      if (!itemDetails) return;
      
      let options: string[] = [];
      const isEquipped = equippedWeapon === selectedItemId || equippedArmor === selectedItemId;

      switch(itemDetails.type) {
          case 'consumable':
              options = ['Usa', 'Scarta', 'Annulla'];
              break;
          case 'weapon':
          case 'armor':
              if (isEquipped) {
                 options = ['Togli', 'Scarta', 'Annulla'];
              } else {
                 options = ['Equipaggia', 'Scarta', 'Annulla'];
              }
              break;
          default:
              options = ['Esamina', 'Scarta', 'Annulla'];
              break;
      }
      set({ actionMenuState: { isOpen: true, options, selectedIndex: 0 } });
  },

  closeActionMenu: () => {
      set({ actionMenuState: { isOpen: false, options: [], selectedIndex: 0 } });
  },

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
      const { inventory, equippedWeapon, equippedArmor, ...charActions } = useCharacterStore.getState();
      
      const isActuallyEquipped = (itemId: string) => equippedWeapon === itemId || equippedArmor === itemId;

      // Determine the correct item list based on whether we are viewing an equipped item or an inventory item
      const selectedAction = actionMenuState.options[actionMenuState.selectedIndex];
      let itemToActOnId: string;
      
      // A bit complex: if the action is 'Togli', we need to find the *equipped* item.
      // Otherwise, we act on the selected item in the *visible* (filtered) inventory list.
      if (selectedAction === 'Togli') {
          // Find which item is equipped that matches the selected list item
          const displayInventory = inventory.filter(i => !isActuallyEquipped(i.itemId));
          const list_item_id = displayInventory[inventorySelectedIndex]?.itemId;
          // This logic is tricky. Let's find the equipped item that *would have been* in this list.
          // A better way: decide which item to act on when opening the menu. Let's assume for now it's always the selected inventory item
          const allItems = [...inventory, {itemId: equippedWeapon, quantity: 1}, {itemId: equippedArmor, quantity: 1}].filter(i => i.itemId);
          
          // Let's simplify. The item must come from the displayed list. 'Togli' should be handled differently.
          // For now, let's assume `openActionMenu` logic is correct and we can derive the item.
           const displayInv = inventory.filter(i => i.itemId !== equippedWeapon && i.itemId !== equippedArmor);
            if (!displayInv[inventorySelectedIndex]) {
                // This case happens if the action was on an equipped item, let's find it.
                // This part of the logic is flawed. Let's fix `openActionMenu` to be smarter.
                 closeActionMenu();
                 return;
            }
           itemToActOnId = displayInv[inventorySelectedIndex].itemId;

      } else {
         const displayInventory = inventory.filter(i => i.itemId !== equippedWeapon && i.itemId !== equippedArmor);
         if (!displayInventory[inventorySelectedIndex]) {
             closeActionMenu();
             return;
         }
         itemToActOnId = displayInventory[inventorySelectedIndex].itemId;
      }
      
      const itemDetails = itemDatabase[itemToActOnId];
      
      switch (selectedAction) {
          case 'Usa':
              if (itemDetails.type === 'consumable') {
                  let message = `Hai usato: ${itemDetails.name}.`;
                  switch(itemDetails.effect) {
                      case 'heal':
                          charActions.heal(itemDetails.effectValue);
                          message += ` Recuperi ${itemDetails.effectValue} HP.`;
                          break;
                      case 'satiety':
                          charActions.restoreSatiety(itemDetails.effectValue);
                           message += ` Recuperi ${itemDetails.effectValue} sazietà.`;
                          break;
                      case 'hydration':
                          charActions.restoreHydration(itemDetails.effectValue);
                           message += ` Recuperi ${itemDetails.effectValue} idratazione.`;
                          break;
                  }
                  addJournalEntry(message);
                  charActions.removeItem(itemToActOnId, 1);
              }
              break;
          case 'Equipaggia':
              charActions.equipItem(itemToActOnId);
              addJournalEntry(`Hai equipaggiato: ${itemDetails.name}.`);
              break;
          case 'Togli':
              const slot = itemDetails.type === 'weapon' ? 'weapon' : 'armor';
              charActions.unequipItem(slot);
              addJournalEntry(`Hai tolto: ${itemDetails.name}.`);
              break;
          case 'Scarta':
              charActions.discardItem(itemToActOnId, 1);
              addJournalEntry(`Hai scartato: ${itemDetails.name}.`);
              break;
          case 'Esamina':
              addJournalEntry(`Esamini: ${itemDetails.name}. ${itemDetails.description}`);
              break;
          case 'Annulla':
              // Do nothing
              break;
      }
      
      closeActionMenu();
      
      // Adjust inventory index if the list becomes shorter
      const newDisplayInventory = useCharacterStore.getState().inventory.filter(i => i.itemId !== useCharacterStore.getState().equippedWeapon && i.itemId !== useCharacterStore.getState().equippedArmor);
      if (inventorySelectedIndex >= newDisplayInventory.length) {
          set({ inventorySelectedIndex: Math.max(0, newDisplayInventory.length - 1) });
      }
  }

}));