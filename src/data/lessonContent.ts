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
  | "trace-the-hacker"
  | "stranger-danger"
  | "download-inspector";

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
  tier?: "junior" | "defender" | "guardian"; // undefined = shown to all tiers
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
        type: "learn",
        icon: "🔐",
        title: "What makes a strong password?",
        body: "• 12+ characters — longer = harder to crack\n• Mix UPPERCASE, lowercase, numbers & symbols\n• Never use your name, birthday, or 'password'\n• A passphrase (e.g. Purple$Cloud42!) is easy to remember AND strong",
      },
      {
        type: "learn",
        icon: "🚫",
        title: "What to avoid",
        body: "❌ Your name or pet's name\n❌ Your birthday or year\n❌ 'password', '123456', or 'qwerty'\n❌ The same password on multiple accounts\n❌ Short passwords under 8 characters",
      },
      {
        type: "check",
        question: "Which of these is the strongest password?",
        choices: [
          { text: "fluffy2010", correct: false, feedback: "Pet name + birth year — two things hackers try first! Too guessable. 😬" },
          { text: "password", correct: false, feedback: "The most common password in the world! Hackers try this first every time. 🙈" },
          { text: "Blue$Sky!Jump99", correct: true, feedback: "Yes! Long, mixed characters, no personal info — that's a strong passphrase! 🏆" },
          { text: "abc123", correct: false, feedback: "Way too short and predictable. Mix it up with symbols and capitals! 💪" },
        ],
      },
      {
        type: "tip",
        tipText: "Try a PASSPHRASE — three random words glued together with symbols, like 'Tiger$Rocket!Moon'. Easy to remember, nearly impossible to crack! 🔐",
      },
      {
        type: "game",
        gameType: "password-builder",
      },
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
      /* ── JUNIOR (ages 5–7) — simple and direct ── */
      {
        tier: "junior",
        question: "How long should a strong password be?",
        choices: [
          { text: "4 letters",           correct: false, feedback: "Way too short! A hacker could guess that super fast! 😬" },
          { text: "12 or more letters",  correct: true,  feedback: "Yes! The longer, the stronger. 12+ is what Byte recommends! 🎯" },
          { text: "Just your name",      correct: false, feedback: "Never use your name — hackers try that first!" },
          { text: "3 letters",           correct: false, feedback: "That's shorter than your name! Go for 12 or more! 💪" },
        ],
      },
      {
        tier: "junior",
        question: "Which password is the strongest?",
        choices: [
          { text: "password",      correct: false, feedback: "That's the most guessed password ever! Hackers try it first. 😬" },
          { text: "123456",        correct: false, feedback: "Number order is way too easy to guess! Try mixing letters and symbols." },
          { text: "Tiger$Jump42!", correct: true,  feedback: "🔥 Yes! Mix letters, numbers AND symbols — that's a super strong password!" },
          { text: "fluffy",        correct: false, feedback: "Pet names are cute but easy to guess. Mix things up! 🐶" },
        ],
      },
      {
        tier: "junior",
        question: "You should NEVER put your ___ in a password.",
        choices: [
          { text: "Favorite color",  correct: false, feedback: "Colors can actually be fine — they're not personal info everyone knows!" },
          { text: "Random numbers",  correct: false, feedback: "Random numbers are great! They make passwords stronger." },
          { text: "Name or birthday", correct: true, feedback: "Exactly! Your name and birthday are easy to find. Never use them! 🛡️" },
          { text: "Capital letters", correct: false, feedback: "Capital letters are helpful — always add some!" },
        ],
      },
      {
        tier: "junior",
        question: "A passphrase is...",
        choices: [
          { text: "A hint to remember your password",     correct: false, feedback: "That's a hint — a passphrase IS the password!" },
          { text: "A bunch of random words together",     correct: true,  feedback: "Right! Like 'pizza cloud seven rocket' — long, random, and easy to remember! 🚀" },
          { text: "Your secret nickname",                 correct: false, feedback: "Nicknames are personal info — hackers can find them. Use random words instead!" },
          { text: "A password your teacher gives you",   correct: false, feedback: "YOU make the passphrase — pick random words that make you smile!" },
        ],
      },
      {
        tier: "junior",
        question: "Should you use the same password on every website?",
        choices: [
          { text: "Yes — easy to remember!",    correct: false, feedback: "It seems smart but if one site gets hacked, ALL your accounts are in danger! 😱" },
          { text: "No — use a different one each time", correct: true, feedback: "Exactly! Each account gets its own unique password. 🔑" },
          { text: "Only if it's really long",   correct: false, feedback: "Even long passwords are risky if reused everywhere!" },
          { text: "Yes if no one is watching",  correct: false, feedback: "Hackers are always watching! Always use different passwords." },
        ],
      },
      {
        tier: "junior",
        question: "What do symbols like ! @ # do to your password?",
        choices: [
          { text: "Make it look cool only",      correct: false, feedback: "They do look cool — but their real job is making your password harder to crack! 😄" },
          { text: "Make it harder to remember",  correct: false, feedback: "They can be tricky to remember, but they make your password WAY stronger!" },
          { text: "Make it much harder to guess", correct: true, feedback: "Yes! Symbols add tons of possible combos that hackers have to try. 💥" },
          { text: "Make it shorter",             correct: false, feedback: "Symbols don't make it shorter — they make it stronger!" },
        ],
      },
      {
        tier: "junior",
        question: "Your friend asks for your password. What do you do?",
        choices: [
          { text: "Share it — they're my best friend!",  correct: false, feedback: "🚨 Never share your password — not even with best friends! Keep it secret." },
          { text: "Never share it with anyone",          correct: true,  feedback: "Correct! Your password is your secret — keep it only to yourself! 🤫" },
          { text: "Share just the first part",           correct: false, feedback: "Never share any part of your password! Even partial passwords can cause trouble." },
          { text: "Write it down and give them the paper", correct: false, feedback: "Written passwords can be found by anyone! Never write it down to share." },
        ],
      },

      /* ── DEFENDER (ages 8–10) — apply the knowledge ── */
      {
        tier: "defender",
        question: "How long should a strong password be?",
        choices: [
          { text: "4 characters",         correct: false, feedback: "Way too short — a hacker can crack that in under a second!" },
          { text: "6 characters",         correct: false, feedback: "Still too short. Hackers have tools that try millions of combos fast!" },
          { text: "12 or more characters", correct: true, feedback: "Yes! The longer it is, the harder it is to crack. 12+ is the sweet spot! 🎯" },
          { text: "Exactly 8 characters", correct: false, feedback: "8 is okay but not great — go for 12 or more to be really safe!" },
        ],
      },
      {
        tier: "defender",
        question: "Which of these is the STRONGEST password?",
        choices: [
          { text: "password123",    correct: false, feedback: "Hackers guess this one in under a second — Byte warned you! 😬" },
          { text: "Fluffy2010",     correct: false, feedback: "Your pet's name + a year? Hackers check those first, every time!" },
          { text: "PurpleTiger$42", correct: true,  feedback: "🔥 Yes! Mix words, numbers and symbols. Long + varied = strong!" },
          { text: "abc12345",       correct: false, feedback: "Simple patterns like abc or 12345 are cracked instantly!" },
        ],
      },
      {
        tier: "defender",
        question: "What should you NEVER put in a password?",
        choices: [
          { text: "Random numbers",  correct: false, feedback: "Numbers are great — they make passwords way stronger!" },
          { text: "Your birthday",   correct: true,  feedback: "Exactly! Birthdays are public info. A hacker can find that easily 🕵️" },
          { text: "Capital letters", correct: false, feedback: "Capital letters are a great addition — keep using them!" },
          { text: "Special symbols", correct: false, feedback: "Symbols like ! @ # are your secret weapon — always add them!" },
        ],
      },
      {
        tier: "defender",
        question: "Byte said to use a passphrase. What is that?",
        choices: [
          { text: "A hint to remember your password",                    correct: false, feedback: "That's a hint — a passphrase is the password itself!" },
          { text: "A password you share with friends",                   correct: false, feedback: "Never share your password — not even with friends!" },
          { text: "Three or more random words like 'pizza cloud rocket'", correct: true, feedback: "Exactly what Byte said! Random words = long, strong, and easy to remember 🚀" },
          { text: "A password your school gives you",                    correct: false, feedback: "Nope — a passphrase is something YOU create. Make it random!" },
        ],
      },
      {
        tier: "defender",
        question: "You use the same password on every website. Is that…",
        choices: [
          { text: "Smart — easy to remember!",                correct: false, feedback: "It seems smart but it's risky — one hack and ALL your accounts are exposed!" },
          { text: "Dangerous — one hack = all accounts exposed", correct: true, feedback: "100% right! Always use a different password for each account 🔑" },
          { text: "Fine if the password is really strong",    correct: false, feedback: "Even a strong password reused everywhere is dangerous. One site gets hacked — they all do!" },
          { text: "Required by most apps",                    correct: false, feedback: "Nope — apps actually encourage unique passwords!" },
        ],
      },
      {
        tier: "defender",
        question: "Why do symbols like ! @ # make passwords stronger?",
        choices: [
          { text: "They look cool",                                    correct: false, feedback: "Ha! They do look cool — but that's not why 😄" },
          { text: "They make passwords easier to remember",            correct: false, feedback: "Actually harder to remember, but WAY harder to crack!" },
          { text: "They massively increase the number of possible combos", correct: true, feedback: "Exactly! More possible characters = billions more combinations to try 💥" },
          { text: "They are required by law",                          correct: false, feedback: "Not a law — just really smart password design!" },
        ],
      },
      {
        tier: "defender",
        question: "A site gets hacked and your password leaks. Which is the WORST outcome?",
        choices: [
          { text: "You need to change one password",                          correct: false, feedback: "Only one? That would be fine — but if you reused that password, every account is at risk!" },
          { text: "All accounts using that same password are now at risk",    correct: true,  feedback: "Exactly the danger! That's why every account needs its own unique password. 🔑" },
          { text: "The site has to pay a fine",                               correct: false, feedback: "The site might face consequences, but YOUR risk is all your reused accounts being exposed!" },
          { text: "Nothing — hackers only care about that one site",          correct: false, feedback: "Hackers immediately try stolen passwords on banking, email, and social accounts!" },
        ],
      },

      /* ── GUARDIAN (ages 11+) — technical depth ── */
      {
        tier: "guardian",
        question: "Why is 12+ characters the recommended minimum? What's the technical reason?",
        choices: [
          { text: "Because it's easier to remember",                             correct: false, feedback: "Longer is actually harder to remember — the real reason is computational time to crack!" },
          { text: "It makes brute-force cracking take billions of years with current hardware", correct: true, feedback: "Exactly! Each added character multiplies combinations exponentially. At 12+ chars, brute-forcing becomes computationally infeasible. 🔐" },
          { text: "Most websites require exactly 12 characters",                 correct: false, feedback: "No universal standard — 12+ is a security best practice based on encryption research." },
          { text: "12-character passwords are encrypted differently",            correct: false, feedback: "Length doesn't change encryption type — it changes the number of possible combinations." },
        ],
      },
      {
        tier: "guardian",
        question: "Why is using your birthday in a password an OSINT vulnerability?",
        choices: [
          { text: "Birthdays are too short to use as passwords",                  correct: false, feedback: "Length isn't the issue — it's that birthdays are discoverable through open-source intelligence!" },
          { text: "Birthdays are publicly discoverable information that attackers can find online", correct: true, feedback: "Correct! OSINT (Open Source Intelligence) means hackers gather your public data — social media, school sites, public records — to guess passwords. 🕵️" },
          { text: "Birthdays contain only numbers",                               correct: false, feedback: "Numbers alone are weak, but the bigger issue is that birthdays are publicly known info!" },
          { text: "All websites ban birthday-based passwords",                    correct: false, feedback: "Most websites don't check — it's on YOU to avoid guessable personal info." },
        ],
      },
      {
        tier: "guardian",
        question: "A passphrase like 'pizza cloud seven rocket' is strong. What's the technical reason?",
        choices: [
          { text: "Food words are unpredictable to hackers",                       correct: false, feedback: "It's not about food — it's about the mathematical combination space the random words create!" },
          { text: "High entropy — random words combine to create massive combinatorial space", correct: true, feedback: "Exactly! Four random words from a large dictionary create more entropy than a complex 8-char password. Length + randomness = strength. 🔐" },
          { text: "Passphrases bypass all hacking tools",                          correct: false, feedback: "No password type bypasses all tools — strength comes from entropy, not bypassing." },
          { text: "It's long enough to trigger special encryption",               correct: false, feedback: "Length doesn't trigger different encryption — it just multiplies the search space attackers face." },
        ],
      },
      {
        tier: "guardian",
        question: "One website you use gets breached and your password leaks in plaintext. What attack type do hackers immediately launch using it?",
        choices: [
          { text: "Phishing — sending you fake emails",               correct: false, feedback: "Phishing is a separate attack vector. With your actual password, hackers use a faster method!" },
          { text: "Credential stuffing — testing that password on hundreds of other services", correct: true, feedback: "Yes! Automated tools instantly test stolen credentials across Gmail, banks, social media, etc. This is why unique passwords per site matter. 🚨" },
          { text: "Brute force — guessing millions of passwords",      correct: false, feedback: "Brute force is used when they DON'T have your password. They already have it — so they test it elsewhere!" },
          { text: "SQL injection — attacking the database directly",   correct: false, feedback: "SQL injection is how they got the breach. With your leaked password, they move to credential stuffing." },
        ],
      },
      {
        tier: "guardian",
        question: "Adding one symbol to an 8-character password — what does it actually change mathematically?",
        choices: [
          { text: "Adds 1 possible combination",                                                    correct: false, feedback: "Far more than 1! Every position in every character gains the full symbol set as a possibility." },
          { text: "Multiplies the possible combinations by the symbol set size at every character position", correct: true, feedback: "Exactly! If you add 30 symbols to the character set, every position has 30 more options — the total combinations multiply exponentially across all positions. 💥" },
          { text: "Makes it 10× harder to crack",                                                   correct: false, feedback: "The multiplier is much larger than 10×. Adding a full symbol set multiplies exponentially across all positions." },
          { text: "Only helps if the symbol is at the start",                                       correct: false, feedback: "Position doesn't matter mathematically — any symbol in any spot multiplies the entire combination space!" },
        ],
      },
      {
        tier: "guardian",
        question: "What professional tool solves password reuse and weakness at the same time?",
        choices: [
          { text: "A notebook where you write all passwords",              correct: false, feedback: "Physical notebooks can be lost, stolen, or found — not a secure solution at scale!" },
          { text: "A password manager — generates and stores unique strong passwords per site", correct: true, feedback: "Exactly! Password managers generate random 20+ character passwords for every site and remember them for you. This is what security professionals use. 🔐" },
          { text: "Using the same strong password everywhere",             correct: false, feedback: "Even a strong reused password fails under credential stuffing. Unique passwords per site is non-negotiable!" },
          { text: "Biometric authentication (fingerprint/face)",          correct: false, feedback: "Biometrics are a great second factor, but most sites still need a password too — and you still need unique ones!" },
        ],
      },
      {
        tier: "guardian",
        question: "You create 'P@ssw0rd123' — it has capitals, symbols, numbers, and 12 chars. Is it strong?",
        choices: [
          { text: "Yes — it meets all the technical requirements",                 correct: false, feedback: "It meets the surface requirements, but it's a predictable pattern! Hackers use 'leet speak' dictionaries that include p@ssw0rd-style substitutions." },
          { text: "No — predictable substitution patterns are in hacker dictionaries", correct: true, feedback: "Correct! Security through substitution (a→@, o→0, s→$) is well-known. Dictionary attacks include these variants. True strength requires randomness, not pattern. 🕵️" },
          { text: "Yes — the @ symbol alone makes it uncrackable",                 correct: false, feedback: "No single character makes a password uncrackable. It's about unpredictability — and p@ssw0rd is very predictable!" },
          { text: "It depends on which website you use it on",                     correct: false, feedback: "The website doesn't change the password's strength. A predictable pattern is weak everywhere." },
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
        type: "game",
        gameType: "trace-the-hacker",
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
      /* ── JUNIOR (ages 5–7) — simple, direct ── */
      {
        tier: "junior",
        question: "Do hackers leave clues online?",
        choices: [
          { text: "No — they are totally invisible", correct: false, feedback: "Nope! The video said hackers ALWAYS leave a trace. You just have to find it! 🔍" },
          { text: "Yes — they always leave a trace", correct: true,  feedback: "You got it! Hackers think they're invisible, but they always leave clues behind. 🕵️" },
          { text: "Only sometimes",                  correct: false, feedback: "The video said ALWAYS — every hacker leaves a trace online!" },
          { text: "Only on phones",                  correct: false, feedback: "Device doesn't matter — hackers always leave a trail, no matter what!" },
        ],
      },
      {
        tier: "junior",
        question: "Which website name has weird spelling?",
        choices: [
          { text: "google.com",          correct: false, feedback: "That's the real Google — looks perfect! ✅" },
          { text: "gooogle.com (3 O's)", correct: true,  feedback: "🚨 Yes! Three O's — just like the video showed. Weird spelling = big clue it's fake!" },
          { text: "youtube.com",         correct: false, feedback: "YouTube's real URL — nothing weird here! ✅" },
          { text: "amazon.com",          correct: false, feedback: "Amazon's real URL — spelled correctly! ✅" },
        ],
      },
      {
        tier: "junior",
        question: "Someone sends you a message asking for your password. What should you do?",
        choices: [
          { text: "Share it if they seem nice", correct: false, feedback: "🚨 Never share your password — not even with nice people online!" },
          { text: "Give them a hint instead",   correct: false, feedback: "No hints either! The video says messages asking for passwords are always suspicious." },
          { text: "Never share it — that's a clue something is wrong!", correct: true, feedback: "Perfect! The video called this 'a huge clue' — real people never need your password. 🚩" },
          { text: "Share it with a parent first", correct: false, feedback: "Tell a parent — but still never share the password! No one online should ever have it." },
        ],
      },
      {
        tier: "junior",
        question: "The video says never download from someone you ___",
        choices: [
          { text: "Like",      correct: false, feedback: "Even if you like them online, you might not really know them. Only download from trusted sources!" },
          { text: "Don't know", correct: true,  feedback: "Exactly! 'Never, ever download from someone you don't know. Safety first!' — right from the video! 🛡️" },
          { text: "Trust",     correct: false, feedback: "Online 'trust' can be faked. The video says if you don't KNOW them in real life, don't download!" },
          { text: "See",       correct: false, feedback: "Not quite — the video's warning is about people you don't know, not about seeing them!" },
        ],
      },
      {
        tier: "junior",
        question: "Before you click a link, what should you do first?",
        choices: [
          { text: "Click it fast!",               correct: false, feedback: "Slow down! The video says STOP and check before you ever click something suspicious." },
          { text: "Stop and check if it looks right", correct: true, feedback: "Yes! Stop, investigate, and ask — does this look right and feel right? 🔎" },
          { text: "Share it with friends",         correct: false, feedback: "That could spread the danger! Always check it yourself first." },
          { text: "Nothing — it's probably fine", correct: false, feedback: "🚨 Never assume! The video says always investigate before clicking." },
        ],
      },
      {
        tier: "junior",
        question: "A website name looks almost right but has an extra letter. What is that?",
        choices: [
          { text: "A loading problem", correct: false, feedback: "Not a tech glitch — hackers do this on purpose to trick you!" },
          { text: "A new version",     correct: false, feedback: "Real websites don't misspell their own name. Weird letters = possible fake site!" },
          { text: "A clue it might be fake", correct: true, feedback: "Right! The video said to look for names that look 'almost right' — that's a hacker clue! 🕵️" },
          { text: "A cool design",     correct: false, feedback: "Ha! It's not style — it's a trick to fool you into visiting the wrong site." },
        ],
      },
      {
        tier: "junior",
        question: "What is your job as a cyber hero?",
        choices: [
          { text: "Never use the internet", correct: false, feedback: "The video wants you to use the internet SAFELY — not quit it!" },
          { text: "Spot the clues and stay safe", correct: true, feedback: "That's your mission! Follow the trail, find the clues, catch the hacker! 🦸" },
          { text: "Delete everything suspicious", correct: false, feedback: "Tell a trusted adult instead — your job is to SPOT clues, not delete things alone." },
          { text: "Block all messages",           correct: false, feedback: "Not all messages are bad — your job is to INVESTIGATE and spot the suspicious ones!" },
        ],
      },

      /* ── DEFENDER (ages 8–10) — scenario-based ── */
      {
        tier: "defender",
        question: "The video says hackers think they're invisible. What's the truth?",
        choices: [
          { text: "They are truly invisible online",         correct: false, feedback: "Nope! The video is clear: hackers ALWAYS leave a trace. That's how they get caught! 🔍" },
          { text: "They always leave a trace online",        correct: true,  feedback: "Exactly! Hackers think they're invisible, but they always leave digital clues behind. 🕵️" },
          { text: "Only beginner hackers leave traces",      correct: false, feedback: "ALL hackers leave traces — even experienced ones. That's how investigators find them!" },
          { text: "They're invisible unless caught quickly", correct: false, feedback: "Time doesn't matter — hackers always leave a trail that cyber detectives can follow!" },
        ],
      },
      {
        tier: "defender",
        question: "You visit a site called 'gooogle.com' (three O's). What should you do?",
        choices: [
          { text: "Stay — it's probably just a typo",     correct: false, feedback: "Typos in URLs are a major red flag! Hackers register misspelled sites to trick people." },
          { text: "Leave immediately — it looks fake",    correct: true,  feedback: "Smart! The video warned about weird spelling. Three O's = not the real Google. 🚨" },
          { text: "It's the same as google.com",          correct: false, feedback: "It's NOT the same — it's a completely different website that could steal your info!" },
          { text: "Check if it has a lock icon first",    correct: false, feedback: "Even fake sites can have a lock icon. The weird spelling already tells you to leave!" },
        ],
      },
      {
        tier: "defender",
        question: "A message from 'your school' asks for your password to 'verify your account'. What is this?",
        choices: [
          { text: "Normal — schools do this sometimes",   correct: false, feedback: "🚨 Schools NEVER ask for your password in a message. This is a trick!" },
          { text: "A huge clue something is wrong — don't share", correct: true, feedback: "Correct! The video said messages asking for passwords are always a red flag, no matter who they seem to be from. 🚩" },
          { text: "Fine if the school logo is on it",    correct: false, feedback: "Logos can be faked! Any message asking for your password is suspicious — full stop." },
          { text: "A routine security update",           correct: false, feedback: "Real security updates never need your password. This is social engineering!" },
        ],
      },
      {
        tier: "defender",
        question: "A stranger online sends you a free game download. The video says you should...",
        choices: [
          { text: "Download it — it's free!",             correct: false, feedback: "🚨 Never download from someone you don't know — the video said this directly!" },
          { text: "Download it if your friend approves",  correct: false, feedback: "Your friend's approval doesn't make the source safe. You still don't know where it really came from!" },
          { text: "Never download it — you don't know them", correct: true, feedback: "Exactly what the video said! Never download from someone you don't know. Safety first! 🛡️" },
          { text: "Download only if it's a small file",  correct: false, feedback: "File size doesn't matter — even tiny files can contain viruses!" },
        ],
      },
      {
        tier: "defender",
        question: "You get a message with a link that feels slightly off. The video says to...",
        choices: [
          { text: "Click it — your gut is probably wrong",   correct: false, feedback: "Trust your instincts! The video says if something feels off, investigate before you click." },
          { text: "Forward it to friends to check",         correct: false, feedback: "That spreads the danger! Investigate it yourself first — does it feel right and look official?" },
          { text: "Investigate — does it feel right and look official?", correct: true, feedback: "Perfect! The video said stop and ask those two questions before you ever click. 🔎" },
          { text: "Click it once to preview it",            correct: false, feedback: "One click is all it takes for a virus to run! Investigate BEFORE clicking, not after." },
        ],
      },
      {
        tier: "defender",
        question: "A site is called 'Faceb00k.com' (zeros instead of O's). What is this?",
        choices: [
          { text: "Facebook's mobile site",           correct: false, feedback: "Facebook's mobile site is still facebook.com — this is a fake!" },
          { text: "A fake site using almost-right spelling", correct: true, feedback: "Exactly! The video warned about names that look 'almost right' — zeros instead of O's is a classic hacker trick. 🕵️" },
          { text: "A secure version of Facebook",    correct: false, feedback: "Security doesn't change the domain name. This is a lookalike scam site!" },
          { text: "Just a different style of spelling", correct: false, feedback: "It's not style — hackers register these look-alike URLs on purpose to steal your info!" },
        ],
      },
      {
        tier: "defender",
        question: "According to the video, what does 'following the digital trail' mean?",
        choices: [
          { text: "Browsing many websites in a row",     correct: false, feedback: "That's just regular browsing! Following a digital trail means tracing the clues hackers leave." },
          { text: "Tracing the clues hackers leave to catch them", correct: true, feedback: "That's it! The video said: follow the trail, uncover the hidden clues, catch the hacker! 🦸" },
          { text: "Following someone's social media",    correct: false, feedback: "Not social media — it's about finding the evidence trail hackers leave behind online." },
          { text: "Deleting your own digital footprint", correct: false, feedback: "Close — digital footprints are real, but 'following the trail' is about tracking hackers, not yourself!" },
        ],
      },

      /* ── GUARDIAN (ages 11+) — advanced reasoning ── */
      {
        tier: "guardian",
        question: "The video says hackers think they're invisible. In real cybersecurity, what kind of traces do hackers typically leave?",
        choices: [
          { text: "Personalized messages explaining what they did", correct: false, feedback: "Ha — hackers don't leave notes! They leave technical traces like login records and IP addresses." },
          { text: "IP address logs, unusual login times, and unknown device entries", correct: true, feedback: "Exactly! These are real digital traces — and exactly the kind of clues cyber detectives use to track hackers. 🕵️" },
          { text: "Traces only visible with special government software", correct: false, feedback: "Not true — many traces are visible in standard account activity logs that anyone can check!" },
          { text: "Only traces if they make a mistake", correct: false, feedback: "The video is clear: hackers ALWAYS leave traces, not just when they slip up!" },
        ],
      },
      {
        tier: "guardian",
        question: "A URL reads 'paypa1.com' (number 1 instead of L). Why would a hacker register this domain?",
        choices: [
          { text: "To make PayPal's site load faster",                         correct: false, feedback: "That's not how web hosting works! This is a deception tactic, not a speed trick." },
          { text: "To trick users who misread it into entering their real login info", correct: true, feedback: "Correct! This is called typosquatting — hackers register look-alike domains to steal credentials from people who don't notice the difference. 🚨" },
          { text: "Because paypal.com was already taken",                      correct: false, feedback: "paypal.com exists and is owned by PayPal. 'paypa1.com' is a deliberate fake." },
          { text: "To redirect you to the real PayPal automatically",         correct: false, feedback: "It won't redirect you — it'll show a fake login page to steal your password!" },
        ],
      },
      {
        tier: "guardian",
        question: "A message looks completely official — correct logo, real teacher's name, proper grammar — but asks for your password. What should you do and why?",
        choices: [
          { text: "Share it — everything checks out",                         correct: false, feedback: "🚨 Looks can be deceiving! Logos, names, and grammar can all be faked. No real system ever needs your password." },
          { text: "Refuse — no legitimate system ever asks for your password", correct: true, feedback: "Exactly right! Official-looking messages can be spoofed. The video's rule holds regardless of appearance: messages asking for passwords are always suspicious. 🚩" },
          { text: "Call the teacher first to verify, then share",             correct: false, feedback: "Calling to verify is smart — but you should NEVER share your password, even after verification!" },
          { text: "Share only the first half of your password",               correct: false, feedback: "Never share any part of your password! And partial passwords can still be used in attacks." },
        ],
      },
      {
        tier: "guardian",
        question: "An online contact you've chatted with for months says they're sending you a 'totally safe' game file. The video says never download from people you don't know. Does this apply here?",
        choices: [
          { text: "No — months of chatting means you know them",              correct: false, feedback: "Online relationships can be faked over time. You don't actually know who is on the other end — this is a common grooming tactic!" },
          { text: "Yes — you still don't know the true source of the file or who they really are", correct: true, feedback: "Correct! The video's rule applies. Online contacts can misrepresent themselves, and the file's source is still unknown. 🛡️" },
          { text: "No — only applies to total strangers, not friends",        correct: false, feedback: "The rule applies to anyone you haven't met in real life. Online 'friends' can be anyone!" },
          { text: "Depends on whether they've been trustworthy before",       correct: false, feedback: "Past behavior online isn't a guarantee. The source of the file is still unknown regardless of your history with them." },
        ],
      },
      {
        tier: "guardian",
        question: "The video says investigate a message before clicking: 'Does it feel right? Does it look official?' What type of cyberattack does this advice help you detect?",
        choices: [
          { text: "DDoS attacks — overloading servers with traffic",  correct: false, feedback: "DDoS attacks target servers, not individual users. This advice is about a different threat." },
          { text: "Phishing — deceptive messages designed to steal info by impersonating trusted sources", correct: true, feedback: "Exactly! Phishing attacks rely on messages that look official. Pausing to investigate is the #1 defense. 🔎" },
          { text: "Brute force attacks — guessing passwords repeatedly", correct: false, feedback: "Brute force attacks happen on servers, not through messages. Strong passwords defend against those." },
          { text: "Malware installed through device hardware",         correct: false, feedback: "Hardware attacks are a different threat entirely. Message-based deception is phishing." },
        ],
      },
      {
        tier: "guardian",
        question: "Someone online claims to be from 'Cyber Hero Academy Support' and asks you to verify your account details to fix a problem. This is an example of...",
        choices: [
          { text: "Normal customer support — respond to fix the issue", correct: false, feedback: "🚨 Real support teams never ask for your account details through a message. This is a trap!" },
          { text: "Social engineering — manipulating people into giving up information", correct: true, feedback: "Correct! Social engineering exploits trust rather than technology. The video said: always investigate — does it really look and feel official? 🕵️" },
          { text: "A routine security audit — standard practice",        correct: false, feedback: "Real security audits don't work by messaging individuals asking for account details!" },
          { text: "End-to-end encryption testing",                      correct: false, feedback: "That's not what encryption testing looks like — this is a classic impersonation scam." },
        ],
      },
      {
        tier: "guardian",
        question: "The video ends: 'Follow the trail and uncover the hidden clues. Can you catch the hacker?' In professional cybersecurity, who does this job?",
        choices: [
          { text: "Web developers — they build the secure sites", correct: false, feedback: "Developers build and secure systems, but they're not the ones who trace hackers after an attack." },
          { text: "Digital forensics investigators — they analyze evidence left on systems", correct: true, feedback: "Exactly! Digital forensics experts follow the digital trail — logs, metadata, IP records — to identify and catch hackers. That's the career path of a real cyber detective! 🦸" },
          { text: "Network engineers — they manage internet traffic", correct: false, feedback: "Network engineers maintain infrastructure, but forensics investigators are the ones who trace hacker evidence." },
          { text: "System administrators — they manage user accounts",  correct: false, feedback: "Sysadmins manage access, but digital forensics investigators are the cyber detectives who follow the trail." },
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson3.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Whiskers1.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Whiskers2.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Whiskers3.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Hoot1.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Hoot2.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Hoot3.mp4",
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
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Robo1.mp4",
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

  /* ─────────────────────────────────────────────────────────────────────────
     ROBO — Lesson 2: Strangers & Cyberbullying
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-robo-2",
    missionId: "stranger-safety",
    character: "Robo Buddy",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Robo2.mp4",
    badgeId: "stranger-shield",
    badgeLabel: "Stranger Shield",
    badgeEmoji: "🛡️",
    slides: [
      {
        type: "learn",
        icon: "👤",
        title: "Who is an online stranger?",
        body: "An online stranger is anyone you haven't met in real life — even if you've chatted for months. People online can pretend to be anyone: a kid, a gamer, a celebrity. Your real friends are the ones you can see face to face.",
      },
      {
        type: "learn",
        icon: "🚩",
        title: "Warning signs from strangers",
        body: "🚩 Asks where you live, go to school, or your real name\n🚩 Wants to move the chat to a private app\n🚩 Asks you to keep your chats secret from parents\n🚩 Sends gifts or offers rewards\n🚩 Asks for photos or videos of you",
      },
      {
        type: "check",
        question: "An online gamer you've never met says 'Don't tell your parents we talk — it'll be our secret.' What do you do?",
        choices: [
          { text: "Keep the secret — they seem cool", correct: false, feedback: "Anyone asking you to hide things from your parents is a major warning sign! 🚩" },
          { text: "Tell a trusted adult straight away", correct: true, feedback: "Exactly right! Secrets from parents = danger. Always tell a trusted adult. 🦸" },
          { text: "Just stop chatting but don't tell anyone", correct: false, feedback: "Good instinct to stop — but telling a trusted adult is also really important here!" },
          { text: "Ask them why it has to be secret", correct: false, feedback: "Don't engage further. Block and tell a trusted adult immediately! 🛡️" },
        ],
      },
      {
        type: "learn",
        icon: "💬",
        title: "What is cyberbullying?",
        body: "Cyberbullying is when someone uses technology to repeatedly hurt, embarrass, or threaten another person. It can happen through messages, group chats, social media, or gaming. It's not OK — and it's not your fault.",
      },
      {
        type: "learn",
        icon: "🛡️",
        title: "How to handle cyberbullying",
        body: "✅ Don't reply — responding can make it worse\n✅ Screenshot the evidence (don't delete it!)\n✅ Block the bully on the platform\n✅ Report it to the app or game\n✅ Tell a trusted adult — a parent, teacher, or school counsellor",
      },
      {
        type: "check",
        question: "Someone in your school group chat is sending mean messages about your friend. What's the best thing to do?",
        choices: [
          { text: "Send mean messages back to defend your friend", correct: false, feedback: "This can make the situation worse and get you in trouble too! 😬" },
          { text: "Laugh along so you don't become the next target", correct: false, feedback: "Joining in — even silently — makes cyberbullying worse. Be an upstander, not a bystander!" },
          { text: "Screenshot it, privately support your friend, report it to an adult", correct: true, feedback: "Perfect! Gather evidence, support your friend, and get a trusted adult involved. 🏆" },
          { text: "Ignore it completely", correct: false, feedback: "Ignoring lets it continue. Your friend needs support and an adult needs to know!" },
        ],
      },
      {
        type: "tip",
        tipText: "If ANYTHING online makes you feel scared, uncomfortable, or confused — trust that feeling and tell a trusted adult straight away. You will NEVER get in trouble for speaking up. 🤖❤️",
      },
      {
        type: "game",
        gameType: "stranger-danger",
      },
      {
        type: "summary",
        takeaways: [
          "Online strangers can pretend to be anyone — even kids 👤",
          "Secrets from parents are always a warning sign 🚩",
          "Never share your location, school, or photos with strangers 📍",
          "Cyberbullying: screenshot, block, report, tell an adult 🛡️",
          "Trust your gut — if it feels wrong, tell someone you trust 💛",
        ],
        quizLabel: "Stranger Safety Quiz!",
      },
    ],
    quiz: [
      // Junior tier
      {
        tier: "junior",
        question: "An online stranger asks where you go to school. You should:",
        options: [
          "Tell them — it's just info",
          "Never tell strangers where you go to school",
          "Ask your friend first",
          "Tell them if they seem nice",
        ],
        correct: 1,
        explanation: "Your school tells strangers how to find you in real life. Keep it private!",
      },
      {
        tier: "junior",
        question: "Someone online says 'keep our chats secret from your parents.' This is:",
        options: [
          "Fine — just a private friendship",
          "A warning sign — tell a trusted adult right away",
          "Normal for online friends",
          "OK if they're nice",
        ],
        correct: 1,
        explanation: "Anyone who wants secrets from your parents is dangerous. Always tell a trusted adult!",
      },
      {
        tier: "junior",
        question: "What should you do if someone online is sending you mean messages?",
        options: [
          "Send mean messages back",
          "Block, screenshot, and tell a grown-up",
          "Ignore it forever",
          "Share your feelings with the bully",
        ],
        correct: 1,
        explanation: "Block and save evidence, then tell a trusted adult. Never reply to bullies!",
      },
      {
        tier: "junior",
        question: "An online 'friend' you've never met asks you to send them a photo. You should:",
        options: [
          "Send it — they seem friendly",
          "Never send photos to people you haven't met in real life",
          "Send a cartoon instead",
          "Ask for their photo first",
        ],
        correct: 1,
        explanation: "Never send photos to online strangers. Tell a trusted adult if asked!",
      },
      {
        tier: "junior",
        question: "An online stranger is an online stranger even if you've chatted for:",
        options: [
          "1 day",
          "1 week",
          "1 month",
          "All of the above — until you meet in real life with a parent present",
        ],
        correct: 3,
        explanation: "Someone is a stranger until you've met them in person with a trusted adult present!",
      },
      // Defender tier
      {
        tier: "defender",
        question: "A gamer you met online asks to move your chat to a private messaging app. This is:",
        options: [
          "Normal — better apps exist",
          "A red flag — groomers move chats away from monitored platforms",
          "Fine if you trust them",
          "OK for older kids",
        ],
        correct: 1,
        explanation: "Moving to private platforms is a grooming tactic to avoid detection. Tell a trusted adult!",
      },
      {
        tier: "defender",
        question: "Your classmate is spreading false rumours about you in a group chat. This is:",
        options: [
          "Just drama, ignore it",
          "Cyberbullying — screenshot and report it",
          "Only bullying if it happens in person",
          "Not serious since it's online",
        ],
        correct: 1,
        explanation: "Online rumours are cyberbullying. Screenshot the evidence and report to a trusted adult!",
      },
      {
        tier: "defender",
        question: "You notice a friend is suddenly quiet, upset, and avoiding their phone. This could mean:",
        options: [
          "They're just busy",
          "They might be experiencing cyberbullying — check in with them",
          "Their battery is dead",
          "Nothing — it's normal",
        ],
        correct: 1,
        explanation: "Withdrawal and distress are signs of cyberbullying. Be a supportive friend and encourage them to tell an adult!",
      },
      {
        tier: "defender",
        question: "The best way to help a friend being cyberbullied is:",
        options: [
          "Attack the bully online",
          "Ignore it to avoid getting involved",
          "Privately support your friend and help them report it",
          "Screenshot it and post it publicly",
        ],
        correct: 2,
        explanation: "Private support + helping them report it is the most effective and safest way to help!",
      },
      {
        tier: "defender",
        question: "An online stranger has been friendly for weeks, then sends you a gift card 'just because.' You should:",
        options: [
          "Accept it — that's kind!",
          "Be suspicious — gift-giving is a grooming tactic",
          "Thank them and keep chatting",
          "Share the code with friends",
        ],
        correct: 1,
        explanation: "Offering gifts is a classic grooming tactic. Tell a trusted adult immediately!",
      },
      // Guardian tier
      {
        tier: "guardian",
        question: "What is 'catfishing'?",
        options: [
          "Phishing via fishing-themed emails",
          "Creating a fake online identity to deceive someone",
          "Hacking into fishing games",
          "A type of malware",
        ],
        correct: 1,
        explanation: "Catfishing = pretending to be someone else online to manipulate or deceive a victim.",
      },
      {
        tier: "guardian",
        question: "Someone threatens to share embarrassing content of you unless you comply with their demands. This is:",
        options: [
          "A negotiation — consider what they want",
          "Sextortion/blackmail — report it and don't comply",
          "Normal online conflict",
          "Only serious if they follow through",
        ],
        correct: 1,
        explanation: "This is blackmail/coercion. Complying makes it worse. Tell a trusted adult and report to the platform and authorities immediately!",
      },
      {
        tier: "guardian",
        question: "Which organisation should you report child sexual abuse material (CSAM) to in the US?",
        options: [
          "The FBI directly",
          "Your school counsellor only",
          "NCMEC's CyberTipline (cybertipline.org)",
          "Just delete and ignore it",
        ],
        correct: 2,
        explanation: "The National Center for Missing & Exploited Children (NCMEC) operates the CyberTipline for reporting CSAM. Never share it — report it!",
      },
      {
        tier: "guardian",
        question: "Digital evidence of cyberbullying should always be:",
        options: [
          "Deleted to protect the victim's privacy",
          "Shared publicly to expose the bully",
          "Screenshotted, saved, and reported to an adult",
          "Responded to so the bully knows it's wrong",
        ],
        correct: 2,
        explanation: "Save screenshots as evidence, report to the platform, and tell a trusted adult. Don't delete or retaliate!",
      },
      {
        tier: "guardian",
        question: "An online contact says 'I work for your school's IT department and need your login to fix an issue.' This is:",
        options: [
          "Legitimate — IT staff sometimes need access",
          "Social engineering — verify through official channels, never share credentials",
          "Fine if they can prove they work there",
          "OK to share since it's school related",
        ],
        correct: 1,
        explanation: "This is social engineering. Real IT staff never ask for passwords. Verify any such request in person with a known adult at your school!",
      },
    ],
  },
  /* ─────────────────────────────────────────────────────────────────────────
     ROBO — Lesson 3: Safe Downloads
     ───────────────────────────────────────── */
  {
    lessonId: "lesson-robo-3",
    missionId: "safe-downloads",
    character: "Robo Buddy",
    characterEmoji: "🤖",
    characterColor: "bg-cyan-500",
    videoUrl: "https://tanxhrdihnkmouhdufzy.supabase.co/storage/v1/object/public/lessons/Lesson-Robo3.mp4",
    badgeId: "download-detective",
    badgeLabel: "Download Detective",
    badgeEmoji: "📥",
    slides: [
      {
        type: "learn",
        icon: "📥",
        title: "Why downloads can be dangerous",
        body: "Every file you download is code that runs on your device. Hackers hide malware inside games, tools, PDFs, and even images. Robo Buddy's Cyber Download Inspection Center checks every file before it gets through!",
      },
      {
        type: "learn",
        icon: "✅",
        title: "The golden rule of downloads",
        body: "Only download from OFFICIAL sources:\n📱 App Store or Google Play for apps\n🌐 The developer's own official website\n🏫 School or parent-approved platforms\n\nIf you're not sure — ask a trusted adult before you click!",
      },
      {
        type: "check",
        question: "A pop-up appears: 'YOUR DEVICE IS INFECTED! Download our free scanner NOW to fix it!' What do you do?",
        choices: [
          { text: "Download it quickly — my device might be infected!", correct: false, feedback: "This is a classic scareware trick! Real antivirus software never appears as website pop-ups. 🚨" },
          { text: "Close the page — it's a fake scare tactic", correct: true, feedback: "Exactly right! These pop-ups are scams designed to install malware. Close and ignore! 🏆" },
          { text: "Click it to see what happens", correct: false, feedback: "Even clicking can trigger a download. Close the tab immediately! ❌" },
          { text: "Ask the pop-up to scan just one file first", correct: false, feedback: "Don't interact with it at all. Close the entire tab! 🛡️" },
        ],
      },
      {
        type: "learn",
        icon: "🚩",
        title: "Red flags on download pages",
        body: "🚩 Multiple 'Download' buttons in different sizes (fake ones!)\n🚩 Countdown timers pressuring you to hurry\n🚩 Asking you to disable your antivirus\n🚩 File names like 'game.exe.pdf' (hiding the real type)\n🚩 No clear file size or version number shown",
      },
      {
        type: "check",
        question: "A file is named 'homework_helper.pdf.exe' — what is it really?",
        choices: [
          { text: "A safe PDF document", correct: false, feedback: "The real file type is always the LAST extension. This is an .exe program, not a PDF! 🚨" },
          { text: "An .exe program disguised as a PDF — don't open it!", correct: true, feedback: "Spot on! Double extensions like .pdf.exe are a classic malware trick. Never open these! 🏆" },
          { text: "Both a PDF and a program", correct: false, feedback: "Files can only be one type. The last extension is the real one — .exe is dangerous! ⚠️" },
          { text: "A compressed file", correct: false, feedback: "No — the last extension .exe means it's an executable program. Always check the final extension! ❌" },
        ],
      },
      {
        type: "learn",
        icon: "🔍",
        title: "Before you download — inspect it!",
        body: "✅ Check the website address — is it the real official site?\n✅ Look for HTTPS (the padlock icon)\n✅ Verify the file size looks right\n✅ Scan with antivirus after downloading, before opening\n✅ When in doubt — ask a trusted adult!",
      },
      {
        type: "tip",
        tipText: "Even files from friends can be dangerous — their accounts might be hacked! Always scan ANY file with antivirus before opening it. Robo Buddy scans everything! 🤖🔍",
      },
      {
        type: "game",
        gameType: "download-inspector",
      },
      {
        type: "summary",
        takeaways: [
          "Only download from official stores and trusted websites 📱",
          "Fake 'virus warning' pop-ups are scams — close them immediately 🚨",
          "Double extensions like .pdf.exe hide dangerous files 🚩",
          "Never disable your antivirus to install software ❌",
          "When in doubt, ask a trusted adult before downloading 👋",
        ],
        quizLabel: "Download Inspection Quiz!",
      },
    ],
    quiz: [
      // Junior tier
      {
        tier: "junior",
        question: "Where is the safest place to get apps for your tablet or phone?",
        options: [
          "Any website that has it",
          "The official App Store or Google Play",
          "Links from friends",
          "Free download sites",
        ],
        correct: 1,
        explanation: "Official app stores check apps for safety. Random websites don't!",
      },
      {
        tier: "junior",
        question: "A pop-up says 'FREE game — download now!' You should:",
        options: [
          "Click it — free games are great!",
          "Close it and tell a grown-up",
          "Download and try it",
          "Share the link with friends",
        ],
        correct: 1,
        explanation: "Free game pop-ups are almost always traps to install malware. Close them!",
      },
      {
        tier: "junior",
        question: "Before downloading anything, you should always:",
        options: [
          "Just click download",
          "Ask a trusted adult first",
          "Download and check later",
          "Ask a friend",
        ],
        correct: 1,
        explanation: "Always check with a trusted adult before downloading anything to stay safe!",
      },
      {
        tier: "junior",
        question: "A website says 'Your device has a virus! Download this to fix it!' This is:",
        options: [
          "Helpful — download it!",
          "A trick — close the page",
          "Real — websites can detect viruses",
          "Probably fine",
        ],
        correct: 1,
        explanation: "Websites cannot scan your device. This is a scam to trick you into installing malware!",
      },
      {
        tier: "junior",
        question: "The safest way to download a game is from:",
        options: [
          "A random Google result",
          "The official app store",
          "A link in a YouTube video",
          "A pop-up ad",
        ],
        correct: 1,
        explanation: "Official app stores verify all apps for safety before listing them!",
      },
      // Defender tier
      {
        tier: "defender",
        question: "A file is called 'setup.exe.pdf' — the real file type is:",
        options: [
          ".pdf — a safe document",
          ".exe — a program that runs code",
          "Both types at once",
          "A compressed archive",
        ],
        correct: 1,
        explanation: "The real extension is always the last one. .exe means it's a program — a common malware disguise!",
      },
      {
        tier: "defender",
        question: "A download page asks you to disable your antivirus first. You should:",
        options: [
          "Disable it — the software probably needs it",
          "Never download software that requires disabling antivirus",
          "Disable it temporarily",
          "Ask a friend if it's OK",
        ],
        correct: 1,
        explanation: "Legitimate software never needs your antivirus disabled. This is a major malware red flag!",
      },
      {
        tier: "defender",
        question: "Your friend sends you a file over Discord. Before opening it:",
        options: [
          "Open it — you trust your friend",
          "Scan with antivirus — friends' accounts can be hacked",
          "Forward it to others first",
          "Open it if the name looks OK",
        ],
        correct: 1,
        explanation: "Even trusted friends' accounts can be hacked and used to spread malware. Always scan first!",
      },
      {
        tier: "defender",
        question: "The safest way to download free software is to:",
        options: [
          "Click the first Google result",
          "Go directly to the official developer's website",
          "Use any site that has it",
          "Download the one with the most reviews",
        ],
        correct: 1,
        explanation: "Fake download sites copy official ones exactly. Always go directly to the developer's own site!",
      },
      {
        tier: "defender",
        question: "Which of these is a red flag on a download page?",
        options: [
          "Clear file size and version number",
          "HTTPS padlock in the address bar",
          "Multiple 'Download' buttons in different sizes",
          "Developer's name and contact info",
        ],
        correct: 2,
        explanation: "Multiple Download buttons are a trick — the fake ones lead to malware. Only one real button should exist!",
      },
      // Guardian tier
      {
        tier: "guardian",
        question: "Checking a file's SHA-256 hash verifies:",
        options: [
          "The file's creation date",
          "The file hasn't been tampered with since release",
          "The file is virus-free",
          "The developer's identity",
        ],
        correct: 1,
        explanation: "Hash verification confirms file integrity — that it's exactly what the developer released, not a modified malicious version!",
      },
      {
        tier: "guardian",
        question: "A supply chain attack means:",
        options: [
          "Downloading too many files at once",
          "Malware injected into legitimate software during development or distribution",
          "A phishing email with a download link",
          "A fake website copying an official one",
        ],
        correct: 1,
        explanation: "Supply chain attacks compromise software at the source — meaning even official downloads can sometimes be affected!",
      },
      {
        tier: "guardian",
        question: "Even after downloading from the official site, you should:",
        options: [
          "Open it immediately — it's from the official site",
          "Scan it with antivirus before opening",
          "Check the file name only",
          "It depends on the file size",
        ],
        correct: 1,
        explanation: "Official sites can be temporarily compromised. Scanning before opening is always good practice!",
      },
      {
        tier: "guardian",
        question: "A .dmg file on Mac is:",
        options: [
          "Always safe — Macs don't get viruses",
          "A disk image installer — can contain malware, only install from trusted sources",
          "A document file",
          "A compressed archive only",
        ],
        correct: 1,
        explanation: "Macs can get malware. .dmg files are installers and should only be downloaded from official sources!",
      },
      {
        tier: "guardian",
        question: "A browser warning says a download is 'dangerous.' You should:",
        options: [
          "Proceed — the site is trusted",
          "Investigate the warning before proceeding",
          "Disable the warning in settings",
          "It's fine if the file size is small",
        ],
        correct: 1,
        explanation: "Browser warnings exist for good reason. Even trusted sites can be compromised. Always investigate!",
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
