// FIX: Corrected import path for IItem.
import { IItem } from '../../types';

// --- Consolidated Item Database ---
// This file centralizes all item data, removing the need for external JSON files
// and resolving module loading errors in browser environments.
// It also applies a specific color to each item based on its category or effect.

const rawDatabase: Omit<IItem, 'color'>[] = [
    // --- Weapons ---
    { id: "WEAP_001", name: "Coltello da combattimento", description: "Un coltello affidabile per il combattimento ravvicinato.", type: "weapon", weight: 1, value: 10, damage: "1d4", rarity: "Common" },
    { id: "WEAP_002", name: "Pistola 9mm", description: "Una pistola semiauto. comune.", type: "weapon", weight: 3, value: 50, damage: "1d6", rarity: "Uncommon" },
    
    // --- Armor ---
    { id: "ARMOR_001", name: "Giubbotto di pelle", description: "Un semplice giubbotto di pelle che offre una protezione minima.", type: "armor", weight: 5, value: 20, armor: 1, rarity: "Common" },
    
    // --- Ammo ---
    { id: "AMMO_001", name: "Munizioni 9mm", description: "Una scatola di munizioni per pistole 9mm.", type: "ammo", weight: 0.5, value: 10, stackable: true, rarity: "Common" },
    
    // --- Consumables ---
    { id: "CONS_001", name: "Razione di cibo", description: "Cibo in scatola. Ripristina sazietà.", type: "consumable", weight: 0.5, value: 5, stackable: true, effect: "satiety", effectValue: 25, rarity: "Common" },
    { id: "CONS_002", name: "Bottiglia d'acqua", description: "Acqua potabile. Essenziale per la sopravvivenza.", type: "consumable", weight: 1, value: 3, stackable: true, effect: "hydration", effectValue: 25, rarity: "Common" },
    { id: "CONS_003", name: "Bende", description: "Bende pulite per medicare ferite leggere.", type: "consumable", weight: 0.1, value: 10, stackable: true, effect: "heal", effectValue: 10, rarity: "Common" },
    { id: "MED_PAINKILLER", name: "Antidolorifico", description: "Pillole per alleviare il dolore.", type: "consumable", weight: 0.05, value: 12, stackable: true, effect: "heal", effectValue: 15, rarity: "Uncommon" },

    // --- Crafting Materials ---
    { id: "CRAFT_METAL_SCRAP", name: "Rottami di metallo", description: "Pezzi di metallo arrugginito.", type: "crafting", weight: 0.3, value: 2, rarity: "Common", stackable: true },
    
    // --- Crafting Manuals ---
    { id: "MANUAL_WEAPONS_BASIC", name: "Manuale: Armi Improvvisate", description: "Insegna a creare armi di fortuna.", type: "manual", weight: 0.3, value: 25, stackable: false, rarity: "Uncommon", unlocksRecipes: ["reinforced_knife", "makeshift_spear", "sling"] },
    
    // --- Quest Items ---
    { id: "QUEST_001", name: "Mappa strappata", description: "Un pezzo di una mappa.", type: "quest", weight: 0.1, value: 0, rarity: "Unique" },
    
    // --- Unique Items ---
    { id: "UNIQUE_001", name: "Bussola antica", description: "Una bussola che punta sempre nella stessa direzione.", type: "unique", weight: 0.5, value: 100, rarity: "Legendary" }
];


// --- Color Assignment Logic ---
const assignColors = (items: Omit<IItem, 'color'>[]): Record<string, IItem> => {
    const finalDatabase: Record<string, IItem> = {};

    items.forEach(item => {
        let color = '#ffffff'; // Default color: white

        switch (item.type) {
            case 'weapon':    color = '#ef4444'; break; // red-500
            case 'ammo':      color = '#f97316'; break; // orange-500
            case 'armor':     color = '#d1d5db'; break; // gray-300
            case 'crafting':  color = '#a16207'; break; // yellow-700
            case 'manual':    color = '#9333ea'; break; // purple-600
            case 'quest':     color = '#facc15'; break; // yellow-400
            case 'unique':    color = '#ec4899'; break; // pink-500
            case 'consumable':
                // Granular colors for consumables based on effect
                if (item.effect?.includes('hydration')) {
                    color = '#7dd3fc'; // light blue
                } else if (item.effect?.includes('satiety')) {
                    color = '#fb923c'; // orange
                } else if (item.effect?.includes('heal')) {
                    color = '#4ade80'; // green
                } else {
                    color = '#a78bfa'; // violet-400 for other consumables
                }
                break;
        }
        
        finalDatabase[item.id] = { ...item, color };
    });

    return finalDatabase;
};

export const itemDatabase: Record<string, IItem> = assignColors(rawDatabase);