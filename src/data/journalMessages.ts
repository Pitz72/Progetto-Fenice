// src/data/journalMessages.ts

// This file contains a centralized catalog of all game messages displayed in the journal.
// Using a key-based system allows for easy management, translation, and reuse of messages
// without hardcoding strings into the game logic.

export const journalMessages: Record<string, string> = {
    // --- System and Game Messages ---
    GAME_WELCOME: "Benvenuto in The Safe Place. La tua avventura inizia ora.",
    MAP_LOAD_ERROR: "Errore nel caricamento della mappa. Utilizzando mappa di fallback.",
    NARRATIVE_SYSTEM_UNAVAILABLE: "Sistema narrativo non disponibile.",
    GAME_INIT_ERROR: "Errore durante l'inizializzazione del gioco. Riprova.",
    ITEM_USED: "Hai usato [ITEM_NAME].",
    ITEM_EQUIPPED: "Hai equipaggiato: [ITEM_NAME].",
    ITEM_UNEQUIPPED: "Hai tolto: [ITEM_NAME].",
    ITEM_DISCARDED: "Hai scartato: [ITEM_NAME].",
    ITEM_EXAMINED: "Esamini: [ITEM_NAME]. [ITEM_DESC]",

    // --- Item Effects ---
    EFFECT_HEAL: "Recuperi [VALUE] HP.",
    EFFECT_SATIETY: "Recuperi [VALUE] sazietà.",
    EFFECT_HYDRATION: "Recuperi [VALUE] idratazione.",

    // --- Weather and Environment ---
    WEATHER_CHANGE: "Il tempo sta cambiando... Ora è [WEATHER_NAME].",
    WEATHER_STORM_SLOWS: "La tempesta rallenta i tuoi movimenti. (+[PENALTY] minuti)",
    WEATHER_RAIN_START: "Il cielo si oscura e inizia a cadere una pioggia battente.",
    WEATHER_WIND_HOWLS: "Il vento ulula tra le rovine.",
    WEATHER_RAIN_SOUND: "Le gocce di pioggia tamburellano sul tuo equipaggiamento.",
    WEATHER_DAMAGE_WIND: "Il vento violento ti fa inciampare. (-1 HP)",
    WEATHER_DAMAGE_RAIN: "Il terreno scivoloso ti fa cadere. (-1 HP)",

    // --- Movement and Interaction ---
    MOVE_FAIL_MOUNTAIN_1: "Non puoi passare. È una montagna.",
    MOVE_FAIL_MOUNTAIN_2: "Scalare questa parete rocciosa a mani nude sarebbe un suicidio.",
    MOVE_FAIL_MOUNTAIN_3: "Anche le capre di montagna guarderebbero questa parete e direbbero 'No, grazie'.",
    MOVE_FAIL_MOUNTAIN_4: "La montagna ti osserva, impassibile. Non passerai.",
    MOVE_ENTER_RIVER: "Entri nell'acqua gelida. Ti costerà uno sforzo extra per uscire.",
    MOVE_EXIT_RIVER: "Con fatica, esci dall'acqua.",

    // --- Skill Check Successes ---
    SKILL_SUCCESS_DESCEND_SLOPE: "Riesci a scendere senza scivolare sulle superfici lisce. Il metallo è stranamente leggero e freddo al tatto.",
    SKILL_SUCCESS_TUNE_RADIO: "Dopo aver armeggiato con la manopola, riesci a isolare un frammento di trasmissione: '...ripeto, il punto di raccolta a Delta-7 è compromesso. Ripiegare su...'.",
    SKILL_SUCCESS_SCAVENGE_RUINS: "La maggior parte delle cose è corrosa dal tempo, ma riesci a trovare una scatola di munizioni impermeabile semi-sepolta e un elmetto da combattimento ancora integro.",

    // --- Skill Check Failures ---
    SKILL_FAILURE_DESCEND_SLOPE: "Scivoli lungo il pendio ripido, tagliandoti contro i bordi affilati del vetro nero. Il frammento di metallo rimane irraggiungibile.",
    SKILl_FAILURE_TUNE_RADIO: "Riesci solo ad amplificare la statica. Qualsiasi messaggio ci fosse, è perso per sempre nel rumore bianco.",
    SKILL_FAILURE_SCAVENGE_RUINS: "Hai cercato ovunque, ma le intemperie e altri saccheggiatori non hanno lasciato nulla di valore.",

    // --- Narrative and Descriptive ---
    NARRATIVE_READ_LETTER: "Apri con delicatezza la busta... Leggi uno stralcio: \"...Anna, amore mio, non so se queste parole ti raggiungeranno mai...\"",
    NARRATIVE_RESPECT_DEAD: "Decidi che quella lettera contiene una promessa troppo intima per essere violata. [...] Questo piccolo atto di rispetto per i morti ti riempie di una strana, solenne determinazione.",
    NARRATIVE_SWARM_BEAUTY: "Resti immobile mentre lo sciame silenzioso ti passa accanto. È uno dei pochi momenti di pura, strana bellezza che hai visto da molto tempo. Ti senti stranamente rinvigorito.",
    NARRATIVE_MUSIC_BOX: "Ti siedi e ascolti la musica casuale e triste del carillon. In questo mondo silenzioso, anche un suono così stonato ha una sua strana bellezza. Ti senti meno solo.",
};
