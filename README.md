# The Safe Place Chronicles

## Un Gioco di Ruolo Testuale Retrò

**The Safe Place Chronicles** è un prototipo di gioco di ruolo (RPG) che si ispira ai classici videogiochi testuali e basati su griglia dei primi anni '80. L'obiettivo è creare un'esperienza immersiva e strategica, dove ogni decisione ha un peso e la sopravvivenza dipende da un'attenta pianificazione.

Il gioco è costruito con una filosofia "keyboard-only", per replicare il feeling dei giochi per computer di quell'epoca, con un'interfaccia grafica minimale ma funzionale che richiama i vecchi monitor a fosfori verdi.

### Tecnologie Utilizzate

*   **Frontend:** React con TypeScript
*   **Gestione dello Stato:** Zustand
*   **Stile:** TailwindCSS per un layout rapido e coerente
*   **Rendering Mappa:** HTML Canvas per una visualizzazione fluida e performante del mondo di gioco

### Caratteristiche Attuali (v0.8.0)

Il prototipo vanta un ciclo di gameplay robusto e completo, con tutti i pilastri fondamentali (Esplorazione, Sopravvivenza, Scelte Narrative, Progressione, Crafting, Combattimento e una Trama Principale) pienamente implementati e integrati.

#### Missione Principale ("Main Quest") Narrativa
*   **Un "Filo di Arianna" Narrativo:** Il gioco ora presenta una trama principale completa in 12 capitoli che fornisce una spina dorsale narrativa all'esperienza di sopravvivenza, trasformandola in un viaggio alla scoperta della verità sul passato del protagonista.
*   **Motore della Storia:** Un "Motore della Storia" invisibile guida la trama. La storia progredisce automaticamente quando il giocatore soddisfa condizioni specifiche (trigger) legate alle sue azioni.
*   **Progressione Organica:** I trigger sono legati alle meccaniche di base: esplorare per una certa distanza, sopravvivere per un numero di giorni, raggiungere luoghi specifici sulla mappa o entrare in un'area chiave per la prima volta.
*   **Esperienza Immersiva:** Quando un capitolo viene sbloccato, il gioco si mette in pausa e presenta la storia in un'interfaccia dedicata a schermo intero, concentrando l'attenzione del giocatore sulla rivelazione narrativa prima di tornare al gameplay.

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
Il mondo è vivo grazie a un sistema di incontri intelligente che garantisce varietà, coerenza narrativa e previene la ripetitività.

*   **Gestore di Incontri Intelligente:** Un sistema centralizzato gestisce tutti gli eventi e i combattimenti con una chiara gerarchia di priorità per migliorare il ritmo di gioco.
*   **Priorità agli Eventi di Trama (Lore):** Il sistema garantisce l'attivazione di **un evento di trama al giorno**, assicurando che il giocatore viva l'intera progressione narrativa senza mancare momenti cruciali.
*   **Incontri Garantiti all'Ingresso:** Per rendere l'esplorazione più gratificante, il primo passo in un'area speciale (Foresta, Villaggio, Città) attiva **immediatamente un evento narrativo a tema**, eliminando la casualità del primo incontro e rendendo la scoperta più significativa. Successivamente, si applica il normale cooldown.
*   **Cooldown Dinamico:** Per evitare la ripetitività, dopo ogni incontro si attiva un periodo di "tranquillità". Questo cooldown è più lungo nelle vaste pianure (**4 ore di gioco**) e più breve nei biomi densi come foreste e città (**90 minuti**).
*   **Progressione Garantita:** Il sistema privilegia l'attivazione di **eventi unici non ancora visti**, assicurando una costante sensazione di scoperta. Gli eventi ripetibili e i combattimenti si attivano solo quando non ci sono nuovi contenuti narrativi da presentare.

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