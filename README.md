# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.2.0)

La versione attuale del prototipo include le seguenti meccaniche fondamentali:

*   **Esplorazione del Mondo:** Un'ampia mappa di gioco su cui muoversi, con diversi tipi di terreno che influenzano il movimento.
*   **Sistema Temporale:** Un orologio di gioco che avanza in base alle azioni del giocatore, con un ciclo giorno/notte implicito.
*   **Meteo Dinamico:** Un sistema meteorologico che cambia in modo realistico e influenza il gameplay, aumentando i costi di movimento e il consumo di risorse.
*   **Meccaniche di Sopravvivenza:** Gestione di Punti Vita (HP), Sazietà e Idratazione, che si consumano con il tempo e lo sforzo.
*   **Inventario Interattivo:** Un sistema di inventario modale e completamente navigabile da tastiera, che permette di usare, equipaggiare, togliere e scartare oggetti.
*   **Sistema di Equipaggiamento:** Slot per arma e armatura, con logica di scambio automatico.
*   **Interfaccia Dinamica:** L'interfaccia di gioco si aggiorna in tempo reale per mostrare lo stato del personaggio, l'ora, il meteo e un diario di viaggio che registra gli eventi importanti.

### Come Giocare

L'interazione avviene interamente tramite tastiera:

*   **Movimento:** Tasti `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** Tasto `I` per aprire e chiudere.
*   **Interazione:** Tasto `Invio` per confermare le azioni, `ESC` per annullare o tornare indietro.

### Stato del Progetto

Il progetto è attualmente in una fase di prototipazione avanzata. Le meccaniche di base sono state implementate e sono funzionanti. I prossimi passi si concentreranno sull'introduzione di sistemi di combattimento, incontri casuali, crafting, dialogo e sulla creazione di contenuti di gioco (quest, luoghi di interesse).