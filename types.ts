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
  EVENT_SCREEN,
  LEVEL_UP_SCREEN,
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
  EVENT,
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

export interface CraftingMenuState {
    selectedIndex: number;
}

// --- Event System ---
export type EventResultType = 
    | 'addItem' | 'removeItem' | 'addXp' | 'takeDamage' | 'advanceTime' 
    | 'journalEntry' | 'alignmentChange' | 'statusChange' | 'statBoost' | 'revealMapPOI' | 'heal' | 'special';

export interface EventResult {
    type: EventResultType;
    value: any;
    text?: string;
}

export interface EventOutcome {
    type: 'direct' | 'skillCheck';
    skill?: SkillName;
    dc?: number;
    success?: EventResult[];
    failure?: EventResult[];
    results?: EventResult[]; // For direct outcomes
    successText?: string;
    failureText?: string;
}

export interface EventChoice {
    text: string;
    alignment?: 'Lena' | 'Elian';
    itemRequirements?: { itemId: string; quantity: number }[];
    outcomes: EventOutcome[];
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    biomes: string[];
    isUnique: boolean;
    choices: EventChoice[];
}

// --- Crafting System ---
export interface Ingredient {
    itemId: string;
    quantity: number;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    skill: SkillName;
    dc: number;
    timeCost: number; // in minutes
    ingredients: Ingredient[];
    result: {
        itemId: string;
        quantity: number;
    };
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
  isCraftingOpen: boolean;
  inventorySelectedIndex: number;
  actionMenuState: ActionMenuState;
  refugeMenuState: RefugeMenuState;
  craftingMenuState: CraftingMenuState;
  refugeActionMessage: string | null;
  refugeJustSearched: boolean;
  currentBiome: string;
  lastRestTime: GameTime | null;
  lootedRefuges: Position[];
  visitedRefuges: Position[];
  activeEvent: GameEvent | null;
  eventHistory: string[];
  eventResolutionText: string | null;
  
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
  triggerRandomEvent: () => void;
  resolveEventChoice: (choiceIndex: number) => void;
  dismissEventResolution: () => void;
  toggleCrafting: () => void;
  navigateCraftingMenu: (direction: number) => void;
  performCrafting: () => void;
  openLevelUpScreen: () => void;
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

export interface Alignment {
  lena: number;
  elian: number;
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
    alignment: Alignment;
    status: string | null; // e.g., 'POISONED', 'SAD', 'WOUNDED', 'ESAUSTO'
    levelUpPending: boolean;

    // Actions
    initCharacter: (newAttributes?: Attributes) => void;
    getAttributeModifier: (attribute: AttributeName) => number;
    getSkillBonus: (skill: SkillName) => number;
    performSkillCheck: (skill: SkillName, dc: number) => SkillCheckResult;
    addXp: (amount: number) => void;
    gainExplorationXp: () => void;
    applyLevelUp: (choices: { attribute: AttributeName, skill: SkillName }) => void;
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
    changeAlignment: (type: 'lena' | 'elian', amount: number) => void;
    setStatus: (newStatus: string | null) => void;
    boostAttribute: (attribute: AttributeName, amount: number) => void;
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