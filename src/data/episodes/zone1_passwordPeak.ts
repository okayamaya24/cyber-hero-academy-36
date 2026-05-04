/**
 * Zone 1 — Password Peak (New York, USA)
 * Episode: "The Cracking Hour"
 * Topic: Strong passwords, password reuse, never share your password
 * Villain: The Keybreaker
 *
 * Structure:
 *   5 story beats · 4 choice moments · 3 mini-games · 3 endings · 1 cliffhanger
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";

export const zone1Episode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Password Peak — New York, USA",
  zoneIcon:     "🔐",
  startSceneId: "s0",

  scenes: {

    /* ─────────────────────────────────────────────────────
       SCENE 0 — Arrival at Password Peak
    ───────────────────────────────────────────────────── */
    s0: {
      id:          "s0",
      speaker:     "narrator",
      text:        "Digital City, New York. The Keybreaker has cracked every weak password protecting the city's accounts. His Crack-Bots are swarming the tower at Password Peak — and citizens are panicking.",
      nextSceneId: "s1",
    },

    s1: {
      id:          "s1",
      speaker:     "villain",
      text:        "Fluffy… password123… mybirthday… Ha! These passwords are EMBARRASSINGLY easy. I've cracked them all in seconds. Try to stop me, little Guardian — I DARE you.",
      nextSceneId: "s2",
    },

    /* ─────────────────────────────────────────────────────
       SCENE 1 — Mia's account is being hacked RIGHT NOW
       CHOICE 1: What should her new password be?
    ───────────────────────────────────────────────────── */
    s2: {
      id:      "s2",
      speaker: "guide",
      text:    "Guardian — that girl's account is being hacked right NOW! Her password is her dog's name: Fluffy. We need to help her pick a new one — FAST! What should it be?",
      choices: [
        {
          label:        "Her birthday: May5!",
          extraDialogue: "The Keybreaker cackles: 'Birthdays! I know when everyone was born — cracked in 0.1 seconds!' Birthdays and pet names are the FIRST things hackers try. Never use them!",
          nextSceneId:  "s3",
        },
        {
          label:        "A random mix: Tr0pic@lFish99!",
          extraDialogue: "The Keybreaker SCREAMS. 'WHAT?! That's… impossible to crack! NOOOO!' Nailed it — uppercase, lowercase, numbers AND symbols. That's a fortress!",
          nextSceneId:  "s3",
          xpBonus:      25,
        },
        {
          label:        "The word 'password'",
          extraDialogue: "Even the Keybreaker does a double-take. 'HAHAHA — they used… the word… PASSWORD?!' Never, ever use 'password' as a password. It's literally the first thing hackers try!",
          nextSceneId:  "s3",
        },
      ],
    },

    /* ─────────────────────────────────────────────────────
       SCENE 2 — Byte teaches the 4 ingredients
    ───────────────────────────────────────────────────── */
    s3: {
      id:          "s3",
      speaker:     "guide",
      text:        "Here's the secret, Guardian. A strong password has FOUR ingredients: UPPERCASE letters, lowercase letters, numbers, and symbols — like ! or @. And it should be at least 12 characters long. Never use your name, pet, or birthday!",
      nextSceneId: "s4",
    },

    /* ─────────────────────────────────────────────────────
       MINI-GAME 1 — Lock & Learn (swipe strong/weak)
    ───────────────────────────────────────────────────── */
    s4: {
      id:                  "s4",
      speaker:             "guide",
      text:                "See these locked gates? Some passwords will hold — others will crumble the second the Keybreaker touches them. Swipe RIGHT for STRONG, LEFT for WEAK. Help me secure this tower!",
      miniGameId:          "lock-and-learn",
      miniGameTitle:       "Lock & Learn",
      miniGameDescription: "Swipe RIGHT for strong passwords, LEFT for weak ones. The Keybreaker is watching — don't let him spot the weak ones first!",
      nextSceneId:         "s5",
    },

    /* ─────────────────────────────────────────────────────
       SCENE 3 — The Keybreaker's deal
       CHOICE 2: Take the deal or push forward?
    ───────────────────────────────────────────────────── */
    s5: {
      id:      "s5",
      speaker: "villain",
      text:    "Impressive… but I have a deal for you, Guardian. Stop now, and I'll only lock HALF the city's accounts. Keep going… and I'll lock them ALL. Your choice.",
      choices: [
        {
          label:        "No deal, Keybreaker — we're not stopping!",
          extraDialogue: "The Keybreaker narrows his eyes. 'Bold. I respect that. But let's see if that boldness survives what comes next!' The gates hold steady.",
          nextSceneId:  "s6",
          xpBonus:      25,
        },
        {
          label:        "We hesitate for a moment…",
          extraDialogue: "Byte whispers urgently: 'Stay strong! He's bluffing — that's what hackers do. They want you scared. Don't fall for it, Guardian!'",
          nextSceneId:  "s6",
        },
      ],
    },

    /* ─────────────────────────────────────────────────────
       SCENE 4 — Password reuse lesson
    ───────────────────────────────────────────────────── */
    s6: {
      id:          "s6",
      speaker:     "guide",
      text:        "New problem! Someone here is using the SAME password for their email, their game account, AND their school login. If the Keybreaker cracks it ONCE — he owns everything! Every account needs its OWN unique password.",
      nextSceneId: "s7",
    },

    /* ─────────────────────────────────────────────────────
       MINI-GAME 2 — Strong or Smash? (timed rapid-fire)
    ───────────────────────────────────────────────────── */
    s7: {
      id:                  "s7",
      speaker:             "guide",
      text:                "The Keybreaker is launching password attacks — FAST! Decide quickly: is each password strong enough to survive, or will it smash? Don't let him through the gates!",
      miniGameId:          "strong-or-smash",
      miniGameTitle:       "Strong or Smash?",
      miniGameDescription: "Passwords are flashing! Tap STRONG if it holds — SMASH if it's too weak. The Keybreaker gets faster every round!",
      nextSceneId:         "s8",
    },

    /* ─────────────────────────────────────────────────────
       SCENE 5 — The email trap (seeds phishing concept)
    ───────────────────────────────────────────────────── */
    s8: {
      id:          "s8",
      speaker:     "villain",
      text:        "You think you're so clever?! Fine. I have ONE trick left. I don't need to crack anything. I just need someone to TYPE their password into my trap… and people fall for it ALL the time.",
      nextSceneId: "s8b",
    },

    s8b: {
      id:          "s8b",
      speaker:     "narrator",
      text:        "A message flashes on every screen in the city: 'URGENT — Your CyberGuard account will be DELETED in 10 minutes! Click here and enter your password NOW to save it!'",
      nextSceneId: "s9",
    },

    /* ─────────────────────────────────────────────────────
       CHOICE 3: What should citizens do with the scary email?
    ───────────────────────────────────────────────────── */
    s9: {
      id:      "s9",
      speaker: "guide",
      text:    "Guardian — people across the city are panicking. They've all got this scary message. What should they do?",
      choices: [
        {
          label:        "Click the link and type their password!",
          extraDialogue: "The Keybreaker cheers: 'YES! Thank you!' NEVER type your password because a scary message told you to. Real companies NEVER ask for your password by email — ever!",
          nextSceneId:  "s10",
        },
        {
          label:        "Delete it and tell a trusted adult.",
          extraDialogue: "The Keybreaker SHRIEKS: 'Noooo — don't tell an ADULT!' Perfect. No real company will ever email you asking for your password. If they do — it's a trap. Delete it!",
          nextSceneId:  "s10",
          xpBonus:      25,
        },
        {
          label:        "Reply to the email asking if it's real.",
          extraDialogue: "Byte shakes their head. 'Replying tells the hacker your email works — making you an even bigger target! Better to just delete it and tell a grown-up straight away.'",
          nextSceneId:  "s10",
        },
      ],
    },

    /* ─────────────────────────────────────────────────────
       MINI-GAME 3 — Who Do You Trust? (real vs fake sites)
    ───────────────────────────────────────────────────── */
    s10: {
      id:                  "s10",
      speaker:             "guide",
      text:                "The Keybreaker planted FAKE websites everywhere — they look real, but they steal your password the moment you type it in. Can you spot the real ones from his traps?",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Who Do You Trust?",
      miniGameDescription: "The Keybreaker's fake sites look VERY real. Check the web address carefully — pick the real login page and avoid his traps. Your passwords depend on it!",
      nextSceneId:         "s11",
    },

    /* ─────────────────────────────────────────────────────
       SCENE 6 — The Keybreaker retreats
       CHOICE 4: How do we finish this?
    ───────────────────────────────────────────────────── */
    s11: {
      id:          "s11",
      speaker:     "villain",
      text:        "This… this is IMPOSSIBLE. No Guardian has EVER gotten this far. Fine — you win THIS round. But I'll be back. Every weak password in the world still belongs to me… eventually.",
      nextSceneId: "s12",
    },

    s12: {
      id:      "s12",
      speaker: "guide",
      text:    "The Keybreaker is retreating! Password Peak is almost ours. The Digital City accounts are safe — for now. One last push, Guardian. How do we finish this?",
      choices: [
        {
          label:       "I'll lead the final lockdown!",
          nextSceneId: "victory_a",
          xpBonus:     50,
        },
        {
          label:       "We finish this together, Byte!",
          nextSceneId: "victory_b",
          xpBonus:     25,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────
       VICTORY A — Guardian Led
    ───────────────────────────────────────────────────── */
    victory_a: {
      id:               "victory_a",
      speaker:          "guide",
      text:             "You led the charge, Guardian! The Keybreaker couldn't believe it. A single hero, standing between him and the whole city. Password Peak is SECURE — every account is locked tight!",
      isEnding:         true,
      endingType:       "victory-a",
      xpReward:         50,
      badge:            "Password Pro",
      completionMessage: "My passwords… YEARS of work! You'll pay for this, Guardian. My friend in Europe is going to love hearing about you…",
    },

    /* ─────────────────────────────────────────────────────
       VICTORY B — Together
    ───────────────────────────────────────────────────── */
    victory_b: {
      id:               "victory_b",
      speaker:          "guide",
      text:             "Together you locked him out! Byte cheers as the Keybreaker melts back into the shadows. The whole city is safe — because you and your team refused to give up!",
      isEnding:         true,
      endingType:       "victory-b",
      xpReward:         50,
      badge:            "Password Pro",
      completionMessage: "This isn't over, Guardian. Not even close. My friend the Phisher King has been VERY busy in Europe… and he's been waiting for you.",
    },

    /* ─────────────────────────────────────────────────────
       DEFEAT — Retry from mini-game 1
    ───────────────────────────────────────────────────── */
    defeat: {
      id:               "defeat",
      speaker:          "guide",
      text:             "Almost there! The sneaky ones are passwords that LOOK strong but aren't quite — like 'P@ssw0rd', which everyone uses. Want to try again? I'll help flag the tricky ones this time.",
      isEnding:         true,
      endingType:       "defeat",
      retrySceneId:     "s4",
      completionMessage: "So close! Watch for passwords that use obvious substitutions — hackers know those tricks too. You've got this!",
    },

  },
};
