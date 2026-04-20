/**
 * Zone 1 — Password Peak (New York, USA)
 * Episode: "Password Plains — The Cracking Hour"
 * Topic: What makes a strong password
 * Villain: The Keybreaker
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";

export const zone1Episode: EpisodeData = {
  villainName: "The Keybreaker",
  zoneName:    "Password Peak — New York, USA",
  zoneIcon:    "🔐",
  startSceneId: "s0",

  scenes: {

    /* ── SCENE 0 — Arrival ─────────────────────────── */
    s0: {
      id: "s0",
      speaker: "guide",
      text: "Guardian! The Keybreaker has blocked the Digital City gates with weak passwords! We need to climb Password Peak and build super-strong ones.",
      nextSceneId: "s1",
    },

    s1: {
      id: "s1",
      speaker: "villain",
      text: "Mwahaha! These passwords are UNBREAKABLE. Come back when you've trained more, rookie!",
      nextSceneId: "s2",
    },

    /* ── SCENE 1 — First choice ────────────────────── */
    s2: {
      id: "s2",
      speaker: "guide",
      text: "A strong password needs uppercase letters, numbers, AND symbols — and it should be long! What do you want to know first?",
      choices: [
        {
          label: "What makes a password strong?",
          extraDialogue: "Great! Long passwords with uppercase letters, numbers AND symbols are nearly impossible to crack. Never use your name, birthday, or 'password123' — the Keybreaker tries those first!",
          nextSceneId: "s3",
          xpBonus: 25,
        },
        {
          label: "Let's just go fight the Keybreaker!",
          nextSceneId: "s2b",
        },
      ],
    },

    /* ── SCENE 1b — Fight-first path ───────────────── */
    s2b: {
      id: "s2b",
      speaker: "villain",
      text: "Oh, charging in without training? PERFECT. Rookies who don't know the rules are my favourite kind of Guardian to crush. Come on then — let's see what you've got!",
      nextSceneId: "s2c",
    },

    s2c: {
      id: "s2c",
      speaker: "guide",
      text: "He's right about one thing — we need to know the rules to beat him. Here's the fastest version: length + uppercase + numbers + symbols = uncrackable. Ready to put that to work?",
      nextSceneId: "s3",
    },

    /* ── SCENE 2 — Mini-game 1 ─────────────────────── */
    s3: {
      id: "s3",
      speaker: "guide",
      text: "Time to put it into practice! Scan these gates and figure out which passwords are strong enough to hold — and which ones the Keybreaker will smash right through.",
      miniGameId:          "lock-and-learn",
      miniGameTitle:       "Lock & Learn",
      miniGameDescription: "Scout the battlefield — spot the strong passwords and flag the weak ones before the Keybreaker finds them!",
      nextSceneId: "s4",
    },

    /* ── SCENE 3 — The deal ────────────────────────── */
    s4: {
      id: "s4",
      speaker: "villain",
      text: "Impressive… but I have a deal for you. Stop now and I won't lock the whole city. Your choice, Guardian.",
      choices: [
        {
          label: "No deal, Keybreaker — we're not stopping!",
          extraDialogue: "The Keybreaker narrows his eyes. 'Bold. I respect that. But let's see if that boldness survives what's next!'",
          nextSceneId: "s5",
          xpBonus: 25,
        },
        {
          label: "We… hesitate.",
          extraDialogue: "Byte whispers urgently: 'Stay strong, Guardian — don't trust him! He's trying to rattle you. Keep going!'",
          nextSceneId: "s5",
        },
      ],
    },

    /* ── SCENE 4 — Mini-game 2 ─────────────────────── */
    s5: {
      id: "s5",
      speaker: "guide",
      text: "The Keybreaker is throwing everything at us — password after password! We need to decide fast which ones are strong and which ones will crumble. Ready?",
      miniGameId:          "strong-or-smash",
      miniGameTitle:       "Strong or Smash?",
      miniGameDescription: "The Keybreaker is attacking! Quickly decide: is each password STRONG (it holds) or WEAK (it smashes)? Don't let him through!",
      nextSceneId: "s6",
    },

    /* ── SCENE 5 — Mini-game 3 ─────────────────────── */
    s6: {
      id: "s6",
      speaker: "villain",
      text: "You can't trust everything online — even I could pretend to be a helpful website. Can you tell who's real and who's a trap?",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Who Do You Trust?",
      miniGameDescription: "The Keybreaker planted fake login pages everywhere. Choose the REAL sites and avoid his traps — your passwords depend on it!",
      nextSceneId: "s7",
    },

    /* ── SCENE 6 — Final choice ────────────────────── */
    s7: {
      id: "s7",
      speaker: "guide",
      text: "The Keybreaker is retreating! The Digital City gates are almost open. One last push, Guardian — how do we finish this?",
      choices: [
        {
          label: "I'll lead the final defense!",
          nextSceneId: "victory_a",
          xpBonus: 50,
        },
        {
          label: "We finish this together!",
          nextSceneId: "victory_b",
          xpBonus: 25,
        },
      ],
    },

    /* ── VICTORY A ─────────────────────────────────── */
    victory_a: {
      id:            "victory_a",
      speaker:       "guide",
      text:          "You led the charge, Guardian! The Keybreaker couldn't believe it. The Digital City gates are OPEN and every citizen is safe!",
      isEnding:      true,
      endingType:    "victory-a",
      xpReward:      50,
      badge:         "Password Pro",
      completionMessage: "Yippee! The gates are open and the Keybreaker is worried!",
    },

    /* ── VICTORY B ─────────────────────────────────── */
    victory_b: {
      id:            "victory_b",
      speaker:       "guide",
      text:          "Together you cracked it! The Keybreaker is running — and the whole city is cheering. This is what Cyber Heroes do!",
      isEnding:      true,
      endingType:    "victory-b",
      xpReward:      50,
      badge:         "Password Pro",
      completionMessage: "Yippee! The gates are open and the Keybreaker is worried!",
    },

    /* ── DEFEAT ────────────────────────────────────── */
    defeat: {
      id:            "defeat",
      speaker:       "guide",
      text:          "Almost! The tricky part is spotting the ones that LOOK strong but aren't quite there. Want to try again? I'll flag the sneaky ones this time.",
      isEnding:      true,
      endingType:    "defeat",
      retrySceneId:  "s3",
      completionMessage: "Almost! The tricky part is spotting the sneaky ones — like passwords that look strong but use common substitutions. You've got this!",
    },

  },
};
