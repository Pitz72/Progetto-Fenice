# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.4.0)

La versione attuale del prototipo include le seguenti meccaniche fondamentali:

*   **Creazione del Personaggio:** Il gioco inizia con una fase di creazione del personaggio in cui le statistiche di base vengono generate casualmente, rendendo ogni partita unica.
*   **Sistema di Skill Check:** Molte azioni, come attraversare un fiume o cercare oggetti, sono governate da test di abilità basati sulle statistiche del personaggio, aggiungendo un elemento di rischio e ricompensa.
*   **Esplorazione del Mondo:** Un'ampia mappa di gioco con diversi biomi (foreste, città, pianure) che influenzano il movimento e attivano messaggi atmosferici per aumentare l'immersione.
*   **Sistema Temporale e Meteo Dinamico:** Un orologio di gioco che avanza con le azioni, un ciclo giorno/notte e un sistema meteorologico realistico che ha un impatto diretto sul gameplay.
*   **Meccaniche di Sopravvivenza Avanzate:**
    *   Gestione di **HP, Sazietà e Idratazione**.
    *   **Riposo Rapido (Tasto 'R'):** Un'azione con cooldown di 24 ore per un recupero di emergenza sul campo.
    *   **Sistema dei Rifugi:** Luoghi strategici a **visita singola** che mettono in pausa il gioco e offrono opzioni contestuali (riposo diurno/notturno, ricerca di oggetti tramite skill check).
*   **Database Oggetti Modulare:** Un database scalabile caricato da file JSON, contenente decine di oggetti unici (armi, armature, consumabili, materiali, ecc.).
*   **Inventario e Equipaggiamento:** Un sistema di inventario completo e navigabile da tastiera, con menu di azione contestuali per usare, equipaggiare e scartare oggetti.
*   **Interfaccia Dinamica e Diario di Viaggio:** L'interfaccia si aggiorna in tempo reale e un diario di viaggio dettagliato, con timestamp e codifica a colori, registra ogni evento.

### Come Giocare

L'interazione avviene interamente tramite tastiera:

*   **Movimento:** Tasti `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** Tasto `I` per aprire e chiudere.
*   **Riposo Rapido:** Tasto `R` per tentare un riposo sul campo.
*   **Interazione:** Tasto `Invio` per confermare le azioni, `ESC` per annullare o tornare indietro.

### Stato del Progetto

Il progetto ha ora un ciclo di gameplay strategico e completo. Le meccaniche di esplorazione, sopravvivenza e gestione delle risorse sono consolidate. I prossimi passi si concentreranno sull'introduzione di sistemi di combattimento, incontri casuali, crafting, dialogo e sulla creazione di contenuti di gioco (quest, luoghi di interesse).
