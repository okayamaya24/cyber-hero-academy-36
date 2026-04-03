export type DifficultyTier = "junior" | "hero" | "elite";

export function getDifficultyTier(age: number): DifficultyTier {
  if (age <= 8) return "junior";
  if (age <= 11) return "hero";
  return "elite";
}

export function getTierLabel(tier: DifficultyTier): string {
  switch (tier) {
    case "junior": return "Junior Hero";
    case "hero": return "Hero";
    case "elite": return "Elite Hero";
  }
}

export interface ZoneQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MiniGameConfig {
  type: string;
  timerSeconds: number;
  items: MiniGameItem[];
  hints: boolean;
  passThreshold?: number;
}

export interface MiniGameItem {
  label: string;
  correct: boolean;
}

export interface ZoneContent {
  storyTitle: string;
  storyText: string;
  miniGame: MiniGameConfig;
  questions: ZoneQuestion[];
  xpReward: number;
  completeMessage: string;
}

export interface WorldZone {
  id: string;
  name: string;
  emoji: string;
  description: string;
  content: Record<DifficultyTier, ZoneContent>;
}

export interface WorldContinent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  villainColor: string;
  villain: string;
  villainEmoji: string;
  totalZones: number;
  zones: WorldZone[];
  byteIntro: Record<DifficultyTier, string>;
}

export const WORLDS: WorldContinent[] = [
  {
    id: "north-america",
    name: "North America",
    emoji: "🌎",
    color: "from-cyan-500/20 to-blue-600/20",
    villainColor: "text-cyan-400",
    villain: "THE KEYBREAKER",
    villainEmoji: "🔓",
    totalZones: 8,
    byteIntro: {
      junior: "Whoa! A new Cyber Hero! I'm Byte! The Keybreaker is breaking passwords everywhere! Let's stop him! 🔐",
      hero: "Guardian! The Keybreaker is on the loose across North America — cracking passwords and breaking into accounts. Ready to learn how to stop him?",
      elite: "Cyber Hero — the Keybreaker has been systematically compromising accounts across North America. Your mission: master password security and shut him down.",
    },
    zones: [
      {
        id: "na-zone-1",
        name: "Password Plains",
        emoji: "🔑",
        description: "The Keybreaker is cracking locks — can you stop him?",
        content: {
          junior: {
            storyTitle: "Password Plains",
            storyText: "Oh no! The Keybreaker is SMASHING locks all over Password Plains! He's getting into everyone's stuff! A password is like a special secret key that keeps YOUR stuff safe. Without one — anyone can get in! Let's stop him together! 🔑",
            miniGame: {
              type: "lock-and-learn",
              timerSeconds: 30,
              hints: true,
              items: [
                { label: "🔒 Protected (password set)", correct: true },
                { label: "🔓 Open (no password)", correct: false },
                { label: "🔒 Protected (password set)", correct: true },
                { label: "🔓 Open (no password)", correct: false },
                { label: "🔒 Protected (password set)", correct: true },
                { label: "🔓 Open (no password)", correct: false },
              ],
            },
            questions: [
              { question: "What is a password?", options: ["A secret key that keeps your account safe", "Your favourite colour", "Your name"], correctIndex: 0 },
              { question: "Who should know your password?", options: ["Your best friend", "Only you", "Everyone"], correctIndex: 1 },
              { question: "What happens if you have no password?", options: ["Nothing bad", "Anyone can get into your stuff", "Your account gets faster"], correctIndex: 1 },
            ],
            xpReward: 50,
            completeMessage: "You did it! The Keybreaker didn't stand a chance! ⭐",
          },
          hero: {
            storyTitle: "Password Plains",
            storyText: "Guardian — the Keybreaker has hit Password Plains hard. He's breaking into accounts that have no protection at all. A password is your first line of defense. It's a secret only YOU should know. Without a strong one, you're leaving the door wide open. Let's fix that.",
            miniGame: {
              type: "lock-and-learn",
              timerSeconds: 25,
              hints: false,
              items: [
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
              ],
            },
            questions: [
              { question: "What is the main purpose of a password?", options: ["To make your account look cool", "To protect your account from people who shouldn't access it", "To help you remember your username", "To share with trusted friends"], correctIndex: 1 },
              { question: "Who should you share your password with?", options: ["Your best friend only", "Your parents and teachers", "Nobody — keep it only to yourself", "Anyone you trust"], correctIndex: 2 },
              { question: "What is an account WITHOUT a password like?", options: ["A locked safe", "A wide open door anyone can walk through", "A secret hideout", "A broken computer"], correctIndex: 1 },
            ],
            xpReward: 100,
            completeMessage: "Solid work Guardian. Password Plains is secure.",
          },
          elite: {
            storyTitle: "Password Plains",
            storyText: "Cyber Hero — the Keybreaker exploits one major weakness — accounts with no passwords or weak ones. Password Plains is under attack. A password is your primary authentication tool. It's the barrier between your personal data and anyone trying to access it. Understand it. Master it. Let's move.",
            miniGame: {
              type: "lock-and-learn",
              timerSeconds: 18,
              hints: false,
              items: [
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔓 Open", correct: false },
                { label: "🔐 Decoy (looks locked)", correct: false },
                { label: "🔒 Protected", correct: true },
                { label: "🔐 Decoy (looks locked)", correct: false },
                { label: "🔓 Open", correct: false },
                { label: "🔒 Protected", correct: true },
              ],
            },
            questions: [
              { question: "What role does a password play in account security?", options: ["It's a decorative feature with minimal impact", "It serves as the primary authentication barrier protecting your data", "It only matters for social media accounts", "It's a backup option if other security fails"], correctIndex: 1 },
              { question: "Which scenario represents the biggest security risk?", options: ["Using a long password with symbols", "Changing your password regularly", "Having an account with no password at all", "Using a password manager"], correctIndex: 2 },
              { question: "Why is a password considered 'personal'?", options: ["Because it's stored on your device", "Because only you should ever know it — sharing it removes its protection", "Because it uses your personal information", "Because it's linked to your email"], correctIndex: 1 },
            ],
            xpReward: 150,
            completeMessage: "Zone cleared. Moving to next objective.",
          },
        },
      },
      {
        id: "na-zone-2",
        name: "Weak Wall Wasteland",
        emoji: "🧱",
        description: "Don't let him walk right through your walls!",
        content: {
          junior: {
            storyTitle: "Weak Wall Wasteland",
            storyText: "Uh oh! Look at these walls Guardian — they're SO weak the Keybreaker just walks right through them! Just like a bad password! Passwords like '123' or 'abc' are super easy to guess. We need STRONG walls — strong passwords! Let's find out what makes them strong! 💪",
            miniGame: {
              type: "strong-or-smash",
              timerSeconds: 40,
              hints: true,
              items: [
                { label: "123", correct: false },
                { label: "Sun$h1ne!", correct: true },
                { label: "abc", correct: false },
                { label: "MyD0g#Ruffy", correct: true },
                { label: "password", correct: false },
                { label: "Blu3$tar!", correct: true },
                { label: "1111", correct: false },
                { label: "R@1nb0w$", correct: true },
              ],
            },
            questions: [
              { question: "Which password is stronger?", options: ["123", "MyD0g$Fluffy!", "abc"], correctIndex: 1 },
              { question: "What makes a password weak?", options: ["It's too long", "It's easy to guess", "It has numbers in it"], correctIndex: 1 },
              { question: "Which password would the Keybreaker crack first?", options: ["password", "T!g3r$unR1se", "BlueSky#99"], correctIndex: 0 },
            ],
            xpReward: 50,
            completeMessage: "Those walls are UNBREAKABLE now! Amazing work! 💪",
          },
          hero: {
            storyTitle: "Weak Wall Wasteland",
            storyText: "Guardian — see these walls? The weak one falls apart the second the Keybreaker touches it. That's exactly what happens with a bad password. Passwords like 'password123' or your name? He cracks those in seconds. A strong password makes his job impossible. Let's learn the difference.",
            miniGame: {
              type: "strong-or-smash",
              timerSeconds: 30,
              hints: false,
              items: [
                { label: "qwerty123", correct: false },
                { label: "P!nkTr33$Moon", correct: true },
                { label: "letmein", correct: false },
                { label: "7Blue!Rocket#", correct: true },
                { label: "football", correct: false },
                { label: "Gr33n$ky!99", correct: true },
                { label: "iloveyou", correct: false },
                { label: "X#9kM!vL2$", correct: true },
                { label: "123456789", correct: false },
                { label: "T!g3r$unR1se", correct: true },
                { label: "password1", correct: false },
                { label: "Bl@ckH0le#7", correct: true },
              ],
            },
            questions: [
              { question: "Which of these is the weakest password?", options: ["Sunshine#Rainy7", "qwerty123", "P!nkTr33$Moon", "7Blue!Rocket#"], correctIndex: 1 },
              { question: "What makes a password strong?", options: ["Using your pet's name", "Keeping it short and simple", "Mixing letters, numbers, and symbols", "Using the same one everywhere"], correctIndex: 2 },
              { question: "How fast can hackers crack a simple password like 123456?", options: ["Several days", "A few hours", "Almost instantly", "They can't crack it"], correctIndex: 2 },
              { question: "Which password is strongest?", options: ["football", "Football1", "F00tb@ll!2024", "Football123"], correctIndex: 2 },
            ],
            xpReward: 100,
            completeMessage: "The Keybreaker can't get through that. Well done Guardian.",
          },
          elite: {
            storyTitle: "Weak Wall Wasteland",
            storyText: "Cyber Hero — the Keybreaker uses something called a brute force attack. He tries thousands of common passwords until one works. Weak passwords are statistically the number one cause of account breaches. Understanding what makes a password strong is your most critical defense skill. Study this carefully.",
            miniGame: {
              type: "strong-or-smash",
              timerSeconds: 20,
              hints: false,
              items: [
                { label: "P@ssword99", correct: false },
                { label: "xK#9mQ!vL2$n", correct: true },
                { label: "Admin1234!", correct: false },
                { label: "Tr0ub4dor&3#Sky", correct: true },
                { label: "Welcome1!", correct: false },
                { label: "9$kLm#Xv2!pQ", correct: true },
                { label: "Summer2024!", correct: false },
                { label: "Qw3r!y#Zx9$", correct: true },
                { label: "iloveyou2024", correct: false },
                { label: "B!rd$Fly#H1gh", correct: true },
                { label: "Monkey2024!", correct: false },
                { label: "7xK$mN!2vLq", correct: true },
                { label: "Trustno1!", correct: false },
                { label: "R@1n&St0rm#5", correct: true },
                { label: "abc123!", correct: false },
                { label: "Zk9#mX!vQ2$p", correct: true },
                { label: "Dragon2024", correct: false },
                { label: "W!nt3r$now#8", correct: true },
              ],
            },
            questions: [
              { question: "What type of attack involves trying thousands of common passwords automatically?", options: ["Phishing attack", "Brute force attack", "Social engineering", "Malware injection"], correctIndex: 1 },
              { question: "Which password would take the longest to crack?", options: ["iloveyou2024", "Tr0ub4dor&3#Sky", "Admin1234!", "P@ssword99"], correctIndex: 1 },
              { question: "Why is using your name or birthday in a password dangerous?", options: ["It makes the password too long", "It's personal information that attackers can easily find online", "It confuses the system", "It's against most platforms' rules"], correctIndex: 1 },
              { question: "What is a dictionary attack?", options: ["When a hacker looks up your password in a book", "When attackers use a list of common words and phrases to guess passwords", "When a virus steals your password dictionary", "A type of phishing scam"], correctIndex: 1 },
            ],
            xpReward: 150,
            completeMessage: "Weak Wall Wasteland secured. Threat neutralized.",
          },
        },
      },
      {
        id: "na-zone-3",
        name: "Recipe Ridge",
        emoji: "📋",
        description: "Cook up a password so strong nobody can crack it!",
        content: {
          junior: {
            storyTitle: "Recipe Ridge",
            storyText: "Welcome to Recipe Ridge Guardian! Every great password has a secret recipe — just like cookies! 🍪 You need CAPITAL letters, small letters, numbers AND special symbols! Mix them all together and you've got a super strong password the Keybreaker can NEVER crack!",
            miniGame: {
              type: "password-chef",
              timerSeconds: 60,
              hints: true,
              passThreshold: 60,
              items: [
                { label: "CAPITAL LETTERS (A-Z)", correct: true },
                { label: "lowercase letters (a-z)", correct: true },
                { label: "Numbers (0-9)", correct: true },
                { label: "Symbols (!@#$)", correct: true },
              ],
            },
            questions: [
              { question: "What ingredients make a strong password?", options: ["Just numbers", "Capital letters, small letters, numbers and symbols", "Only your name"], correctIndex: 1 },
              { question: "Which password used the recipe correctly?", options: ["sunshine", "Sun$h1ne!", "SUNSHINE"], correctIndex: 1 },
              { question: "What makes a password harder to crack?", options: ["Making it shorter", "Using only letters", "Mixing different types of characters"], correctIndex: 2 },
            ],
            xpReward: 50,
            completeMessage: "That recipe is PERFECT! The Keybreaker can't crack THAT! 🍪⭐",
          },
          hero: {
            storyTitle: "Recipe Ridge",
            storyText: "Guardian — building a strong password isn't random. There's actually a recipe for it. Capital letters. Lowercase letters. Numbers. Special characters. The longer and more mixed up it is, the stronger it gets. Let me show you how to put it all together.",
            miniGame: {
              type: "password-chef",
              timerSeconds: 45,
              hints: false,
              passThreshold: 75,
              items: [
                { label: "CAPITAL LETTERS (A-Z)", correct: true },
                { label: "lowercase letters (a-z)", correct: true },
                { label: "Numbers (0-9)", correct: true },
                { label: "Symbols (!@#$)", correct: true },
                { label: "Length (12+ chars)", correct: true },
                { label: "Your pet's name", correct: false },
              ],
            },
            questions: [
              { question: "Which combination makes the strongest password?", options: ["All lowercase letters", "Letters and numbers only", "Uppercase, lowercase, numbers and symbols", "All uppercase letters"], correctIndex: 2 },
              { question: "Which password best follows the recipe?", options: ["bluesky123", "BlueSky123", "Blu3$ky!23", "BLUESKY123"], correctIndex: 2 },
              { question: "Why does length matter in a password?", options: ["Longer passwords are easier to remember", "Longer passwords create more possible combinations making them harder to crack", "Short passwords are actually more secure", "Length doesn't matter as long as you use symbols"], correctIndex: 1 },
              { question: "What should you AVOID when creating a password?", options: ["Adding symbols", "Using a mix of characters", "Using your full name or birthday", "Making it longer than 8 characters"], correctIndex: 2 },
            ],
            xpReward: 100,
            completeMessage: "Recipe Ridge locked down. That password is rock solid.",
          },
          elite: {
            storyTitle: "Recipe Ridge",
            storyText: "Cyber Hero — password strength is measurable. It comes down to complexity and length — what we call entropy. A 12 character password using all four character types — uppercase, lowercase, numbers, symbols — creates billions of possible combinations. That's what we're building today.",
            miniGame: {
              type: "password-chef",
              timerSeconds: 35,
              hints: false,
              passThreshold: 90,
              items: [
                { label: "CAPITAL LETTERS (A-Z)", correct: true },
                { label: "lowercase letters (a-z)", correct: true },
                { label: "Numbers (0-9)", correct: true },
                { label: "Symbols (!@#$)", correct: true },
                { label: "Length (16+ chars)", correct: true },
                { label: "Unpredictable pattern", correct: true },
                { label: "Your birthday", correct: false },
                { label: "Dictionary word", correct: false },
              ],
            },
            questions: [
              { question: "What is password entropy?", options: ["The emotional strength of a password", "A measure of password unpredictability and complexity", "The length of time before a password expires", "The number of failed login attempts allowed"], correctIndex: 1 },
              { question: "Which password has the highest entropy?", options: ["Monkey2024!", "P@ssw0rd123", "xK#9mQ!vL2$n", "Tr0ub4dor123"], correctIndex: 2 },
              { question: "Why are passphrases sometimes more secure than complex short passwords?", options: ["They're easier to type", "They use dictionary words which are safer", "Their length creates high entropy even without complex characters", "They don't require symbols"], correctIndex: 2 },
              { question: "What is the minimum recommended password length by most cybersecurity standards?", options: ["6 characters", "8 characters", "12 characters", "20 characters"], correctIndex: 2 },
            ],
            xpReward: 150,
            completeMessage: "Optimal password construction confirmed. Zone complete.",
          },
        },
      },
      {
        id: "na-zone-4",
        name: "Secret Summit",
        emoji: "🤫",
        description: "Shh… your password is YOUR secret weapon!",
        content: {
          junior: {
            storyTitle: "Secret Summit",
            storyText: "Psssst — Guardian! Come closer… your password is a SECRET. That means nobody — not even your best friend — should ever know it! Even if someone REALLY nice asks — the answer is always NO! Your secret stays YOUR secret! 🤫",
            miniGame: {
              type: "who-do-you-trust",
              timerSeconds: 40,
              hints: true,
              items: [
                { label: "A cartoon villain says: 'Give me your password!'", correct: false },
                { label: "A stranger online says: 'What's your password? I'll help you!'", correct: false },
                { label: "Your best friend says: 'Tell me your password so we can share!'", correct: false },
                { label: "A kid at school says: 'Everyone shares passwords — what's yours?'", correct: false },
                { label: "A pop-up says: 'Enter your password to win a prize!'", correct: false },
              ],
            },
            questions: [
              { question: "Who should you share your password with?", options: ["Your best friend", "Nobody", "Your teacher"], correctIndex: 1 },
              { question: "Your friend asks for your password to help you log in. What do you do?", options: ["Tell them — they're your friend", "Say no — your password is always private", "Write it down for them"], correctIndex: 1 },
              { question: "Why is your password a secret?", options: ["Because it sounds cool", "Because sharing it lets others get into your account", "Because everyone has one"], correctIndex: 1 },
            ],
            xpReward: 50,
            completeMessage: "Your secret is SAFE! Nobody is getting that password! 🤫⭐",
          },
          hero: {
            storyTitle: "Secret Summit",
            storyText: "Guardian — you've built a strong password. Now the most important rule: never share it. Not with friends, not with classmates, not with anyone. Even people you trust can accidentally let it slip, get hacked themselves, or misuse it. Your password only works as protection when it's yours alone.",
            miniGame: {
              type: "who-do-you-trust",
              timerSeconds: 30,
              hints: false,
              items: [
                { label: "Your classmate says: 'Can I borrow your password real quick?'", correct: false },
                { label: "A friendly older student says: 'I'll fix your account — just tell me your password.'", correct: false },
                { label: "Your best friend says: 'We share everything — share your password too!'", correct: false },
                { label: "A teacher says: 'I need your password to check something.'", correct: false },
                { label: "A website pop-up says: 'Verify your password to continue.'", correct: false },
                { label: "Your cousin says: 'Tell me your password so I can log in for you.'", correct: false },
                { label: "An online game friend says: 'Share passwords so we can help each other!'", correct: false },
                { label: "A school admin email says: 'Please reply with your password for records.'", correct: false },
              ],
            },
            questions: [
              { question: "Your classmate forgot their password and asks to use yours temporarily. What do you do?", options: ["Share it — they'll delete it after", "Refuse — your password should never be shared", "Write it on a piece of paper", "Tell a teacher to share it"], correctIndex: 1 },
              { question: "Which of these is NEVER okay?", options: ["Changing your password regularly", "Using a long password", "Sharing your password with a trusted friend", "Using different passwords for each account"], correctIndex: 2 },
              { question: "Why is sharing your password risky even with someone you trust?", options: ["They might change it", "They could accidentally expose it or get hacked themselves", "It makes the password weaker", "It's not actually risky with trusted people"], correctIndex: 1 },
              { question: "Someone online claims to be from the game support team and needs your password to fix your account. What do you do?", options: ["Share it — they're official support", "Ask your parents first", "Never share it — legitimate services never ask for your password", "Share just the first few characters"], correctIndex: 2 },
            ],
            xpReward: 100,
            completeMessage: "Secret Summit secured. Your password stays yours.",
          },
          elite: {
            storyTitle: "Secret Summit",
            storyText: "Cyber Hero — some of the biggest security breaches in history happened not because of hacking — but because someone shared their password. Social engineering is when attackers manipulate people into giving up passwords willingly. It's more common than brute force attacks. Your password is only as strong as your ability to keep it secret.",
            miniGame: {
              type: "who-do-you-trust",
              timerSeconds: 20,
              hints: false,
              items: [
                { label: "Your school IT admin emails: 'Password audit — reply with your password.'", correct: false },
                { label: "A trusted friend says: 'Share your Netflix password — everyone does it.'", correct: false },
                { label: "An urgent pop-up: 'Your account will be deleted — enter password NOW!'", correct: false },
                { label: "A phone call: 'This is tech support. We need your password to fix a virus.'", correct: false },
                { label: "Your team captain: 'Give me the shared account password.'", correct: false },
                { label: "A professional-looking email: 'Security upgrade requires password verification.'", correct: false },
                { label: "Your sibling: 'Just tell me your password — I won't tell anyone.'", correct: false },
                { label: "A chat message: 'I'm from the game company — password needed for prize claim.'", correct: false },
                { label: "A classmate: 'The teacher said we should share passwords for the project.'", correct: false },
                { label: "A police officer online: 'We need your password for an investigation.'", correct: false },
                { label: "A website: 'Confirm identity by re-entering password on this page.'", correct: false },
                { label: "Your coach: 'Give me your account password so I can monitor your activity.'", correct: false },
              ],
            },
            questions: [
              { question: "What is social engineering in cybersecurity?", options: ["Building secure social media profiles", "Manipulating people psychologically to reveal confidential information", "Engineering software for social networks", "A type of malware attack"], correctIndex: 1 },
              { question: "An email from your school IT department asks you to verify your password due to a system upgrade. What do you do?", options: ["Reply with your password — it's from school", "Ignore it completely", "Recognize it as a likely phishing attempt — legitimate IT never asks for passwords", "Forward it to friends to check"], correctIndex: 2 },
              { question: "Why do cybercriminals often target friends and family relationships to obtain passwords?", options: ["Family members have better passwords", "People are more likely to comply with requests from people they trust", "Family accounts have less security", "Friend networks are less monitored"], correctIndex: 1 },
              { question: "What is pretexting?", options: ["Sending fake text messages", "Creating a fabricated scenario to manipulate someone into sharing information", "A type of password encryption", "Pre-screening passwords for weakness"], correctIndex: 1 },
            ],
            xpReward: 150,
            completeMessage: "Operational security maintained. Zone complete.",
          },
        },
      },
      {
        id: "na-zone-5",
        name: "Reuse Ruins",
        emoji: "♻️",
        description: "One password for everything? That's exactly what he wants!",
        content: {
          junior: {
            storyTitle: "Reuse Ruins",
            storyText: "Guardian — imagine using the same key for your house, your bike, your diary AND your school locker. If someone got that key… they'd have EVERYTHING! Same with passwords! Every account needs its OWN special password. That way if one gets stolen — the rest stay safe! 🔑🔑🔑",
            miniGame: {
              type: "key-matcher",
              timerSeconds: 45,
              hints: true,
              items: [
                { label: "Email", correct: true },
                { label: "Games", correct: true },
                { label: "School", correct: true },
                { label: "Photos", correct: true },
              ],
            },
            questions: [
              { question: "Should you use the same password for every account?", options: ["Yes — it's easier to remember", "No — every account needs its own password", "Only for games"], correctIndex: 1 },
              { question: "What happens if the Keybreaker gets your one password for everything?", options: ["Nothing bad", "He can get into ALL your accounts", "Only one account is affected"], correctIndex: 1 },
              { question: "How many different passwords should you have?", options: ["Just one", "Two — one for games one for school", "A different one for each account"], correctIndex: 2 },
            ],
            xpReward: 50,
            completeMessage: "Every account has its own key now! The Keybreaker can't get them ALL! 🔑⭐",
          },
          hero: {
            storyTitle: "Reuse Ruins",
            storyText: "Guardian — using the same password for everything seems easier. But it's one of the biggest mistakes you can make. If the Keybreaker cracks ONE account he now has access to ALL of them. Different passwords for different accounts means one breach doesn't become a disaster.",
            miniGame: {
              type: "key-matcher",
              timerSeconds: 35,
              hints: false,
              items: [
                { label: "Email", correct: true },
                { label: "Gaming", correct: true },
                { label: "School", correct: true },
                { label: "Social Media", correct: true },
                { label: "Banking", correct: true },
                { label: "Shopping", correct: true },
                { label: "Cloud Storage", correct: true },
                { label: "Streaming", correct: true },
              ],
            },
            questions: [
              { question: "Why is reusing passwords dangerous?", options: ["It makes passwords weaker", "One stolen password gives access to every account that uses it", "It's against the rules", "Reusing passwords is actually fine"], correctIndex: 1 },
              { question: "What is the safest approach to managing multiple passwords?", options: ["Use one strong password for everything", "Use two or three passwords and rotate them", "Use a unique password for every single account", "Write them all in a notebook"], correctIndex: 2 },
              { question: "If your gaming account password gets stolen and it's the same as your email password what's the risk?", options: ["None — they're different websites", "The attacker can now access your email too", "Only your gaming account is at risk", "The passwords automatically change"], correctIndex: 1 },
              { question: "What's the best tool for managing lots of different passwords?", options: ["A sticky note on your monitor", "A password manager", "Your memory alone", "A shared document"], correctIndex: 1 },
            ],
            xpReward: 100,
            completeMessage: "Reuse Ruins cleared. Every account locked down separately.",
          },
          elite: {
            storyTitle: "Reuse Ruins",
            storyText: "Cyber Hero — there's an attack called credential stuffing. Hackers take leaked username and password combinations and try them across hundreds of websites automatically. If you reuse passwords, one data breach from any site exposes every account you own. Unique passwords per account is non-negotiable in modern security practice.",
            miniGame: {
              type: "key-matcher",
              timerSeconds: 25,
              hints: false,
              items: [
                { label: "Email", correct: true },
                { label: "Gaming", correct: true },
                { label: "School Portal", correct: true },
                { label: "Social Media", correct: true },
                { label: "Banking", correct: true },
                { label: "Shopping", correct: true },
                { label: "Cloud Storage", correct: true },
                { label: "Streaming", correct: true },
                { label: "Work VPN", correct: true },
                { label: "Password Mgr", correct: true },
                { label: "Dev Tools", correct: true },
                { label: "Forum", correct: true },
              ],
            },
            questions: [
              { question: "What is credential stuffing?", options: ["Adding extra characters to strengthen passwords", "Using leaked login credentials to attempt access across multiple platforms", "Stuffing multiple passwords into one account", "A brute force variation targeting one account"], correctIndex: 1 },
              { question: "A major gaming platform suffers a data breach. You use the same password there as your email. What is the immediate risk?", options: ["Only the gaming account is compromised", "Your email and any other accounts sharing that password are immediately at risk", "The breach only affects users who logged in that day", "Changing the gaming password is enough protection"], correctIndex: 1 },
              { question: "Why are password managers considered best practice?", options: ["They share passwords securely with trusted contacts", "They generate and store unique complex passwords for every account", "They simplify passwords to make them memorable", "They automatically change passwords every day"], correctIndex: 1 },
              { question: "What makes credential stuffing attacks particularly dangerous?", options: ["They target only high-profile accounts", "They're slow and easy to detect", "They're fully automated and can test millions of combinations across sites simultaneously", "They only work on unsecured networks"], correctIndex: 2 },
            ],
            xpReward: 150,
            completeMessage: "Unique credential architecture confirmed. Zone complete.",
          },
        },
      },
      {
        id: "na-zone-6",
        name: "Fake Gate Falls",
        emoji: "🚪",
        description: "Warning! Something here isn't what it seems…",
        content: {
          junior: {
            storyTitle: "Fake Gate Falls",
            storyText: "Guardian — the Keybreaker is SNEAKY. He builds fake doors that look just like real ones to trick you into giving him your password! If a login page looks weird or asks for your password in a funny way — STOP! Check with a grown up first! Real websites never try to trick you! 🚨",
            miniGame: {
              type: "real-or-fake",
              timerSeconds: 40,
              hints: true,
              items: [
                { label: "www.coolkidsgames.com/login", correct: true },
                { label: "www.co0lkidsgamez.com/login", correct: false },
                { label: "www.school-portal.edu/login", correct: true },
                { label: "www.skool-p0rtal.net/login", correct: false },
                { label: "www.kidsemail.com/login", correct: true },
                { label: "www.k1dsema1l.xyz/free-login", correct: false },
              ],
            },
            questions: [
              { question: "What is a fake login page?", options: ["A page that looks real but steals your password", "A broken website", "A login page for games only"], correctIndex: 0 },
              { question: "What should you do if a login page looks weird?", options: ["Type your password anyway", "Stop and ask a grown up", "Close the whole computer"], correctIndex: 1 },
              { question: "What does the Keybreaker want you to do on a fake page?", options: ["Play a game", "Type in your password so he can steal it", "Watch a video"], correctIndex: 1 },
            ],
            xpReward: 50,
            completeMessage: "You spotted EVERY fake! The Keybreaker's tricks didn't work! 🚪⭐",
          },
          hero: {
            storyTitle: "Fake Gate Falls",
            storyText: "Guardian — the Keybreaker creates fake login pages that look exactly like real ones. You type in your password thinking you're logging in — but you're actually handing it straight to him. Always check the website address before you type anything. If something feels off — trust that feeling.",
            miniGame: {
              type: "real-or-fake",
              timerSeconds: 30,
              hints: false,
              items: [
                { label: "https://www.facebook.com/login", correct: true },
                { label: "https://www.faceb00k.com/login", correct: false },
                { label: "https://accounts.google.com", correct: true },
                { label: "https://acc0unts-google.com", correct: false },
                { label: "https://www.instagram.com/login", correct: true },
                { label: "https://www.lnstagram.com/login", correct: false },
                { label: "https://www.roblox.com/login", correct: true },
                { label: "https://www.rob1ox-free.com/login", correct: false },
                { label: "https://www.youtube.com", correct: true },
                { label: "https://www.y0utube-rewards.net", correct: false },
              ],
            },
            questions: [
              { question: "What is the first thing to check before logging into any website?", options: ["The logo looks correct", "The website address in the browser bar", "The page loads quickly", "The login button colour"], correctIndex: 1 },
              { question: "A website asks for your password but the address bar shows 'faceb00k.com' instead of 'facebook.com.' What is this?", options: ["A typo by the website team", "A fake login page trying to steal your password", "A new version of the site", "A secure login page"], correctIndex: 1 },
              { question: "Which of these is a warning sign of a fake login page?", options: ["The page loads quickly", "The URL looks slightly different from the real site", "The logo is colourful", "It asks for your username"], correctIndex: 1 },
              { question: "What should you do if you accidentally typed your password into a fake page?", options: ["Nothing — it's probably fine", "Change your password immediately on the real site", "Delete the browser", "Create a new account"], correctIndex: 1 },
            ],
            xpReward: 100,
            completeMessage: "Fake Gate Falls cleared. No fake page gets past you now.",
          },
          elite: {
            storyTitle: "Fake Gate Falls",
            storyText: "Cyber Hero — this is a spoofed login page. It mirrors the design of a legitimate site but the domain is slightly altered — a technique called typosquatting. Fake login pages are one of the most effective credential harvesting methods. Knowing exactly what to look for is what separates a Cyber Hero from a victim.",
            miniGame: {
              type: "real-or-fake",
              timerSeconds: 20,
              hints: false,
              items: [
                { label: "https://accounts.google.com/signin", correct: true },
                { label: "https://accounts-google.com/signin", correct: false },
                { label: "https://www.paypal.com/login", correct: true },
                { label: "https://www.paypa1.com/login", correct: false },
                { label: "https://login.microsoftonline.com", correct: true },
                { label: "https://login-microsoftonline.com", correct: false },
                { label: "https://www.amazon.com/ap/signin", correct: true },
                { label: "https://www.amaz0n-secure.com/signin", correct: false },
                { label: "https://github.com/login", correct: true },
                { label: "https://githubb.com/login", correct: false },
                { label: "https://www.apple.com/account", correct: true },
                { label: "https://www.apple-id-verify.com/account", correct: false },
                { label: "https://twitter.com/login", correct: true },
                { label: "https://twiitter-verify.com/login", correct: false },
              ],
            },
            questions: [
              { question: "What is typosquatting?", options: ["A technique to strengthen passwords using typos", "Registering domain names similar to legitimate sites to deceive users", "A type of keyboard-based malware", "Squatting on expired domains for advertising"], correctIndex: 1 },
              { question: "What does a missing HTTPS padlock in the browser indicate?", options: ["The site is loading slowly", "The connection may not be encrypted and could be insecure", "The site requires a login", "The site is new and trustworthy"], correctIndex: 1 },
              { question: "What is a credential harvesting attack?", options: ["Collecting strong passwords for research", "Using fake pages or forms to trick users into submitting their login information", "Harvesting data from public databases", "A malware attack that copies saved passwords"], correctIndex: 1 },
              { question: "Beyond checking the URL what else can help verify a legitimate login page?", options: ["The page design matches what you remember", "Checking for a valid SSL certificate and using bookmarked links", "The page loaded from a search result", "The login form has a CAPTCHA"], correctIndex: 1 },
            ],
            xpReward: 150,
            completeMessage: "Spoofed credential harvesting attempt neutralized. Zone complete.",
          },
        },
      },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    emoji: "🏰",
    color: "from-violet-500/20 to-purple-600/20",
    villainColor: "text-violet-400",
    villain: "THE PHISHER KING",
    villainEmoji: "🎣",
    totalZones: 6,
    byteIntro: {
      junior: "Watch out! The Phisher King sends tricky messages to steal your info! Let's learn to spot his tricks! 🎣",
      hero: "The Phisher King rules Europe's dark web — sending fake emails and messages to trick people. Time to learn how to identify phishing!",
      elite: "The Phisher King orchestrates sophisticated social engineering campaigns across Europe. Your mission: master phishing detection and defense.",
    },
    zones: [],
  },
  {
    id: "africa",
    name: "Africa",
    emoji: "🌍",
    color: "from-amber-500/20 to-orange-600/20",
    villainColor: "text-amber-400",
    villain: "THE TROLL LORD",
    villainEmoji: "👹",
    totalZones: 6,
    byteIntro: {
      junior: "The Troll Lord is being mean to people online! Let's learn how to stay safe and be kind! 💪",
      hero: "The Troll Lord spreads cyberbullying across Africa. Your mission: learn how to handle online harassment and protect others.",
      elite: "The Troll Lord weaponizes social platforms for targeted harassment campaigns. Master digital citizenship and counter-trolling strategies.",
    },
    zones: [],
  },
  {
    id: "asia",
    name: "Asia",
    emoji: "🏯",
    color: "from-rose-500/20 to-red-600/20",
    villainColor: "text-rose-400",
    villain: "THE FIREWALL PHANTOM",
    villainEmoji: "👻",
    totalZones: 7,
    byteIntro: {
      junior: "The Firewall Phantom sneaks into computers! Let's build walls to keep him out! 🧱",
      hero: "The Firewall Phantom exploits network vulnerabilities across Asia. Learn about firewalls, encryption, and network security!",
      elite: "The Firewall Phantom breaches enterprise networks using zero-day exploits. Your mission: master network defense and intrusion detection.",
    },
    zones: [],
  },
  {
    id: "south-america",
    name: "South America",
    emoji: "🌿",
    color: "from-emerald-500/20 to-green-600/20",
    villainColor: "text-emerald-400",
    villain: "THE DATA THIEF",
    villainEmoji: "🦹",
    totalZones: 5,
    byteIntro: {
      junior: "The Data Thief is stealing people's personal info! Let's learn what to keep private! 🔒",
      hero: "The Data Thief harvests personal data across South America. Learn to protect your digital identity and privacy!",
      elite: "The Data Thief runs sophisticated data exfiltration operations. Master data privacy, encryption, and digital rights management.",
    },
    zones: [],
  },
  {
    id: "australia",
    name: "Australia",
    emoji: "🦘",
    color: "from-sky-500/20 to-teal-600/20",
    villainColor: "text-sky-400",
    villain: "MALWARE MAX",
    villainEmoji: "🦠",
    totalZones: 5,
    byteIntro: {
      junior: "Malware Max hides bad stuff in games and apps! Let's learn to spot his tricks! 🛡️",
      hero: "Malware Max spreads viruses and trojans across Australia. Learn to identify and defend against malware!",
      elite: "Malware Max deploys polymorphic malware and ransomware at scale. Master malware analysis and incident response protocols.",
    },
    zones: [],
  },
  {
    id: "antarctica",
    name: "Antarctica",
    emoji: "❄️",
    color: "from-slate-400/20 to-blue-400/20",
    villainColor: "text-slate-300",
    villain: "SHADOWBYTE",
    villainEmoji: "🌑",
    totalZones: 4,
    byteIntro: {
      junior: "Shadowbyte hides in the darkest corners of the internet! This is the final challenge! ⚡",
      hero: "Shadowbyte is the ultimate villain — master of all cyber threats. Prove you're ready to be a true Cyber Guardian!",
      elite: "Shadowbyte orchestrates advanced persistent threats from the shadows. This is your final exam — demonstrate mastery of all cybersecurity domains.",
    },
    zones: [],
  },
];
