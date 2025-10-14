// src/data/itemDatabase.ts

import { IItem } from '../../types';

// Import all the raw JSON data from the items directory
import weaponsData from './items/weapons.json';
import armorData from './items/armor.json';
import consumablesData from './items/consumables.json';
import materialsData from './items/materials.json';
import questData from './items/quest.json';
import ammoData from './items/ammo.json';

// --- The Great Aggregation ---
// This module serves as the single source of truth for all item data in the game.
// It imports the modular JSON files and consolidates them into a single,
// easily accessible object map (Record<string, IItem>).

const allItems: IItem[] = [
    ...(weaponsData as IItem[]),
    ...(armorData as IItem[]),
    ...(consumablesData as IItem[]),
    ...(materialsData as IItem[]),
    ...(questData as IItem[]),
    ...(ammoData as IItem[]),
];

// Create the final database object, indexed by item ID for quick lookups.
const itemDatabase: Record<string, IItem> = {};
for (const item of allItems) {
    if (item.id) {
        itemDatabase[item.id] = item;
    }
}

// Export the unified and indexed database.
export { itemDatabase };
