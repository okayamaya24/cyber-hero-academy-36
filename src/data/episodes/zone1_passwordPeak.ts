/**
 * Zone 1 — Password Peak (New York, USA)
 * Episode: "The Cracking Hour"
 * Topic: Strong passwords, password reuse, never share your password
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";

export const zone1Episode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Password Peak — New York, USA",
  zoneIcon:     "🔐",
  startSceneId: "s0",

  scenes: {

    s0: {
      id:          "s0",
      speaker:     "narrator",
      text:        "New York. The Keybreaker cracked every weak password in the city. His Crack-Bots are swarming Password Peak — and citizens are panicking.",
      nextSceneId: "s1",
    },

    s1: {
      id:          "s1",
      speaker:     "villain",
      text:        "Fluffy… password123… mybirthday… EMBARRASSINGLY easy. I've cracked them all in seconds. Try to stop me, Guardian — I DARE you.",
      nextSceneId: "s2",
    },

    s2: {
      id:      "s2",
      speaker: "guide",
      text:    "That girl's account is being hacked RIGHT NOW! Her password is her dog's name: Fluffy. Help her pick a new one — FAST!",
      choices: [
        {
          label:        "Her birthday: May5!",
          extraDialogue: "Keybreaker: 'Birthdays! I know everyone's birthday — cracked in 0.1 seconds!' Birthdays and pet names are the FIRST things hackers try!",
          nextSceneId:  "s3",
        },
        {
          label:        "A random mix: Tr0pic@lFish99!",
          extraDialogue: "The Keybreaker SCREAMS. 'WHAT?! That's impossible to crack! NOOOO!' Uppercase, lowercase, numbers AND symbols — that's a fortress!",
          nextSceneId:  "s3",
          xpBonus:      25,
        },
        {
          label:        "The word 'password'",
          extraDialogue: "Keybreaker doubles over laughing. 'They used… the word… PASSWORD?!' Never, ever use 'password' as a password!",
          nextSceneId:  "s3",
        },
      ],
    },

    s3: {
      id:          "s3",
      speaker:     "guide",
      text:        "A strong password needs FOUR things: UPPERCASE, lowercase, numbers, and symbols like ! or @. At least 12 characters — and NEVER your name or birthday!",
      nextSceneId: "s4",
    },

    s4: {
      id:                  "s4",
      speaker:             "guide",
      text:                "Some passwords will hold — others crumble the moment the Keybreaker touches them. Swipe RIGHT for STRONG, LEFT for WEAK. Protect the tower!",
      miniGameId:          "lock-and-learn",
      miniGameTitle:       "Lock & Learn",
      miniGameDescription: "Swipe RIGHT for strong passwords, LEFT for weak ones. The Keybreaker is watching — don't let him spot the weak ones first!",
      nextSceneId:         "s5",
    },

    s5: {
      id:      "s5",
      speaker: "villain",
      text:    "Impressive. But I have a deal — stop now and I'll only lock HALF the city's accounts. Keep going… and I lock them ALL.",
      choices: [
        {
          label:        "No deal, Keybreaker — we're not stopping!",
          extraDialogue: "The Keybreaker narrows his eyes. 'Bold. But boldness won't survive what comes next!'",
          nextSceneId:  "s6",
          xpBonus:      25,
        },
        {
          label:        "We hesitate for a moment…",
          extraDialogue: "Byte whispers: 'He's bluffing! That's what hackers do — they want you scared. Don't fall for it!'",
          nextSceneId:  "s6",
        },
      ],
    },

    s6: {
      id:          "s6",
      speaker:     "guide",
      text:        "New problem! Someone's using the SAME password for email, games, AND school. If the Keybreaker cracks it once — he owns everything. Every account needs its OWN password!",
      nextSceneId: "s7",
    },

    s7: {
      id:                  "s7",
      speaker:             "guide",
      text:                "The Keybreaker is launching password attacks — FAST! Is each one strong enough to survive, or will it smash?",
      miniGameId:          "strong-or-smash",
      miniGameTitle:       "Strong or Smash?",
      miniGameDescription: "Passwords are flashing! Tap STRONG if it holds — SMASH if it's too weak. The Keybreaker gets faster every round!",
      nextSceneId:         "s8",
    },

    s8: {
      id:          "s8",
      speaker:     "villain",
      text:        "You think you're clever?! Fine. I have one trick left — I don't need to crack anything. I just need someone to TYPE their password into my trap.",
      nextSceneId: "s8b",
    },

    s8b: {
      id:          "s8b",
      speaker:     "narrator",
      text:        "A message flashes across every screen in the city: 'URGENT — Your CyberGuard account will be DELETED in 10 minutes! Enter your password NOW to save it!'",
      nextSceneId: "s9",
    },

    s9: {
      id:      "s9",
      speaker: "guide",
      text:    "Everyone in the city is panicking. They all got that scary message. What should they do?",
      choices: [
        {
          label:        "Click the link and type their password!",
          extraDialogue: "Keybreaker cheers: 'YES! Thank you!' NEVER type your password because a scary message told you to. Real companies NEVER ask by email!",
          nextSceneId:  "s10",
        },
        {
          label:        "Delete it and tell a trusted adult.",
          extraDialogue: "Keybreaker SHRIEKS: 'Noooo — don't tell an ADULT!' No real company emails you asking for your password. Delete it every time!",
          nextSceneId:  "s10",
          xpBonus:      25,
        },
        {
          label:        "Reply to the email asking if it's real.",
          extraDialogue: "Byte shakes their head. 'Replying tells the hacker your email works — making you a bigger target! Just delete it and tell a grown-up.'",
          nextSceneId:  "s10",
        },
      ],
    },

    s10: {
      id:                  "s10",
      speaker:             "guide",
      text:                "The Keybreaker planted FAKE websites everywhere — they look real, but steal your password the moment you type it. Spot the real ones from his traps!",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Who Do You Trust?",
      miniGameDescription: "The Keybreaker's fake sites look VERY real. Check the web address carefully — pick the real login page and avoid his traps!",
      nextSceneId:         "s11",
    },

    s11: {
      id:          "s11",
      speaker:     "villain",
      text:        "This is IMPOSSIBLE. No Guardian has ever gotten this far. Fine — you win THIS round. But every weak password still belongs to me… eventually.",
      nextSceneId: "s12",
    },

    s12: {
      id:      "s12",
      speaker: "guide",
      text:    "The Keybreaker is retreating! Password Peak is almost ours. One last push — how do we finish this?",
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

    victory_a: {
      id:               "victory_a",
      speaker:          "guide",
      text:             "You led the charge! The Keybreaker couldn't believe it — one hero, standing between him and the whole city. Password Peak is SECURE!",
      isEnding:         true,
      endingType:       "victory-a",
      xpReward:         50,
      badge:            "Password Pro",
      completionMessage: "My passwords… YEARS of work! You'll pay for this. My friend in Europe is going to love hearing about you…",
    },

    victory_b: {
      id:               "victory_b",
      speaker:          "guide",
      text:             "Together you locked him out! The whole city is safe — because you and Byte refused to give up.",
      isEnding:         true,
      endingType:       "victory-b",
      xpReward:         50,
      badge:            "Password Pro",
      completionMessage: "This isn't over. My friend the Phisher King has been VERY busy in Europe… and he's been waiting for you.",
    },

    defeat: {
      id:               "defeat",
      speaker:          "guide",
      text:             "Almost! Watch for passwords that LOOK strong but aren't — like 'P@ssw0rd'. Hackers know those tricks too. Try again?",
      isEnding:         true,
      endingType:       "defeat",
      retrySceneId:     "s4",
      completionMessage: "So close! Watch for obvious substitutions — hackers know those tricks too. You've got this!",
    },

  },
};
