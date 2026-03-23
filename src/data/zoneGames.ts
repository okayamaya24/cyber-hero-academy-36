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
  type: string; // component name identifier
  title: string;
  description: string;
}

export interface ZoneGameContent {
  quiz: { title: string; questions: ZoneQuizQuestion[] };
  miniGame: ZoneMiniGameDef;
  /** Either wordSearch OR crossword — the 3rd game slot */
  wordSearch?: ZoneWordSearch;
  crossword?: ZoneCrossword;
  dragDrop: ZoneDragDrop;
}

export interface BossBattleContent {
  quizQuestions: ZoneQuizQuestion[];
  defenseRound: {
    type: "shield-dodge" | "scam-real" | "kindness";
    title: string;
    items: any[];
  };
}

/* ─── NORTH AMERICA ─────────────────────────────────── */

const hqGames: ZoneGameContent = {
  quiz: {
    title: "Welcome to Cyber Hero Academy",
    questions: [
      { q: "What is the internet?", choices: ["A place to play games only", "A giant network connecting computers worldwide", "A type of computer", "A television channel"], answer: 1, explanation: "The internet connects billions of computers and devices worldwide!" },
      { q: "Which of these is safe to share online with strangers?", choices: ["Your home address", "Your full name", "Your favourite colour", "Your school name"], answer: 2, explanation: "Your favourite colour is harmless to share — the others could be used to find you!" },
      { q: "What should you do if something online makes you feel scared or uncomfortable?", choices: ["Keep it secret", "Tell a trusted adult immediately", "Share it with friends", "Ignore it"], answer: 1, explanation: "Always tell a trusted adult — they can help keep you safe!" },
      { q: "What is a Cyber Hero?", choices: ["Someone who hacks computers", "Someone who stays safe online and helps others do the same", "A character in a video game", "Someone who never uses the internet"], answer: 1, explanation: "A Cyber Hero protects themselves and others in the digital world!" },
      { q: "Which of these is a trusted adult you could go to if something goes wrong online?", choices: ["A stranger you met in a game", "An online friend", "A parent, teacher, or guardian", "Anyone who seems nice"], answer: 2, explanation: "Parents, teachers, and guardians are your go-to trusted adults!" },
    ],
  },
  miniGame: { type: "profile-builder", title: "Cyber Hero Profile Builder", description: "Create your operative identity!" },
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
      { q: "Which password is the strongest?", choices: ["password123", "fluffy", "T#9kL!2mP$", "mybirthday"], answer: 2, explanation: "T#9kL!2mP$ uses uppercase, lowercase, numbers AND symbols — super strong!" },
      { q: "How long should a strong password be?", choices: ["4 characters", "6 characters", "At least 8 characters", "2 characters"], answer: 2, explanation: "Longer passwords are harder to crack — aim for 8 or more characters!" },
      { q: "Which of these should you NEVER use in a password?", choices: ["Symbols like ! or #", "Your birthday or pet's name", "Random numbers", "Uppercase letters"], answer: 1, explanation: "Hackers try birthdays and pet names first — never use personal info!" },
      { q: "What should you do if you think someone knows your password?", choices: ["Keep using it", "Change it immediately and tell a trusted adult", "Share it with a friend", "Write it on paper"], answer: 1, explanation: "Change it right away and let a trusted adult know!" },
      { q: "Is it okay to share your password with your best friend?", choices: ["Yes, best friends can be trusted", "Only if they promise not to tell", "No — keep passwords private, even from friends", "Only your game passwords"], answer: 2, explanation: "Even best friends shouldn't know your password — keep it private!" },
    ],
  },
  miniGame: { type: "password-builder", title: "Password Builder", description: "Build the strongest password you can!" },
  wordSearch: {
    junior: { size: 8, words: ["LOCK", "SAFE", "CODE", "KEY", "HIDE"] },
    defender: { size: 12, words: ["PASSWORD", "STRONG", "UPPERCASE", "NUMBER", "SYMBOL", "SECURE", "LOCK", "PROTECT"] },
    guardian: { size: 15, words: ["ENCRYPTION", "ALPHANUMERIC", "AUTHENTICATION", "UPPERCASE", "CYBERSECURE", "FIREWALL", "PROTOCOL"] },
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
      { q: "What does encryption do?", choices: ["Deletes your files", "Scrambles data so only the right person can read it", "Makes your computer faster", "Blocks websites"], answer: 1, explanation: "Encryption scrambles your data into a secret code only you can unlock!" },
      { q: "What is a padlock icon in your browser's address bar?", choices: ["The page is broken", "The website is encrypted and safe", "You need to pay to visit", "The page is loading"], answer: 1, explanation: "A padlock means the website uses encryption to protect your data!" },
      { q: "What does HTTPS stand for?", choices: ["Hyper Text Transfer Protocol Secure", "High Tech Transfer Program System", "Home Technology Protection Service", "Hyper Text Tracking Protection System"], answer: 0, explanation: "HTTPS means the website uses secure encrypted communication!" },
      { q: "Why is encryption important?", choices: ["It makes websites look nicer", "It keeps your private information safe from hackers", "It makes the internet faster", "It lets you play games online"], answer: 1, explanation: "Encryption protects your passwords, messages, and personal info from hackers!" },
      { q: "Which website is safer to use?", choices: ["http://mybank.com", "https://mybank.com", "They are both the same", "Neither is safe"], answer: 1, explanation: "HTTPS means encrypted — always look for the S before entering personal info!" },
    ],
  },
  miniGame: { type: "secret-code-maker", title: "Secret Code Maker", description: "Encrypt a secret message using a Caesar cipher!" },
  crossword: {
    clues: [
      { number: 1, direction: "across", clue: "Scrambled data that hackers can't read", answer: "ENCRYPTED", juniorClue: "Secret code", guardianClue: "Data rendered unintelligible via cryptographic transformation" },
      { number: 4, direction: "across", clue: "The padlock in your browser means this", answer: "SECURE", juniorClue: "Keeps you safe", guardianClue: "Protected state indicated by browser TLS certificate validation" },
      { number: 6, direction: "across", clue: "HTTPS stands for Hyper Text Transfer Protocol ___", answer: "SECURE", juniorClue: "Safe word", guardianClue: "The cryptographic layer suffix in web protocol nomenclature" },
      { number: 2, direction: "down", clue: "A secret code only you can unlock", answer: "KEY", juniorClue: "Opens locks", guardianClue: "Asymmetric cryptographic artifact used for decryption" },
      { number: 3, direction: "down", clue: "The S in HTTPS stands for this", answer: "SAFE", juniorClue: "Not dangerous", guardianClue: "Colloquial reference to Secure Sockets Layer protocol" },
      { number: 5, direction: "down", clue: "Look for this icon before entering passwords online", answer: "PADLOCK", juniorClue: "Lock picture", guardianClue: "Visual TLS/SSL indicator in browser chrome" },
    ],
    wordBank: ["ENCRYPTED", "SECURE", "KEY", "SAFE", "PADLOCK"],
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

/* ─── EUROPE ────────────────────────────────────────── */

const phishLagoonGames: ZoneGameContent = {
  quiz: {
    title: "Spot the Phisher King's Traps",
    questions: [
      { q: "What is phishing?", choices: ["A type of fishing sport", "Fake emails or messages trying to steal your information", "A computer virus", "A safe way to browse the internet"], answer: 1, explanation: "Phishing tricks you into giving away passwords or personal info using fake messages!" },
      { q: "You get an email saying 'YOU WON $1,000,000! Click here!' What do you do?", choices: ["Click it immediately", "Share it with friends", "Delete it — it's a scam", "Reply with your details"], answer: 2, explanation: "If it sounds too good to be true, it's a scam! Delete and tell a trusted adult." },
      { q: "A fake email pretending to be from your bank is called what?", choices: ["Spam", "Phishing", "Hacking", "Trolling"], answer: 1, explanation: "Phishing emails pretend to be from trusted sources to steal your info!" },
      { q: "How can you spot a phishing email?", choices: ["It looks exactly like a real email", "It has spelling mistakes and asks for personal info urgently", "It comes from a friend", "It has nice pictures"], answer: 1, explanation: "Phishing emails often have spelling mistakes and create urgency to trick you!" },
      { q: "What should you do if you accidentally clicked a suspicious link?", choices: ["Keep it secret", "Enter your details anyway", "Tell a trusted adult immediately and don't enter any information", "Close the tab and forget about it"], answer: 2, explanation: "Always tell a trusted adult right away — they can help protect your accounts!" },
    ],
  },
  miniGame: { type: "email-inspector", title: "Email Inspector", description: "Find all the suspicious parts of a phishing email!" },
  wordSearch: {
    junior: { size: 8, words: ["FAKE", "TRICK", "SAFE", "STOP", "TELL"] },
    defender: { size: 12, words: ["PHISHING", "SCAM", "FAKE", "VIRUS", "SPAM", "ALERT", "DANGER", "REPORT"] },
    guardian: { size: 15, words: ["PHISHING", "MALWARE", "SPOOFING", "CREDENTIAL", "RANSOMWARE", "INFILTRATE", "DECEPTION"] },
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
      { q: "Before downloading anything, what should you always do?", choices: ["Download it immediately", "Ask a trusted adult for permission", "Share it with friends first", "Click all the buttons"], answer: 1, explanation: "Always ask a trusted adult before downloading anything!" },
      { q: "Which of these is a SAFE place to download apps?", choices: ["A random website", "The official App Store or Google Play", "A link in an email", "A pop-up advertisement"], answer: 1, explanation: "Official app stores check apps for safety — always use them!" },
      { q: "A pop-up says 'Your device has a virus! Download this to fix it!' What do you do?", choices: ["Download it immediately", "Ignore it and tell a trusted adult", "Share the pop-up with friends", "Click yes on everything"], answer: 1, explanation: "This is a scam! Real virus alerts don't come from pop-ups. Tell a trusted adult!" },
      { q: "What is malware?", choices: ["A type of hardware", "Harmful software designed to damage your device", "A safe app", "A computer brand"], answer: 1, explanation: "Malware is malicious software designed to damage or steal from your device!" },
      { q: "You find a free version of a paid game on a random website. What should you do?", choices: ["Download it — free is great!", "Ask a trusted adult and only use official sources", "Share the link with your class", "Download it but don't tell anyone"], answer: 1, explanation: "Unofficial free downloads often contain hidden malware. Stick to official sources!" },
    ],
  },
  miniGame: { type: "file-scanner", title: "File Scanner", description: "Scan files on the conveyor belt — safe or infected?" },
  crossword: {
    clues: [
      { number: 1, direction: "across", clue: "Only download from ___ sources", answer: "OFFICIAL", juniorClue: "Real and true", guardianClue: "Vendor-authenticated distribution channel" },
      { number: 4, direction: "across", clue: "Harmful software hidden in downloads", answer: "MALWARE", juniorClue: "Bad program", guardianClue: "Malicious executable payload delivered via trojanised packages" },
      { number: 6, direction: "across", clue: "Always ask this person before downloading", answer: "ADULT", juniorClue: "Grown-up", guardianClue: "Responsible guardian with administrative privileges" },
      { number: 2, direction: "down", clue: "The official store for iPhone apps", answer: "APPSTORE", juniorClue: "Where to get apps", guardianClue: "Apple's curated software distribution platform" },
      { number: 3, direction: "down", clue: "A fake warning designed to scare you", answer: "POPUP", juniorClue: "Surprise box", guardianClue: "Browser-rendered modal injection used in scareware campaigns" },
      { number: 5, direction: "down", clue: "Check this before you download", answer: "PERMISSION", juniorClue: "Ask first", guardianClue: "Authorization scope requested by application binaries" },
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
      { q: "What is two-factor authentication (2FA)?", choices: ["Using two passwords", "A second check to prove it's really you logging in", "Two different usernames", "Logging in twice"], answer: 1, explanation: "2FA adds a second layer of security — like a password AND a code sent to your phone!" },
      { q: "Why is 2FA important?", choices: ["It makes logging in slower", "Even if someone steals your password they still can't get in", "It looks impressive", "It replaces your password"], answer: 1, explanation: "With 2FA, a stolen password alone isn't enough — hackers still can't access your account!" },
      { q: "Which of these is an example of 2FA?", choices: ["Using a long password", "Entering a code sent to your phone after your password", "Having two email accounts", "Using the same password twice"], answer: 1, explanation: "A code sent to your phone is the most common form of 2FA!" },
      { q: "Someone asks for the 2FA code that was sent to your phone. What do you do?", choices: ["Give it to them — they seem nice", "Never share it — it's private, like a password", "Only share it if they're a friend", "Post it online quickly"], answer: 1, explanation: "NEVER share your 2FA code with anyone — not even someone claiming to be from a company!" },
      { q: "What should you do if you get a 2FA code you didn't ask for?", choices: ["Enter it anyway", "Share it with friends", "Tell a trusted adult — someone may be trying to access your account", "Ignore it"], answer: 2, explanation: "An unexpected 2FA code means someone is trying to log into your account. Tell a trusted adult!" },
    ],
  },
  miniGame: { type: "two-factor-sim", title: "2FA Simulator", description: "Walk through setting up two-factor authentication!" },
  wordSearch: {
    junior: { size: 8, words: ["CODE", "SAFE", "LOCK", "PHONE", "CHECK"] },
    defender: { size: 12, words: ["AUTHENTICATION", "TWOFACTOR", "VERIFY", "PASSWORD", "SECURITY", "CODE", "PHONE"] },
    guardian: { size: 15, words: ["MULTIFACTOR", "AUTHENTICATION", "VERIFICATION", "BIOMETRIC", "CREDENTIAL", "PROTOCOL", "TWOSTEP"] },
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
      { q: "Someone you've never met in real life wants to be your friend online. What should you do?", choices: ["Accept immediately", "Tell a trusted adult and don't accept", "Share your address so they can visit", "Give them your phone number"], answer: 1, explanation: "Online strangers could be anyone. Always tell a trusted adult before accepting!" },
      { q: "An online friend asks where you go to school. What do you do?", choices: ["Tell them — it's just a school", "Don't share it and tell a trusted adult", "Give them your teacher's name too", "Post it on social media"], answer: 1, explanation: "Your school location is personal information — never share it with online strangers!" },
      { q: "What information is safe to share with online strangers?", choices: ["Your home address", "Your favourite colour", "Your phone number", "Your school name"], answer: 1, explanation: "Your favourite colour is harmless — never share location or contact details!" },
      { q: "Someone online is being very kind and giving you lots of compliments. Should you trust them completely?", choices: ["Yes — kind people are always safe", "No — be careful, some people use kindness to gain trust before asking for personal info", "Yes — share your address to meet them", "Yes — give them your password as a gift"], answer: 1, explanation: "Some people use kindness online to build trust before asking for dangerous things. Always stay alert!" },
      { q: "What should you do if an online stranger makes you feel uncomfortable?", choices: ["Keep talking to them", "Block them and tell a trusted adult immediately", "Share their messages with online friends", "Delete the app and say nothing"], answer: 1, explanation: "Block, stop talking, and always tell a trusted adult when something feels wrong!" },
    ],
  },
  miniGame: { type: "stranger-danger", title: "Stranger Danger Sorter", description: "Sort contacts into trusted vs unknown!" },
  wordSearch: {
    junior: { size: 8, words: ["SAFE", "TELL", "STOP", "HELP", "KIND"] },
    defender: { size: 12, words: ["PRIVATE", "SECRET", "ADDRESS", "SHARE", "TRUST", "STRANGER", "BLOCK", "HELP"] },
    guardian: { size: 15, words: ["ANONYMOUS", "ENCRYPTED", "GEOLOCATION", "SURVEILLANCE", "CONFIDENTIAL", "TRUSTWORTHY"] },
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
      { q: "What is the dark web?", choices: ["A spooky website for Halloween", "A hidden part of the internet used for illegal activities", "A dark-themed social media app", "A website that turns your screen dark"], answer: 1, explanation: "The dark web is a hidden part of the internet where illegal activities often happen — stay away!" },
      { q: "Should kids ever try to access the dark web?", choices: ["Yes, it sounds exciting", "No — it is dangerous and illegal for children", "Only with friends", "Yes, to learn about hacking"], answer: 1, explanation: "The dark web is dangerous and off limits. It's never safe for children to access it!" },
      { q: "What should you do if someone online offers to show you 'secret parts of the internet'?", choices: ["Follow their instructions", "Say no and tell a trusted adult immediately", "Only agree if they seem friendly", "Ask for more details first"], answer: 1, explanation: "Never let anyone guide you to hidden or secret online spaces — tell a trusted adult immediately!" },
      { q: "How can you identify a suspicious website?", choices: ["It has lots of colourful pictures", "It has no padlock, strange spelling, and asks for personal info", "It loads slowly", "It looks old-fashioned"], answer: 1, explanation: "No padlock, strange URLs, and requests for personal info are big warning signs!" },
      { q: "What does a safe website URL usually start with?", choices: ["http://", "www.", "https://", "mail://"], answer: 2, explanation: "https:// means the website is encrypted and safer to use!" },
    ],
  },
  miniGame: { type: "safe-sites-detector", title: "Safe Sites Detector", description: "Spot safe vs suspicious URLs!" },
  crossword: {
    clues: [
      { number: 1, direction: "across", clue: "Always ask this person before going online", answer: "PARENT", juniorClue: "Mum or Dad", guardianClue: "Primary custodial authority for minors' digital access" },
      { number: 3, direction: "across", clue: "Don't talk to these people online", answer: "STRANGER", juniorClue: "Unknown person", guardianClue: "Unverified entity with no established trust relationship" },
      { number: 5, direction: "across", clue: "A trustworthy website starts with this", answer: "HTTPS", juniorClue: "Safe letters", guardianClue: "TLS-encrypted HTTP protocol prefix" },
      { number: 7, direction: "across", clue: "What you should do to bad messages", answer: "REPORT", juniorClue: "Tell someone", guardianClue: "Formal notification to platform moderation systems" },
      { number: 2, direction: "down", clue: "Lock your account with this", answer: "PASSWORD", juniorClue: "Secret code", guardianClue: "Authentication credential string" },
      { number: 4, direction: "down", clue: "Keep this secret — your home location", answer: "ADDRESS", juniorClue: "Where you live", guardianClue: "Personally identifiable geospatial data" },
      { number: 6, direction: "down", clue: "Be kind online, this is called cyber ___", answer: "KINDNESS", juniorClue: "Being nice", guardianClue: "Prosocial digital behaviour promoting positive online culture" },
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
      { q: "What is cyberbullying?", choices: ["Playing games online", "Using technology to hurt, embarrass, or threaten someone", "Making new friends online", "Sending funny memes"], answer: 1, explanation: "Cyberbullying is using technology to hurt others — it's never okay!" },
      { q: "Someone posts a mean comment about your friend online. What should you do?", choices: ["Join in — everyone's doing it", "Ignore it completely", "Stand up for your friend and report the comment", "Share the comment"], answer: 2, explanation: "Be an upstander — support your friend and report the mean comment!" },
      { q: "What is an upstander?", choices: ["Someone who bullies others", "Someone who stands up for others when they see bullying", "Someone who watches bullying and does nothing", "A type of computer program"], answer: 1, explanation: "An upstander speaks up for others — be the hero someone needs!" },
      { q: "If someone sends you a mean message online, what should you do?", choices: ["Send an even meaner message back", "Don't respond, save the message, and tell a trusted adult", "Share it with everyone", "Delete it and say nothing"], answer: 1, explanation: "Don't retaliate — save the evidence and tell a trusted adult who can help!" },
      { q: "How can you make the internet a kinder place?", choices: ["Only talk to people you like", "Think before you post — would this hurt someone's feelings?", "Share everything you think", "Ignore others' feelings online"], answer: 1, explanation: "Always think before you post — kindness online makes the whole world better!" },
    ],
  },
  miniGame: { type: "kindness-shield", title: "Kindness Shield", description: "Deflect mean messages with kind responses!" },
  wordSearch: {
    junior: { size: 8, words: ["KIND", "HELP", "NICE", "CARE", "STOP"] },
    defender: { size: 12, words: ["KINDNESS", "UPSTANDER", "REPORT", "RESPECT", "SUPPORT", "BULLYING", "PROTECT"] },
    guardian: { size: 15, words: ["CYBERBULLYING", "UPSTANDER", "HARASSMENT", "EMPATHY", "BYSTANDER", "INTERVENTION", "RESPECT"] },
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

/* ─── BOSS BATTLES ──────────────────────────────────── */

export const BOSS_BATTLES: Record<string, BossBattleContent> = {
  "boss-keybreaker": {
    quizQuestions: [
      ...passwordPeakGames.quiz.questions.slice(0, 3),
      ...encryptEnclaveGames.quiz.questions.slice(0, 2),
    ],
    defenseRound: {
      type: "shield-dodge",
      title: "Block the Keybreaker's Attacks",
      items: [
        { text: "CRACKING: password123", correctAction: "SHIELD", explanation: "Weak password — easily cracked!" },
        { text: "CRACKING: fluffy2010", correctAction: "SHIELD", explanation: "Pet name + year — never use these!" },
        { text: "CRACKING: X$7mK!9pQ#", correctAction: "DODGE", explanation: "Strong password — can't crack this one!" },
        { text: "CRACKING: mybirthday", correctAction: "SHIELD", explanation: "Personal info — too easy to guess!" },
        { text: "CRACKING: Qr#5!vL@8z", correctAction: "DODGE", explanation: "Random characters — very secure!" },
      ],
    },
  },
  "boss-phisher": {
    quizQuestions: [
      ...phishLagoonGames.quiz.questions.slice(0, 2),
      ...downloadDungeonGames.quiz.questions.slice(0, 2),
      ...codeCastleGames.quiz.questions[0] ? [codeCastleGames.quiz.questions[0]] : [],
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
        { attack: "You're terrible at games!", kindResponse: "Everyone is learning at their own pace!", wrongResponses: ["Whatever, you're worse!", "I don't care"] },
        { attack: "Nobody wants to be your friend!", kindResponse: "You seem really cool — want to play together?", wrongResponses: ["You have no friends either!", "Go away"] },
        { attack: "Your drawing looks awful!", kindResponse: "I love your creativity — keep drawing!", wrongResponses: ["Yours is worse!", "I'll stop drawing then"] },
        { attack: "You're so slow!", kindResponse: "You're doing great — keep going!", wrongResponses: ["At least I'm not mean!", "Fine, I quit"] },
        { attack: "Give up, you'll never win!", kindResponse: "I believe in you — don't stop!", wrongResponses: ["You'll never win either!", "Maybe you're right"] },
      ],
    },
  },
};

/* ─── ZONE GAME REGISTRY ───────────────────────────── */

export const ZONE_GAMES: Record<string, ZoneGameContent> = {
  // North America
  "hq": hqGames,
  "password-peak": passwordPeakGames,
  "encrypt-enclave": encryptEnclaveGames,
  // Europe
  "phish-lagoon": phishLagoonGames,
  "download-dungeon": downloadDungeonGames,
  "code-castle": codeCastleGames,
  // Africa
  "stranger-shore": strangerShoreGames,
  "dark-web-den": darkWebDenGames,
  "kindness-citadel": kindnessCitadelGames,
};

/** Get game content for a zone. Returns undefined if no games defined yet. */
export function getZoneGames(zoneId: string): ZoneGameContent | undefined {
  return ZONE_GAMES[zoneId];
}

/** Get boss battle content. Returns undefined if not defined. */
export function getBossBattle(bossId: string): BossBattleContent | undefined {
  return BOSS_BATTLES[bossId];
}
