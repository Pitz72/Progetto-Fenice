# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.6.0)

Il prototipo vanta un ciclo di gameplay robusto e completo, con le seguenti meccaniche interconnesse:

#### Esplorazione e Mondo di Gioco
*   **Mappa Vasta:** Un'ampia mappa di gioco con diversi biomi (Pianure, Foreste, Villaggi, Città) che influenzano il movimento e gli incontri.
*   **Messaggi Atmosferici:** Messaggi descrittivi contestuali basati su bioma, ora del giorno e meteo aumentano l'immersione.
*   **Diario di Viaggio Dettagliato:** Un log cronologico di tutte le azioni e gli eventi, con timestamp e codifica a colori per una facile lettura.

#### Meccaniche di Sopravvivenza Avanzate
*   **Gestione Risorse Critica:** Statistiche di HP, Sazietà e Idratazione con un tasso di consumo bilanciato per rendere la ricerca di cibo e acqua una priorità costante.
*   **Sistema Temporale e Meteo:** Un orologio di gioco e un sistema meteo dinamico che influenzano movimento, consumo di risorse e pericoli ambientali.
*   **Pericoli Notturni:** Esplorare di notte comporta il rischio di subire danni a ogni passo, rendendo la ricerca di un riparo una decisione strategica.
*   **Rifugi a Visita Singola:** Luoghi sicuri che offrono riposo, ricerca di oggetti tramite skill check e crafting, ma che possono essere utilizzati una sola volta.
*   **Riposo Rapido:** Un'azione da campo con cooldown di 24 ore per un recupero di emergenza.

#### Sistema di Eventi Stratificato
*   **Eventi di Bioma:** Ogni area ha un set dedicato di eventi a tema, garantendo varietà e coerenza narrativa.
*   **Incontri Globali:** Sfide di sopravvivenza e combattimenti semplificati che possono verificarsi ovunque, mantenendo alta la tensione.
*   **Eventi Lore:** Incontri rari e unici che approfondiscono la trama principale e il conflitto interiore del protagonista.
*   **Logica di Attivazione Dinamica:** Il gioco bilancia la frequenza tra eventi narrativi e sfide di sopravvivenza per un'esperienza varia e imprevedibile.

#### Gestione Oggetti e Crafting
*   **Database Modulare:** Un database scalabile di centinaia di oggetti (armi, armature, consumabili, materiali) caricato dinamicamente da file JSON.
*   **Inventario e Equipaggiamento:** Un sistema di inventario completo e navigabile da tastiera, con menu di azione contestuali.
*   **Sistema di Crafting Dinamico e Progressivo:**
    *   **Ricette da Scoprire:** Le ricette di crafting non sono disponibili dall'inizio. Il giocatore deve trovare "Manuali di Crafting" durante l'esplorazione per apprendere nuove formule.
    *   **Banco di Lavoro Intelligente:** L'interfaccia del banco di lavoro mostra solo le ricette che il personaggio ha imparato, fornendo un feedback visivo immediato su quali sono creabili in base agli ingredienti posseduti.
    *   **Creazione basata su Abilità:** Ogni tentativo di crafting richiede un test di abilità (es. Sopravvivenza, Medicina) e consuma tempo di gioco, con il rischio di sprecare materiali in caso di fallimento.

#### Sviluppo del Personaggio
*   **Creazione Personaggio:** La partita inizia con una generazione casuale delle statistiche del personaggio, garantendo rigiocabilità.
*   **Progressione tramite XP:** I Punti Esperienza si guadagnano esplorando, superando eventi (con bonus maggiori per i successi) e completando azioni.
*   **Level Up Strategico:** Alla pressione del tasto 'L', il giocatore accede a una schermata dedicata per aumentare permanentemente un attributo e acquisire una nuova competenza in un'abilità.
*   **Sistema di Skill Check:** Le azioni complesse sono risolte tramite un sistema di test di abilità (d20 + modificatori vs CD) che aggiunge un elemento di rischio e ricompensa.
*   **Bussola Morale con Effetti:** Un sistema di allineamento (Lena/Elian) traccia le decisioni morali. Raggiungere una forte inclinazione verso la compassione o il pragmatismo sblocca bonus passivi a determinate abilità, collegando direttamente le scelte narrative ai vantaggi meccanici.

### Come Giocare

L'interazione avviene interamente tramite tastiera:

*   **Movimento/Navigazione:** Tasti `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** Tasto `I`.
*   **Riposo Rapido:** Tasto `R`.
*   **Level Up:** Tasto `L` (quando disponibile).
*   **Interazione:** Tasto `Invio` per confermare, `ESC` per annullare/indietro.

### Stato del Progetto

Il progetto ha raggiunto la piena maturità delle sue meccaniche di base. Il ciclo di gameplay **esplora -> sopravvivi -> incontra eventi -> fai scelte morali -> sali di livello -> crea oggetti** è completo, robusto e bilanciato. La base tecnica e di contenuto è solida e pronta per l'implementazione delle prossime fasi: sistema di combattimento a turni, incontri con PNG, dialoghi e lo sviluppo della trama principale.