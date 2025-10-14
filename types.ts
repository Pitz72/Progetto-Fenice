// --- Enums ---
export enum GameState {
  INITIAL_BLACK_SCREEN,
  PRESENTS_SCREEN,
  INTERSTITIAL_BLACK_SCREEN,
  BOOTING_SCREEN,
  MAIN_MENU,
  CHARACTER_CREATION,
  INSTRUCTIONS_SCREEN,
  STORY_SCREEN,
  OPTIONS_SCREEN,
  IN_GAME,
  GAME_OVER,
}

export enum WeatherType {
  SERENO,
  NUVOLOSO,
  PIOGGIA,
  TEMPESTA,
  NEBBIA,
}

// --- Interfaces & Types for Game State ---
export interface Position {
  x: number;
  y: number;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}

export interface WeatherState {
  type: WeatherType;
  duration: number; // in minutes
}

export interface PlayerStatus {
  isExitingWater: boolean;
}

export enum LogMessageType {
  GAME_START,
  SKILL_SUCCESS,
  SKILL_FAILURE,
  ACTION_FAILURE,
  NARRATIVE,
  ITEM_ACQUIRED,
  SYSTEM_ERROR,
  SYSTEM_WARNING,
  COMBAT,
  XP_GAIN,
}

export interface JournalEntry {
  type: LogMessageType;
  text: string;
  timestamp: GameTime;
  icon?: string;
}

export interface TileInfo {
  char: string;
  name: string;
}

export interface ActionMenuState {
    isOpen: boolean;
    options: string[];
    selectedIndex: number;
}

export interface GameStoreState {
  gameState: GameState;
  map: string[][];
  playerPos: Position;
  gameTime: GameTime;
  weather: WeatherState;
  playerStatus: PlayerStatus;
  journal: JournalEntry[];
  isInventoryOpen: boolean;
  inventorySelectedIndex: number;
  actionMenuState: ActionMenuState;
  
  setGameState: (newState: GameState) => void;
  addJournalEntry: (message: string) => void;
  setMap: () => void;
  advanceTime: (minutes: number) => void;
  movePlayer: (dx: number, dy: number) => void;
  getTileInfo: (x: number, y: number) => TileInfo;
  toggleInventory: () => void;
  setInventorySelectedIndex: (updater: (prev: number) => number) => void;
  openActionMenu: () => void;
  closeActionMenu: () => void;
  navigateActionMenu: (direction: number) => void;
  confirmActionMenuSelection: () => void;
}

// --- Interfaces & Types for Character State ---
export type AttributeName = 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car';
export type SkillName = 
  'atletica' | 'acrobazia' | 'furtivita' | 'rapiditaDiMano' |
  'arcanismo' | 'storia' | 'investigare' | 'natura' | 'religione' |
  'addestrareAnimali' | 'intuizione' | 'medicina' | 'percezione' | 'sopravvivenza' |
  'inganno' | 'intimidire' | 'persuasione' | 'spettacolo';
  
export interface Attributes {
  for: number;
  des: number;
  cos: number;
  int: number;
  sag: number;
  car: number;
}

export interface Stat {
  current: number;
  max: number;
}

export interface Skill {
  proficient: boolean;
}

export interface SkillDefinition {
  attribute: AttributeName;
}

export interface SkillCheckResult {
  skill: SkillName;
  roll: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
}

export interface CharacterState {
    level: number;
    xp: { current: number; next: number };
    hp: Stat;
    satiety: Stat;
    hydration: Stat;
    attributes: Attributes;
    skills: Record<SkillName, Skill>;
    inventory: InventoryItem[];
    equippedWeapon: string | null;
    equippedArmor: string | null;

    initCharacter: (attributes?: Attributes) => void;
    getAttributeModifier: (attribute: AttributeName) => number;
    getSkillBonus: (skill: SkillName) => number;
    performSkillCheck: (skill: SkillName, dc: number) => SkillCheckResult;
    addXp: (amount: number) => void;
    levelUp: () => void;
    addItem: (itemId: string, quantity?: number) => void;
    removeItem: (itemId: string, quantity?: number) => void;
    discardItem: (itemId: string, quantity?: number) => void;
    equipItem: (itemId: string) => void;
    unequipItem: (slot: 'weapon' | 'armor') => void;
    takeDamage: (amount: number) => void;
    updateSurvivalStats: (minutes: number, weather: WeatherType) => void;
    heal: (amount: number) => void;
    restoreSatiety: (amount: number) => void;
    restoreHydration: (amount: number) => void;
}

// --- Interfaces & Types for Items ---
export type ItemType = 'weapon' | 'armor' | 'ammo' | 'consumable' | 'crafting' | 'manual' | 'quest' | 'unique';
export interface ItemEffect {
    type: string;
    value: number;
}

export interface IItem {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    weight: number;
    value: number;
    stackable?: boolean;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Unique' | 'quest';
    damage?: string | number;
    armor?: number;
    effects?: ItemEffect[];
    unlocksRecipes?: string[];
    weaponType?: 'melee' | 'ranged' | 'thrown';
    slot?: 'head' | 'chest' | 'legs';
    defense?: number;
}
