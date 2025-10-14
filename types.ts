// --- Game State & Core Types ---
export enum GameState {
  INITIAL_BLACK_SCREEN,
  PRESENTS_SCREEN,
  INTERSTITIAL_BLACK_SCREEN,
  BOOTING_SCREEN,
  MAIN_MENU,
  INSTRUCTIONS_SCREEN,
  STORY_SCREEN,
  OPTIONS_SCREEN,
  CHARACTER_CREATION,
  IN_GAME,
}

export enum JournalEntryType {
  GAME_START,
  SKILL_CHECK_SUCCESS,
  SKILL_CHECK_FAILURE,
  ACTION_FAILURE,
  NARRATIVE,
  ITEM_ACQUIRED,
  SYSTEM_ERROR,
  SYSTEM_WARNING,
  COMBAT,
  XP_GAIN,
}

export interface Position {
  x: number;
  y: number;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
}

export interface JournalEntry {
    type: JournalEntryType;
    text: string;
    time: GameTime;
    color?: string;
}

export interface TileInfo {
  char: string;
  name: string;
}

// --- Weather System ---
export enum WeatherType {
    SERENO = 'Sereno',
    NUVOLOSO = 'Nuvoloso',
    PIOGGIA = 'Pioggia',
    TEMPESTA = 'Tempesta',
    NEBBIA = 'Nebbia',
}

export interface WeatherState {
  type: WeatherType;
  duration: number; // in minutes
}

// --- UI & Menu States ---
export interface ActionMenuState {
    isOpen: boolean;
    options: string[];
    selectedIndex: number;
}

export interface RefugeMenuState {
    isOpen: boolean;
    options: string[];
    selectedIndex: number;
}

// --- Store States ---
export interface PlayerStatus {
    isExitingWater: boolean;
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
  isInRefuge: boolean;
  inventorySelectedIndex: number;
  actionMenuState: ActionMenuState;
  refugeMenuState: RefugeMenuState;
  refugeActionMessage: string | null;
  refugeJustSearched: boolean;
  currentBiome: string;
  lastRestTime: GameTime | null;
  lootedRefuges: Position[];
  visitedRefuges: Position[];
  
  // Actions
  setGameState: (newState: GameState) => void;
  addJournalEntry: (entry: { text: string; type: JournalEntryType; color?: string }) => void;
  setMap: () => void;
  advanceTime: (minutes: number, bypassPause?: boolean) => void;
  movePlayer: (dx: number, dy: number) => void;
  getTileInfo: (x: number, y: number) => TileInfo;
  toggleInventory: () => void;
  setInventorySelectedIndex: (updater: (prev: number) => number) => void;
  openActionMenu: () => void;
  closeActionMenu: () => void;
  navigateActionMenu: (direction: number) => void;
  confirmActionMenuSelection: () => void;
  performQuickRest: () => void;
  enterRefuge: () => void;
  leaveRefuge: () => void;
  navigateRefugeMenu: (direction: number) => void;
  confirmRefugeMenuSelection: () => void;
  searchRefuge: () => void;
  clearRefugeActionMessage: () => void;
}


// --- Character System ---
export type AttributeName = 'for' | 'des' | 'cos' | 'int' | 'sag' | 'car';

export type SkillName = 
  | 'atletica' | 'acrobazia' | 'furtivita' | 'rapiditaDiMano'
  | 'arcanismo' | 'storia' | 'investigare' | 'natura' | 'religione'
  | 'addestrareAnimali' | 'intuizione' | 'medicina' | 'percezione' | 'sopravvivenza'
  | 'inganno' | 'intimidire' | 'persuasione' | 'spettacolo';

export interface Attributes {
  for: number;
  des: number;
  cos: number;
  int: number;
  sag: number;
  car: number;
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

export interface Stat {
    current: number;
    max: number;
}

export interface XPState {
    current: number;
    next: number;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
}

export interface CharacterState {
    level: number;
    xp: XPState;
    hp: Stat;
    satiety: Stat;
    hydration: Stat;
    attributes: Attributes;
    skills: Record<SkillName, Skill>;
    inventory: InventoryItem[];
    equippedWeapon: string | null;
    equippedArmor: string | null;

    // Actions
    initCharacter: (newAttributes?: Attributes) => void;
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
    calculateSurvivalCost: (minutes: number) => { satietyCost: number; hydrationCost: number };
    heal: (amount: number) => void;
    restoreSatiety: (amount: number) => void;
    restoreHydration: (amount: number) => void;
}

// --- Item System ---
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'ammo';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'quest';
export type WeaponType = 'melee' | 'ranged' | 'thrown';
export type ArmorSlot = 'head' | 'chest' | 'legs';
export type ItemEffectType = 
    | 'heal' | 'satiety' | 'hydration' | 'light' | 'trap' | 'container' 
    | 'vision' | 'repair' | 'shelter' | 'random' | 'antirad' | 'power' 
    | 'fishing' | 'smoke' | 'communication' | 'fire';

export interface ItemEffect {
    type: ItemEffectType;
    value: number;
}

export interface IItem {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    weight: number;
    value: number;
    stackable: boolean;
    color: string;
    damage?: number;
    weaponType?: WeaponType;
    defense?: number;
    slot?: ArmorSlot;
    effects?: ItemEffect[];
}