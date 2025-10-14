import { AttributeName, SkillDefinition, SkillName } from "./types";

export const ASCII_TITLE = `
 _____ _   ___   __   _____   _____ ______   _____ _   _  _____  _   _ 
/  ___| | / / | / /  / __  \\ /  __ \\|  _  \\  /  __ \\ | | |/  __ \\| | | |
\\ \`--.| |/ /| |/ /   \`' / /' | /  \\/| | | |  | /  \\/ | | | | /  \\/| | | |
 \`--. \\    / |    /     / /   | |    | | | |  | |   | | | | | |   | | | |
/\\__/ / |\\ \\ | |\\ \\   ./ /___ | \\__/\\| |/ /   | \\__/\\ \\_/ /| \\__/\\| |_| |
\\____/\\_| \\_/ \\_| \\_/   \\_____/ \\____/|___/     \\____/\\___/  \\____/\\___/ 
                                                                       
  ______ _   _ _   _ _____ _____ _   _  _____ _____ _   _  _____ 
 |  ____| | | | \\ | |_   _|_   _| \\ | |/ ____|_   _| \\ | |/ ____|
 | |__  | | | |  \\| | | |   | | |  \\| | |      | | |  \\| | (___  
 |  __| | | | | . \` | | |   | | | . \` | |      | | | . \` |\\___ \\ 
 | |    | |_| | |\\  |_| |_  | | | |\\  | |____ _| |_| |\\  |____) |
 |_|     \\___/|_| \\_|_____| |_| |_| \\_|\\_____|_____|_| \\_|_____/ 
                                                                
`;

export const BOOT_TEXT = [
    'Runtime Radio BIOS v1.02',
    'Copyright (C) 1983 Runtime Radio Corp.',
    '',
    'CPU: R-8088 @ 4.77MHz',
    'Memory Test: 640K OK',
    '',
    'Checking drives...',
    'Drive A: Floppy Disk',
    'Drive C: Hard Disk',
    '',
    'Booting from C:...',
    'Starting RR-DOS...',
    '',
    'HIMEM is testing extended memory...done.',
    'RR-DOS Mouse Driver installed.',
    'RR-DOS CD-ROM Driver installed.',
    'Sound Blaster 8 card detected at A220 I5 D1.',
    '',
    'C:\\> autoexec.bat',
    'C:\\> echo off',
    'C:\\> load game.exe',
    'Loading TSP Chronicles...',
];

export const MENU_ITEMS = [
    "Nuova Partita",
    "Continua Partita",
    "Carica Partita",
    "Storia",
    "Istruzioni",
    "Opzioni",
    "Esci",
];

export const INSTRUCTIONS_TEXT = `Figlio Mio, Ultimo...

Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.

Ricorda le basi, sempre. La mappa è la tua guida; la E segna la speranza, il 'Safe Place'. Raggiungila. I tasti direzionali (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: cibo e acqua sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua Condizione – ferite, malanni, veleni – sono nemici silenziosi.

Il tempo è un fiume crudele, il giorno un breve respiro prima del gelo e dei pericoli della notte. Prima che il sole muoia, cerca un Rifugio ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.

Il tuo Inventario è piccolo, riempilo con ciò che è essenziale. Premi 'I' per aprirlo e naviga con i tasti direzionali. Premi il numero corrispondente per usare un oggetto.

La strada ti metterà di fronte a Eventi e scelte difficili. Fidati del tuo Presagio, delle tue Abilità, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.

Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere. Trova il Safe Place. Con tutto l'amore che un padre può dare, Papà.

Leggenda mappa:

@ = Giocatore
C = Città
F = Foresta
~ = Acqua
M = Montagna
R = Rifugio
S = Start
E = End`;

export const STORY_TEXT = `L'Eco del Silenzio

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde. Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".

Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.

Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità. Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.

Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo. Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."

Ora, il silenzio è il suo unico compagno. Davanti a lui, un viaggio disperato attraverso un continente irriconoscibile, armato solo degli insegnamenti paterni e di una mappa verso un luogo che potrebbe essere leggenda, trappola, o forse, davvero, salvezza. Il peso della solitudine è grande, ma la volontà di onorare la memoria del padre, e la primordiale necessità di vivere, lo spingono a muovere il primo passo in quel mondo ostile. Il Safe Place attende, da qualche parte oltre la desolazione.`;

// --- Character System Constants ---

export const ATTRIBUTES: AttributeName[] = ['for', 'des', 'cos', 'int', 'sag', 'car'];
export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  for: 'Forza',
  des: 'Destrezza',
  cos: 'Costituzione',
  int: 'Intelligenza',
  sag: 'Saggezza',
  car: 'Carisma',
};


export const SKILLS: Record<SkillName, SkillDefinition> = {
  // FOR
  atletica: { attribute: 'for' },
  // DES
  acrobazia: { attribute: 'des' },
  furtivita: { attribute: 'des' },
  rapiditaDiMano: { attribute: 'des' },
  // INT
  arcanismo: { attribute: 'int' },
  storia: { attribute: 'int' },
  investigare: { attribute: 'int' },
  natura: { attribute: 'int' },
  religione: { attribute: 'int' },
  // SAG
  addestrareAnimali: { attribute: 'sag' },
  intuizione: { attribute: 'sag' },
  medicina: { attribute: 'sag' },
  percezione: { attribute: 'sag' },
  sopravvivenza: { attribute: 'sag' },
  // CAR
  inganno: { attribute: 'car' },
  intimidire: { attribute: 'car' },
  persuasione: { attribute: 'car' },
  spettacolo: { attribute: 'car' },
};

// XP needed to reach the next level. Index represents the level you are trying to reach.
// e.g., XP_PER_LEVEL[2] = 300 XP to reach level 2.
export const XP_PER_LEVEL = [
  0,      // Livello 0 (non usato)
  0,      // Livello 1
  300,    // Livello 2
  900,    // Livello 3
  2700,   // Livello 4
  6500,   // Livello 5
  14000,  // ...e così via
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000,
];