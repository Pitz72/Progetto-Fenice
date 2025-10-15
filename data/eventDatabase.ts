import { create } from 'zustand';
import { GameEvent } from '../types';

async function loadEvents(): Promise<{ biomeEvents: GameEvent[], globalEncounters: GameEvent[] }> {
    const biomeFiles = [
        './data/events/plains.json',
        './data/events/forest.json',
        './data/events/village.json',
        './data/events/city.json'
    ];
    const encounterFile = './data/events/encounters.json';

    try {
        const biomeResponses = await Promise.all(biomeFiles.map(file => fetch(file)));
        for (const res of biomeResponses) {
            if (!res.ok) throw new Error(`Failed to fetch ${res.url}: ${res.statusText}`);
        }
        const biomeEventArrays: GameEvent[][] = await Promise.all(biomeResponses.map(res => res.json()));
        const biomeEvents = biomeEventArrays.flat();

        const encounterResponse = await fetch(encounterFile);
        if (!encounterResponse.ok) throw new Error(`Failed to fetch ${encounterResponse.url}: ${encounterResponse.statusText}`);
        const globalEncounters: GameEvent[] = await encounterResponse.json();

        return { biomeEvents, globalEncounters };

    } catch (error) {
        console.error("Error loading event database:", error);
        return { biomeEvents: [], globalEncounters: [] };
    }
}


interface EventDatabaseState {
    isLoaded: boolean;
    biomeEvents: GameEvent[];
    globalEncounters: GameEvent[];
    loadDatabase: () => Promise<void>;
}

export const useEventDatabaseStore = create<EventDatabaseState>((set, get) => ({
    isLoaded: false,
    biomeEvents: [],
    globalEncounters: [],
    loadDatabase: async () => {
        if (get().isLoaded) return;
        const { biomeEvents, globalEncounters } = await loadEvents();
        set({ biomeEvents, globalEncounters, isLoaded: true });
    }
}));