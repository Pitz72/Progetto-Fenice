import { create } from 'zustand';
import { CharacterState, AttributeName, SkillName, SkillCheckResult, Attributes, WeatherType, InventoryItem } from '../types';
import { SKILLS, XP_PER_LEVEL } from '../constants';
import { itemDatabase } from '../src/data/itemDatabase';

// --- Helper Functions ---
const getAttributeModifier = (attributeValue: number): number => {
    return Math.floor((attributeValue - 10) / 2);
};

const getProficiencyBonus = (level: number): number => {
    return Math.floor((level - 1) / 4) + 2;
};

// --- Zustand Store ---
export const useCharacterStore = create<CharacterState>((set, get) => ({
    // --- State ---
    level: 1,
    xp: { current: 0, next: XP_PER_LEVEL[2] },
    hp: { current: 10, max: 10 },
    satiety: { current: 100, max: 100 },
    hydration: { current: 100, max: 100 },
    attributes: { for: 10, des: 10, cos: 10, int: 10, sag: 10, car: 10 },
    skills: Object.keys(SKILLS).reduce((acc, skill) => {
        acc[skill as SkillName] = { proficient: false };
        return acc;
    }, {} as Record<SkillName, { proficient: boolean }>),
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,

    // --- Actions ---
    initCharacter: (newAttributes?: Attributes) => {
        const startingAttributes = newAttributes || { for: 10, des: 10, cos: 10, int: 10, sag: 10, car: 10, };
        const conModifier = getAttributeModifier(startingAttributes.cos);
        const initialHp = 100 + conModifier;

        set({
            level: 1,
            xp: { current: 0, next: XP_PER_LEVEL[2] },
            attributes: startingAttributes,
            hp: { current: initialHp, max: initialHp },
            satiety: { current: 100, max: 100 },
            hydration: { current: 100, max: 100 },
            skills: { ...get().skills, sopravvivenza: { proficient: true }, atletica: { proficient: true } },
            inventory: [
                { itemId: 'CONS_002', quantity: 3 }, // Bottiglia d'acqua
                { itemId: 'CONS_001', quantity: 3 }, // Razione di cibo
                { itemId: 'CONS_003', quantity: 2 }, // Bende
                { itemId: 'MED_PAINKILLER', quantity: 2 }, // Antidolorifico
            ],
            equippedWeapon: 'combat_knife',
            equippedArmor: 'leather_jacket',
        });
    },

    getAttributeModifier: (attribute: AttributeName) => getAttributeModifier(get().attributes[attribute]),
    getSkillBonus: (skill: SkillName) => {
        const { level, attributes, skills } = get();
        const skillInfo = SKILLS[skill];
        if (!skillInfo) return 0;
        const attributeValue = attributes[skillInfo.attribute];
        const modifier = getAttributeModifier(attributeValue);
        let bonus = modifier;
        if (skills[skill].proficient) {
            bonus += getProficiencyBonus(level);
        }
        return bonus;
    },

    performSkillCheck: (skill: SkillName, dc: number): SkillCheckResult => {
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = get().getSkillBonus(skill);
        const total = roll + bonus;
        const success = total >= dc;
        console.log(`Prova di ${skill}: Tiro=${roll}, Bonus=${bonus}, Totale=${total} vs CD=${dc} -> ${success ? 'SUCCESSO' : 'FALLIMENTO'}`);
        return { skill, roll, bonus, total, dc, success };
    },

    addXp: (amount: number) => {
        const { xp, level } = get();
        const newXp = xp.current + amount;
        if (newXp >= xp.next) {
            set({ xp: { ...xp, current: newXp } });
            get().levelUp();
        } else {
            set({ xp: { ...xp, current: newXp } });
        }
    },

    levelUp: () => {
        const { level, xp } = get();
        const newLevel = level + 1;
        const newNextXp = XP_PER_LEVEL[newLevel + 1] || xp.next;
        const remainingXp = xp.current - xp.next;
        const conModifier = get().getAttributeModifier('cos');
        const hpGain = Math.max(1, Math.floor(Math.random() * 8) + 1 + conModifier);
        const newMaxHp = get().hp.max + hpGain;
        set({ level: newLevel, xp: { current: remainingXp, next: newNextXp }, hp: { max: newMaxHp, current: newMaxHp } });
        console.log(`CONGRATULAZIONI! Hai raggiunto il livello ${newLevel}!`);
    },

    addItem: (itemId, quantity = 1) => {
        set(state => {
            const item = itemDatabase[itemId];
            if (!item) return state;
            const newInventory: InventoryItem[] = [...state.inventory];
            if (item.stackable) {
                const existingItemIndex = newInventory.findIndex(i => i.itemId === itemId);
                if (existingItemIndex > -1) {
                    newInventory[existingItemIndex].quantity += quantity;
                } else {
                    newInventory.push({ itemId, quantity });
                }
            } else {
                for (let i = 0; i < quantity; i++) {
                    newInventory.push({ itemId, quantity: 1 });
                }
            }
            return { inventory: newInventory };
        });
    },

    removeItem: (itemId, quantity = 1) => {
        set(state => {
            const newInventory = [...state.inventory];
            let quantityToRemove = quantity;
            const itemDefinition = itemDatabase[itemId];

            if (itemDefinition && itemDefinition.stackable) {
                 const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
                 if (itemIndex > -1) {
                     newInventory[itemIndex].quantity -= quantityToRemove;
                     if (newInventory[itemIndex].quantity <= 0) {
                         newInventory.splice(itemIndex, 1);
                     }
                 }
            } else {
                while (quantityToRemove > 0) {
                    const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
                    if (itemIndex > -1) {
                        newInventory.splice(itemIndex, 1);
                        quantityToRemove--;
                    } else {
                        break;
                    }
                }
            }
            return { inventory: newInventory };
        });
    },

    discardItem: (itemId, quantity = 1) => {
        get().removeItem(itemId, quantity);
    },

    equipItem: (itemId) => {
        const itemDetails = itemDatabase[itemId];
        if (!itemDetails || (itemDetails.type !== 'weapon' && itemDetails.type !== 'armor')) return;

        set(state => {
            if (!state.inventory.some(invItem => invItem.itemId === itemId)) return state;

            const slot = itemDetails.type === 'weapon' ? 'weapon' : 'armor';
            const equippedSlotKey = slot === 'weapon' ? 'equippedWeapon' : 'equippedArmor';
            const currentlyEquippedId = state[equippedSlotKey];
            const newInventory = [...state.inventory];

            // Remove the item to be equipped from inventory
            const itemIndex = newInventory.findIndex(i => i.itemId === itemId);
            if (itemIndex > -1) {
                const item = newInventory[itemIndex];
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    newInventory.splice(itemIndex, 1);
                }
            }

            // Add previously equipped item back to inventory
            if (currentlyEquippedId) {
                const itemDef = itemDatabase[currentlyEquippedId];
                const existing = newInventory.find(i => i.itemId === currentlyEquippedId && itemDef?.stackable);
                if(existing) {
                    existing.quantity += 1;
                } else {
                    newInventory.push({ itemId: currentlyEquippedId, quantity: 1 });
                }
            }

            return { inventory: newInventory, [equippedSlotKey]: itemId };
        });
    },

    unequipItem: (slot) => {
        const equippedSlotKey = slot === 'weapon' ? 'equippedWeapon' : 'equippedArmor';
        const itemToUnequipId = get()[equippedSlotKey];
        if (!itemToUnequipId) return;

        get().addItem(itemToUnequipId, 1);
        set({ [equippedSlotKey]: null });
    },

    takeDamage: (amount: number) => {
        set(state => ({
            hp: { ...state.hp, current: Math.max(0, state.hp.current - amount) }
        }));
    },
    
    updateSurvivalStats: (minutes: number, weather: WeatherType) => {
        let satietyDrain = (1 / 30) * minutes;   // 1 point every 30 minutes
        let hydrationDrain = (1 / 20) * minutes; // 1 point every 20 minutes

        // Weather multiplier
        if (weather === WeatherType.PIOGGIA || weather === WeatherType.TEMPESTA) {
            satietyDrain *= 1.5;
            hydrationDrain *= 1.5;
        }

        set(state => ({
            satiety: { ...state.satiety, current: Math.max(0, state.satiety.current - satietyDrain) },
            hydration: { ...state.hydration, current: Math.max(0, state.hydration.current - hydrationDrain) }
        }));
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
}));