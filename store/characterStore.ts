import { create } from 'zustand';
import {
  CharacterState,
  Attributes,
  AttributeName,
  SkillName,
  SkillCheckResult,
  WeatherType,
  InventoryItem,
  Stat,
  Skill,
  Alignment,
} from '../types';
import { SKILLS, XP_PER_LEVEL } from '../constants';
import { useItemDatabaseStore } from '../data/itemDatabase';

const BASE_STAT_VALUE = 100;

const initialAttributes: Attributes = {
  for: 10,
  des: 10,
  cos: 10,
  int: 10,
  sag: 10,
  car: 10,
};

// Create initial skills record from SKILLS constant
const initialSkills: Record<SkillName, Skill> = Object.keys(SKILLS).reduce((acc, skill) => {
  acc[skill as SkillName] = { proficient: false };
  return acc;
}, {} as Record<SkillName, Skill>);

const initialAlignment: Alignment = {
    lena: 0,
    elian: 0,
};


export const useCharacterStore = create<CharacterState>((set, get) => ({
    // --- State ---
    level: 1,
    xp: { current: 0, next: XP_PER_LEVEL[2] },
    hp: { current: 100, max: 100 },
    satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
    hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
    attributes: { ...initialAttributes },
    skills: { ...initialSkills },
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    alignment: { ...initialAlignment },
    status: null,

    // --- Actions ---
    initCharacter: (newAttributes) => {
        const attributes = newAttributes || initialAttributes;
        const maxHp = 100; // Increased starting HP

        set({
            level: 1,
            xp: { current: 0, next: XP_PER_LEVEL[2] },
            attributes,
            hp: { current: maxHp, max: maxHp },
            satiety: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            hydration: { current: BASE_STAT_VALUE, max: BASE_STAT_VALUE },
            skills: { ...initialSkills },
            alignment: { ...initialAlignment },
            status: null,
            inventory: [ // Updated starting gear
                { itemId: 'CONS_002', quantity: 3 },         // Bottiglia d'acqua
                { itemId: 'CONS_001', quantity: 3 },         // Razione di cibo
                { itemId: 'CONS_003', quantity: 2 },         // Bende
                { itemId: 'MED_PAINKILLER', quantity: 2 }, // Antidolorifici
                { itemId: 'combat_knife', quantity: 1 },   // Coltello da combattimento
                { itemId: 'leather_jacket', quantity: 1 }, // Giubbotto di pelle
            ],
            equippedWeapon: null,
            equippedArmor: null,
        });
    },

    getAttributeModifier: (attribute) => {
        const value = get().attributes[attribute];
        return Math.floor((value - 10) / 2);
    },

    getSkillBonus: (skill) => {
        const skillDef = SKILLS[skill];
        if (!skillDef) return 0;
        const attributeModifier = get().getAttributeModifier(skillDef.attribute);
        // Proficiency bonus like in D&D 5e: +2 at level 1-4, +3 at 5-8, etc.
        const proficiencyBonus = get().skills[skill].proficient ? Math.floor((get().level - 1) / 4) + 2 : 0;
        return attributeModifier + proficiencyBonus;
    },

    performSkillCheck: (skill, dc) => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = get().getSkillBonus(skill);
        const total = roll + bonus;
        const success = total >= dc;
        return { skill, roll, bonus, total, dc, success };
    },

    addXp: (amount) => {
        set(state => ({ xp: { ...state.xp, current: state.xp.current + amount } }));
        if (get().xp.current >= get().xp.next) {
            get().levelUp();
        }
    },

    levelUp: () => {
        set(state => {
            if (state.xp.current < state.xp.next) return {};
            
            const newLevel = state.level + 1;
            const newNextXp = XP_PER_LEVEL[newLevel + 1] || state.xp.next;
            
            const constitutionModifier = get().getAttributeModifier('cos');
            const hpIncrease = 5 + constitutionModifier; // Rebalanced HP gain
            const newMaxHp = state.hp.max + hpIncrease;

            return {
                level: newLevel,
                xp: { ...state.xp, current: state.xp.current - state.xp.next, next: newNextXp },
                hp: { max: newMaxHp, current: newMaxHp } // Full heal on level up
            };
        });
    },

    addItem: (itemId, quantity = 1) => {
        set(state => {
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            const itemDetails = itemDatabase[itemId];
            if (!itemDetails) return {};

            const existingItem = state.inventory.find(i => i.itemId === itemId);

            if (existingItem && itemDetails.stackable) {
                const newInventory = state.inventory.map(i =>
                    i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
                );
                return { inventory: newInventory };
            } else {
                const newInventory = [...state.inventory, { itemId, quantity }];
                return { inventory: newInventory };
            }
        });
    },

    removeItem: (itemId, quantity = 1) => {
        set(state => {
            const existingItem = state.inventory.find(i => i.itemId === itemId);
            if (!existingItem) return {};

            if (existingItem.quantity > quantity) {
                // Riduci la quantità
                const newInventory = state.inventory.map(i =>
                    i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
                );
                return { inventory: newInventory };
            } else {
                // Rimuovi completamente l'oggetto
                const newInventory = state.inventory.filter(i => i.itemId !== itemId);
                return { inventory: newInventory };
            }
        });
    },
    
    discardItem: (itemId, quantity = 1) => {
        const itemInInventory = get().inventory.find(i => i.itemId === itemId);
        if (!itemInInventory) return;
        
        const isEquipped = get().equippedWeapon === itemId || get().equippedArmor === itemId;
        // Se l'oggetto è equipaggiato e la quantità da scartare è l'intera quantità posseduta
        if (isEquipped && itemInInventory.quantity <= quantity) {
            get().unequipItem(useItemDatabaseStore.getState().itemDatabase[itemId]?.type as 'weapon' | 'armor');
        }
        get().removeItem(itemId, quantity);
    },

    equipItem: (itemId) => {
        set(state => {
            const itemDatabase = useItemDatabaseStore.getState().itemDatabase;
            const itemDetails = itemDatabase[itemId];
            if (!itemDetails || (itemDetails.type !== 'weapon' && itemDetails.type !== 'armor')) {
                return state;
            }
            // Item remains in inventory, just set the equipped ID.
            if (itemDetails.type === 'weapon') {
                return { equippedWeapon: itemId };
            }
            if (itemDetails.type === 'armor') {
                return { equippedArmor: itemId };
            }
            return state;
        });
    },

    unequipItem: (slot) => {
        set(state => {
            if (slot === 'weapon' && state.equippedWeapon) {
                return { equippedWeapon: null };
            }
            if (slot === 'armor' && state.equippedArmor) {
                return { equippedArmor: null };
            }
            return {};
        });
    },

    takeDamage: (amount) => {
        set(state => ({
            hp: { ...state.hp, current: Math.max(0, state.hp.current - amount) }
        }));
    },
    
    calculateSurvivalCost: (minutes) => {
        // Rates per hour
        let satietyDecay = 1.0; 
        let hydrationDecay = 1.5;
        
        const satietyCost = (minutes / 60) * satietyDecay;
        const hydrationCost = (minutes / 60) * hydrationDecay;
        
        return { satietyCost, hydrationCost };
    },

    updateSurvivalStats: (minutes, weather) => {
        set(state => {
            // Rates per hour
            let satietyDecay = 1.0; 
            let hydrationDecay = 1.5;

            if (weather === WeatherType.TEMPESTA) {
                hydrationDecay *= 1.5;
            }

            const satietyLoss = (minutes / 60) * satietyDecay;
            const hydrationLoss = (minutes / 60) * hydrationDecay;
            
            const newSatiety = Math.max(0, state.satiety.current - satietyLoss);
            const newHydration = Math.max(0, state.hydration.current - hydrationLoss);
            
            let hpLossFromSurvival = 0;
            if (newSatiety === 0) hpLossFromSurvival += (minutes / 60); // 1 HP loss per hour of starvation
            if (newHydration === 0) hpLossFromSurvival += (minutes / 60) * 2; // 2 HP loss per hour of dehydration

            const newHp = Math.max(0, state.hp.current - hpLossFromSurvival);
            
            return {
                satiety: { ...state.satiety, current: newSatiety },
                hydration: { ...state.hydration, current: newHydration },
                hp: { ...state.hp, current: newHp }
            };
        });
    },
    
    heal: (amount) => {
        set(state => ({
            hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + amount) }
        }));
    },
    
    restoreSatiety: (amount) => {
        set(state => ({
            satiety: { ...state.satiety, current: Math.min(state.satiety.max, state.satiety.current + amount) }
        }));
    },
    
    restoreHydration: (amount) => {
        set(state => ({
            hydration: { ...state.hydration, current: Math.min(state.hydration.max, state.hydration.current + amount) }
        }));
    },
    changeAlignment: (type, amount) => {
        set(state => ({
            alignment: {
                ...state.alignment,
                [type]: state.alignment[type] + amount,
            }
        }));
    },
    setStatus: (newStatus) => set({ status: newStatus }),
    boostAttribute: (attribute, amount) => {
        set(state => ({
            attributes: {
                ...state.attributes,
                [attribute]: state.attributes[attribute] + amount,
            }
        }));
    },
}));