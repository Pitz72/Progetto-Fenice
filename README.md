# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.7.4)

Il prototipo vanta un ciclo di gameplay robusto e completo, con tutti i pilastri fondamentali (Esplorazione, Sopravvivenza, Scelte Narrative, Progressione, Crafting e Combattimento) pienamente implementati e integrati.

#### Esplorazione e Mondo di Gioco
*   **Mappa Vasta e Diversificata:** Un'ampia mappa con biomi unici (Pianure, Foreste, Villaggi, Città) che influenzano movimento, incontri e risorse.
*   **Immersione Atmosferica:** Messaggi descrittivi contestuali basati su bioma, ora del giorno e meteo aumentano l'immersione.
*   **Pericoli Notturni:** Esplorare di notte comporta un rischio costante di subire danni, rendendo la ricerca di un riparo una decisione strategica.
*   **Diario di Viaggio Dettagliato:** Un log cronologico di tutte le azioni e gli eventi, con timestamp e codifica a colori.

#### Meccaniche di Sopravvivenza Impegnative
*   **Gestione Risorse Critica:** Statistiche di HP, Sazietà e Idratazione con tassi di consumo bilanciati che rendono la ricerca di cibo e acqua una priorità costante e pressante.
*   **Sistema Temporale e Meteo Dinamico:** Un orologio di gioco e un sistema meteo che influenzano movimento, consumo di risorse e pericoli ambientali.
*   **Rifugi Strategici:** Luoghi sicuri a visita singola che offrono riposo, ricerca di oggetti tramite skill check e crafting, trasformandoli in decisioni cruciali e irripetibili.
*   **Sistema di Stati del Giocatore:** Il personaggio può subire stati negativi come `FERITO` (penalità alle abilità fisiche), `MALATO` (lenta perdita di HP) o `AVVELENATO` (perdita rapida di HP). Questi stati, causati da eventi o combattimenti, richiedono cure specifiche (come antidolorifici o antidoti), aggiungendo un ulteriore livello di gestione del rischio e dell'inventario.

#### Sistema di Eventi Stratificato
Il mondo è vivo grazie a un sistema di eventi a tre livelli che garantisce varietà e rigiocabilità:
*   **Eventi di Bioma:** Ogni area ha un set dedicato di incontri narrativi a tema.
*   **Incontri Globali:** Sfide di sopravvivenza e combattimenti semplificati che possono verificarsi ovunque, mantenendo alta la tensione.
*   **Eventi Lore:** Incontri rari e unici che approfondiscono la trama e il conflitto interiore del protagonista.

#### Sviluppo del Personaggio e Scelte Morali
*   **Progressione tramite XP:** I Punti Esperienza si guadagnano da ogni azione: esplorare, superare eventi, vincere combattimenti.
*   **Level Up Strategico:** Una schermata dedicata permette di aumentare un attributo e acquisire una nuova competenza in un'abilità, personalizzando la crescita del personaggio.
*   **Bussola Morale con Effetti:** Un sistema di allineamento (Lena/Elian) traccia le decisioni morali. Raggiungere una forte inclinazione verso la compassione o il pragmatismo sblocca **bonus passivi permanenti** a determinate abilità.
*   **Stati Psicologici:** Le scelte narrative più importanti possono alterare lo stato emotivo del personaggio, fornendo un feedback immersivo sulle conseguenze delle sue azioni.

#### Gestione Oggetti e Crafting Progressivo
*   **Database Modulare:** Un database scalabile di oggetti (armi, armature, consumabili, materiali) caricato dinamicamente.
*   **Inventario e Equipaggiamento:** Un sistema di inventario completo e navigabile da tastiera, con menu di azione contestuali.
*   **Sistema di Crafting Progressivo:** Le ricette di crafting non sono disponibili dall'inizio. Il giocatore deve **trovare "Manuali di Crafting"** durante l'esplorazione per apprendere nuove formule, rendendo la scoperta una parte fondamentale della progressione.

#### Sistema di Combattimento Tattico e Narrativo
*   **Combattimento a Turni:** Un sistema di combattimento testuale che mette in pausa il gioco e si concentra sulla narrazione e sulle scelte tattiche.
*   **Premiare l'Astuzia:** La filosofia è "sopravvivere, non solo vincere". Il giocatore è incoraggiato a studiare il nemico per scoprire le sue debolezze.
*   **Azione "Analizza":** Spendendo un turno per analizzare il nemico con un test di Percezione, il giocatore può sbloccare opzioni di combattimento tattiche uniche che offrono vantaggi significativi.
*   **Fuga Strategica:** Fuggire è una tattica valida, risolta con un test di abilità che comporta dei rischi in caso di fallimento.

### Come Giocare

L'interazione avviene interamente tramite tastiera:

*   **Movimento/Navigazione:** Tasti `W, A, S, D` o `Frecce Direzionali`.
*   **Inventario:** Tasto `I`.
*   **Riposo Rapido:** Tasto `R`.
*   **Level Up:** Tasto `L` (quando disponibile).
*   **Interazione:** Tasto `Invio` per confermare, `ESC` per annullare/indietro.

### Stato del Progetto

Il prototipo ha raggiunto la piena maturità delle sue meccaniche di base. Il ciclo di gameplay **esplora -> sopravvivi -> incontra eventi -> combatti -> fai scelte morali -> sali di livello -> crea oggetti** è completo, robusto e bilanciato. La base tecnica e di contenuto è solida e pronta per l'implementazione di incontri con PNG, dialoghi e lo sviluppo della trama principale.