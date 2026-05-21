/**
 * Lesson Content Data
 * Each lesson maps to a series of slides shown before the quiz mission.
 */

export type SlideType =
  | "intro"    // character welcome screen
  | "learn"    // info card with icon + text
  | "tip"      // speech-bubble style tip from guide
  | "check"    // tap-the-right-answer interactive
  | "game"     // full interactive mini-game
  | "summary"; // key takeaways + quiz CTA

export type LessonGameType =
  | "password-attention"
  | "password-strength-tester"
  | "password-fixer"
  | "password-builder"
  | "login-detective"
  | "popup-or-scam"
  | "phishing-swipe"
  | "url-detective"
  | "suspicious-text"
  | "info-shield-sort"
  | "post-or-pass"
  | "fact-check"
  | "malware-monster-match"
  | "trace-the-hacker";

export interface CheckChoice {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface LessonSlide {
  type: SlideType;
  gameType?: LessonGameType; // used when type === "game"
  // intro
  headline?: string;
  subtext?: string;
  // learn
  icon?: string;
  title?: string;
  body?: string;
  // tip
  tipText?: string;
  // check
  question?: string;
  choices?: CheckChoice[];
  // summary
  takeaways?: string[];
  quizLabel?: string; // CTA button label
}

export interface LessonQuizQuestion {
  question: string;
  choices: { text: string; correct: boolean; feedback: string }[];
}

export interface LessonContent {
  lessonId: string;
  missionId: string;
  character: string; // guide name for display
  characterEmoji: string;
  characterColor: string; // tailwind bg
  videoUrl?: string; // optional video shown before slides
  slides: LessonSlide[];
  quiz?: LessonQuizQuestion[]; // inline quiz shown when summary CTA is clicked
  badgeLabel?: string;         // badge name awarded on quiz completion
  badgeEmoji?: string;         // badge emoji
}

export const LESSON_CONTENT: LessonContent[] = [
  /* ─────────────────────────────────────────
     HERO — Lesson 1: Creating Strong Passwords
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hero-1",
    missionId: "password-safety",
    character: "Byte",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson1.mp4",
    badgeLabel: "Password Pro",
    badgeEmoji: "🔐",
    slides: [
      {
        type: "summary",
        takeaways: [
          "Use 12+ characters — longer is stronger 📏",
          "Mix letters, numbers, AND symbols 🔤🔢💥",
          "Never use your name, birthday, or 'password' 🚫",
          "A passphrase is your secret weapon 🗡️",
          "Use a different password for every account 🔐",
        ],
        quizLabel: "Take the Password Quiz!",
      },
    ],
    quiz: [
      {
        question: "How long should a strong password be?",
        choices: [
          { text: "4 characters",        correct: false, feedback: "Way too short — a hacker can crack that in under a second!" },
          { text: "6 characters",        correct: false, feedback: "Still too short. Hackers have tools that try millions of combos fast!" },
          { text: "12 or more characters", correct: true,  feedback: "Yes! The longer it is, the harder it is to crack. 12+ is the sweet spot! 🎯" },
          { text: "Exactly 8 characters", correct: false, feedback: "8 is okay but not great — go for 12 or more to be really safe!" },
        ],
      },
      {
        question: "Which of these is the STRONGEST password?",
        choices: [
          { text: "password123",    correct: false, feedback: "Hackers guess this one in under a second — Byte warned you! 😬" },
          { text: "Fluffy2010",     correct: false, feedback: "Your pet's name + a year? Hackers check those first, every time!" },
          { text: "PurpleTiger$42", correct: true,  feedback: "🔥 Yes! Just like Byte said — mix words, numbers and symbols. That's unbreakable!" },
          { text: "abc12345",       correct: false, feedback: "Simple patterns like abc or 12345 are cracked instantly!" },
        ],
      },
      {
        question: "What should you NEVER put in a password?",
        choices: [
          { text: "Random numbers",    correct: false, feedback: "Numbers are great — they make passwords way stronger!" },
          { text: "Your birthday",     correct: true,  feedback: "Exactly! Birthdays are public info. A hacker can find that easily 🕵️" },
          { text: "Capital letters",   correct: false, feedback: "Capital letters are a great addition — keep using them!" },
          { text: "Special symbols",   correct: false, feedback: "Symbols like ! @ # are your secret weapon — always add them!" },
        ],
      },
      {
        question: "Byte said to use a passphrase. What is that?",
        choices: [
          { text: "A hint to remember your password",          correct: false, feedback: "That's a hint — a passphrase is the password itself!" },
          { text: "A password you share with friends",         correct: false, feedback: "Never share your password — not even with friends!" },
          { text: "Three random words like 'pizza cloud seven rocket'", correct: true, feedback: "Exactly what Byte said! Random words = long, strong, and easy to remember 🚀" },
          { text: "A password your school gives you",          correct: false, feedback: "Nope — a passphrase is something YOU create. Make it random!" },
        ],
      },
      {
        question: "You use the same password on every website. Is that…",
        choices: [
          { text: "Smart — easy to remember!",          correct: false, feedback: "It seems smart but it's risky — one hack and ALL your accounts are exposed!" },
          { text: "Dangerous — one hack = all accounts exposed", correct: true, feedback: "100% right! Always use a different password for each account 🔑" },
          { text: "Fine if the password is really strong", correct: false, feedback: "Even a strong password reused everywhere is dangerous. One site gets hacked — they all do!" },
          { text: "Required by most apps",              correct: false, feedback: "Nope — apps actually encourage unique passwords!" },
        ],
      },
      {
        question: "Why do symbols like ! @ # make passwords stronger?",
        choices: [
          { text: "They look cool",                                   correct: false, feedback: "Ha! They do look cool — but that's not why 😄" },
          { text: "They make passwords easier to remember",           correct: false, feedback: "Actually harder to remember, but WAY harder to crack!" },
          { text: "They massively increase the number of possible combos", correct: true, feedback: "Exactly! More possible characters = billions more combinations to try 💥" },
          { text: "They are required by law",                         correct: false, feedback: "Not a law — just really smart password design!" },
        ],
      },
    ],
  },

  /* ─────────────────────────────────────────
     HERO — Lesson 2: Cyber Clues & Digital Trails
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hero-2",
    missionId: "cyber-clues",
    character: "Byte",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson2.mp4",
    badgeLabel: "Cyber Detective",
    badgeEmoji: "🕵️",
    slides: [
      {
        type: "intro",
        headline: "Cyber Clues & Digital Trails",
        subtext: "Every time you go online, you leave footprints. Let's learn to spot the clues!",
      },
      {
        type: "learn",
        icon: "👣",
        title: "You leave digital footprints",
        body: "Every website you visit, search you make, and photo you post leaves a trail online. This is called your digital footprint.",
      },
      {
        type: "learn",
        icon: "🔍",
        title: "Hackers leave clues too",
        body: "When hackers break into accounts, they leave signs — weird login times, unknown devices, or changed settings. Spotting these clues makes you a cyber detective!",
      },
      {
        type: "check",
        question: "Which one is a sign someone may have hacked your account?",
        choices: [
          { text: "You got a new high score in a game", correct: false, feedback: "Great job on the score, but that's not a hack sign! 🎮" },
          { text: "You see a login from a city you've never been to", correct: true, feedback: "Exactly! Unknown logins are a major red flag! 🚨" },
          { text: "Your profile picture loaded slowly", correct: false, feedback: "Slow loading is usually just bad internet! 📶" },
          { text: "Your friend sent you a funny video", correct: false, feedback: "Sounds fun — but that's totally normal! 😄" },
        ],
      },
      {
        type: "tip",
        tipText: "Always log out of accounts on shared computers — like at school or the library. If you leave yourself logged in, anyone can access your stuff! 🚪",
      },
      {
        type: "game",
        gameType: "login-detective",
      },
      {
        type: "learn",
        icon: "🕵️",
        title: "Think like a cyber detective",
        body: "Real hackers leave clues — fake websites, suspicious messages, and strange downloads. Your job is to spot the difference between SAFE and SUSPICIOUS before it's too late!",
      },
      {
        type: "game",
        gameType: "trace-the-hacker",
      },
      {
        type: "summary",
        takeaways: [
          "You have a digital footprint everywhere you go online 👣",
          "Unknown logins from new places = red flag 🚩",
          "Always log out on shared devices 🚪",
          "Fake URLs use misspellings and missing lock icons 🔒",
          "Never download .exe files from strangers or plug in found USB drives 💾",
          "Check your account activity regularly 🔍",
        ],
        quizLabel: "Take the Cyber Clues Quiz!",
      },
    ],
    quiz: [
      {
        question: "What is a digital footprint?",
        choices: [
          { text: "A shoe print made on a touchscreen", correct: false, feedback: "Ha! That would be muddy! A digital footprint is the trail you leave online. 😄" },
          { text: "The trail of info you leave online when browsing, posting, or searching", correct: true, feedback: "Exactly! Every click, search, and post adds to your digital footprint. 👣" },
          { text: "A special password that tracks you", correct: false, feedback: "Not a password — it's all the data trails you leave just by going online!" },
          { text: "A virus that follows you around the internet", correct: false, feedback: "No viruses here! A digital footprint is just the data trail you naturally create online." },
        ],
      },
      {
        question: "You get a message: \"You won a FREE iPhone! Click here!\" What should you do?",
        choices: [
          { text: "Click it immediately — free phone!", correct: false, feedback: "🚨 STOP! Nobody gives strangers free iPhones. This is a scam to steal your info!" },
          { text: "Ignore it and tell a trusted adult", correct: true, feedback: "Smart move! Prize scams are one of the most common tricks hackers use. 🧠" },
          { text: "Share it with friends so they can win too", correct: false, feedback: "That would spread the scam! Never forward suspicious messages." },
          { text: "Reply asking for more details", correct: false, feedback: "Replying confirms your account is active — that's what scammers want!" },
        ],
      },
      {
        question: "Which website URL looks suspicious?",
        choices: [
          { text: "https://google.com", correct: false, feedback: "Google's real URL with https and a lock — totally safe! ✅" },
          { text: "https://amazon.com", correct: false, feedback: "Amazon's official URL — nothing suspicious here! ✅" },
          { text: "http://amaz0n-deals.com", correct: true, feedback: "🚨 Spot it! The '0' instead of 'o' AND no https = fake phishing site!" },
          { text: "https://myschool.edu", correct: false, feedback: "School domains (.edu) with https are secure — that's your school's real site! ✅" },
        ],
      },
      {
        question: "You find a USB drive in the school hallway. What should you do?",
        choices: [
          { text: "Plug it into your computer to see what's on it", correct: false, feedback: "🚨 Never! Hackers leave infected USB drives in public on purpose to spread viruses." },
          { text: "Give it to a teacher without plugging it in", correct: true, feedback: "Perfect! Hand it to an adult — never plug in a USB you found on the ground. 🏫" },
          { text: "Keep it — finders keepers!", correct: false, feedback: "It might be a trap! Hackers bait people with free-looking USB drives." },
          { text: "Plug it in to find the owner's name and return it", correct: false, feedback: "The virus runs the moment you plug it in — don't do it! Give it to a teacher instead." },
        ],
      },
      {
        question: "You notice your account shows a login from another country at 3 AM. What does this mean?",
        choices: [
          { text: "Your friend is using your account while traveling", correct: false, feedback: "Maybe — but you should still investigate! Never ignore unknown logins." },
          { text: "It's probably just a glitch", correct: false, feedback: "Don't assume glitch! Unknown logins are a serious red flag that needs action right away." },
          { text: "Someone may have hacked into your account", correct: true, feedback: "🚨 Yes! Unknown country + 3 AM = major red flag. Change your password immediately!" },
          { text: "The internet is just slow", correct: false, feedback: "Slow internet doesn't create logins from other countries! This is a real warning sign." },
        ],
      },
      {
        question: "A pop-up on a FREE kids' game says \"Enter your credit card to verify your age.\" What should you do?",
        choices: [
          { text: "Enter the card — it's probably safe", correct: false, feedback: "🚨 Free kids' games never need credit cards! This is a scam to steal payment info." },
          { text: "Close the pop-up and tell an adult immediately", correct: true, feedback: "Exactly right! Legit free games don't ask for payment info. Tell a trusted adult. 🦸" },
          { text: "Ask a friend if they've seen this before", correct: false, feedback: "Better to tell an adult right away — they can help you report it properly." },
          { text: "Enter fake card numbers to trick them", correct: false, feedback: "Don't engage at all — close it and report it to an adult immediately!" },
        ],
      },
      {
        question: "What should you ALWAYS do on shared computers like at school or the library?",
        choices: [
          { text: "Change the computer's wallpaper", correct: false, feedback: "Ha! That's not a security move. Always log out before you leave!" },
          { text: "Log out of all accounts before you leave", correct: true, feedback: "Yes! If you stay logged in, the next person can access your accounts. Always log out! 🚪" },
          { text: "Delete your browsing history only", correct: false, feedback: "History deletion isn't enough — you need to fully log out of your accounts!" },
          { text: "Nothing — shared computers are always safe", correct: false, feedback: "Nope! Shared computers are risky. Always log out when you're done. 🔐" },
        ],
      },
    ],
  },

  /* ─────────────────────────────────────────
     HERO — Lesson 3: Defending Your Devices
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hero-3",
    missionId: "device-defender",
    character: "Byte",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    slides: [
      {
        type: "intro",
        headline: "Defending Your Devices",
        subtext: "Your phone, tablet, and computer need protection — just like a superhero needs armor!",
      },
      {
        type: "learn",
        icon: "📱",
        title: "Your devices store your life",
        body: "Photos, messages, school work, passwords — your devices hold a LOT. If someone gets in, they could steal or see everything.",
      },
      {
        type: "learn",
        icon: "🔒",
        title: "Lock your screen",
        body: "Always use a PIN, pattern, or fingerprint lock on your phone. Without it, anyone who picks up your device can access everything!",
      },
      {
        type: "learn",
        icon: "🛡️",
        title: "Keep software updated",
        body: "Updates patch security holes that hackers use to break in. When you see 'Update Available' — don't wait, update it!",
      },
      {
        type: "check",
        question: "What should you do if you see a pop-up saying 'Your device has a virus! Click here to fix it!'?",
        choices: [
          { text: "Click it immediately to fix the virus", correct: false, feedback: "STOP! This is almost always a scam to install real malware! 🛑" },
          { text: "Ignore it and tell a trusted adult", correct: true, feedback: "Perfect! These are fake scare pop-ups — always tell an adult! 🦸" },
          { text: "Close the browser and open the pop-up link again", correct: false, feedback: "Never re-open suspicious links! The pop-up is the scam. ❌" },
          { text: "Share the link with your friends", correct: false, feedback: "That would spread the scam to your friends! 😱" },
        ],
      },
      {
        type: "tip",
        tipText: "Never plug in a USB drive you found on the ground — hackers leave infected drives in public places on purpose hoping someone will pick them up! 💻",
      },
      {
        type: "game",
        gameType: "popup-or-scam",
      },
      {
        type: "summary",
        takeaways: [
          "Always lock your screen with a PIN or fingerprint 🔒",
          "Install updates as soon as they're available 🔄",
          "Scary pop-ups are almost always fake scams 🛑",
          "Never use unknown USB drives 💾",
          "Ask a trusted adult if something seems wrong 👋",
        ],
        quizLabel: "Start Device Defender Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     WHISKERS — Lesson 1: What Is Phishing?
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-whiskers-1",
    missionId: "scam-detection",
    character: "Detective Whiskers",
    characterEmoji: "🐱",
    characterColor: "bg-amber-500",
    slides: [
      {
        type: "intro",
        headline: "What Is Phishing?",
        subtext: "Scammers cast their hooks to steal your info. Detective Whiskers will teach you to spot the bait!",
      },
      {
        type: "learn",
        icon: "🎣",
        title: "Phishing explained",
        body: 'Phishing is when a scammer pretends to be someone you trust — like your bank, a game company, or even a friend — to trick you into giving them your password or personal info.',
      },
      {
        type: "learn",
        icon: "📧",
        title: "How phishing works",
        body: "You get an email or message that looks REAL. It says something scary like 'Your account will be deleted!' or exciting like 'You won a prize!' — then asks you to click a link and enter your info.",
      },
      {
        type: "check",
        question: "An email says: 'YOUR ROBLOX ACCOUNT WILL BE BANNED! Click here to verify your password NOW!' What do you do?",
        choices: [
          { text: "Click the link and enter my password to save my account", correct: false, feedback: "This is a phishing trap! Real companies never ask for your password by email. 🎣" },
          { text: "Delete the email and tell a trusted adult", correct: true, feedback: "Smart! Urgent scary messages are a phishing red flag! 🏆" },
          { text: "Forward it to your friends to warn them", correct: false, feedback: "Don't spread it — just delete and report it! ❌" },
          { text: "Reply asking if it's real", correct: false, feedback: "Replying tells them your email is active — don't respond! 🚫" },
        ],
      },
      {
        type: "tip",
        tipText: "Real companies NEVER ask for your password over email or text. If you're worried, go directly to the website by typing it yourself — never click the link in the message! 🔐",
      },
      {
        type: "game",
        gameType: "phishing-swipe",
      },
      {
        type: "summary",
        takeaways: [
          "Phishing pretends to be someone you trust 🎭",
          "Urgent scary or exciting messages = red flag 🚩",
          "Real companies never ask for passwords by email 📧",
          "Type website addresses yourself — never click suspicious links 🔗",
          "When in doubt, tell a trusted adult 👋",
        ],
        quizLabel: "Start Scam Detection Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     WHISKERS — Lesson 2: Fake Websites & Links
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-whiskers-2",
    missionId: "safe-websites",
    character: "Detective Whiskers",
    characterEmoji: "🐱",
    characterColor: "bg-amber-500",
    slides: [
      {
        type: "intro",
        headline: "Fake Websites & Links",
        subtext: "Not every website is what it looks like. Learn to spot fakes before you click!",
      },
      {
        type: "learn",
        icon: "🔒",
        title: "Check for the padlock",
        body: "Real safe websites show a padlock 🔒 in the browser bar and start with https:// (the 's' means secure). If you see a warning or no padlock — be careful!",
      },
      {
        type: "learn",
        icon: "🕵️",
        title: "Spot the fake URL",
        body: 'Hackers make websites that look EXACTLY like the real ones but with tiny changes in the address:\n\n• paypa1.com (number 1 not letter l)\n• amazon-security.com\n• google.com.fakesite.net',
      },
      {
        type: "check",
        question: "Which website address looks real and safe?",
        choices: [
          { text: "www.paypa1.com", correct: false, feedback: "That's a '1' (one) not an 'l' (L) — classic fake trick! 👀" },
          { text: "www.paypal.com", correct: true, feedback: "Correct! The real PayPal. Always check the spelling carefully! ✅" },
          { text: "www.paypal.com.verify-now.net", correct: false, feedback: "The real domain is what comes before .com — this ends in .net! 🚫" },
          { text: "paypal-login-secure.com", correct: false, feedback: "Scammers add words like 'secure' and 'login' to look trustworthy! ❌" },
        ],
      },
      {
        type: "tip",
        tipText: "Hover over a link BEFORE clicking it — the real destination shows up at the bottom of your browser. If it looks weird or different from what you expected, don't click! 🖱️",
      },
      {
        type: "game",
        gameType: "url-detective",
      },
      {
        type: "summary",
        takeaways: [
          "Look for 🔒 and https:// before entering any info",
          "Check the spelling of website addresses carefully 🔍",
          "Hover over links to see where they really go 🖱️",
          "Extra words in URLs (like -secure, -login) are warning signs ⚠️",
        ],
        quizLabel: "Start Safe Websites Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     WHISKERS — Lesson 3: Suspicious Messages
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-whiskers-3",
    missionId: "phishy-messages",
    character: "Detective Whiskers",
    characterEmoji: "🐱",
    characterColor: "bg-amber-500",
    slides: [
      {
        type: "intro",
        headline: "Suspicious Messages",
        subtext: "Scammers don't just use email — they text, DM, and even call. Let's learn to spot them all!",
      },
      {
        type: "learn",
        icon: "📱",
        title: "Scam texts are everywhere",
        body: 'Scam texts (called smishing) say things like:\n• "You won a $1,000 gift card! Click here"\n• "Package could not be delivered. Confirm address"\n• "Your account has been locked"',
      },
      {
        type: "learn",
        icon: "⚠️",
        title: "Warning signs in ANY message",
        body: "🚩 Creates urgency ('act NOW or lose access!')\n🚩 Asks for personal info or passwords\n🚩 Offers something too good to be true\n🚩 Has spelling mistakes or weird grammar\n🚩 Comes from a stranger",
      },
      {
        type: "check",
        question: "You get a text: 'Hi! This is your school. You won an iPad! Reply with your address and parent's credit card to claim.' What do you do?",
        choices: [
          { text: "Reply immediately — free iPad!", correct: false, feedback: "SCAM ALERT! Schools never ask for credit card info by text! 🛑" },
          { text: "Show it to a trusted adult and don't reply", correct: true, feedback: "Smart detective work! This has EVERY scam warning sign! 🏆" },
          { text: "Call the number in the text to check if it's real", correct: false, feedback: "The scammer might answer! Always verify through official channels. ❌" },
          { text: "Click the link to see the iPad options", correct: false, feedback: "That link likely installs malware or steals info! 🦠" },
        ],
      },
      {
        type: "tip",
        tipText: "If you're not sure whether a message is real, DON'T reply or click anything. Instead, contact the company directly using their official website or phone number that you find yourself. 📞",
      },
      {
        type: "game",
        gameType: "suspicious-text",
      },
      {
        type: "summary",
        takeaways: [
          "Scam messages create fake urgency and fear ⚠️",
          "Real organizations never ask for passwords or credit cards by text 💳",
          "If it seems too good to be true, it is 🎁",
          "Don't reply or click — go find the official contact yourself 🔍",
          "Always show suspicious messages to a trusted adult 👨‍👩‍👧",
        ],
        quizLabel: "Start Phishy Messages Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     HOOT — Lesson 1: Your Personal Info
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hoot-1",
    missionId: "personal-info",
    character: "Professor Hoot",
    characterEmoji: "🦉",
    characterColor: "bg-teal-500",
    slides: [
      {
        type: "intro",
        headline: "Your Personal Info",
        subtext: "Not everyone online deserves to know who you are. Let's learn what to protect!",
      },
      {
        type: "learn",
        icon: "🪪",
        title: "What counts as personal info?",
        body: "Personal info (PII) is anything that identifies YOU:\n• Full name\n• Address & phone number\n• School name\n• Passwords & PINs\n• Birthday\n• Photos that show your location",
      },
      {
        type: "learn",
        icon: "🛡️",
        title: "Why protect it?",
        body: "With your personal info, strangers can find where you live, pretend to be you, steal from your family, or try to meet you in person. Your info is precious — guard it!",
      },
      {
        type: "check",
        question: "Which of these is safe to share in an online game chat?",
        choices: [
          { text: "Your favourite game character", correct: true, feedback: "Totally safe! This tells strangers nothing about the real you! 🎮" },
          { text: "What school you go to", correct: false, feedback: "Your school can help strangers find you in real life! 🏫" },
          { text: "Your home address", correct: false, feedback: "NEVER share your address online — with anyone! 🏠" },
          { text: "Your full name and birthday", correct: false, feedback: "Scammers use this info to impersonate you or guess passwords! 🎂" },
        ],
      },
      {
        type: "tip",
        tipText: "Use a fun username instead of your real name online. Something like 'StarBlaster42' or 'NinjaOwl' tells people nothing about the real you! 🎭",
      },
      {
        type: "game",
        gameType: "info-shield-sort",
      },
      {
        type: "summary",
        takeaways: [
          "PII = anything that identifies you in real life 🪪",
          "Never share your address, school, or phone number online 🏠",
          "Use a fun username — not your real name 🎭",
          "Photos can reveal your location — be careful what you post 📸",
          "When in doubt, don't share it! 🛡️",
        ],
        quizLabel: "Start Personal Info Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     HOOT — Lesson 2: Smart Sharing Online
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hoot-2",
    missionId: "smart-sharing",
    character: "Professor Hoot",
    characterEmoji: "🦉",
    characterColor: "bg-teal-500",
    slides: [
      {
        type: "intro",
        headline: "Smart Sharing Online",
        subtext: "Sharing online can be great — but smart heroes know what's safe and what's not!",
      },
      {
        type: "learn",
        icon: "🌐",
        title: "Once online, always online",
        body: "Anything you post online can be saved, shared, and seen by people you never intended — even after you delete it. Think before you post!",
      },
      {
        type: "learn",
        icon: "✅",
        title: "Safe to share",
        body: "• Your favourite movies, games, or music\n• Drawings or creative work (without location clues)\n• Opinions on topics (kindly!)\n• Scores and achievements in games",
      },
      {
        type: "check",
        question: "Your friend asks to post a photo of you both at school on social media. What's the best thing to do?",
        choices: [
          { text: "Say yes — it's just a photo!", correct: false, feedback: "Photos at school reveal your school name and location! 📸" },
          { text: "Ask a parent first and make sure the account is private", correct: true, feedback: "Smart! Always check with parents and use private accounts! 🏆" },
          { text: "Post it yourself first on your public account", correct: false, feedback: "A public account means anyone in the world can see it! 🌍" },
          { text: "Refuse all photos forever", correct: false, feedback: "Photos can be fine — just be thoughtful about where they're shared! 😊" },
        ],
      },
      {
        type: "tip",
        tipText: "Before posting anything, ask yourself: Would I be OK if my teacher, parents, AND a stranger all saw this? If you hesitate, don't post it! 🤔",
      },
      {
        type: "game",
        gameType: "post-or-pass",
      },
      {
        type: "summary",
        takeaways: [
          "Deleted doesn't always mean gone — think before you post 🤔",
          "Check your privacy settings — keep accounts private 🔒",
          "Photos at school or home can reveal your location 📍",
          "Ask a parent before posting photos of yourself 👨‍👩‍👧",
          "Be kind online — everything leaves a digital trail 💬",
        ],
        quizLabel: "Start Smart Sharing Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     HOOT — Lesson 3: Searching Safely
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-hoot-3",
    missionId: "internet-detective",
    character: "Professor Hoot",
    characterEmoji: "🦉",
    characterColor: "bg-teal-500",
    slides: [
      {
        type: "intro",
        headline: "Searching Safely",
        subtext: "Not everything online is true — a cyber detective knows how to find real facts!",
      },
      {
        type: "learn",
        icon: "🤔",
        title: "Anyone can post anything",
        body: "The internet has no editor. Anyone — including kids, bots, and scammers — can post made-up facts, fake news, and wrong information.",
      },
      {
        type: "learn",
        icon: "✔️",
        title: "How to check if something is true",
        body: "1. Find 2-3 trusted sources (BBC, National Geographic, NASA)\n2. Check when it was written — old info can be wrong\n3. Look for who wrote it — are they an expert?\n4. Does it seem designed to make you angry or scared? Might be fake.",
      },
      {
        type: "check",
        question: "You read online: 'Eating carrots gives you superpowers!' What do you do?",
        choices: [
          { text: "Share it with everyone — sounds amazing!", correct: false, feedback: "Always verify before sharing — you might be spreading misinformation! 🥕" },
          { text: "Check a trusted website like a health or science site first", correct: true, feedback: "Great detective work! Always verify with trusted sources! 🔍" },
          { text: "Believe it — if it's online, it must be true", correct: false, feedback: "Anyone can post anything online — doesn't make it true! ❌" },
          { text: "Ask the website for proof by commenting", correct: false, feedback: "Comments on dodgy sites don't help — check a proper trusted source! 📰" },
        ],
      },
      {
        type: "tip",
        tipText: "Great trusted websites for kids: National Geographic Kids, BBC Newsround, NASA Kids Club, and your school library's online resources. Bookmark them! 📚",
      },
      {
        type: "game",
        gameType: "fact-check",
      },
      {
        type: "summary",
        takeaways: [
          "Anyone can post false info online — even about you! 📝",
          "Always check 2-3 trusted sources before believing something ✔️",
          "Look at who wrote it and when 📅",
          "Information designed to make you angry is often fake 😡",
          "Trusted kids' news sites are your best friends 📰",
        ],
        quizLabel: "Start Internet Detective Mission!",
      },
    ],
  },

  /* ─────────────────────────────────────────
     ROBO — Lesson 1: Malware & Viruses
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-robo-1",
    missionId: "malware-monsters",
    character: "Robo Buddy",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    slides: [
      {
        type: "intro",
        headline: "Malware & Viruses",
        subtext: "There are monsters hiding in downloads and dodgy links. Robo Buddy will help you spot them!",
      },
      {
        type: "learn",
        icon: "🦠",
        title: "What is malware?",
        body: "Malware (malicious software) is a program designed to harm your device or steal your info. It can hide inside downloads, email attachments, or dodgy websites.",
      },
      {
        type: "learn",
        icon: "👾",
        title: "Types of malware monsters",
        body: "🦠 Virus — spreads and breaks things\n🐴 Trojan — pretends to be a normal app\n🔒 Ransomware — locks your files and demands money\n🕵️ Spyware — secretly watches what you do",
      },
      {
        type: "learn",
        icon: "🛡️",
        title: "How to stay safe",
        body: "• Only download apps from official stores (App Store, Google Play)\n• Don't open attachments from strangers\n• Keep your antivirus software on and updated\n• Never click 'free download' pop-ups on random websites",
      },
      {
        type: "check",
        question: "A website offers a 'FREE full version' of a paid game. What should you do?",
        choices: [
          { text: "Download it — free stuff is great!", correct: false, feedback: "Free pirated games are the #1 way kids get malware! 🦠" },
          { text: "Click the download but scan it with antivirus first", correct: false, feedback: "Some malware bypasses antivirus — don't risk it! Just say no. ❌" },
          { text: "Close the page and don't download it", correct: true, feedback: "Smart! Illegal 'free' games almost always come bundled with malware! 🏆" },
          { text: "Share the link with friends so they get it too", correct: false, feedback: "You'd be spreading malware to your friends! 😱" },
        ],
      },
      {
        type: "tip",
        tipText: "If your device suddenly gets slow, shows weird ads, or apps appear that you didn't install — tell a trusted adult right away! These are signs of malware. 🤖",
      },
      {
        type: "game",
        gameType: "malware-monster-match",
      },
      {
        type: "summary",
        takeaways: [
          "Malware hides in free downloads, attachments, and pop-ups 🦠",
          "Only download apps from official stores 📱",
          "Never open attachments from people you don't know 📧",
          "Keep antivirus software updated and running 🛡️",
          "Weird device behaviour = tell an adult immediately 👋",
        ],
        quizLabel: "Fight the Malware Monsters!",
      },
    ],
  },
];

/** Get lesson content by lesson ID */
export function getLessonContent(lessonId: string): LessonContent | undefined {
  return LESSON_CONTENT.find((l) => l.lessonId === lessonId);
}

/** Get lesson content by mission ID */
export function getLessonContentByMission(missionId: string): LessonContent | undefined {
  return LESSON_CONTENT.find((l) => l.missionId === missionId);
}
