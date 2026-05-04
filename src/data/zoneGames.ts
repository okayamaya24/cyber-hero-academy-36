import type { AgeTier } from "./missions";
import type { CrosswordClue } from "./trainingGames";

/* ─── Types ─────────────────────────────────────────── */

export interface ZoneQuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface ZoneWordSearch {
  junior: { size: number; words: string[] };
  defender: { size: number; words: string[] };
  guardian: { size: number; words: string[] };
}

export interface ZoneDragDropItem {
  text: string;
  bucket: string;
}

export interface ZoneDragDrop {
  items: ZoneDragDropItem[];
  buckets: string[];
}

export interface ZoneCrossword {
  clues: CrosswordClue[];
  wordBank: string[];
}

export interface ZoneMiniGameDef {
  type: string;
  title: string;
  description: string;
}

export interface ZoneGameContent {
  quiz: { title: string; questions: ZoneQuizQuestion[] };
  miniGame: ZoneMiniGameDef;
  wordSearch?: ZoneWordSearch;
  crossword?: ZoneCrossword;
  dragDrop: ZoneDragDrop;
}

export interface BossBattleContent {
  isFinalBoss?: boolean;
  quizQuestions: ZoneQuizQuestion[];
  defenseRound: {
    type: "shield-dodge" | "scam-real" | "kindness";
    title: string;
    items: any[];
  };
  finalRound?: {
    title: string;
    patterns: { sequence: string[]; answer: string; options: string[] }[];
  };
}

/* ─── NORTH AMERICA ─────────────────────────────────── */

const hqGames: ZoneGameContent = {
  quiz: {
    title: "Welcome to Cyber Hero Academy",
    questions: [
      {
        q: "What is the internet?",
        choices: [
          "A place to play games only",
          "A giant network connecting computers worldwide",
          "A type of computer",
          "A television channel",
        ],
        answer: 1,
        explanation: "The internet connects billions of computers and devices worldwide!",
      },
      {
        q: "Which of these is safe to share online with strangers?",
        choices: ["Your home address", "Your full name", "Your favourite colour", "Your school name"],
        answer: 2,
        explanation: "Your favourite colour is harmless to share — the others could be used to find you!",
      },
      {
        q: "What should you do if something online makes you feel scared or uncomfortable?",
        choices: ["Keep it secret", "Tell a trusted adult immediately", "Share it with friends", "Ignore it"],
        answer: 1,
        explanation: "Always tell a trusted adult — they can help keep you safe!",
      },
      {
        q: "What is a Cyber Hero?",
        choices: [
          "Someone who hacks computers",
          "Someone who stays safe online and helps others do the same",
          "A character in a video game",
          "Someone who never uses the internet",
        ],
        answer: 1,
        explanation: "A Cyber Hero protects themselves and others in the digital world!",
      },
      {
        q: "Which of these is a trusted adult you could go to if something goes wrong online?",
        choices: [
          "A stranger you met in a game",
          "An online friend",
          "A parent, teacher, or guardian",
          "Anyone who seems nice",
        ],
        answer: 2,
        explanation: "Parents, teachers, and guardians are your go-to trusted adults!",
      },
    ],
  },
  miniGame: {
    type: "profile-builder",
    title: "Cyber Hero Profile Builder",
    description: "Create your operative identity!",
  },
  dragDrop: {
    items: [
      { text: "Tell a trusted adult if something scares you online", bucket: "✅ SAFE" },
      { text: "Share your home address with a new online friend", bucket: "🚨 UNSAFE" },
      { text: "Use a strong password for your accounts", bucket: "✅ SAFE" },
      { text: "Click on a popup saying you won a prize", bucket: "🚨 UNSAFE" },
      { text: "Ask a parent before downloading an app", bucket: "✅ SAFE" },
      { text: "Talk to strangers in online games", bucket: "🚨 UNSAFE" },
      { text: "Log out of accounts on shared computers", bucket: "✅ SAFE" },
      { text: "Share your school name with strangers", bucket: "🚨 UNSAFE" },
    ],
    buckets: ["✅ SAFE", "🚨 UNSAFE"],
  },
  wordSearch: {
    junior: { size: 8, words: ["SAFE", "HERO", "HELP", "TELL", "KIND"] },
    defender: { size: 12, words: ["GUARDIAN", "INTERNET", "PROTECT", "TRUSTED", "ONLINE", "SAFETY"] },
    guardian: { size: 15, words: ["CYBERHERO", "GUARDIAN", "INTERNET", "PROTECTION", "TRUSTWORTHY", "DIGITALSAFETY"] },
  },
};

const passwordPeakGames: ZoneGameContent = {
  quiz: {
    title: "Crack the Keybreaker's Passwords",
    questions: [
      {
        q: "Which password is the strongest?",
        choices: ["password123", "fluffy", "T#9kL!2mP$", "mybirthday"],
        answer: 2,
        explanation: "T#9kL!2mP$ uses uppercase, lowercase, numbers AND symbols — super strong!",
      },
      {
        q: "How long should a strong password be?",
        choices: ["4 characters", "6 characters", "At least 8 characters", "2 characters"],
        answer: 2,
        explanation: "Longer passwords are harder to crack — aim for 8 or more characters!",
      },
      {
        q: "Which of these should you NEVER use in a password?",
        choices: ["Symbols like ! or #", "Your birthday or pet's name", "Random numbers", "Uppercase letters"],
        answer: 1,
        explanation: "Hackers try birthdays and pet names first — never use personal info!",
      },
      {
        q: "What should you do if you think someone knows your password?",
        choices: [
          "Keep using it",
          "Change it immediately and tell a trusted adult",
          "Share it with a friend",
          "Write it on paper",
        ],
        answer: 1,
        explanation: "Change it right away and let a trusted adult know!",
      },
      {
        q: "Is it okay to share your password with your best friend?",
        choices: [
          "Yes, best friends can be trusted",
          "Only if they promise not to tell",
          "No — keep passwords private, even from friends",
          "Only your game passwords",
        ],
        answer: 2,
        explanation: "Even best friends shouldn't know your password — keep it private!",
      },
    ],
  },
  miniGame: {
    type: "password-builder",
    title: "Password Builder",
    description: "Build the strongest password you can!",
  },
  wordSearch: {
    junior: { size: 8, words: ["LOCK", "SAFE", "CODE", "KEY", "HIDE"] },
    defender: { size: 12, words: ["PASSWORD", "STRONG", "UPPERCASE", "NUMBER", "SYMBOL", "SECURE", "LOCK", "PROTECT"] },
    guardian: {
      size: 15,
      words: ["ENCRYPTION", "ALPHANUMERIC", "AUTHENTICATION", "UPPERCASE", "CYBERSECURE", "FIREWALL", "PROTOCOL"],
    },
  },
  dragDrop: {
    items: [
      { text: "password123", bucket: "😬 WEAK" },
      { text: "T#9kL!2mP$", bucket: "💪 STRONG" },
      { text: "fluffy", bucket: "😬 WEAK" },
      { text: "X$7mK!9pQ#", bucket: "💪 STRONG" },
      { text: "mybirthday", bucket: "😬 WEAK" },
      { text: "Qr#5!vL@8z", bucket: "💪 STRONG" },
      { text: "123456", bucket: "😬 WEAK" },
      { text: "B@9nM!3xW#", bucket: "💪 STRONG" },
    ],
    buckets: ["💪 STRONG", "😬 WEAK"],
  },
};

const encryptEnclaveGames: ZoneGameContent = {
  quiz: {
    title: "Decode the Keybreaker's Message",
    questions: [
      {
        q: "What does encryption do?",
        choices: [
          "Deletes your files",
          "Scrambles data so only the right person can read it",
          "Makes your computer faster",
          "Blocks websites",
        ],
        answer: 1,
        explanation: "Encryption scrambles your data into a secret code only you can unlock!",
      },
      {
        q: "What is a padlock icon in your browser's address bar?",
        choices: [
          "The page is broken",
          "The website is encrypted and safe",
          "You need to pay to visit",
          "The page is loading",
        ],
        answer: 1,
        explanation: "A padlock means the website uses encryption to protect your data!",
      },
      {
        q: "What does HTTPS stand for?",
        choices: [
          "Hyper Text Transfer Protocol Secure",
          "High Tech Transfer Program System",
          "Home Technology Protection Service",
          "Hyper Text Tracking Protection System",
        ],
        answer: 0,
        explanation: "HTTPS means the website uses secure encrypted communication!",
      },
      {
        q: "Why is encryption important?",
        choices: [
          "It makes websites look nicer",
          "It keeps your private information safe from hackers",
          "It makes the internet faster",
          "It lets you play games online",
        ],
        answer: 1,
        explanation: "Encryption protects your passwords, messages, and personal info from hackers!",
      },
      {
        q: "Which website is safer to use?",
        choices: ["http://mybank.com", "https://mybank.com", "They are both the same", "Neither is safe"],
        answer: 1,
        explanation: "HTTPS means encrypted — always look for the S before entering personal info!",
      },
    ],
  },
  miniGame: {
    type: "secret-code-maker",
    title: "Secret Code Maker",
    description: "Encrypt a secret message using a Caesar cipher!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Scrambled data that hackers can't read",
        answer: "ENCRYPTED",
        juniorClue: "Secret code",
        guardianClue: "Data rendered unintelligible via cryptographic transformation",
      },
      {
        number: 4,
        direction: "across",
        clue: "The padlock in your browser means this",
        answer: "SECURE",
        juniorClue: "Keeps you safe",
        guardianClue: "Protected state indicated by browser TLS certificate validation",
      },
      {
        number: 6,
        direction: "across",
        clue: "Encrypted website protocol prefix",
        answer: "HTTPS",
        juniorClue: "Safe letters",
        guardianClue: "TLS-encrypted HTTP protocol identifier",
      },
      {
        number: 2,
        direction: "down",
        clue: "A secret code only you can unlock",
        answer: "KEY",
        juniorClue: "Opens locks",
        guardianClue: "Asymmetric cryptographic artifact used for decryption",
      },
      {
        number: 3,
        direction: "down",
        clue: "The S in HTTPS stands for this",
        answer: "SAFE",
        juniorClue: "Not dangerous",
        guardianClue: "Colloquial reference to Secure Sockets Layer protocol",
      },
      {
        number: 5,
        direction: "down",
        clue: "Look for this icon before entering passwords online",
        answer: "PADLOCK",
        juniorClue: "Lock picture",
        guardianClue: "Visual TLS/SSL indicator in browser chrome",
      },
    ],
    wordBank: ["ENCRYPTED", "SECURE", "HTTPS", "KEY", "SAFE", "PADLOCK"],
  },
  dragDrop: {
    items: [
      { text: "Someone intercepts your message", bucket: "🔐 USE ENCRYPTION" },
      { text: "Hacker tries to read your password", bucket: "🔐 USE ENCRYPTION" },
      { text: "Website has padlock icon", bucket: "✅ SAFE TO USE" },
      { text: "Website is HTTP only", bucket: "⚠️ BE CAREFUL" },
      { text: "Your data is scrambled in transit", bucket: "✅ SAFE TO USE" },
      { text: "No padlock on a banking site", bucket: "⚠️ BE CAREFUL" },
    ],
    buckets: ["🔐 USE ENCRYPTION", "✅ SAFE TO USE", "⚠️ BE CAREFUL"],
  },
};

const codeCanyonGames: ZoneGameContent = {
  quiz: {
    title: "Safe Coding & Online Scams",
    questions: [
      {
        q: "Someone in an online game offers you free in-game currency if you share your account password. What do you do?",
        choices: [
          "Share it — free currency sounds great!",
          "Never share your password — it's a scam",
          "Ask a friend what to do",
          "Share only your username",
        ],
        answer: 1,
        explanation: "No legitimate game will ever ask for your password — this is always a scam!",
      },
      {
        q: "What is a QR code scam?",
        choices: [
          "A fun game using QR codes",
          "A fake QR code that leads to a dangerous website when scanned",
          "A type of puzzle",
          "A safe way to share links",
        ],
        answer: 1,
        explanation:
          "Criminals create fake QR codes that redirect you to phishing sites — always verify before scanning!",
      },
      {
        q: "You receive a pop-up saying 'CONGRATULATIONS! You are our 1,000,000th visitor! Claim your prize!' What do you do?",
        choices: [
          "Click it immediately",
          "Close it — it's a scam",
          "Share it with friends so they can win too",
          "Enter your details to claim",
        ],
        answer: 1,
        explanation: "These pop-ups are ALWAYS scams designed to steal your information!",
      },
      {
        q: "What is social engineering?",
        choices: [
          "Building bridges",
          "Tricking people into giving away information or doing something unsafe",
          "A type of coding",
          "A social media feature",
        ],
        answer: 1,
        explanation: "Social engineering manipulates people psychologically rather than hacking technology directly!",
      },
      {
        q: "A message says 'Act NOW or your account will be DELETED in 24 hours!' What is this designed to make you feel?",
        choices: [
          "Calm and relaxed",
          "Panicked and rushed so you don't think carefully",
          "Excited and happy",
          "Curious and interested",
        ],
        answer: 1,
        explanation: "Urgency is a classic scam trick — slow down, think carefully, and tell a trusted adult!",
      },
    ],
  },
  miniGame: { type: "scam-spotter", title: "Scam Spotter", description: "Identify real offers from sneaky scams!" },
  dragDrop: {
    items: [
      { text: "Free V-Bucks if you share your password", bucket: "🚨 SCAM" },
      { text: "Official game update from the app store", bucket: "✅ LEGITIMATE" },
      { text: "YOU WON! Click here to claim your prize!", bucket: "🚨 SCAM" },
      { text: "Your school's official newsletter email", bucket: "✅ LEGITIMATE" },
      { text: "Act NOW — account deleted in 1 hour!", bucket: "🚨 SCAM" },
      { text: "Receipt from a store your parent ordered from", bucket: "✅ LEGITIMATE" },
      { text: "Scan this QR code for free robux", bucket: "🚨 SCAM" },
      { text: "Password reset you requested yourself", bucket: "✅ LEGITIMATE" },
    ],
    buckets: ["✅ LEGITIMATE", "🚨 SCAM"],
  },
  wordSearch: {
    junior: { size: 8, words: ["SCAM", "FAKE", "STOP", "TELL", "SAFE"] },
    defender: { size: 12, words: ["SCAMMER", "URGENCY", "PHISHING", "TRICKERY", "SOCIAL", "ENGINEER", "VERIFY"] },
    guardian: {
      size: 15,
      words: ["SOCIALENGINEERING", "PRETEXTING", "URGENCY", "MANIPULATION", "BAITING", "QRCODE", "VISHING"],
    },
  },
};

const signalSummitGames: ZoneGameContent = {
  quiz: {
    title: "WiFi Safety & Public Networks",
    questions: [
      {
        q: "You're at a café and see a free WiFi network called 'Free_Cafe_WiFi'. What should you do?",
        choices: [
          "Connect immediately — free WiFi is great!",
          "Ask a trusted adult or staff member if it's the official network",
          "Connect and check your bank account",
          "Share the network name with everyone",
        ],
        answer: 1,
        explanation: "Hackers create fake WiFi hotspots with convincing names — always verify before connecting!",
      },
      {
        q: "What is a 'man-in-the-middle' attack?",
        choices: [
          "A game where someone stands in the middle",
          "When a hacker secretly intercepts communication between you and a website",
          "A type of firewall",
          "A safety feature",
        ],
        answer: 1,
        explanation: "On public WiFi, hackers can position themselves between you and the internet to steal your data!",
      },
      {
        q: "What should you AVOID doing on public WiFi?",
        choices: [
          "Watching a video",
          "Logging into bank accounts or entering passwords",
          "Reading a news article",
          "Looking at a map",
        ],
        answer: 1,
        explanation: "Never enter sensitive information on public WiFi — hackers could be watching!",
      },
      {
        q: "What does VPN stand for?",
        choices: [
          "Very Private Network",
          "Virtual Private Network",
          "Verified Protection Network",
          "Virtual Password Network",
        ],
        answer: 1,
        explanation: "A VPN creates an encrypted tunnel for your data — like a private road on the public internet!",
      },
      {
        q: "Which is the SAFEST type of network to use for important tasks?",
        choices: [
          "Public café WiFi",
          "A hotel's guest WiFi",
          "Your home network secured with a password",
          "Airport free WiFi",
        ],
        answer: 2,
        explanation: "Your home network is the safest for important tasks — public networks are risky!",
      },
    ],
  },
  miniGame: { type: "wifi-detective", title: "WiFi Detective", description: "Find the safe network among the fakes!" },
  dragDrop: {
    items: [
      { text: "Home WiFi with WPA2 password", bucket: "✅ SAFE NETWORK" },
      { text: "Free_Airport_WiFi (unverified)", bucket: "⚠️ RISKY NETWORK" },
      { text: "Your school's secured network", bucket: "✅ SAFE NETWORK" },
      { text: "Open café hotspot with no password", bucket: "⚠️ RISKY NETWORK" },
      { text: "Mobile data (your phone's 4G/5G)", bucket: "✅ SAFE NETWORK" },
      { text: "Free_Hotel_Guest (no verification)", bucket: "⚠️ RISKY NETWORK" },
    ],
    buckets: ["✅ SAFE NETWORK", "⚠️ RISKY NETWORK"],
  },
  wordSearch: {
    junior: { size: 8, words: ["WIFI", "SAFE", "HOME", "LOCK", "TELL"] },
    defender: { size: 12, words: ["NETWORK", "WIRELESS", "SECURITY", "PASSWORD", "HOTSPOT", "ENCRYPT", "PRIVATE"] },
    guardian: { size: 15, words: ["MITM", "ENCRYPTION", "VPNTUNNEL", "WIRELESS", "HOTSPOT", "PROTOCOL", "INTERCEPT"] },
  },
};

const arcticArchiveGames: ZoneGameContent = {
  quiz: {
    title: "Backing Up & Protecting Your Data",
    questions: [
      {
        q: "What is a data backup?",
        choices: [
          "Deleting old files",
          "A copy of your important files stored safely in case the originals are lost",
          "A type of password manager",
          "An antivirus scan",
        ],
        answer: 1,
        explanation:
          "Backups are copies of your data — if your device is lost, stolen, or infected you still have your files!",
      },
      {
        q: "What is the '3-2-1 backup rule'?",
        choices: [
          "Back up 3 times a day",
          "Keep 3 copies, on 2 different media types, with 1 offsite",
          "Use 3 different passwords",
          "Back up every 2 weeks",
        ],
        answer: 1,
        explanation:
          "3 copies, 2 different media types, 1 offsite (like cloud) is the gold standard of backup strategy!",
      },
      {
        q: "What is cloud storage?",
        choices: [
          "Storing files in the sky",
          "Storing files on remote servers you can access from anywhere via the internet",
          "A type of USB drive",
          "A local hard drive",
        ],
        answer: 1,
        explanation: "Cloud storage keeps your files on secure remote servers — accessible from any device!",
      },
      {
        q: "Ransomware has encrypted all your files and demands money. What helps you recover WITHOUT paying?",
        choices: [
          "Paying the ransom immediately",
          "Having a recent backup of your files",
          "Buying a new device",
          "Creating a new account",
        ],
        answer: 1,
        explanation: "A backup means ransomware loses its power — you can restore your files without paying a penny!",
      },
      {
        q: "How often should important files be backed up?",
        choices: [
          "Once a year",
          "Only when you remember",
          "Regularly — weekly or with automatic backups",
          "Only after a virus attack",
        ],
        answer: 2,
        explanation: "Regular automatic backups ensure you never lose important work — set it and forget it!",
      },
    ],
  },
  miniGame: {
    type: "backup-builder",
    title: "Backup Builder",
    description: "Save files to the right backup locations before the timer runs out!",
  },
  dragDrop: {
    items: [
      { text: "School project saved on USB only", bucket: "⚠️ NEEDS BACKUP" },
      { text: "Photos backed up to cloud automatically", bucket: "✅ WELL BACKED UP" },
      { text: "One copy of homework on your laptop", bucket: "⚠️ NEEDS BACKUP" },
      { text: "Files on laptop AND external drive AND cloud", bucket: "✅ WELL BACKED UP" },
      { text: "Videos saved only on your phone", bucket: "⚠️ NEEDS BACKUP" },
      { text: "Documents synced to cloud storage daily", bucket: "✅ WELL BACKED UP" },
    ],
    buckets: ["✅ WELL BACKED UP", "⚠️ NEEDS BACKUP"],
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "A copy of your files kept safe",
        answer: "BACKUP",
        juniorClue: "Saved copy",
        guardianClue: "Redundant data copy for disaster recovery",
      },
      {
        number: 4,
        direction: "across",
        clue: "Storing files remotely on the internet",
        answer: "CLOUD",
        juniorClue: "Online storage",
        guardianClue: "Remote server-based distributed storage infrastructure",
      },
      {
        number: 6,
        direction: "across",
        clue: "Malware that locks files for ransom",
        answer: "RANSOMWARE",
        juniorClue: "Lock virus",
        guardianClue: "Cryptoviral extortion malware variant",
      },
      {
        number: 2,
        direction: "down",
        clue: "Keep this number of backup copies (3-2-1 rule)",
        answer: "THREE",
        juniorClue: "Magic number",
        guardianClue: "Minimum redundancy threshold in backup strategy",
      },
      {
        number: 3,
        direction: "down",
        clue: "Portable storage device for backups",
        answer: "USB",
        juniorClue: "Stick drive",
        guardianClue: "Universal Serial Bus removable storage medium",
      },
      {
        number: 5,
        direction: "down",
        clue: "Set backups to run by themselves",
        answer: "AUTOMATIC",
        juniorClue: "By itself",
        guardianClue: "Scheduled unattended backup process",
      },
    ],
    wordBank: ["BACKUP", "CLOUD", "RANSOMWARE", "THREE", "USB", "AUTOMATIC"],
  },
};

const pixelPortGames: ZoneGameContent = {
  quiz: {
    title: "Screen Time & Digital Wellbeing",
    questions: [
      {
        q: "What is 'screen time'?",
        choices: [
          "The brightness of your screen",
          "The amount of time you spend using digital devices",
          "A TV show about technology",
          "A type of screensaver",
        ],
        answer: 1,
        explanation:
          "Screen time is how long you spend on devices — balancing it with offline activities keeps you healthy!",
      },
      {
        q: "Which of these is a sign you might be spending too much time online?",
        choices: [
          "You enjoy being online",
          "You feel anxious or upset when you can't use your device",
          "You learn new things online",
          "You talk to friends online",
        ],
        answer: 1,
        explanation:
          "Feeling anxious without your device can be a sign of unhealthy screen habits — talk to a trusted adult!",
      },
      {
        q: "What is a 'digital detox'?",
        choices: [
          "Cleaning your device screen",
          "Taking a planned break from screens and devices",
          "Deleting old apps",
          "Updating your software",
        ],
        answer: 1,
        explanation:
          "A digital detox is a break from devices — it helps you recharge and reconnect with the world around you!",
      },
      {
        q: "Why is it important to balance online and offline activities?",
        choices: [
          "It isn't — online is always better",
          "Because physical activity, face-to-face socialising, and rest are important for your health",
          "Because offline activities are boring",
          "Because the internet is always broken",
        ],
        answer: 1,
        explanation: "A healthy balance of online and offline activities supports your physical and mental wellbeing!",
      },
      {
        q: "What should you do before bed to help you sleep better?",
        choices: [
          "Play games on your phone until you fall asleep",
          "Stop using screens at least an hour before bed",
          "Watch videos with the brightness turned up",
          "Keep your phone under your pillow",
        ],
        answer: 1,
        explanation: "Screen light disrupts sleep — switching off an hour before bed helps you get much better rest!",
      },
    ],
  },
  miniGame: {
    type: "balance-builder",
    title: "Balance Builder",
    description: "Schedule a healthy mix of online and offline activities!",
  },
  dragDrop: {
    items: [
      { text: "Playing outside with friends", bucket: "🌟 HEALTHY HABIT" },
      { text: "Gaming for 8 hours straight", bucket: "⚠️ UNHEALTHY HABIT" },
      { text: "Reading a book before bed", bucket: "🌟 HEALTHY HABIT" },
      { text: "Scrolling phone until midnight", bucket: "⚠️ UNHEALTHY HABIT" },
      { text: "Taking screen breaks every hour", bucket: "🌟 HEALTHY HABIT" },
      { text: "Skipping meals to stay online", bucket: "⚠️ UNHEALTHY HABIT" },
      { text: "Doing homework before gaming", bucket: "🌟 HEALTHY HABIT" },
      { text: "Feeling upset when phone is taken away", bucket: "⚠️ UNHEALTHY HABIT" },
    ],
    buckets: ["🌟 HEALTHY HABIT", "⚠️ UNHEALTHY HABIT"],
  },
  wordSearch: {
    junior: { size: 8, words: ["PLAY", "REST", "SLEEP", "MOVE", "SAFE"] },
    defender: { size: 12, words: ["SCREENTIME", "BALANCE", "WELLBEING", "DIGITAL", "DETOX", "HEALTHY", "OFFLINE"] },
    guardian: {
      size: 15,
      words: ["DIGITALWELLBEING", "SCREENTIME", "CYBERHYGIENE", "MINDFULNESS", "DETOX", "BALANCE", "DOPAMINE"],
    },
  },
};

const shadowStationGames: ZoneGameContent = {
  quiz: {
    title: "Staying Safe in Online Games",
    questions: [
      {
        q: "Someone in an online game asks for your real name and where you live. What should you do?",
        choices: [
          "Tell them — you've been playing together for weeks",
          "Never share real personal info in games and tell a trusted adult",
          "Share just your first name",
          "Ask why they want to know first",
        ],
        answer: 1,
        explanation: "People in online games are strangers in real life — never share personal information!",
      },
      {
        q: "What is 'griefing' in online games?",
        choices: [
          "Feeling sad about losing",
          "Deliberately ruining other players' experience to upset them",
          "A type of game mode",
          "Celebrating a win",
        ],
        answer: 1,
        explanation: "Griefing is a form of cyberbullying in games — you can report and block griefers!",
      },
      {
        q: "A player offers you rare in-game items if you meet them in real life. What do you do?",
        choices: [
          "Agree — the items sound amazing",
          "Refuse and tell a trusted adult immediately",
          "Ask them where to meet",
          "Accept but bring a friend",
        ],
        answer: 1,
        explanation:
          "NEVER agree to meet someone from an online game in real life — tell a trusted adult straight away!",
      },
      {
        q: "What should you do if someone in a game is sending you inappropriate messages?",
        choices: [
          "Send them back",
          "Block them, screenshot the messages, and tell a trusted adult",
          "Leave the game forever",
          "Share the messages with other players",
        ],
        answer: 1,
        explanation:
          "Block, screenshot as evidence, and tell a trusted adult — you can also report them to the game platform!",
      },
      {
        q: "In-game purchases are always safe because they're inside the game. True or false?",
        choices: [
          "True — games are always safe",
          "False — scammers create fake in-game purchase sites to steal payment details",
          "True — game companies protect all purchases",
          "True — as long as you use a gift card",
        ],
        answer: 1,
        explanation:
          "Fake purchase sites that look like game stores are a common scam — only use official payment methods!",
      },
    ],
  },
  miniGame: { type: "game-guardian", title: "Game Guardian", description: "Spot safe vs unsafe in-game situations!" },
  dragDrop: {
    items: [
      { text: "Player asks for your home address", bucket: "🚨 UNSAFE — TELL AN ADULT" },
      { text: "Player sends a fun meme", bucket: "✅ PROBABLY FINE" },
      { text: "Player offers to meet in real life", bucket: "🚨 UNSAFE — TELL AN ADULT" },
      { text: "Player says 'good game!'", bucket: "✅ PROBABLY FINE" },
      { text: "Player sends inappropriate images", bucket: "🚨 UNSAFE — TELL AN ADULT" },
      { text: "Player invites you to a team game", bucket: "✅ PROBABLY FINE" },
      { text: "Player asks for your school name", bucket: "🚨 UNSAFE — TELL AN ADULT" },
      { text: "Player shares a gaming tip", bucket: "✅ PROBABLY FINE" },
    ],
    buckets: ["✅ PROBABLY FINE", "🚨 UNSAFE — TELL AN ADULT"],
  },
  wordSearch: {
    junior: { size: 8, words: ["GAME", "SAFE", "BLOCK", "TELL", "STOP"] },
    defender: { size: 12, words: ["GAMING", "STRANGER", "REPORT", "BLOCK", "PROTECT", "PURCHASE", "GRIEFER"] },
    guardian: {
      size: 15,
      words: ["ONLINEGAMING", "PREDATOR", "IMPERSONATION", "MICROTRANSACTION", "GRIEFING", "REPORTING", "GROOMING"],
    },
  },
};

/* ─── EUROPE ────────────────────────────────────────── */

const phishLagoonGames: ZoneGameContent = {
  quiz: {
    title: "Spot the Phisher King's Traps",
    questions: [
      {
        q: "What is phishing?",
        choices: [
          "A type of fishing sport",
          "Fake emails or messages trying to steal your information",
          "A computer virus",
          "A safe way to browse the internet",
        ],
        answer: 1,
        explanation: "Phishing tricks you into giving away passwords or personal info using fake messages!",
      },
      {
        q: "You get an email saying 'YOU WON $1,000,000! Click here!' What do you do?",
        choices: [
          "Click it immediately",
          "Share it with friends",
          "Delete it — it's a scam",
          "Reply with your details",
        ],
        answer: 2,
        explanation: "If it sounds too good to be true, it's a scam! Delete and tell a trusted adult.",
      },
      {
        q: "A fake email pretending to be from your bank is called what?",
        choices: ["Spam", "Phishing", "Hacking", "Trolling"],
        answer: 1,
        explanation: "Phishing emails pretend to be from trusted sources to steal your info!",
      },
      {
        q: "How can you spot a phishing email?",
        choices: [
          "It looks exactly like a real email",
          "It has spelling mistakes and asks for personal info urgently",
          "It comes from a friend",
          "It has nice pictures",
        ],
        answer: 1,
        explanation: "Phishing emails often have spelling mistakes and create urgency to trick you!",
      },
      {
        q: "What should you do if you accidentally clicked a suspicious link?",
        choices: [
          "Keep it secret",
          "Enter your details anyway",
          "Tell a trusted adult immediately and don't enter any information",
          "Close the tab and forget about it",
        ],
        answer: 2,
        explanation: "Always tell a trusted adult right away — they can help protect your accounts!",
      },
    ],
  },
  miniGame: {
    type: "email-inspector",
    title: "Email Inspector",
    description: "Find all the suspicious parts of a phishing email!",
  },
  wordSearch: {
    junior: { size: 8, words: ["FAKE", "TRICK", "SAFE", "STOP", "TELL"] },
    defender: { size: 12, words: ["PHISHING", "SCAM", "FAKE", "VIRUS", "SPAM", "ALERT", "DANGER", "REPORT"] },
    guardian: {
      size: 15,
      words: ["PHISHING", "MALWARE", "SPOOFING", "CREDENTIAL", "RANSOMWARE", "INFILTRATE", "DECEPTION"],
    },
  },
  dragDrop: {
    items: [
      { text: "Your teacher sends homework instructions", bucket: "✅ REAL EMAIL" },
      { text: "A prince needs your help and will pay you millions", bucket: "🚨 SCAM EMAIL" },
      { text: "Your school newsletter arrives every Monday", bucket: "✅ REAL EMAIL" },
      { text: "URGENT: Your account will be deleted! Click now!", bucket: "🚨 SCAM EMAIL" },
      { text: "A friend replies to your message", bucket: "✅ REAL EMAIL" },
      { text: "You won a free iPhone — enter your address!", bucket: "🚨 SCAM EMAIL" },
      { text: "A store confirms your mum's order", bucket: "✅ REAL EMAIL" },
      { text: "Verify your password or lose your account!", bucket: "🚨 SCAM EMAIL" },
    ],
    buckets: ["✅ REAL EMAIL", "🚨 SCAM EMAIL"],
  },
};

const downloadDungeonGames: ZoneGameContent = {
  quiz: {
    title: "Safe Downloads",
    questions: [
      {
        q: "Before downloading anything, what should you always do?",
        choices: [
          "Download it immediately",
          "Ask a trusted adult for permission",
          "Share it with friends first",
          "Click all the buttons",
        ],
        answer: 1,
        explanation: "Always ask a trusted adult before downloading anything!",
      },
      {
        q: "Which of these is a SAFE place to download apps?",
        choices: [
          "A random website",
          "The official App Store or Google Play",
          "A link in an email",
          "A pop-up advertisement",
        ],
        answer: 1,
        explanation: "Official app stores check apps for safety — always use them!",
      },
      {
        q: "A pop-up says 'Your device has a virus! Download this to fix it!' What do you do?",
        choices: [
          "Download it immediately",
          "Ignore it and tell a trusted adult",
          "Share the pop-up with friends",
          "Click yes on everything",
        ],
        answer: 1,
        explanation: "This is a scam! Real virus alerts don't come from pop-ups. Tell a trusted adult!",
      },
      {
        q: "What is malware?",
        choices: [
          "A type of hardware",
          "Harmful software designed to damage your device",
          "A safe app",
          "A computer brand",
        ],
        answer: 1,
        explanation: "Malware is malicious software designed to damage or steal from your device!",
      },
      {
        q: "You find a free version of a paid game on a random website. What should you do?",
        choices: [
          "Download it — free is great!",
          "Ask a trusted adult and only use official sources",
          "Share the link with your class",
          "Download it but don't tell anyone",
        ],
        answer: 1,
        explanation: "Unofficial free downloads often contain hidden malware. Stick to official sources!",
      },
    ],
  },
  miniGame: {
    type: "file-scanner",
    title: "File Scanner",
    description: "Scan files on the conveyor belt — safe or infected?",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Only download from ___ sources",
        answer: "OFFICIAL",
        juniorClue: "Real and true",
        guardianClue: "Vendor-authenticated distribution channel",
      },
      {
        number: 4,
        direction: "across",
        clue: "Harmful software hidden in downloads",
        answer: "MALWARE",
        juniorClue: "Bad program",
        guardianClue: "Malicious executable payload delivered via trojanised packages",
      },
      {
        number: 6,
        direction: "across",
        clue: "Always ask this person before downloading",
        answer: "ADULT",
        juniorClue: "Grown-up",
        guardianClue: "Responsible guardian with administrative privileges",
      },
      {
        number: 2,
        direction: "down",
        clue: "The official store for iPhone apps",
        answer: "APPSTORE",
        juniorClue: "Where to get apps",
        guardianClue: "Apple's curated software distribution platform",
      },
      {
        number: 3,
        direction: "down",
        clue: "A fake warning designed to scare you",
        answer: "POPUP",
        juniorClue: "Surprise box",
        guardianClue: "Browser-rendered modal injection used in scareware campaigns",
      },
      {
        number: 5,
        direction: "down",
        clue: "Check this before you download",
        answer: "PERMISSION",
        juniorClue: "Ask first",
        guardianClue: "Authorization scope requested by application binaries",
      },
    ],
    wordBank: ["OFFICIAL", "MALWARE", "ADULT", "APPSTORE", "POPUP", "PERMISSION"],
  },
  dragDrop: {
    items: [
      { text: "App from the official App Store", bucket: "✅ SAFE DOWNLOAD" },
      { text: "Game downloaded from a random website", bucket: "🚨 DANGEROUS DOWNLOAD" },
      { text: "App approved by a parent", bucket: "✅ SAFE DOWNLOAD" },
      { text: "Free movie from an unknown link", bucket: "🚨 DANGEROUS DOWNLOAD" },
      { text: "Update from the official developer", bucket: "✅ SAFE DOWNLOAD" },
      { text: "File attached to a spam email", bucket: "🚨 DANGEROUS DOWNLOAD" },
    ],
    buckets: ["✅ SAFE DOWNLOAD", "🚨 DANGEROUS DOWNLOAD"],
  },
};

const codeCastleGames: ZoneGameContent = {
  quiz: {
    title: "Two-Factor Authentication",
    questions: [
      {
        q: "What is two-factor authentication (2FA)?",
        choices: [
          "Using two passwords",
          "A second check to prove it's really you logging in",
          "Two different usernames",
          "Logging in twice",
        ],
        answer: 1,
        explanation: "2FA adds a second layer of security — like a password AND a code sent to your phone!",
      },
      {
        q: "Why is 2FA important?",
        choices: [
          "It makes logging in slower",
          "Even if someone steals your password they still can't get in",
          "It looks impressive",
          "It replaces your password",
        ],
        answer: 1,
        explanation: "With 2FA, a stolen password alone isn't enough — hackers still can't access your account!",
      },
      {
        q: "Which of these is an example of 2FA?",
        choices: [
          "Using a long password",
          "Entering a code sent to your phone after your password",
          "Having two email accounts",
          "Using the same password twice",
        ],
        answer: 1,
        explanation: "A code sent to your phone is the most common form of 2FA!",
      },
      {
        q: "Someone asks for the 2FA code that was sent to your phone. What do you do?",
        choices: [
          "Give it to them — they seem nice",
          "Never share it — it's private, like a password",
          "Only share it if they're a friend",
          "Post it online quickly",
        ],
        answer: 1,
        explanation: "NEVER share your 2FA code with anyone — not even someone claiming to be from a company!",
      },
      {
        q: "What should you do if you get a 2FA code you didn't ask for?",
        choices: [
          "Enter it anyway",
          "Share it with friends",
          "Tell a trusted adult — someone may be trying to access your account",
          "Ignore it",
        ],
        answer: 2,
        explanation: "An unexpected 2FA code means someone is trying to log into your account. Tell a trusted adult!",
      },
    ],
  },
  miniGame: {
    type: "two-factor-sim",
    title: "2FA Simulator",
    description: "Walk through setting up two-factor authentication!",
  },
  wordSearch: {
    junior: { size: 8, words: ["CODE", "SAFE", "LOCK", "PHONE", "CHECK"] },
    defender: { size: 12, words: ["AUTHENTICATION", "TWOFACTOR", "VERIFY", "PASSWORD", "SECURITY", "CODE", "PHONE"] },
    guardian: {
      size: 15,
      words: ["MULTIFACTOR", "AUTHENTICATION", "VERIFICATION", "BIOMETRIC", "CREDENTIAL", "PROTOCOL", "TWOSTEP"],
    },
  },
  dragDrop: {
    items: [
      { text: "Password only", bucket: "😬 WEAK SECURITY" },
      { text: "Password + phone code", bucket: "🛡️ STRONG SECURITY" },
      { text: "No password at all", bucket: "😬 WEAK SECURITY" },
      { text: "Password + fingerprint", bucket: "🛡️ STRONG SECURITY" },
      { text: "Sharing your password with friends", bucket: "😬 WEAK SECURITY" },
      { text: "Using 2FA on all important accounts", bucket: "🛡️ STRONG SECURITY" },
    ],
    buckets: ["🛡️ STRONG SECURITY", "😬 WEAK SECURITY"],
  },
};

/* ─── AFRICA ────────────────────────────────────────── */

const strangerShoreGames: ZoneGameContent = {
  quiz: {
    title: "Stranger Danger Online",
    questions: [
      {
        q: "Someone you've never met in real life wants to be your friend online. What should you do?",
        choices: [
          "Accept immediately",
          "Tell a trusted adult and don't accept",
          "Share your address so they can visit",
          "Give them your phone number",
        ],
        answer: 1,
        explanation: "Online strangers could be anyone. Always tell a trusted adult before accepting!",
      },
      {
        q: "An online friend asks where you go to school. What do you do?",
        choices: [
          "Tell them — it's just a school",
          "Don't share it and tell a trusted adult",
          "Give them your teacher's name too",
          "Post it on social media",
        ],
        answer: 1,
        explanation: "Your school location is personal information — never share it with online strangers!",
      },
      {
        q: "What information is safe to share with online strangers?",
        choices: ["Your home address", "Your favourite colour", "Your phone number", "Your school name"],
        answer: 1,
        explanation: "Your favourite colour is harmless — never share location or contact details!",
      },
      {
        q: "Someone online is being very kind and giving you lots of compliments. Should you trust them completely?",
        choices: [
          "Yes — kind people are always safe",
          "No — be careful, some people use kindness to gain trust before asking for personal info",
          "Yes — share your address to meet them",
          "Yes — give them your password as a gift",
        ],
        answer: 1,
        explanation:
          "Some people use kindness online to build trust before asking for dangerous things. Always stay alert!",
      },
      {
        q: "What should you do if an online stranger makes you feel uncomfortable?",
        choices: [
          "Keep talking to them",
          "Block them and tell a trusted adult immediately",
          "Share their messages with online friends",
          "Delete the app and say nothing",
        ],
        answer: 1,
        explanation: "Block, stop talking, and always tell a trusted adult when something feels wrong!",
      },
    ],
  },
  miniGame: {
    type: "stranger-danger",
    title: "Stranger Danger Sorter",
    description: "Sort contacts into trusted vs unknown!",
  },
  wordSearch: {
    junior: { size: 8, words: ["SAFE", "TELL", "STOP", "HELP", "KIND"] },
    defender: { size: 12, words: ["PRIVATE", "SECRET", "ADDRESS", "SHARE", "TRUST", "STRANGER", "BLOCK", "HELP"] },
    guardian: {
      size: 15,
      words: ["ANONYMOUS", "ENCRYPTED", "GEOLOCATION", "SURVEILLANCE", "CONFIDENTIAL", "TRUSTWORTHY"],
    },
  },
  dragDrop: {
    items: [
      { text: "Your favourite movie", bucket: "✅ SAFE TO SHARE" },
      { text: "Your home address", bucket: "🔒 KEEP PRIVATE" },
      { text: "Your favourite colour", bucket: "✅ SAFE TO SHARE" },
      { text: "Your phone number", bucket: "🔒 KEEP PRIVATE" },
      { text: "Your favourite sport", bucket: "✅ SAFE TO SHARE" },
      { text: "Your school name", bucket: "🔒 KEEP PRIVATE" },
      { text: "Your favourite food", bucket: "✅ SAFE TO SHARE" },
      { text: "Photos of your house", bucket: "🔒 KEEP PRIVATE" },
    ],
    buckets: ["✅ SAFE TO SHARE", "🔒 KEEP PRIVATE"],
  },
};

const darkWebDenGames: ZoneGameContent = {
  quiz: {
    title: "The Dark Web",
    questions: [
      {
        q: "What is the dark web?",
        choices: [
          "A spooky website for Halloween",
          "A hidden part of the internet used for illegal activities",
          "A dark-themed social media app",
          "A website that turns your screen dark",
        ],
        answer: 1,
        explanation: "The dark web is a hidden part of the internet where illegal activities often happen — stay away!",
      },
      {
        q: "Should kids ever try to access the dark web?",
        choices: [
          "Yes, it sounds exciting",
          "No — it is dangerous and illegal for children",
          "Only with friends",
          "Yes, to learn about hacking",
        ],
        answer: 1,
        explanation: "The dark web is dangerous and off limits. It's never safe for children to access it!",
      },
      {
        q: "What should you do if someone online offers to show you 'secret parts of the internet'?",
        choices: [
          "Follow their instructions",
          "Say no and tell a trusted adult immediately",
          "Only agree if they seem friendly",
          "Ask for more details first",
        ],
        answer: 1,
        explanation: "Never let anyone guide you to hidden or secret online spaces — tell a trusted adult immediately!",
      },
      {
        q: "How can you identify a suspicious website?",
        choices: [
          "It has lots of colourful pictures",
          "It has no padlock, strange spelling, and asks for personal info",
          "It loads slowly",
          "It looks old-fashioned",
        ],
        answer: 1,
        explanation: "No padlock, strange URLs, and requests for personal info are big warning signs!",
      },
      {
        q: "What does a safe website URL usually start with?",
        choices: ["http://", "www.", "https://", "mail://"],
        answer: 2,
        explanation: "https:// means the website is encrypted and safer to use!",
      },
    ],
  },
  miniGame: { type: "safe-sites-detector", title: "Safe Sites Detector", description: "Spot safe vs suspicious URLs!" },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Always ask this person before going online",
        answer: "PARENT",
        juniorClue: "Mum or Dad",
        guardianClue: "Primary custodial authority for minors' digital access",
      },
      {
        number: 3,
        direction: "across",
        clue: "Don't talk to these people online",
        answer: "STRANGER",
        juniorClue: "Unknown person",
        guardianClue: "Unverified entity with no established trust relationship",
      },
      {
        number: 5,
        direction: "across",
        clue: "A trustworthy website starts with this",
        answer: "HTTPS",
        juniorClue: "Safe letters",
        guardianClue: "TLS-encrypted HTTP protocol prefix",
      },
      {
        number: 7,
        direction: "across",
        clue: "What you should do to bad messages",
        answer: "REPORT",
        juniorClue: "Tell someone",
        guardianClue: "Formal notification to platform moderation systems",
      },
      {
        number: 2,
        direction: "down",
        clue: "Lock your account with this",
        answer: "PASSWORD",
        juniorClue: "Secret code",
        guardianClue: "Authentication credential string",
      },
      {
        number: 4,
        direction: "down",
        clue: "Keep this secret — your home location",
        answer: "ADDRESS",
        juniorClue: "Where you live",
        guardianClue: "Personally identifiable geospatial data",
      },
      {
        number: 6,
        direction: "down",
        clue: "Be kind online, this is called cyber ___",
        answer: "KINDNESS",
        juniorClue: "Being nice",
        guardianClue: "Prosocial digital behaviour promoting positive online culture",
      },
    ],
    wordBank: ["PARENT", "STRANGER", "HTTPS", "REPORT", "PASSWORD", "ADDRESS", "KINDNESS"],
  },
  dragDrop: {
    items: [
      { text: "https://google.com 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://g00gle.com (no padlock)", bucket: "⚠️ SUSPICIOUS WEBSITE" },
      { text: "https://amazon.com 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://free-prizes-click-here.com", bucket: "⚠️ SUSPICIOUS WEBSITE" },
      { text: "https://bbc.co.uk 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://your-bank-login.xyz", bucket: "⚠️ SUSPICIOUS WEBSITE" },
    ],
    buckets: ["✅ SAFE WEBSITE", "⚠️ SUSPICIOUS WEBSITE"],
  },
};

const kindnessCitadelGames: ZoneGameContent = {
  quiz: {
    title: "Stop the Troll Lord",
    questions: [
      {
        q: "What is cyberbullying?",
        choices: [
          "Playing games online",
          "Using technology to hurt, embarrass, or threaten someone",
          "Making new friends online",
          "Sending funny memes",
        ],
        answer: 1,
        explanation: "Cyberbullying is using technology to hurt others — it's never okay!",
      },
      {
        q: "Someone posts a mean comment about your friend online. What should you do?",
        choices: [
          "Join in — everyone's doing it",
          "Ignore it completely",
          "Stand up for your friend and report the comment",
          "Share the comment",
        ],
        answer: 2,
        explanation: "Be an upstander — support your friend and report the mean comment!",
      },
      {
        q: "What is an upstander?",
        choices: [
          "Someone who bullies others",
          "Someone who stands up for others when they see bullying",
          "Someone who watches bullying and does nothing",
          "A type of computer program",
        ],
        answer: 1,
        explanation: "An upstander speaks up for others — be the hero someone needs!",
      },
      {
        q: "If someone sends you a mean message online, what should you do?",
        choices: [
          "Send an even meaner message back",
          "Don't respond, save the message, and tell a trusted adult",
          "Share it with everyone",
          "Delete it and say nothing",
        ],
        answer: 1,
        explanation: "Don't retaliate — save the evidence and tell a trusted adult who can help!",
      },
      {
        q: "How can you make the internet a kinder place?",
        choices: [
          "Only talk to people you like",
          "Think before you post — would this hurt someone's feelings?",
          "Share everything you think",
          "Ignore others' feelings online",
        ],
        answer: 1,
        explanation: "Always think before you post — kindness online makes the whole world better!",
      },
    ],
  },
  miniGame: {
    type: "kindness-shield",
    title: "Kindness Shield",
    description: "Deflect mean messages with kind responses!",
  },
  wordSearch: {
    junior: { size: 8, words: ["KIND", "HELP", "NICE", "CARE", "STOP"] },
    defender: { size: 12, words: ["KINDNESS", "UPSTANDER", "REPORT", "RESPECT", "SUPPORT", "BULLYING", "PROTECT"] },
    guardian: {
      size: 15,
      words: ["CYBERBULLYING", "UPSTANDER", "HARASSMENT", "EMPATHY", "BYSTANDER", "INTERVENTION", "RESPECT"],
    },
  },
  dragDrop: {
    items: [
      { text: "Great job on your drawing!", bucket: "💙 KIND MESSAGE" },
      { text: "You're so stupid", bucket: "🚨 MEAN MESSAGE" },
      { text: "I love playing games with you!", bucket: "💙 KIND MESSAGE" },
      { text: "Nobody likes you", bucket: "🚨 MEAN MESSAGE" },
      { text: "You did really well today!", bucket: "💙 KIND MESSAGE" },
      { text: "Your clothes are ugly", bucket: "🚨 MEAN MESSAGE" },
      { text: "Can I help you with that?", bucket: "💙 KIND MESSAGE" },
      { text: "You should just quit", bucket: "🚨 MEAN MESSAGE" },
    ],
    buckets: ["💙 KIND MESSAGE", "🚨 MEAN MESSAGE"],
  },
};

/* ─── ASIA ──────────────────────────────────────────── */

const privacyPalaceGames: ZoneGameContent = {
  quiz: {
    title: "App Permissions",
    questions: [
      {
        q: "A flashlight app asks for access to your contacts and location. What should you do?",
        choices: [
          "Allow everything — it probably needs it",
          "Deny unnecessary permissions — a flashlight doesn't need contacts or location",
          "Delete your contacts first",
          "Turn off your phone",
        ],
        answer: 1,
        explanation: "A flashlight only needs to turn on your camera flash — contacts and location are unnecessary!",
      },
      {
        q: "What is a privacy setting?",
        choices: [
          "A type of password",
          "Controls that let you decide who can see your information",
          "A secret website",
          "A computer virus",
        ],
        answer: 1,
        explanation: "Privacy settings let you control who can see your posts, location, and personal info!",
      },
      {
        q: "Which app permission should a simple game NOT need?",
        choices: ["Sound", "Display", "Your exact GPS location", "Screen brightness"],
        answer: 2,
        explanation: "A simple game has no reason to know your exact location — deny that permission!",
      },
      {
        q: "What does it mean when an app tracks your location?",
        choices: [
          "It helps you play better",
          "It knows exactly where you are at all times",
          "It makes the app faster",
          "It connects you to friends",
        ],
        answer: 1,
        explanation: "Location tracking means the app knows where you are — only allow this when truly necessary!",
      },
      {
        q: "What should you do before installing a new app?",
        choices: [
          "Install it immediately",
          "Check what permissions it asks for and ask a trusted adult",
          "Share it with friends",
          "Give it all permissions",
        ],
        answer: 1,
        explanation: "Always check permissions and ask a trusted adult before installing new apps!",
      },
    ],
  },
  miniGame: {
    type: "app-permission",
    title: "App Permission Manager",
    description: "Toggle app permissions correctly!",
  },
  wordSearch: {
    junior: { size: 8, words: ["SAFE", "HIDE", "LOCK", "TELL", "STOP"] },
    defender: { size: 12, words: ["PRIVACY", "PERMISSION", "LOCATION", "SETTINGS", "PERSONAL", "PROTECT", "PRIVATE"] },
    guardian: {
      size: 15,
      words: ["GEOLOCATION", "PERMISSIONS", "SURVEILLANCE", "BIOMETRIC", "CONFIDENTIAL", "DATAPROTECT"],
    },
  },
  dragDrop: {
    items: [
      { text: "Maps app needs your location", bucket: "✅ NECESSARY" },
      { text: "Flashlight app needs your contacts", bucket: "🚫 UNNECESSARY" },
      { text: "Camera app needs camera access", bucket: "✅ NECESSARY" },
      { text: "Calculator app needs your microphone", bucket: "🚫 UNNECESSARY" },
      { text: "Music app needs audio access", bucket: "✅ NECESSARY" },
      { text: "Simple game needs your exact GPS", bucket: "🚫 UNNECESSARY" },
    ],
    buckets: ["✅ NECESSARY", "🚫 UNNECESSARY"],
  },
};

const browseBazaarGames: ZoneGameContent = {
  quiz: {
    title: "Safe Browsing",
    questions: [
      {
        q: "What does HTTPS mean in a website address?",
        choices: [
          "The website is old",
          "The website uses secure encrypted communication",
          "The website is free to use",
          "The website has lots of content",
        ],
        answer: 1,
        explanation: "HTTPS means the website encrypts your data — look for it before entering any personal info!",
      },
      {
        q: "You see a padlock icon next to a website address. What does this mean?",
        choices: [
          "The website is locked and you can't use it",
          "The website is using a secure connection",
          "The website costs money",
          "The website is under construction",
        ],
        answer: 1,
        explanation: "A padlock icon means the connection is secure and encrypted!",
      },
      {
        q: "Which website address looks suspicious?",
        choices: ["https://google.com", "https://amazon.com", "http://amaz0n-deals.xyz", "https://bbc.co.uk"],
        answer: 2,
        explanation: "amaz0n-deals.xyz uses a zero instead of 'o' and .xyz domain — classic phishing trick!",
      },
      {
        q: "What should you do if a website asks for your home address to show you content?",
        choices: [
          "Enter it — websites need this",
          "Never enter personal info unless a trusted adult says it's okay",
          "Enter a fake address",
          "Close the tab and tell a trusted adult",
        ],
        answer: 3,
        explanation: "Close the tab and tell a trusted adult — legitimate websites rarely need your home address!",
      },
      {
        q: "What is a cookie on a website?",
        choices: [
          "A tasty snack",
          "A small file that remembers your preferences and tracks your activity",
          "A type of virus",
          "A security feature",
        ],
        answer: 1,
        explanation: "Cookies track what you do on websites — it's okay to decline non-essential cookies!",
      },
    ],
  },
  miniGame: {
    type: "url-inspector",
    title: "URL Inspector",
    description: "Identify safe vs suspicious URL components!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Secure website protocol — look for this",
        answer: "HTTPS",
        juniorClue: "Safe letters",
        guardianClue: "Transport Layer Security HTTP protocol prefix",
      },
      {
        number: 4,
        direction: "across",
        clue: "This icon means the connection is secure",
        answer: "PADLOCK",
        juniorClue: "Lock picture",
        guardianClue: "Visual TLS certificate validation indicator",
      },
      {
        number: 6,
        direction: "across",
        clue: "Small file that tracks website activity",
        answer: "COOKIE",
        juniorClue: "Website memory",
        guardianClue: "HTTP state management mechanism per RFC 6265",
      },
      {
        number: 2,
        direction: "down",
        clue: "Never enter this on unknown websites",
        answer: "PASSWORD",
        juniorClue: "Secret code",
        guardianClue: "Authentication credential string",
      },
      {
        number: 3,
        direction: "down",
        clue: "Fake website designed to look real",
        answer: "PHISHING",
        juniorClue: "Trick site",
        guardianClue: "Credential harvesting via spoofed web properties",
      },
      {
        number: 5,
        direction: "down",
        clue: "The address of a website",
        answer: "URL",
        juniorClue: "Web name",
        guardianClue: "Uniform Resource Locator",
      },
    ],
    wordBank: ["HTTPS", "PADLOCK", "COOKIE", "PASSWORD", "PHISHING", "URL"],
  },
  dragDrop: {
    items: [
      { text: "https://google.com 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://free-movies-download.xyz", bucket: "🚨 UNSAFE WEBSITE" },
      { text: "https://khanacademy.org 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://g00gle.com (no padlock)", bucket: "🚨 UNSAFE WEBSITE" },
      { text: "https://wikipedia.org 🔒", bucket: "✅ SAFE WEBSITE" },
      { text: "http://win-prize-now.com", bucket: "🚨 UNSAFE WEBSITE" },
    ],
    buckets: ["✅ SAFE WEBSITE", "🚨 UNSAFE WEBSITE"],
  },
};

const firewallFrontierGames: ZoneGameContent = {
  quiz: {
    title: "Firewalls and Network Security",
    questions: [
      {
        q: "What is a firewall?",
        choices: [
          "A wall made of fire",
          "A security system that monitors and controls incoming and outgoing network traffic",
          "A type of virus",
          "A fast internet connection",
        ],
        answer: 1,
        explanation:
          "A firewall acts like a security guard for your network — blocking bad traffic and allowing good traffic!",
      },
      {
        q: "What does a firewall protect against?",
        choices: ["Slow internet", "Unauthorized access and malicious traffic", "Power cuts", "Screen damage"],
        answer: 1,
        explanation: "Firewalls block hackers and malware from accessing your network!",
      },
      {
        q: "What is a network?",
        choices: [
          "A type of fish net",
          "A group of connected computers and devices",
          "A social media app",
          "A computer brand",
        ],
        answer: 1,
        explanation: "A network connects multiple devices so they can share information and resources!",
      },
      {
        q: "Why should you never connect to unknown public WiFi without protection?",
        choices: [
          "It might be slow",
          "Hackers can set up fake networks to steal your data",
          "It uses too much battery",
          "It might cost money",
        ],
        answer: 1,
        explanation: "Fake WiFi hotspots are a common hacking trick — always ask a trusted adult before connecting!",
      },
      {
        q: "What should you do before connecting to a new WiFi network?",
        choices: [
          "Connect immediately",
          "Ask a trusted adult if it's safe to use",
          "Share the password with friends",
          "Turn off your firewall",
        ],
        answer: 1,
        explanation: "Always check with a trusted adult before connecting to any new network!",
      },
    ],
  },
  miniGame: {
    type: "firewall-builder",
    title: "Firewall Builder",
    description: "Block bad traffic and allow good traffic!",
  },
  wordSearch: {
    junior: { size: 8, words: ["WALL", "SAFE", "BLOCK", "GUARD", "STOP"] },
    defender: { size: 12, words: ["FIREWALL", "NETWORK", "SECURITY", "PROTECT", "TRAFFIC", "BLOCK", "MONITOR"] },
    guardian: {
      size: 15,
      words: ["FIREWALL", "BANDWIDTH", "ENCRYPTION", "PROTOCOL", "INTRUSION", "DETECTION", "NETWORK"],
    },
  },
  dragDrop: {
    items: [
      { text: "Traffic from a trusted school website", bucket: "✅ ALLOW" },
      { text: "Unknown connection from foreign server", bucket: "🚫 BLOCK" },
      { text: "Your favourite game's official servers", bucket: "✅ ALLOW" },
      { text: "Suspicious program trying to access internet", bucket: "🚫 BLOCK" },
      { text: "Video call with family members", bucket: "✅ ALLOW" },
      { text: "Unknown app sending data at midnight", bucket: "🚫 BLOCK" },
    ],
    buckets: ["✅ ALLOW", "🚫 BLOCK"],
  },
};

const cyberguardAcademyGames: ZoneGameContent = {
  quiz: {
    title: "All-Round Cyber Defence",
    questions: [
      {
        q: "What is the most important thing you can do to stay safe online?",
        choices: [
          "Never use the internet",
          "Always tell a trusted adult when something feels wrong",
          "Only use the internet at night",
          "Share your passwords with family",
        ],
        answer: 1,
        explanation: "Telling a trusted adult is always the most important step!",
      },
      {
        q: "Which of these is the BEST cyber safety habit?",
        choices: [
          "Using the same password for everything",
          "Never updating your apps",
          "Using strong unique passwords and 2FA",
          "Sharing your login with friends",
        ],
        answer: 2,
        explanation: "Strong unique passwords plus 2FA is the gold standard of account security!",
      },
      {
        q: "What should you do if you receive a message that makes you feel scared or uncomfortable?",
        choices: [
          "Reply angrily",
          "Delete it and say nothing",
          "Tell a trusted adult straight away",
          "Share it with classmates",
        ],
        answer: 2,
        explanation: "Always tell a trusted adult — they can help and take action to keep you safe!",
      },
      {
        q: "You notice your friend is being bullied in an online game. What is the RIGHT thing to do?",
        choices: [
          "Watch and say nothing",
          "Join in",
          "Support your friend, report the bully, and tell a trusted adult",
          "Leave the game",
        ],
        answer: 2,
        explanation: "Be an upstander — support your friend and report the bullying!",
      },
      {
        q: "What makes someone a true Cyber Hero?",
        choices: [
          "Knowing how to hack",
          "Staying safe online AND helping others stay safe too",
          "Never using the internet",
          "Having the most followers",
        ],
        answer: 1,
        explanation: "A true Cyber Hero protects themselves and the people around them!",
      },
    ],
  },
  miniGame: {
    type: "cyber-obstacle",
    title: "Cyber Obstacle Course",
    description: "Rapid fire mixed quiz across all Asia topics!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Security system monitoring network traffic",
        answer: "FIREWALL",
        juniorClue: "Network guard",
        guardianClue: "Packet-filtering network security appliance",
      },
      {
        number: 4,
        direction: "across",
        clue: "Second verification step for login",
        answer: "TWOFACTOR",
        juniorClue: "Extra check",
        guardianClue: "Multi-factor authentication protocol",
      },
      {
        number: 6,
        direction: "across",
        clue: "Scrambling data to protect it",
        answer: "ENCRYPTION",
        juniorClue: "Secret code",
        guardianClue: "Cryptographic data transformation",
      },
      {
        number: 8,
        direction: "across",
        clue: "Controls who can see your information",
        answer: "PRIVACY",
        juniorClue: "Keeping safe",
        guardianClue: "Data access governance framework",
      },
      {
        number: 2,
        direction: "down",
        clue: "Network of connected devices",
        answer: "INTERNET",
        juniorClue: "Online world",
        guardianClue: "Global interconnected packet-switched network",
      },
      {
        number: 3,
        direction: "down",
        clue: "Fake email designed to trick you",
        answer: "PHISHING",
        juniorClue: "Trick mail",
        guardianClue: "Social engineering credential harvesting attack",
      },
      {
        number: 5,
        direction: "down",
        clue: "Harmful software on your device",
        answer: "MALWARE",
        juniorClue: "Bad program",
        guardianClue: "Malicious executable payload",
      },
      {
        number: 7,
        direction: "down",
        clue: "Your secret account key",
        answer: "PASSWORD",
        juniorClue: "Secret word",
        guardianClue: "Authentication credential string",
      },
    ],
    wordBank: ["FIREWALL", "TWOFACTOR", "ENCRYPTION", "PRIVACY", "INTERNET", "PHISHING", "MALWARE", "PASSWORD"],
  },
  dragDrop: {
    items: [
      { text: "Phishing email", bucket: "🗑️ REPORT & DELETE" },
      { text: "Weak password", bucket: "🔑 CHANGE TO STRONG" },
      { text: "Unknown network connection", bucket: "🛡️ USE FIREWALL" },
      { text: "Virus on device", bucket: "🔬 RUN ANTIVIRUS" },
      { text: "Someone asking for personal info", bucket: "👨‍👩‍👧 TELL TRUSTED ADULT" },
      { text: "Cyberbully online", bucket: "🚫 BLOCK & REPORT" },
    ],
    buckets: [
      "🗑️ REPORT & DELETE",
      "🔑 CHANGE TO STRONG",
      "🛡️ USE FIREWALL",
      "🔬 RUN ANTIVIRUS",
      "👨‍👩‍👧 TELL TRUSTED ADULT",
      "🚫 BLOCK & REPORT",
    ],
  },
};

/* ─── SOUTH AMERICA ─────────────────────────────────── */

const kindnessKingdomGames: ZoneGameContent = {
  quiz: {
    title: "Social Media Safety",
    questions: [
      {
        q: "What is the minimum age for most social media platforms?",
        choices: ["8 years old", "10 years old", "13 years old", "18 years old"],
        answer: 2,
        explanation: "Most social media platforms require users to be at least 13 years old!",
      },
      {
        q: "Before posting a photo online, what should you think about?",
        choices: [
          "How many likes it will get",
          "Whether it reveals personal info like your location or school",
          "Whether it's funny enough",
          "How quickly you can post it",
        ],
        answer: 1,
        explanation: "Always think about what personal information might be visible in your photos before posting!",
      },
      {
        q: "Someone you don't know sends you a friend request on social media. What should you do?",
        choices: [
          "Accept — the more friends the better",
          "Ask a trusted adult before accepting",
          "Accept and immediately share personal info",
          "Give them your phone number",
        ],
        answer: 1,
        explanation: "Always check with a trusted adult before accepting friend requests from strangers!",
      },
      {
        q: "What should you do before posting something online?",
        choices: [
          "Post immediately — be the first!",
          "Think: is this kind, is this safe, would I be happy if everyone saw this?",
          "Only think about whether friends will like it",
          "Post and delete later if needed",
        ],
        answer: 1,
        explanation: "Think before you post — once it's online it can be very hard to remove!",
      },
      {
        q: "What does 'digital footprint' mean?",
        choices: [
          "A type of computer mouse",
          "The trail of data you leave behind when using the internet",
          "A social media follower count",
          "A type of online game",
        ],
        answer: 1,
        explanation: "Your digital footprint is everything you do online — it can last forever!",
      },
    ],
  },
  miniGame: {
    type: "social-media-checker",
    title: "Social Media Safety Checker",
    description: "Check a post for safety issues before publishing!",
  },
  wordSearch: {
    junior: { size: 8, words: ["POST", "SAFE", "KIND", "TELL", "STOP"] },
    defender: { size: 12, words: ["SOCIALMEDIA", "FOOTPRINT", "PRIVACY", "KINDNESS", "POSTING", "DIGITAL", "SAFETY"] },
    guardian: {
      size: 15,
      words: ["DIGITALFOOTPRINT", "SOCIALMEDIA", "CYBERBULLYING", "PRIVACY", "REPUTATION", "OVERSHARING"],
    },
  },
  dragDrop: {
    items: [
      { text: "A drawing you made", bucket: "✅ SAFE TO POST" },
      { text: "A photo showing your school sign", bucket: "🔒 KEEP PRIVATE" },
      { text: "Your favourite book recommendation", bucket: "✅ SAFE TO POST" },
      { text: "A photo showing your house number", bucket: "🔒 KEEP PRIVATE" },
      { text: "A funny meme you made", bucket: "✅ SAFE TO POST" },
      { text: "Your daily routine and schedule", bucket: "🔒 KEEP PRIVATE" },
    ],
    buckets: ["✅ SAFE TO POST", "🔒 KEEP PRIVATE"],
  },
};

const socialFortressGames: ZoneGameContent = {
  quiz: {
    title: "Protecting Personal Information",
    questions: [
      {
        q: "What is personal information?",
        choices: [
          "Your favourite colour",
          "Details that can identify or locate you, like your name, address, or phone number",
          "The games you like",
          "Your favourite food",
        ],
        answer: 1,
        explanation: "Personal information can be used to find or identify you — protect it carefully!",
      },
      {
        q: "Which of these is NOT personal information?",
        choices: ["Your home address", "Your phone number", "Your favourite movie", "Your school name"],
        answer: 2,
        explanation: "Your favourite movie can't be used to find or identify you — the others can!",
      },
      {
        q: "Why is it dangerous to share your location online?",
        choices: [
          "It uses too much battery",
          "People can find out where you are in real life",
          "It slows down your device",
          "It costs money",
        ],
        answer: 1,
        explanation: "Sharing your location tells people exactly where you are — this can be very dangerous!",
      },
      {
        q: "A website asks for your full name and birthday to sign up. What should you do?",
        choices: [
          "Enter it all quickly",
          "Ask a trusted adult if the website is safe before entering any information",
          "Make up fake details",
          "Enter just your first name",
        ],
        answer: 1,
        explanation: "Always check with a trusted adult before giving ANY personal information to a website!",
      },
      {
        q: "What should you do if you accidentally shared personal information online?",
        choices: [
          "Keep it secret and hope nothing happens",
          "Tell a trusted adult immediately so they can help fix it",
          "Share more information to cover it up",
          "Delete your account without telling anyone",
        ],
        answer: 1,
        explanation: "Tell a trusted adult right away — they can help limit the damage and keep you safe!",
      },
    ],
  },
  miniGame: {
    type: "info-vault",
    title: "Info Vault",
    description: "Lock personal info in the vault before the Data Thief steals it!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Details that can identify or locate you",
        answer: "PERSONAL",
        juniorClue: "About you",
        guardianClue: "Personally identifiable information (PII)",
      },
      {
        number: 4,
        direction: "across",
        clue: "Never share this with strangers — where you live",
        answer: "ADDRESS",
        juniorClue: "Home place",
        guardianClue: "Residential geospatial identifier",
      },
      {
        number: 6,
        direction: "across",
        clue: "The trail you leave online",
        answer: "FOOTPRINT",
        juniorClue: "Online marks",
        guardianClue: "Persistent digital activity metadata",
      },
      {
        number: 2,
        direction: "down",
        clue: "Keep this private — your location",
        answer: "LOCATION",
        juniorClue: "Where you are",
        guardianClue: "Geospatial coordinates",
      },
      {
        number: 3,
        direction: "down",
        clue: "Always ask this person before sharing info",
        answer: "ADULT",
        juniorClue: "Grown-up",
        guardianClue: "Responsible custodial authority",
      },
      {
        number: 5,
        direction: "down",
        clue: "Protect this — your identity",
        answer: "PRIVACY",
        juniorClue: "Keeping safe",
        guardianClue: "Data sovereignty and access control",
      },
    ],
    wordBank: ["PERSONAL", "ADDRESS", "FOOTPRINT", "LOCATION", "ADULT", "PRIVACY"],
  },
  dragDrop: {
    items: [
      { text: "Your favourite colour", bucket: "✅ PUBLIC OK" },
      { text: "Your home address", bucket: "🔒 PERSONAL — PROTECT IT" },
      { text: "Your favourite sport", bucket: "✅ PUBLIC OK" },
      { text: "Your phone number", bucket: "🔒 PERSONAL — PROTECT IT" },
      { text: "Your favourite animal", bucket: "✅ PUBLIC OK" },
      { text: "What time you leave for school", bucket: "🔒 PERSONAL — PROTECT IT" },
    ],
    buckets: ["✅ PUBLIC OK", "🔒 PERSONAL — PROTECT IT"],
  },
};

const identityIsleGames: ZoneGameContent = {
  quiz: {
    title: "Identity Theft Awareness",
    questions: [
      {
        q: "What is identity theft?",
        choices: [
          "Stealing someone's phone",
          "When someone steals your personal information to pretend to be you",
          "Copying someone's homework",
          "Taking someone's photo",
        ],
        answer: 1,
        explanation:
          "Identity theft is when criminals use your personal info to impersonate you online or financially!",
      },
      {
        q: "Someone online is pretending to be you and messaging your friends. What should you do?",
        choices: [
          "Send them a message asking them to stop",
          "Tell a trusted adult immediately and report the fake account",
          "Create a new account",
          "Ignore it",
        ],
        answer: 1,
        explanation: "Tell a trusted adult right away — fake accounts can be reported and removed!",
      },
      {
        q: "Which of these helps PREVENT identity theft?",
        choices: [
          "Using the same password everywhere",
          "Sharing your birthday publicly online",
          "Using strong passwords and keeping personal info private",
          "Accepting all friend requests",
        ],
        answer: 2,
        explanation: "Strong passwords and keeping personal info private are your best defences!",
      },
      {
        q: "You notice purchases on your parent's account that they didn't make. What could this mean?",
        choices: [
          "The shop made a mistake",
          "Someone may have stolen their account details",
          "It's a special surprise",
          "The bank made an error",
        ],
        answer: 1,
        explanation: "Unexpected purchases could mean identity theft — tell a trusted adult to check immediately!",
      },
      {
        q: "What is the safest way to protect your identity online?",
        choices: [
          "Share your info only with online friends",
          "Keep personal info private and use strong passwords",
          "Never use the internet",
          "Post your details publicly so everyone can verify it's you",
        ],
        answer: 1,
        explanation: "Keeping personal info private and using strong passwords is the best protection!",
      },
    ],
  },
  miniGame: {
    type: "identity-defender",
    title: "Identity Defender",
    description: "Spot differences between real and fake accounts!",
  },
  wordSearch: {
    junior: { size: 8, words: ["REAL", "FAKE", "SAFE", "TELL", "STOP"] },
    defender: { size: 12, words: ["IDENTITY", "THEFT", "IMPOSTER", "PROTECT", "PERSONAL", "ACCOUNT", "REPORT"] },
    guardian: {
      size: 15,
      words: ["IMPERSONATION", "CREDENTIALS", "AUTHENTICATION", "FRAUDULENT", "IDENTITY", "PROTECTION"],
    },
  },
  dragDrop: {
    items: [
      { text: "Account created today with no posts", bucket: "⚠️ SUSPICIOUS" },
      { text: "Verified badge from the platform", bucket: "✅ LIKELY REAL" },
      { text: "Asking for personal info in first message", bucket: "⚠️ SUSPICIOUS" },
      { text: "Friends you know follow this account", bucket: "✅ LIKELY REAL" },
      { text: "Profile photo looks like a stock image", bucket: "⚠️ SUSPICIOUS" },
      { text: "Account has years of genuine posts and history", bucket: "✅ LIKELY REAL" },
    ],
    buckets: ["✅ LIKELY REAL", "⚠️ SUSPICIOUS"],
  },
};

/* ─── AUSTRALIA ──────────────────────────────────────── */

const malwareMazeGames: ZoneGameContent = {
  quiz: {
    title: "Malware Awareness",
    questions: [
      {
        q: "What is malware?",
        choices: [
          "A type of hardware",
          "Malicious software designed to damage or steal from your device",
          "A safe app",
          "A computer brand",
        ],
        answer: 1,
        explanation: "Malware is any harmful software — including viruses, spyware, and ransomware!",
      },
      {
        q: "How does malware usually get onto a device?",
        choices: [
          "Through official app stores",
          "By clicking suspicious links, downloading unsafe files, or visiting dangerous websites",
          "Through the power cable",
          "By using WiFi",
        ],
        answer: 1,
        explanation: "Most malware arrives through suspicious downloads, links, or unsafe websites!",
      },
      {
        q: "What is a computer virus?",
        choices: [
          "A type of illness",
          "Malware that copies itself and spreads to other devices",
          "A helpful program",
          "A type of game",
        ],
        answer: 1,
        explanation: "A computer virus spreads from device to device and can damage files and steal data!",
      },
      {
        q: "What is ransomware?",
        choices: [
          "A game about pirates",
          "Malware that locks your files and demands money to unlock them",
          "A type of antivirus",
          "A safe backup tool",
        ],
        answer: 1,
        explanation: "Ransomware is incredibly dangerous malware that holds your files hostage for money!",
      },
      {
        q: "What is the best protection against malware?",
        choices: [
          "Never turning on your device",
          "Using antivirus software, keeping software updated, and avoiding suspicious links",
          "Buying a new device every year",
          "Using the internet less",
        ],
        answer: 1,
        explanation: "Antivirus software plus safe browsing habits plus regular updates is the winning combination!",
      },
    ],
  },
  miniGame: { type: "virus-spotter", title: "Virus Spotter", description: "Find hidden viruses before time runs out!" },
  wordSearch: {
    junior: { size: 8, words: ["VIRUS", "SAFE", "SCAN", "STOP", "HELP"] },
    defender: { size: 12, words: ["MALWARE", "VIRUS", "RANSOMWARE", "SPYWARE", "ANTIVIRUS", "PROTECT", "SCAN"] },
    guardian: { size: 15, words: ["RANSOMWARE", "TROJAN", "SPYWARE", "ROOTKIT", "KEYLOGGER", "BOTNET", "EXPLOIT"] },
  },
  dragDrop: {
    items: [
      { text: "Locks your files and demands money", bucket: "💰 RANSOMWARE" },
      { text: "Secretly watches everything you type", bucket: "👁️ SPYWARE" },
      { text: "Copies itself and spreads to other devices", bucket: "🦠 VIRUS" },
      { text: "Pretends to be a safe program but is harmful", bucket: "🎭 TROJAN" },
    ],
    buckets: ["💰 RANSOMWARE", "👁️ SPYWARE", "🦠 VIRUS", "🎭 TROJAN"],
  },
};

const updateOutpostGames: ZoneGameContent = {
  quiz: {
    title: "Software Updates",
    questions: [
      {
        q: "Why are software updates important?",
        choices: [
          "They make apps look different",
          "They fix security vulnerabilities that hackers could exploit",
          "They use up storage",
          "They slow down your device",
        ],
        answer: 1,
        explanation: "Updates patch security holes that hackers exploit — always keep software updated!",
      },
      {
        q: "What is a security patch?",
        choices: [
          "A sticker for your device",
          "A fix for a discovered security weakness in software",
          "A type of antivirus",
          "A device screen cover",
        ],
        answer: 1,
        explanation: "Security patches close vulnerabilities before hackers can exploit them!",
      },
      {
        q: "You've been ignoring an update for weeks. What risk does this create?",
        choices: [
          "None — updates aren't important",
          "Your device has known vulnerabilities that hackers can exploit",
          "The app might look different",
          "Your storage might fill up",
        ],
        answer: 1,
        explanation: "Unpatched vulnerabilities are open doors for hackers — update as soon as possible!",
      },
      {
        q: "Where should software updates come from?",
        choices: [
          "Links in emails",
          "Pop-up ads on websites",
          "Official app stores or the software developer's official website",
          "Friends' recommendations",
        ],
        answer: 2,
        explanation: "Only update through official channels — fake update prompts are a common malware trick!",
      },
      {
        q: "What is the BEST setting for updates on your device?",
        choices: [
          "Manual only — never auto-update",
          "Automatic updates so you're always protected",
          "Never update — it changes things",
          "Update only when the device breaks",
        ],
        answer: 1,
        explanation: "Automatic updates ensure you're always protected with the latest security fixes!",
      },
    ],
  },
  miniGame: {
    type: "update-simulator",
    title: "Update Simulator",
    description: "Identify legitimate vs fake updates!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Fixes security holes in software",
        answer: "PATCH",
        juniorClue: "Fix it",
        guardianClue: "Binary delta addressing CVE-identified vulnerabilities",
      },
      {
        number: 4,
        direction: "across",
        clue: "Software designed to protect your device from threats",
        answer: "ANTIVIRUS",
        juniorClue: "Safety scanner",
        guardianClue: "Heuristic and signature-based malware detection engine",
      },
      {
        number: 6,
        direction: "across",
        clue: "Keep software __ to stay protected",
        answer: "UPDATED",
        juniorClue: "Make new",
        guardianClue: "Current revision incorporating latest security patches",
      },
      {
        number: 2,
        direction: "down",
        clue: "A weakness hackers can exploit",
        answer: "VULNERABILITY",
        juniorClue: "Weak spot",
        guardianClue: "Exploitable defect in system security posture",
      },
      {
        number: 3,
        direction: "down",
        clue: "Harmful software on your device",
        answer: "MALWARE",
        juniorClue: "Bad program",
        guardianClue: "Malicious executable payload",
      },
      {
        number: 5,
        direction: "down",
        clue: "The best update setting — happens by itself",
        answer: "AUTOMATIC",
        juniorClue: "By itself",
        guardianClue: "Unattended background patch deployment",
      },
    ],
    wordBank: ["PATCH", "ANTIVIRUS", "UPDATED", "VULNERABILITY", "MALWARE", "AUTOMATIC"],
  },
  dragDrop: {
    items: [
      { text: "Security patch for a critical vulnerability", bucket: "⚡ UPDATE NOW" },
      { text: "A cosmetic theme update", bucket: "🕐 CAN WAIT" },
      { text: "Antivirus definition update", bucket: "⚡ UPDATE NOW" },
      { text: "New emoji pack", bucket: "🕐 CAN WAIT" },
      { text: "Operating system security update", bucket: "⚡ UPDATE NOW" },
      { text: "Update from a pop-up ad", bucket: "🚫 NOT NEEDED — SCAM" },
    ],
    buckets: ["⚡ UPDATE NOW", "🕐 CAN WAIT", "🚫 NOT NEEDED — SCAM"],
  },
};

const antivirusAtollGames: ZoneGameContent = {
  quiz: {
    title: "Antivirus and Device Protection",
    questions: [
      {
        q: "What does antivirus software do?",
        choices: [
          "Makes your device faster",
          "Detects and removes malware and viruses from your device",
          "Blocks all websites",
          "Manages your passwords",
        ],
        answer: 1,
        explanation: "Antivirus software scans for and removes harmful software protecting your device!",
      },
      {
        q: "How often should you scan your device for viruses?",
        choices: [
          "Never — it's not necessary",
          "Regularly, or set up automatic scheduled scans",
          "Only when something goes wrong",
          "Once a year",
        ],
        answer: 1,
        explanation: "Regular scans catch threats early — set up automatic scans for best protection!",
      },
      {
        q: "Your antivirus says a file is dangerous. What should you do?",
        choices: [
          "Ignore the warning and open it",
          "Delete the file and tell a trusted adult",
          "Turn off the antivirus",
          "Share the file with friends",
        ],
        answer: 1,
        explanation: "Always trust your antivirus warnings — delete the file and tell a trusted adult!",
      },
      {
        q: "What sign might indicate your device has malware?",
        choices: [
          "It works perfectly",
          "It suddenly becomes very slow, crashes often, or shows strange pop-ups",
          "It charges faster",
          "The screen is brighter",
        ],
        answer: 1,
        explanation: "Slowness, crashes, and strange pop-ups are classic signs of malware infection!",
      },
      {
        q: "What is the best complete device protection strategy?",
        choices: [
          "Antivirus only",
          "Updates only",
          "Antivirus + regular updates + safe browsing habits + trusted adult supervision",
          "Never using the internet",
        ],
        answer: 2,
        explanation: "Layered protection is best — antivirus, updates, safe habits, and trusted adult guidance!",
      },
    ],
  },
  miniGame: { type: "antivirus-lab", title: "Antivirus Lab", description: "Match antivirus tools to virus types!" },
  wordSearch: {
    junior: { size: 8, words: ["SCAN", "SAFE", "CLEAN", "BLOCK", "GUARD"] },
    defender: { size: 12, words: ["ANTIVIRUS", "SCANNER", "QUARANTINE", "PROTECT", "MALWARE", "DETECT", "REMOVE"] },
    guardian: {
      size: 15,
      words: ["QUARANTINE", "HEURISTIC", "SIGNATURE", "REALTIME", "DETECTION", "SANDBOXING", "REMEDIATION"],
    },
  },
  dragDrop: {
    items: [
      { text: "Antivirus installed and updated", bucket: "🛡️ PROTECTED" },
      { text: "No antivirus software", bucket: "⚠️ VULNERABLE" },
      { text: "All software up to date", bucket: "🛡️ PROTECTED" },
      { text: "Months of ignored updates", bucket: "⚠️ VULNERABLE" },
      { text: "Only downloads from official sources", bucket: "🛡️ PROTECTED" },
      { text: "Downloads from random websites", bucket: "⚠️ VULNERABLE" },
    ],
    buckets: ["🛡️ PROTECTED", "⚠️ VULNERABLE"],
  },
};

/* ─── ANTARCTICA ─────────────────────────────────────── */

const cryptoCavernGames: ZoneGameContent = {
  quiz: {
    title: "Cryptography Basics",
    questions: [
      {
        q: "What is cryptography?",
        choices: [
          "The study of caves",
          "The science of writing and solving codes to protect information",
          "A type of currency",
          "A computer programming language",
        ],
        answer: 1,
        explanation:
          "Cryptography is the ancient and modern science of encoding messages so only the right person can read them!",
      },
      {
        q: "What is a Caesar cipher?",
        choices: [
          "A type of salad",
          "A simple encryption method that shifts letters by a fixed number",
          "A computer program",
          "A type of firewall",
        ],
        answer: 1,
        explanation: "Julius Caesar used this cipher — shift each letter by 3 positions to encrypt!",
      },
      {
        q: "If A=1, B=2, C=3 — what does '8-5-12-12-15' spell?",
        choices: ["WORLD", "HELLO", "CYBER", "GUARD"],
        answer: 1,
        explanation: "8=H, 5=E, 12=L, 12=L, 15=O — HELLO! You decoded your first cipher!",
      },
      {
        q: "Why is encryption used in everyday apps?",
        choices: [
          "To make apps look complicated",
          "To protect your messages and data from being read by anyone except the intended recipient",
          "To slow down hackers",
          "To make apps use less battery",
        ],
        answer: 1,
        explanation: "End-to-end encryption means only you and the person you're messaging can read your messages!",
      },
      {
        q: "What does end-to-end encryption mean?",
        choices: [
          "The message is encrypted at the start and end of the word",
          "Only the sender and recipient can read the message — nobody else",
          "The message is deleted after reading",
          "The message is backed up twice",
        ],
        answer: 1,
        explanation: "End-to-end encryption means even the app company can't read your messages!",
      },
    ],
  },
  miniGame: {
    type: "caesar-cipher",
    title: "Caesar Cipher Decoder",
    description: "Decode SHADOWBYTE's encrypted message!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Science of writing and solving codes",
        answer: "CRYPTOGRAPHY",
        juniorClue: "Secret codes",
        guardianClue: "Mathematical discipline of secure communication",
      },
      {
        number: 4,
        direction: "across",
        clue: "Simple letter-shifting cipher used by Roman emperors",
        answer: "CAESAR",
        juniorClue: "Roman code",
        guardianClue: "Substitution cipher with fixed alphabetic rotation",
      },
      {
        number: 6,
        direction: "across",
        clue: "Only sender and receiver can read this type of message",
        answer: "ENCRYPTED",
        juniorClue: "Secret message",
        guardianClue: "Ciphertext produced by cryptographic transformation",
      },
      {
        number: 2,
        direction: "down",
        clue: "A secret code key",
        answer: "CIPHER",
        juniorClue: "Code type",
        guardianClue: "Algorithm for encryption and decryption",
      },
      {
        number: 3,
        direction: "down",
        clue: "Scrambled data",
        answer: "ENCODED",
        juniorClue: "Mixed up",
        guardianClue: "Data transformed via encoding scheme",
      },
      {
        number: 5,
        direction: "down",
        clue: "Unscrambling a secret message",
        answer: "DECRYPT",
        juniorClue: "Solve it",
        guardianClue: "Reverse cryptographic transformation to plaintext",
      },
    ],
    wordBank: ["CRYPTOGRAPHY", "CAESAR", "ENCRYPTED", "CIPHER", "ENCODED", "DECRYPT"],
  },
  dragDrop: {
    items: [
      { text: "WhatsApp message (end-to-end encrypted)", bucket: "🔐 ENCRYPTED" },
      { text: "Plain text email with no security", bucket: "📖 UNENCRYPTED" },
      { text: "HTTPS website connection", bucket: "🔐 ENCRYPTED" },
      { text: "HTTP website with no padlock", bucket: "📖 UNENCRYPTED" },
      { text: "Password stored as a hash", bucket: "🔐 ENCRYPTED" },
      { text: "Password written in plain text in a file", bucket: "📖 UNENCRYPTED" },
    ],
    buckets: ["🔐 ENCRYPTED", "📖 UNENCRYPTED"],
  },
};

const algorithmAbyssGames: ZoneGameContent = {
  quiz: {
    title: "Ethical Hacking",
    questions: [
      {
        q: "What is an ethical hacker?",
        choices: [
          "A criminal who hacks for money",
          "A security professional who tests systems with permission to find vulnerabilities",
          "Someone who hacks their own device",
          "A hacker who only hacks at night",
        ],
        answer: 1,
        explanation: "Ethical hackers have permission to hack systems to find and fix weaknesses before criminals do!",
      },
      {
        q: "What is the key difference between ethical and unethical hacking?",
        choices: [
          "The tools they use",
          "Permission — ethical hackers always have authorization",
          "The time of day",
          "The speed of hacking",
        ],
        answer: 1,
        explanation: "Permission is everything — ethical hackers are always authorized by the system owner!",
      },
      {
        q: "What is a vulnerability?",
        choices: [
          "A type of password",
          "A weakness in a system that could be exploited by attackers",
          "A security feature",
          "A type of firewall rule",
        ],
        answer: 1,
        explanation: "Vulnerabilities are weaknesses — ethical hackers find them so developers can fix them!",
      },
      {
        q: "What should you do if you accidentally find a security vulnerability in a website?",
        choices: [
          "Exploit it for personal gain",
          "Keep it secret",
          "Report it responsibly to the website owner or a trusted adult",
          "Tell all your friends",
        ],
        answer: 2,
        explanation: "Responsible disclosure means reporting vulnerabilities so they can be fixed!",
      },
      {
        q: "Which of these is a cybersecurity career?",
        choices: ["Penetration Tester", "Social Media Manager", "Graphic Designer", "Video Editor"],
        answer: 0,
        explanation:
          "Penetration testers are paid ethical hackers who help companies find and fix security weaknesses!",
      },
    ],
  },
  miniGame: { type: "pattern-breaker", title: "Pattern Breaker", description: "Break SHADOWBYTE's attack patterns!" },
  wordSearch: {
    junior: { size: 8, words: ["HACK", "FIND", "FIX", "SAFE", "GOOD"] },
    defender: {
      size: 12,
      words: ["ETHICAL", "HACKING", "PERMISSION", "TESTING", "SECURITY", "VULNERABILITY", "REPORT"],
    },
    guardian: {
      size: 15,
      words: ["PENETRATION", "VULNERABILITY", "AUTHORIZATION", "RESPONSIBLE", "DISCLOSURE", "EXPLOITATION", "ETHICAL"],
    },
  },
  dragDrop: {
    items: [
      { text: "Hacking with written permission from the owner", bucket: "✅ ETHICAL HACKER" },
      { text: "Breaking into systems without permission", bucket: "🚨 UNETHICAL HACKER" },
      { text: "Reporting a vulnerability to the website owner", bucket: "✅ ETHICAL HACKER" },
      { text: "Stealing data after finding a vulnerability", bucket: "🚨 UNETHICAL HACKER" },
      { text: "Testing your own device's security", bucket: "✅ ETHICAL HACKER" },
      { text: "Selling stolen passwords online", bucket: "🚨 UNETHICAL HACKER" },
    ],
    buckets: ["✅ ETHICAL HACKER", "🚨 UNETHICAL HACKER"],
  },
};

const codeCitadelGames: ZoneGameContent = {
  quiz: {
    title: "Cybersecurity Careers and Final Preparation",
    questions: [
      {
        q: "Which of these is a real cybersecurity job?",
        choices: ["Cyber Chef", "Security Analyst", "Digital Painter", "Internet Architect"],
        answer: 1,
        explanation: "Security Analysts monitor networks and systems for threats — a real and important career!",
      },
      {
        q: "What does a Chief Information Security Officer (CISO) do?",
        choices: [
          "Makes coffee for the IT team",
          "Leads an organization's entire cybersecurity strategy",
          "Designs company logos",
          "Manages social media",
        ],
        answer: 1,
        explanation: "The CISO is the top cybersecurity leader in an organization!",
      },
      {
        q: "What qualification helps you start a cybersecurity career?",
        choices: [
          "A cooking certificate",
          "CompTIA Security+ or similar cybersecurity certification",
          "A driving licence",
          "A sports award",
        ],
        answer: 1,
        explanation: "Certifications like CompTIA Security+ are entry-level qualifications for cybersecurity careers!",
      },
      {
        q: "You are now a Cyber Hero. What is your most important mission?",
        choices: [
          "Hack as many systems as possible",
          "Protect yourself and others online and never stop learning",
          "Keep all cybersecurity knowledge secret",
          "Only protect your own devices",
        ],
        answer: 1,
        explanation: "A true Cyber Hero never stops learning and always helps protect others!",
      },
      {
        q: "SHADOWBYTE's final question: What is the ULTIMATE cybersecurity defence?",
        choices: [
          "The most expensive antivirus",
          "A combination of strong passwords, 2FA, updates, safe habits, AND education",
          "Never using the internet",
          "The strongest firewall money can buy",
        ],
        answer: 1,
        explanation:
          "No single tool is enough — layered security combining technology AND knowledge is always strongest!",
      },
    ],
  },
  miniGame: {
    type: "career-matcher",
    title: "Cyber Career Matcher",
    description: "Match cybersecurity jobs to their descriptions!",
  },
  crossword: {
    clues: [
      {
        number: 1,
        direction: "across",
        clue: "Science of protecting digital systems",
        answer: "CYBERSECURITY",
        juniorClue: "Online safety",
        guardianClue: "Discipline of protecting digital infrastructure",
      },
      {
        number: 5,
        direction: "across",
        clue: "Ethical hacker who tests systems with permission",
        answer: "PENTESTER",
        juniorClue: "Safe hacker",
        guardianClue: "Authorized offensive security professional",
      },
      {
        number: 7,
        direction: "across",
        clue: "The S in CISO stands for this",
        answer: "SECURITY",
        juniorClue: "Being safe",
        guardianClue: "Information assurance domain",
      },
      {
        number: 2,
        direction: "down",
        clue: "Protects your network from unauthorized access",
        answer: "FIREWALL",
        juniorClue: "Network guard",
        guardianClue: "Packet-filtering network security appliance",
      },
      {
        number: 3,
        direction: "down",
        clue: "Second verification layer for login",
        answer: "TWOFACTOR",
        juniorClue: "Extra check",
        guardianClue: "Multi-factor authentication protocol",
      },
      {
        number: 4,
        direction: "down",
        clue: "Harmful software — collective term",
        answer: "MALWARE",
        juniorClue: "Bad program",
        guardianClue: "Malicious executable payload",
      },
      {
        number: 6,
        direction: "down",
        clue: "Scrambling data to protect it",
        answer: "ENCRYPTION",
        juniorClue: "Secret code",
        guardianClue: "Cryptographic data transformation",
      },
    ],
    wordBank: ["CYBERSECURITY", "PENTESTER", "SECURITY", "FIREWALL", "TWOFACTOR", "MALWARE", "ENCRYPTION"],
  },
  dragDrop: {
    items: [
      { text: "Finds vulnerabilities in systems", bucket: "🔍 PENETRATION TESTER" },
      { text: "Monitors networks for threats 24/7", bucket: "👁️ SECURITY ANALYST" },
      { text: "Leads an organization's security strategy", bucket: "👔 CISO" },
      { text: "Responds to active cyberattacks", bucket: "🚨 INCIDENT RESPONDER" },
    ],
    buckets: ["🔍 PENETRATION TESTER", "👁️ SECURITY ANALYST", "👔 CISO", "🚨 INCIDENT RESPONDER"],
  },
};

/* ─── BOSS BATTLES ──────────────────────────────────── */

export const BOSS_BATTLES: Record<string, BossBattleContent> = {
  "boss-keybreaker": {
    quizQuestions: [
      ...passwordPeakGames.quiz.questions.slice(0, 2),
      ...encryptEnclaveGames.quiz.questions.slice(0, 1),
      ...codeCanyonGames.quiz.questions.slice(0, 1),
      ...signalSummitGames.quiz.questions.slice(0, 1),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Block the Keybreaker's Attacks",
      items: [
        { text: "CRACKING: password123", correctAction: "SHIELD", explanation: "Weak password — easily cracked!" },
        { text: "CRACKING: fluffy2010", correctAction: "SHIELD", explanation: "Pet name + year — never use these!" },
        {
          text: "CRACKING: X$7mK!9pQ#",
          correctAction: "DODGE",
          explanation: "Strong password — can't crack this one!",
        },
        {
          text: "SCAM: Free V-Bucks for your password!",
          correctAction: "SHIELD",
          explanation: "Never give your password for free items!",
        },
        {
          text: "FAKE WIFI: Free_Keybreaker_Wifi",
          correctAction: "SHIELD",
          explanation: "Fake hotspot — don't connect!",
        },
        {
          text: "Your 2FA code is active!",
          correctAction: "DODGE",
          explanation: "2FA protects you even if password is stolen!",
        },
        { text: "CRACKING: mybirthday", correctAction: "SHIELD", explanation: "Personal info — too easy to guess!" },
        { text: "CRACKING: Qr#5!vL@8z", correctAction: "DODGE", explanation: "Random characters — very secure!" },
      ],
    },
  },
  "boss-phisher": {
    quizQuestions: [
      ...phishLagoonGames.quiz.questions.slice(0, 2),
      ...downloadDungeonGames.quiz.questions.slice(0, 2),
      ...(codeCastleGames.quiz.questions[0] ? [codeCastleGames.quiz.questions[0]] : []),
    ],
    defenseRound: {
      type: "scam-real",
      title: "Destroy the Phishing Nets",
      items: [
        { preview: "URGENT: Your account expires TODAY! Click here!", isScam: true },
        { preview: "Hi! Here are your homework notes from class", isScam: false },
        { preview: "Congratulations! You've won a FREE iPhone!", isScam: true },
        { preview: "Your library book is due back on Friday", isScam: false },
        { preview: "VERIFY your password or account DELETED", isScam: true },
        { preview: "Reminder: Football practice at 4pm tomorrow", isScam: false },
        { preview: "Click NOW to claim your prize money!", isScam: true },
        { preview: "School newsletter — this month's events", isScam: false },
      ],
    },
  },
  "boss-troll": {
    quizQuestions: [
      ...strangerShoreGames.quiz.questions.slice(0, 2),
      ...darkWebDenGames.quiz.questions.slice(0, 1),
      ...kindnessCitadelGames.quiz.questions.slice(0, 2),
    ],
    defenseRound: {
      type: "kindness",
      title: "Spread Kindness to Defeat the Troll",
      items: [
        {
          attack: "You're terrible at games!",
          kindResponse: "Everyone is learning at their own pace!",
          wrongResponses: ["Whatever, you're worse!", "I don't care"],
        },
        {
          attack: "Nobody wants to be your friend!",
          kindResponse: "You seem really cool — want to play together?",
          wrongResponses: ["You have no friends either!", "Go away"],
        },
        {
          attack: "Your drawing looks awful!",
          kindResponse: "I love your creativity — keep drawing!",
          wrongResponses: ["Yours is worse!", "I'll stop drawing then"],
        },
        {
          attack: "You're so slow!",
          kindResponse: "You're doing great — keep going!",
          wrongResponses: ["At least I'm not mean!", "Fine, I quit"],
        },
        {
          attack: "Give up, you'll never win!",
          kindResponse: "I believe in you — don't stop!",
          wrongResponses: ["You'll never win either!", "Maybe you're right"],
        },
      ],
    },
  },
  "boss-phantom": {
    quizQuestions: [
      ...privacyPalaceGames.quiz.questions.slice(0, 1),
      ...browseBazaarGames.quiz.questions.slice(0, 1),
      ...firewallFrontierGames.quiz.questions.slice(0, 1),
      ...cyberguardAcademyGames.quiz.questions.slice(0, 2),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Trap the Phantom",
      items: [
        {
          text: "PHISHING GHOST approaches!",
          correctAction: "SHIELD",
          explanation: "Use email filter to trap phishing ghost!",
        },
        {
          text: "MALWARE GHOST phases through!",
          correctAction: "SHIELD",
          explanation: "Antivirus scan catches the malware ghost!",
        },
        {
          text: "FIREWALL GHOST detected!",
          correctAction: "SHIELD",
          explanation: "Firewall blocks the network ghost!",
        },
        {
          text: "Your strong password holds!",
          correctAction: "DODGE",
          explanation: "Strong passwords can't be cracked!",
        },
        {
          text: "PRIVACY GHOST tries to steal data!",
          correctAction: "SHIELD",
          explanation: "Privacy settings stop the data theft!",
        },
      ],
    },
  },
  "boss-datathief": {
    quizQuestions: [
      ...kindnessKingdomGames.quiz.questions.slice(0, 2),
      ...socialFortressGames.quiz.questions.slice(0, 1),
      ...identityIsleGames.quiz.questions.slice(0, 2),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Protect the Data Cards",
      items: [
        {
          text: "Home Address flying away!",
          correctAction: "SHIELD",
          explanation: "Keep private — protect your address!",
        },
        { text: "Favourite Colour card", correctAction: "DODGE", explanation: "Favourite colour is safe to share!" },
        { text: "School Name escaping!", correctAction: "SHIELD", explanation: "Keep private — protect school info!" },
        { text: "Favourite Movie card", correctAction: "DODGE", explanation: "Favourite movie is safe to share!" },
        {
          text: "Phone Number data card!",
          correctAction: "SHIELD",
          explanation: "Keep private — protect your number!",
        },
        { text: "Hobby: Drawing card", correctAction: "DODGE", explanation: "Hobbies are safe to share!" },
      ],
    },
  },
  "boss-malware": {
    quizQuestions: [
      ...malwareMazeGames.quiz.questions.slice(0, 2),
      ...updateOutpostGames.quiz.questions.slice(0, 1),
      ...antivirusAtollGames.quiz.questions.slice(0, 2),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Zap the Viruses",
      items: [
        {
          text: "RANSOMWARE hops out!",
          correctAction: "SHIELD",
          explanation: "Backup and restore defeats ransomware!",
        },
        { text: "SPYWARE creeping in!", correctAction: "SHIELD", explanation: "Antivirus scan catches spyware!" },
        {
          text: "Your updated system is strong!",
          correctAction: "DODGE",
          explanation: "Updated systems resist attacks!",
        },
        { text: "TROJAN disguised as game!", correctAction: "SHIELD", explanation: "Delete suspicious files!" },
        { text: "FAKE UPDATE popup!", correctAction: "SHIELD", explanation: "Ignore and report fake updates!" },
      ],
    },
  },
  "boss-shadowbyte": {
    isFinalBoss: true,
    quizQuestions: [
      ...passwordPeakGames.quiz.questions.slice(0, 1),
      ...phishLagoonGames.quiz.questions.slice(0, 1),
      ...strangerShoreGames.quiz.questions.slice(0, 1),
      ...privacyPalaceGames.quiz.questions.slice(0, 1),
      ...kindnessKingdomGames.quiz.questions.slice(0, 1),
      ...malwareMazeGames.quiz.questions.slice(0, 1),
      ...cryptoCavernGames.quiz.questions.slice(0, 1),
      ...codeCitadelGames.quiz.questions.slice(0, 1),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Ultimate Defence",
      items: [
        { text: "PHISHING EMAIL attack!", correctAction: "SHIELD", explanation: "Report and delete phishing emails!" },
        { text: "WEAK PASSWORD vulnerability!", correctAction: "SHIELD", explanation: "Change to a strong password!" },
        {
          text: "Your FIREWALL holds strong!",
          correctAction: "DODGE",
          explanation: "Firewalls block unauthorized access!",
        },
        {
          text: "CYBERBULLY message incoming!",
          correctAction: "SHIELD",
          explanation: "Block and report cyberbullies!",
        },
        { text: "STRANGER requests data!", correctAction: "SHIELD", explanation: "Tell a trusted adult!" },
        { text: "FAKE UPDATE detected!", correctAction: "SHIELD", explanation: "Ignore fake updates!" },
        { text: "Your ENCRYPTION is unbreakable!", correctAction: "DODGE", explanation: "Encrypted data stays safe!" },
        { text: "DATA THEFT attempt!", correctAction: "SHIELD", explanation: "Keep personal info private!" },
      ],
    },
    finalRound: {
      title: "Break SHADOWBYTE's Code",
      patterns: [
        { sequence: ["🔴", "🔵", "🔴", "🔵", "🔴"], answer: "🔵", options: ["🔴", "🔵", "🟢"] },
        { sequence: ["🛡️", "🛡️", "⚔️", "🛡️", "🛡️"], answer: "⚔️", options: ["🛡️", "⚔️", "🔒"] },
        { sequence: ["1", "2", "4", "8"], answer: "16", options: ["10", "12", "16"] },
      ],
    },
  },
};

/* ─── ZONE GAME REGISTRY ───────────────────────────── */

export const ZONE_GAMES: Record<string, ZoneGameContent> = {
  // North America
  hq: hqGames,
  "password-peak": passwordPeakGames,
  "encrypt-enclave": encryptEnclaveGames,
  "code-canyon": codeCanyonGames,
  "signal-summit": signalSummitGames,
  "arctic-archive": arcticArchiveGames,
  "pixel-port": pixelPortGames,
  "shadow-station": shadowStationGames,
  "firewall-fortress": firewallFrontierGames,
  // Europe
  "phish-lagoon": phishLagoonGames,
  "download-dungeon": downloadDungeonGames,
  "code-castle": codeCastleGames,
  // Africa
  "stranger-shore": strangerShoreGames,
  "dark-web-den": darkWebDenGames,
  "kindness-citadel": kindnessCitadelGames,
  // Asia
  "privacy-palace": privacyPalaceGames,
  "browse-bazaar": browseBazaarGames,
  "firewall-frontier": firewallFrontierGames,
  "cyberguard-academy": cyberguardAcademyGames,
  // South America
  "kindness-kingdom": kindnessKingdomGames,
  "social-fortress": socialFortressGames,
  "identity-isle": identityIsleGames,
  // Australia
  "malware-maze": malwareMazeGames,
  "update-outpost": updateOutpostGames,
  "antivirus-atoll": antivirusAtollGames,
  // Antarctica
  "crypto-cavern": cryptoCavernGames,
  "algorithm-abyss": algorithmAbyssGames,
  "code-citadel": codeCitadelGames,
};

/** Get game content for a zone. Returns undefined if no games defined yet. */
export function getZoneGames(zoneId: string): ZoneGameContent | undefined {
  return ZONE_GAMES[zoneId];
}

/** Get boss battle content. Returns undefined if not defined. */
export function getBossBattle(bossId: string): BossBattleContent | undefined {
  return BOSS_BATTLES[bossId];
}
