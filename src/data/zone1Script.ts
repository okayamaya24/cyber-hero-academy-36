/**
 * Zone 1 — Password Plains — "The Cracking Hour"
 * Visual-novel branching script for the SceneEngine.
 */

export type Speaker = "byte" | "keybreaker" | "guardian" | "narrator";
export type SceneType = "dialogue" | "choice" | "minigame";
export type CharacterSlot = "byte" | "keybreaker" | "guardian" | null;

export interface ChoiceOption {
  label: string;
  /** scene index to jump to */
  next: number;
}

export interface SceneEntry {
  id: number;
  speaker: Speaker;
  text: string;
  characterLeft?: CharacterSlot;
  characterRight?: CharacterSlot;
  speakerSide?: "left" | "right";
  background?: string;
  type: SceneType;
  choices?: ChoiceOption[];
  /** For minigame scenes – which mini game to load */
  miniGameType?: string;
  /** Extra mini-game config overrides (e.g. faster timer) */
  miniGameFast?: boolean;
  /** Scene to jump to after this one (defaults to id+1) */
  next?: number;
}

const ZONE1_SCRIPT: SceneEntry[] = [
  // ═══ Scene 1 — Arrival ═══
  {
    id: 0,
    speaker: "narrator",
    text: "Password Plains. A glowing digital landscape filled with massive golden padlocks. Some are sealed. Others are cracked and dark.",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 1,
    speaker: "byte",
    text: "Okay Guardian — welcome to Password Plains. Normally this place is beautiful. All these glowing locks keeping everyone's accounts safe. But something is… very wrong today.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 2,
    speaker: "narrator",
    text: "A loud CRACK echoes across the plains. One of the golden locks shatters. Then another.",
    characterLeft: "byte",
    characterRight: "guardian",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 3,
    speaker: "byte",
    text: "WHOA — did you hear that?! Something is BREAKING the locks!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 4,
    speaker: "keybreaker",
    text: "Hahaha! Another one! And ANOTHER! Oh this is TOO easy. These passwords are absolutely, completely, embarrassingly PATHETIC!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 5,
    speaker: "byte",
    text: "That's the Keybreaker. He's been breaking into accounts all over North America. He cracks passwords for FUN. Like a hobby. A terrible, terrible hobby.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 6,
    speaker: "keybreaker",
    text: "Oh hoho — what do we have HERE? A tiny Cyber Hero? How PRECIOUS. And is that… Byte? Oh wonderful.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 7,
    speaker: "byte",
    text: "H-hey Keybreaker. Long time no see. You look… terrible. As always.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 8,
    speaker: "keybreaker",
    text: "Tell me little hero — do you even know what a password IS? Or did they just hand you that cape and hope for the best?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    background: "password-plains",
    type: "dialogue",
  },
  {
    id: 9,
    speaker: "byte",
    text: "You've GOT this Guardian. Say the thing. SAY THE THING.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    background: "password-plains",
    type: "dialogue",
  },

  // ═══ Choice 1 ═══
  {
    id: 10,
    speaker: "narrator",
    text: "The Keybreaker is waiting. What do you say?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    background: "password-plains",
    type: "choice",
    choices: [
      {
        label: "A password is a secret key that protects your account — and yours is going DOWN!",
        next: 11,
      },
      {
        label: "It's… uh… like your pet's name? Or your birthday?",
        next: 15,
      },
    ],
  },

  // ═══ Path A (11-14) ═══
  {
    id: 11,
    speaker: "keybreaker",
    text: "...Hm. You actually know that? Most people use their cat's name and call it a day.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 12,
    speaker: "byte",
    text: "YES! THAT'S OUR GUARDIAN! Did you SEE his face?!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 13,
    speaker: "keybreaker",
    text: "Lucky guess. Knowing WHAT a password is means nothing if you can't spot one in the wild. Watch this.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 14,
    speaker: "keybreaker",
    text: "No password. Not even a weak one. Just… open. Like a front door with no lock. PATHETIC.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
    next: 19, // merge
  },

  // ═══ Path B (15-18) ═══
  {
    id: 15,
    speaker: "keybreaker",
    text: "YOUR PET'S NAME?! HAHAHA! Oh this is WONDERFUL! THIS is the Guardian they sent?!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 16,
    speaker: "byte",
    text: "Guardian… oh no… okay. Okay we can recover from this. Probably.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 17,
    speaker: "keybreaker",
    text: "A password is supposed to be a SECRET key. Something only YOU know. Something that keeps people like ME out.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 18,
    speaker: "keybreaker",
    text: "Fluffy123. I've seen it four thousand times this week alone.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
    next: 19, // merge
  },

  // ═══ Scene 2 — The Scout (merged) ═══
  {
    id: 19,
    speaker: "byte",
    text: "Okay Guardian — the Keybreaker is moving toward the main vault. We need to identify every protected lock before he does.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 20,
    speaker: "keybreaker",
    text: "I can HEAR you planning! It won't help!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },

  // ═══ Choice 2 ═══
  {
    id: 21,
    speaker: "narrator",
    text: "How do you want to play this Guardian?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    type: "choice",
    choices: [
      {
        label: "Rush — identify them fast and get between him and the vault!",
        next: 22,
      },
      {
        label: "Sneak — move quietly and secure them before he notices!",
        next: 24,
      },
    ],
  },

  // Path A — Rush
  {
    id: 22,
    speaker: "byte",
    text: "Rush it is! Bold strategy! Could absolutely backfire! Let's GO!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
    next: 26,
  },
  // mini game placeholder id for rush path
  {
    id: 23,
    speaker: "narrator",
    text: "",
    type: "dialogue",
    next: 26,
  },

  // Path B — Sneak
  {
    id: 24,
    speaker: "byte",
    text: "Stealth mode — smart! He won't even know what hit him!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
    next: 26,
  },
  {
    id: 25,
    speaker: "narrator",
    text: "",
    type: "dialogue",
    next: 26,
  },

  // ═══ MINI GAME 1: Lock & Learn ═══
  {
    id: 26,
    speaker: "narrator",
    text: "Lock & Learn",
    type: "minigame",
    miniGameType: "lock-and-learn",
    miniGameFast: false,
    next: 27,
  },

  // ═══ Scene 3 — After mini game 1 ═══
  {
    id: 27,
    speaker: "byte",
    text: "Okay — we know which accounts are protected. But not all passwords are strong enough to hold him.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 28,
    speaker: "keybreaker",
    text: "Oh finally — someone who gets it! Weak passwords are almost WORSE than no password.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 29,
    speaker: "byte",
    text: "Did you just… agree with us?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 30,
    speaker: "keybreaker",
    text: "I'm a villain, not an idiot.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 31,
    speaker: "keybreaker",
    text: "THIS one. Strong password. Annoying.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 32,
    speaker: "keybreaker",
    text: "And THIS one — 'sunshine99.' Half a second. PATHETIC.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 33,
    speaker: "byte",
    text: "Guardian — strong passwords hold. Weak ones crumble. We need to tell the difference!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },

  // ═══ Scene 3 — The Deal ═══
  {
    id: 34,
    speaker: "keybreaker",
    text: "What if I only crack the accounts with WEAK passwords? The ones with strong passwords I'll leave alone. Deal?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 35,
    speaker: "byte",
    text: "Don't trust him. Don't you DARE trust him. I am BEGGING you.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },

  // ═══ Choice 3 ═══
  {
    id: 36,
    speaker: "narrator",
    text: "The Keybreaker is offering a deal. What do you do?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    type: "choice",
    choices: [
      {
        label: "Never! Every account deserves protection — not just the strong ones!",
        next: 37,
      },
      {
        label: "...That actually sounds kind of reasonable?",
        next: 42,
      },
    ],
  },

  // Path A — Refuse deal
  {
    id: 37,
    speaker: "keybreaker",
    text: "...Every account? Even the ones with 'password123'?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 38,
    speaker: "guardian",
    text: "EVERY. ONE.",
    characterLeft: "guardian",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 39,
    speaker: "keybreaker",
    text: "Fine. Have it your way. But now I'm ANGRY.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 40,
    speaker: "byte",
    text: "Oh great you made him angry. Okay Guardian — MINI GAME TIME LET'S GO!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
    next: 49,
  },
  {
    id: 41,
    speaker: "narrator",
    text: "",
    type: "dialogue",
    next: 49,
  },

  // Path B — Accept deal (bad choice)
  {
    id: 42,
    speaker: "byte",
    text: "GUARDIAN — NO —",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 43,
    speaker: "keybreaker",
    text: "WONDERFUL! Deal accepted!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 44,
    speaker: "byte",
    text: "He's cheating! OF COURSE he's cheating!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 45,
    speaker: "keybreaker",
    text: "I said I'd leave the strong ones alone! I just didn't say WHEN! Hahahaha!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 46,
    speaker: "byte",
    text: "That is NOT how deals work! Guardian — MINI GAME — GO!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
    next: 49,
  },
  { id: 47, speaker: "narrator", text: "", type: "dialogue", next: 49 },
  { id: 48, speaker: "narrator", text: "", type: "dialogue", next: 49 },

  // ═══ MINI GAME 2: Strong or Smash ═══
  {
    id: 49,
    speaker: "narrator",
    text: "Strong or Smash",
    type: "minigame",
    miniGameType: "strong-or-smash",
    next: 50,
  },

  // ═══ Scene 4 — After mini game 2 ═══
  {
    id: 50,
    speaker: "keybreaker",
    text: "You actually know the difference between strong and weak passwords? Most people can't tell!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 51,
    speaker: "byte",
    text: "Our Guardian isn't most people!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 52,
    speaker: "keybreaker",
    text: "Impressive. But knowing strong from weak means nothing if someone just… gives the password away.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 53,
    speaker: "byte",
    text: "What is he doing?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 54,
    speaker: "keybreaker",
    text: "Calling in some help. Sometimes you don't need to crack a password. Sometimes people just hand it over.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 55,
    speaker: "byte",
    text: "Oh no. OH NO. Guardian — those are his decoys! We have to stop them before they reach the vault!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },

  // ═══ MINI GAME 3: Who Do You Trust ═══
  {
    id: 56,
    speaker: "narrator",
    text: "Who Do You Trust?",
    type: "minigame",
    miniGameType: "who-do-you-trust",
    next: 57,
  },

  // ═══ Scene 4 — Final Standoff ═══
  {
    id: 57,
    speaker: "byte",
    text: "Guardian — the vault is right there. This is it.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 58,
    speaker: "keybreaker",
    text: "Step aside Guardian. That vault is mine.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 59,
    speaker: "byte",
    text: "Guardian… what do we do?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },

  // ═══ Choice 4 — Final ═══
  {
    id: 60,
    speaker: "narrator",
    text: "The Keybreaker is at the vault. What do you do?",
    characterLeft: "byte",
    characterRight: "keybreaker",
    type: "choice",
    choices: [
      {
        label: "Use everything we learned — lock it down tight! He's NOT getting through!",
        next: 61,
      },
      {
        label: "Byte — together!",
        next: 68,
      },
    ],
  },

  // ═══ Victory Path A (61-67) ═══
  {
    id: 61,
    speaker: "byte",
    text: "Oh. OH. Guardian's got this. Standing back. Not getting involved. This is FINE.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 62,
    speaker: "keybreaker",
    text: "What — why won't it — OPEN!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 63,
    speaker: "byte",
    text: "Because every account inside has proper password protection now! You can't crack what's properly locked!",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 64,
    speaker: "keybreaker",
    text: "This isn't OVER Guardian. Password Plains may be yours. But ALL of North America still belongs to me.",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 65,
    speaker: "byte",
    text: "WE WON! WE ACTUALLY WON! I'm not crying — you're crying — NOBODY IS CRYING I'M FINE —",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 66,
    speaker: "byte",
    text: "Hey… you see that on the horizon? That's Weak Wall Wasteland. The Keybreaker's already heading there. Those walls are made of passwords. And some of them… are very, very weak.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 67,
    speaker: "byte",
    text: "We should go.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
    next: -1, // end — zone complete
  },

  // ═══ Victory Path B (68-76) ═══
  {
    id: 68,
    speaker: "byte",
    text: "TOGETHER?! Yes — YES — BYTE AND GUARDIAN — ULTIMATE COMBO — LET'S GO!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 69,
    speaker: "keybreaker",
    text: "What is that little creature DOING?! And why is the Guardian — STOP THAT —",
    characterLeft: "byte",
    characterRight: "keybreaker",
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 70,
    speaker: "byte",
    text: "GUARDIAN — NOW!",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 71,
    speaker: "byte",
    text: "You're… welcome. Just putting that out there. Byte. Saved. The day.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 72,
    speaker: "byte",
    text: "Okay FINE — WE saved the day. TOGETHER. I'm not even keeping score.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 73,
    speaker: "byte",
    text: "I'm absolutely keeping score.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
  },
  {
    id: 74,
    speaker: "keybreaker",
    text: "WEAK WALL WASTELAND, GUARDIAN! I'LL SEE YOU THERE!",
    characterLeft: "byte",
    characterRight: null,
    speakerSide: "right",
    type: "dialogue",
  },
  {
    id: 75,
    speaker: "byte",
    text: "There's always a next time. Come on Guardian. And maybe next time — take the lead a little sooner? Just a thought.",
    characterLeft: "byte",
    characterRight: "guardian",
    speakerSide: "left",
    type: "dialogue",
    next: -1, // end — zone complete
  },
];

export default ZONE1_SCRIPT;
