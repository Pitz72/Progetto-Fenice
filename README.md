# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.4.6)

La versione attuale del prototipo include un ciclo di gameplay completo e strategico, con le seguenti meccaniche:

#### Esplorazione e Mondo di Gioco
*   **Mappa Vasta:** Un'ampia mappa di gioco con diversi biomi (Pianure, Foreste, Villaggi, Città) che influenzano il movimento.
*   **Messaggi Atmosferici:** Messaggi descrittivi contestuali basati su bioma, ora del giorno e meteo per aumentare l'immersione.
*   **Diario di Viaggio Dettagliato:** Un log cronologico di tutte le azioni e gli eventi, con timestamp e codifica a colori per una facile lettura.

#### Meccaniche di Sopravvivenza Avanzate
*   **Statistiche Vitali:** Gestione di HP, Sazietà e Idratazione, che diminuiscono con il tempo e le azioni.
*   **Sistema Temporale e Meteo:** Un orologio di gioco e un sistema meteo dinamico che influenzano i costi di movimento e il consumo di risorse.
*   **Rifugi Strategici:** Luoghi sicuri a **visita singola** che offrono opzioni di riposo (diurno/notturno), ricerca di oggetti tramite skill check e accesso al banco di lavoro.
*   **Riposo Rapido:** Un'azione da campo (tasto 'R') con un cooldown di 24 ore per un recupero di emergenza.

#### Sistema di Eventi Dinamici
*   **Incontri Casuali:** Esplorando, il giocatore può incappare in eventi casuali che presentano scenari unici e scelte significative.
*   **Eventi Specifici per Bioma:** Ogni bioma (Pianura, Foresta, Villaggio, Città) ha un set dedicato di eventi a tema, garantendo varietà e rigiocabilità.
*   **Eventi Unici (Easter Egg):** Incontri rari e irripetibili che svelano dettagli cruciali sulla lore del mondo di gioco.

#### Gestione Oggetti e Risorse
*   **Database Modulare:** Un database scalabile e robusto di centinaia di oggetti, caricato dinamicamente da file JSON esterni.
*   **Inventario e Equipaggiamento:** Un sistema di inventario completo e navigabile da tastiera, con menu di azione contestuali per usare, equipaggiare e scartare oggetti.
*   **Sistema di Crafting:** Nei rifugi, il giocatore può accedere a un "Banco di Lavoro" per creare nuovi oggetti (es. bende migliorate, armi di fortuna) a partire dai materiali raccolti, basandosi su test di abilità specifici.

#### Sviluppo del Personaggio
*   **Creazione Casuale:** La partita inizia con una generazione casuale delle statistiche del personaggio.
*   **Sistema di Skill Check:** Le azioni complesse (cercare, creare, superare ostacoli) sono risolte tramite un sistema di test di abilità (d20 + modificatori vs CD) che aggiunge un elemento di rischio.
*   **Bussola Morale:** Un sistema di allineamento (Lena/Elian) che traccia le decisioni morali del giocatore, orientandolo verso la compassione o il pragmatismo.

### Come Giocare

L'interazione avviene interamente tramite tastiera:

*   **Movimento:** Tasti `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** Tasto `I` per aprire e chiudere.
*   **Riposo Rapido:** Tasto `R` per tentare un riposo sul campo.
*   **Interazione:** Tasto `Invio` per confermare le azioni, `ESC` per annullare o tornare indietro.

### Stato del Progetto

Il progetto ha ora un ciclo di gameplay strategico e completo: **esplora -> gestisci risorse -> incontra eventi -> crea nuovi oggetti**. L'architettura del software è stata resa stabile e scalabile, risolvendo i problemi iniziali e garantendo una base solida per le future implementazioni.

I prossimi passi si concentreranno sull'introduzione dei sistemi di combattimento, incontri con PNG, dialoghi e sulla creazione di una trama principale con quest strutturate.