import { create } from 'zustand';
import { GameEvent } from '../types';

async function loadAllEvents(): Promise<GameEvent[]> {
    // This can be expanded to load multiple files for different biomes
    const filesToLoad = [
        './data/events/plains.json',
        './data/events/forest.json',
        './data/events/village.json',
        './data/events/city.json'
    ];
    
    try {
        const responses = await Promise.all(filesToLoad.map(file => fetch(file)));
        for (const res of responses) {
            if (!res.ok) {
                throw new Error(`Failed to fetch ${res.url}: ${res.statusText}`);
            }
        }
        const eventArrays: GameEvent[][] = await Promise.all(responses.map(res => res.json()));
        
        // Flatten all event arrays into a single array
        const allEvents = eventArrays.flat();
        return allEvents;
    } catch (error) {
        console.error("Error loading event database:", error);
        return []; // Return empty array on error
    }
}

interface EventDatabaseState {
    isLoaded: boolean;
    events: GameEvent[];
    loadDatabase: () => Promise<void>;
}

export const useEventDatabaseStore = create<EventDatabaseState>((set, get) => ({
    isLoaded: false,
    events: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const events = await loadAllEvents();
        set({ events, isLoaded: true });
    }
}));