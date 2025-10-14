// store/journalStore.ts

import { create } from 'zustand';
import { JournalEntry, LogMessageType } from '../types';
import { journalMessages } from '../src/data/journalMessages';
import { useGameStore } from './gameStore'; // Import gameStore to get game time

interface JournalState {
    entries: JournalEntry[];
    addEntry: (type: LogMessageType, messageId: string, templateData?: Record<string, string>) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
    entries: [],
    addEntry: (type, messageId, templateData) => {
        const gameTime = useGameStore.getState().gameTime; // Get current game time
        let messageText = journalMessages[messageId] || "Messaggio non trovato.";

        // Replace placeholders like [ITEM_NAME] with actual data
        if (templateData) {
            for (const key in templateData) {
                messageText = messageText.replace(`[${key}]`, templateData[key]);
            }
        }

        const newEntry: JournalEntry = {
            type: type,
            text: messageText,
            timestamp: gameTime,
        };

        set(state => ({
            // Add the new entry to the beginning of the array
            entries: [newEntry, ...state.entries].slice(0, 100) // Keep last 100 entries
        }));
    },
}));
