import { AlertTriangle, Lock, Eye, Shield } from "lucide-react";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

export type AgeTier = "junior" | "defender" | "guardian";
export type LearningMode = "quick" | "standard" | "deep" | "auto";

export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  sender?: string;
  subject?: string;
  body?: string;
  fakeLink?: string;
  senderIcon?: string;
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  guide: { name: string; image: string };
  questionsByTier: Record<AgeTier, Question[]>;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
}

export const LEVEL_NAMES = ["Training", "Challenge", "Mastery"] as const;
export const LEVEL_EMOJIS = ["🎯", "⚔️", "👑"] as const;

export const LEARNING_MODE_CONFIG: Record<LearningMode, {
  label: string;
  gamesPerLevel: number;
  totalGames: number;
  description: string;
  emoji: string;
}> = {
  quick: { label: "Quick Play", gamesPerLevel: 1, totalGames: 3, description: "3 games · ~5 min", emoji: "⚡" },
  standard: { label: "Standard", gamesPerLevel: 2, totalGames: 6, description: "6 games · ~10 min", emoji: "📚" },
  deep: { label: "Deep Practice", gamesPerLevel: 3, totalGames: 9, description: "9+ games · ~15 min", emoji: "🧠" },
  auto: { label: "Auto-Generate More", gamesPerLevel: 3, totalGames: 10, description: "Unlimited practice", emoji: "♾️" },
};

export function getAgeTier(age: number): AgeTier {
  if (age <= 7) return "junior";
  if (age <= 10) return "defender";
  return "guardian";
}

export function getTierLabel(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "Junior Heroes";
    case "defender": return "Cyber Defenders";
    case "guardian": return "Cyber Guardians";
  }
}

export function getTierEmoji(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "🌟";
    case "defender": return "🛡️";
    case "guardian": return "⚔️";
  }
}

export function getPointsPerCorrect(tier: AgeTier): number {
  switch (tier) {
    case "junior": return 10;
    case "defender": return 15;
    case "guardian": return 20;
  }
}

export function getMissionQuestions(mission: MissionDef, age: number): Question[] {
  return mission.questionsByTier[getAgeTier(age)];
}

export function getTotalGames(mode: LearningMode): number {
  return LEARNING_MODE_CONFIG[mode].totalGames;
}

export interface MissionLevel {
  name: string;
  emoji: string;
  level: number;
  questions: Question[];
  locked: boolean;
}

/**
 * Get mission structured into 3 levels based on learning mode.
 * Questions cycle if we need more than available.
 */
export function getMissionLevels(
  mission: MissionDef,
  age: number,
  mode: LearningMode,
  completedGames: number
): MissionLevel[] {
  const allQuestions = getMissionQuestions(mission, age);
  const config = LEARNING_MODE_CONFIG[mode];
  const gamesPerLevel = config.gamesPerLevel;

  return LEVEL_NAMES.map((name, i) => {
    const questions: Question[] = [];
    for (let j = 0; j < gamesPerLevel; j++) {
      const qIdx = (i * gamesPerLevel + j) % allQuestions.length;
      questions.push(allQuestions[qIdx]);
    }
    const levelStart = i * gamesPerLevel;
    const locked = i > 0 && completedGames < levelStart;
    return {
      name,
      emoji: LEVEL_EMOJIS[i],
      level: i + 1,
      questions,
      locked,
    };
  });
}

/** Get flat list of all questions for a mission based on learning mode */
export function getMissionGames(mission: MissionDef, age: number, mode: LearningMode): Question[] {
  const allQuestions = getMissionQuestions(mission, age);
  const config = LEARNING_MODE_CONFIG[mode];
  const total = config.totalGames;
  const games: Question[] = [];
  for (let i = 0; i < total; i++) {
    games.push(allQuestions[i % allQuestions.length]);
  }
  return games;
}

export const MISSIONS: MissionDef[] = [
  {
    id: "scam-detection",
    title: "Spot the Scam!",
    description: "Learn to tell real messages from fake ones. Detective Whiskers will help!",
    icon: AlertTriangle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    badgeId: "scam-spotter",
    badgeName: "Scam Spotter",
    badgeIcon: "🔍",
    questionsByTier: {
      junior: [
        {
          question: "Is this message safe or a scam?",
          sender: "🎁 Mystery Prize Bot",
          senderIcon: "🎁",
          subject: "You won a FREE toy!",
          body: "Click the big button to get your toy NOW!!! 🧸🎉",
          fakeLink: "👉 CLICK HERE FOR TOY",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Nobody gives free toys to strangers online. If it sounds too good, tell a grown-up!",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "Mom 💕",
          senderIcon: "👩",
          subject: "Dinner time!",
          body: "Hey sweetie, dinner is ready! Come to the kitchen. Love you! 🍕",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Messages from your family that you recognize are totally okay. 💕",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "⚠️ VIRUS ALERT",
          senderIcon: "⚠️",
          subject: "YOUR TABLET HAS A VIRUS!!!",
          body: "Call this number RIGHT NOW or your tablet will BREAK! 😱📞",
          fakeLink: "📞 CALL 1-800-FAKE",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Real virus warnings don't yell at you or ask you to call a number. Close it and tell an adult!",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "Ms. Johnson 📚",
          senderIcon: "👩‍🏫",
          subject: "Homework reminder",
          body: "Don't forget to read chapter 3 for tomorrow! Have a great evening!",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Your teacher is just reminding you about homework on the school app. 📚",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "Cool_Stranger_99",
          senderIcon: "🕵️",
          subject: "I can make you FAMOUS!",
          body: "Hey kid! Send me your photo and I'll put you on TV! You'll be a STAR! ⭐📸",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Never send photos to strangers online. Real TV people don't ask random kids for photos!",
        },
      ],
      defender: [
        {
          question: "Is this message safe or a scam?",
          sender: "security@r0blox-alerts.com",
          senderIcon: "🎮",
          subject: "URGENT: Your Roblox account will be DELETED",
          body: "Dear user, we detected suspicious activity on your account. Your account will be permanently deleted in 24 hours unless you verify your identity. Click the link below and enter your password immediately.",
          fakeLink: "🔗 r0blox-verify.com/save-account",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Phishing scam! Notice the email uses 'r0blox' (with a zero) not 'Roblox.' Real companies never ask for your password in an email. Always go to the real website directly.",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "school@myschool.edu",
          senderIcon: "🏫",
          subject: "Field Trip to Science Museum — Next Friday",
          body: "Dear parents, this is a reminder that the field trip to the City Science Museum is next Friday. Please return the signed permission slip by Wednesday. Bring a packed lunch!",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This looks safe! The email matches what your teacher mentioned, comes from the official school address, and has realistic details.",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "+1-555-WINNER",
          senderIcon: "📱",
          subject: "🎉 CONGRATULATIONS!!! 🎉",
          body: "You've been randomly selected to win a FREE iPhone 15!! This is NOT a joke! Click the link below within 10 minutes or you'll lose your prize forever!",
          fakeLink: "🔗 bit.ly/fr33-ph0ne-now",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Classic scam! Red flags: suspicious shortened link with numbers replacing letters, urgency pressure ('10 minutes!'), and nobody randomly gives away phones.",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "YouTube Ads",
          senderIcon: "▶️",
          subject: "New update for Dragon Quest!",
          body: "Dragon Quest Heroes has a new expansion! Download it from the official App Store today. Rated E for Everyone.",
          fakeLink: "🔗 apps.apple.com/dragon-quest",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This is likely safe! The link goes to the official App Store. Always double-check the developer name matches the real game company.",
        },
        {
          question: "Is this message safe or a scam?",
          sender: "xX_MinecraftAdmin_Xx",
          senderIcon: "💬",
          subject: "FREE DIAMONDS — Discord DM",
          body: "Hey bro! I'm an official Minecraft admin. If you give me your login details, I'll add 10,000 diamonds to your account. This is a limited-time offer for VIP players only!!",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Scam alert! No real game admin asks for your password through DMs. They don't need your login to give you items. This is someone trying to steal your account.",
        },
      ],
      guardian: [
        {
          question: "What do you think about this email?",
          sender: "noreply@amaz0n-security.com",
          senderIcon: "📧",
          subject: "URGENT: Suspicious Activity Detected on Your Account",
          body: "We have detected an unauthorized purchase of $847.99 on your account. If you did not make this purchase, you must verify your payment information within 2 hours to prevent your account from being suspended. Click below to verify your identity.",
          fakeLink: "🔗 amaz0n-security.com/verify-payment",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "Phishing email! Notice 'amaz0n' uses a zero instead of 'o', and the domain is 'amaz0n-security.com' — not amazon.com. Urgency pressure ('2 hours') is a manipulation tactic. Real Amazon emails come from @amazon.com.",
        },
        {
          question: "What do you think about this notification?",
          sender: "Google Classroom",
          senderIcon: "📖",
          subject: "New Assignment: Chapter 5 Reading Response",
          body: "Mrs. Chen posted a new assignment in English Language Arts. Read Chapter 5 and complete the response worksheet in the linked Google Doc. Due: Friday at 3pm.",
          fakeLink: "🔗 docs.google.com/document/d/...",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "This is safe. It came through Google Classroom (a trusted platform), from a known teacher, linking to a Google Doc — all consistent and expected.",
        },
        {
          question: "What do you think about this ad?",
          sender: "CyberKids Academy Pro",
          senderIcon: "📢",
          subject: "🎓 FREE Cybersecurity Course for Kids!",
          body: "Enroll your child in our premium cybersecurity course — completely FREE! We just need your parent's credit card for age verification purposes. You will NOT be charged. Limited spots available, act now!",
          fakeLink: "🔗 cyberkids-pro.net/enroll-free",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "If it's truly free, why do they need a credit card? 'Age verification' via credit card is a trick to charge hidden fees. The urgency ('limited spots!') is pressure. Never enter payment info for 'free' offers.",
        },
        {
          question: "What do you think about this website?",
          sender: "gooogle.com",
          senderIcon: "🌐",
          subject: "Sign in to your Google Account",
          body: "Your session has expired. Please enter your email and password to continue using Google services. This page looks exactly like the real Google login page.",
          fakeLink: "🔗 gooogle.com/accounts/signin",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "This is 'typosquatting' — a fake website with a misspelled URL (three o's). The real Google is google.com. Always check the URL carefully before entering credentials. Bookmark important sites!",
        },
        {
          question: "What do you think about this link?",
          sender: "Alex (your friend)",
          senderIcon: "👋",
          subject: "Check out this cool science article!",
          body: "Hey! Look at this amazing discovery about a new species of deep-sea fish. It's from BBC News. Pretty wild, right?",
          fakeLink: "🔗 https://www.bbc.com/news/science-environment/deep-sea-fish",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "This appears safe. BBC.com is a well-known news site, the URL uses HTTPS, and it was shared by a friend you know personally. Still, always verify surprising claims independently!",
        },
      ],
    },
  },
  {
    id: "password-safety",
    title: "Password Power!",
    description: "Create super strong passwords that no villain can crack!",
    icon: Lock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    guide: { name: "Professor Hoot", image: wiseOwl },
    badgeId: "password-pro",
    badgeName: "Password Pro",
    badgeIcon: "🔐",
    questionsByTier: {
      junior: [
        { question: "Should you tell your password to your best friend? 🤫", options: ["Safe", "Scam"], correct: 1, explanation: "Keep passwords secret! Only share with your parents." },
        { question: "Your parent helps you create a password. Is that okay? 👨‍👩‍👧", options: ["Safe", "Scam"], correct: 0, explanation: "Yes! Parents can help you make a strong, safe password." },
        { question: "Using '123456' as a password. Good idea? 🔢", options: ["Safe", "Scam"], correct: 1, explanation: "That's a bad password! It's too easy for bad guys to guess." },
        { question: "Writing your password on a sticky note on your computer. 📝", options: ["Safe", "Scam"], correct: 1, explanation: "Never write passwords where others can see them!" },
        { question: "Using your favorite animal + a number + a symbol, like 'Tiger7!' 🐯", options: ["Safe", "Scam"], correct: 0, explanation: "Good job! Mixing words, numbers, and symbols makes a stronger password." },
      ],
      defender: [
        { question: "Which password is the strongest?", options: ["Safe", "Scam"], correct: 0, explanation: "A password like 'BlueTiger$42Rain' that mixes words, symbols, and numbers is much stronger than simple ones like 'password123'." },
        { question: "A website says 'Save your password in your browser for easy login.' Should you?", options: ["Safe", "Scam"], correct: 0, explanation: "Saving passwords in browsers on your OWN device is generally okay, but ask a parent first. Never save them on shared or public computers." },
        { question: "Your friend asks for your game password so they can 'help you level up.' What do you do?", options: ["Safe", "Scam"], correct: 1, explanation: "Never share passwords, even with friends! They could accidentally share it or use your account in ways you don't want." },
        { question: "Using the same password for every website and game you use.", options: ["Safe", "Scam"], correct: 1, explanation: "Dangerous! If one site gets hacked, all your accounts are at risk. Use different passwords for important accounts." },
        { question: "A password manager app helps you store all your passwords securely.", options: ["Safe", "Scam"], correct: 0, explanation: "Password managers are a great tool! They create and remember strong, unique passwords for you. Ask your parent about using one." },
      ],
      guardian: [
        { question: "You're creating an account on a new platform. Which approach is best for your password?", options: ["Use your name + birthday", "Create a unique passphrase like 'PurpleDragon$Flies@Night9'", "Unsure"], correct: 1, explanation: "Passphrases are long, memorable, and hard to crack. Never use personal info like your name or birthday — that's easy for attackers to find online." },
        { question: "Two-factor authentication (2FA) adds an extra step when logging in, like a code sent to your phone. Is this worth the hassle?", options: ["Yes, it's much safer", "No, passwords are enough", "Unsure"], correct: 0, explanation: "2FA is one of the best ways to protect accounts. Even if someone steals your password, they can't get in without the second factor." },
        { question: "You receive an email saying 'Your password has been compromised. Click here to reset it immediately.' The email looks official.", options: ["Click the link to reset", "Go to the website directly instead", "Unsure"], correct: 1, explanation: "Never click password reset links in unexpected emails. Go directly to the website by typing the URL yourself. The email could be a phishing attempt." },
        { question: "A data breach notification says a website you use was hacked. You use the same password on three other sites. What should you do?", options: ["Change only the breached site's password", "Change all four passwords", "Unsure"], correct: 1, explanation: "Change ALL passwords that match the compromised one. This is called 'credential stuffing' — hackers try stolen passwords on other sites automatically." },
        { question: "Your friend suggests using a free online 'password strength checker' website. You'd need to type your actual password to test it.", options: ["Go ahead, it's helpful", "Don't enter your real password", "Unsure"], correct: 1, explanation: "Never type your real password into third-party websites! They could be stealing passwords. Use offline tools or your password manager's built-in strength checker." },
      ],
    },
  },
  {
    id: "safe-websites",
    title: "Safe Sites Explorer",
    description: "Learn to spot safe websites from dangerous ones!",
    icon: Eye,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    badgeId: "safe-surfer",
    badgeName: "Safe Surfer",
    badgeIcon: "🏄",
    questionsByTier: {
      junior: [
        { question: "A website has lots of flashing 'YOU WIN!' banners. Is it safe? 🎰", options: ["Safe", "Scam"], correct: 1, explanation: "Websites with lots of flashy 'win' messages are usually not safe!" },
        { question: "Your parent shows you a website for kids' games they checked first. 🎮", options: ["Safe", "Scam"], correct: 0, explanation: "If a parent checked the website first, it's safe to use!" },
        { question: "A website asks you to type your name and where you live. 🏠", options: ["Safe", "Scam"], correct: 1, explanation: "Never type where you live on a website! Tell a grown-up." },
        { question: "You visit the library website your teacher told you about. 📖", options: ["Safe", "Scam"], correct: 0, explanation: "Websites recommended by teachers are usually safe and helpful!" },
        { question: "A website says 'Download this to make your computer faster!' ⚡", options: ["Safe", "Scam"], correct: 1, explanation: "Don't download things from websites you don't know! It could be bad software." },
      ],
      defender: [
        { question: "You notice a website URL starts with 'http://' instead of 'https://'. The site asks you to enter your email to sign up.", options: ["Safe", "Scam"], correct: 1, explanation: "The 's' in 'https' means secure. Without it, your information isn't encrypted and could be stolen. Avoid entering personal info on http:// sites." },
        { question: "You're researching for a school project and find information on Wikipedia.org.", options: ["Safe", "Scam"], correct: 0, explanation: "Wikipedia is a generally safe and well-known site. However, remember that anyone can edit it, so verify important facts with other sources too!" },
        { question: "A search result shows a website called 'free-minecraft-hacks.xyz' offering free game modifications.", options: ["Safe", "Scam"], correct: 1, explanation: "Suspicious! '.xyz' domains offering 'free hacks' are often loaded with malware. Stick to official game websites and trusted app stores." },
        { question: "You visit your school's official website to check the lunch menu. The URL matches what's on the school letterhead.", options: ["Safe", "Scam"], correct: 0, explanation: "Safe! Verifying the URL matches official sources (like school letterheads) is a great habit. This is how you confirm a site is legitimate." },
        { question: "A website offers free homework answers but has tons of pop-up ads and asks you to disable your ad blocker.", options: ["Safe", "Scam"], correct: 1, explanation: "Red flags everywhere! Excessive pop-ups and pressure to disable ad blockers often mean the site is trying to show you malicious ads or install unwanted software." },
      ],
      guardian: [
        { question: "You're shopping for a birthday gift and find a site with prices that are 90% cheaper than everywhere else. The site's URL is 'nikee-outlet-deals.com' (note the double 'e').", options: ["Safe", "Scam", "Unsure"], correct: 1, explanation: "Multiple red flags: misspelled brand name in URL, prices too good to be true. This is likely a counterfeit goods scam or credit card harvesting site." },
        { question: "You need to download a free PDF reader. You go to the official Adobe website (adobe.com) and download it from there.", options: ["Safe", "Scam", "Unsure"], correct: 0, explanation: "Downloading from the official website of a well-known company is the safest approach. Always prefer official sources over third-party download sites." },
        { question: "A website claims to let you watch new movies for free. It asks you to install a 'special video player' to watch them.", options: ["Safe", "Scam", "Unsure"], correct: 1, explanation: "This is a classic malware distribution trick. Legitimate streaming services don't require special player downloads. The 'player' is likely malware." },
        { question: "You find a coding tutorial site that a well-known tech YouTuber recommended. It has HTTPS, clear contact info, and no suspicious ads.", options: ["Safe", "Scam", "Unsure"], correct: 0, explanation: "Multiple trust signals: recommended by a known source, uses HTTPS, has transparency. While no site is 100% guaranteed safe, these are strong positive indicators." },
        { question: "A website shows a security certificate warning in your browser, saying 'Your connection is not private.' But the content looks fine.", options: ["Proceed anyway", "Leave the site", "Unsure"], correct: 1, explanation: "Never ignore security certificate warnings! They mean the site's identity can't be verified or the connection isn't secure. Even if the content looks fine, your data could be intercepted." },
      ],
    },
  },
  {
    id: "personal-info",
    title: "Secret Keeper",
    description: "Protect your personal information like a true Cyber Hero!",
    icon: Shield,
    color: "text-cyber-purple",
    bgColor: "bg-cyber-purple/10",
    guide: { name: "Professor Hoot", image: wiseOwl },
    badgeId: "privacy-knight",
    badgeName: "Privacy Knight",
    badgeIcon: "🛡️",
    questionsByTier: {
      junior: [
        { question: "Someone online asks: 'What school do you go to?' Should you tell them? 🏫", options: ["Safe", "Scam"], correct: 1, explanation: "Never tell strangers online where your school is!" },
        { question: "Your parent posts a family photo on their private account. 📷", options: ["Safe", "Scam"], correct: 0, explanation: "When parents share on private accounts they control, that's their decision to make." },
        { question: "A game asks for your real birthday and full name to play. 🎂", options: ["Safe", "Scam"], correct: 1, explanation: "Games don't need your real birthday or full name. Ask a parent for help!" },
        { question: "You tell your parent about a weird message you got online. 💬", options: ["Safe", "Scam"], correct: 0, explanation: "Great job! Always tell a trusted adult about weird messages." },
        { question: "A stranger online wants to video chat with you. 📹", options: ["Safe", "Scam"], correct: 1, explanation: "Never video chat with strangers! Tell a grown-up right away." },
      ],
      defender: [
        { question: "A fun online quiz asks for your full name, birthday, pet's name, and favorite teacher to generate your 'superhero name.'", options: ["Safe", "Scam"], correct: 1, explanation: "These quizzes collect personal data that could be used to guess your passwords or security questions! Pet names and teacher names are common security question answers." },
        { question: "You want to set up a gaming profile. You use a username like 'CosmicPlayer42' instead of your real name.", options: ["Safe", "Scam"], correct: 0, explanation: "Smart choice! Using a creative username protects your identity. Never use your real name, age, or location in usernames." },
        { question: "A classmate asks you to share your location on a messaging app so they can find you at the park.", options: ["Safe", "Scam"], correct: 1, explanation: "Even with friends, sharing your live location digitally is risky. The message could be seen by others, or the account could be compromised. Meet up by agreeing on a place instead." },
        { question: "You're filling out a form for a legitimate school activity. It asks for your name, grade, and parent's email for permission.", options: ["Safe", "Scam"], correct: 0, explanation: "School activities with parent involvement are typically safe. Having your parent's email for permission shows the organization is being responsible." },
        { question: "An app asks for permission to access your contacts, camera, microphone, and location — but it's just a flashlight app.", options: ["Safe", "Scam"], correct: 1, explanation: "A flashlight app doesn't need access to all that! When apps ask for unnecessary permissions, they're likely collecting your data. Only grant permissions that make sense for the app." },
      ],
      guardian: [
        { question: "A social media platform suggests making your profile public to 'get more followers.' Your profile has your school name, city, and photos.", options: ["Make it public", "Keep it private", "Unsure"], correct: 1, explanation: "Keep profiles with personal info private. Public profiles with school names and locations make it easy for strangers to find you in real life. More followers isn't worth the risk." },
        { question: "You take a selfie and notice your house number and street sign are visible in the background before posting it.", options: ["Post it anyway", "Crop or retake the photo", "Unsure"], correct: 1, explanation: "Always check photo backgrounds before posting! Visible addresses, license plates, or landmarks can reveal your location. Crop the image or take a new one." },
        { question: "A website's privacy policy says they 'may share your data with third-party partners for marketing purposes.'", options: ["That's normal, accept it", "Be cautious about what you share", "Unsure"], correct: 1, explanation: "This means your data could be sold to advertisers. While common, you should minimize what personal info you provide and consider if the service is worth the privacy trade-off." },
        { question: "Your friend tags you in a photo at a specific location with your full name visible. You didn't give permission.", options: ["It's fine, friends do that", "Ask them to remove the tag", "Unsure"], correct: 1, explanation: "You have the right to control your digital footprint. Ask your friend to remove the tag, and adjust your privacy settings so tags require your approval first." },
        { question: "A legitimate-looking survey offers a $10 gift card for answering questions about your family's income, devices you own, and daily routine.", options: ["Worth it for $10", "Too much personal info to share", "Unsure"], correct: 1, explanation: "This data is extremely valuable and could be used for targeted scams. Information about your family's wealth, devices, and routines helps criminals plan break-ins or social engineering attacks." },
      ],
    },
  },
];

export const ALL_BADGES = [
  { id: "scam-spotter", name: "Scam Spotter", icon: "🔍" },
  { id: "password-pro", name: "Password Pro", icon: "🔐" },
  { id: "safe-surfer", name: "Safe Surfer", icon: "🏄" },
  { id: "privacy-knight", name: "Privacy Knight", icon: "🛡️" },
  { id: "cyber-champion", name: "Cyber Champion", icon: "🏆" },
  { id: "master-hero", name: "Master Hero", icon: "⭐" },
];
