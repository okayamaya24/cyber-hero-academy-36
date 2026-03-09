import { AlertTriangle, Lock, Eye, Shield } from "lucide-react";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

export type AgeTier = "junior" | "defender" | "guardian";

export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
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

/** Helper to get the questions for a mission based on age */
export function getMissionQuestions(mission: MissionDef, age: number): Question[] {
  return mission.questionsByTier[getAgeTier(age)];
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
          question: "Someone sends you a message: 'You won a toy! Click here!' 🎁",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Nobody gives free toys to strangers online.",
        },
        {
          question: "Your mom texts you: 'Dinner is ready, come home!' 🍕",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Messages from your family that you recognize are okay.",
        },
        {
          question: "A pop-up says: 'Your tablet has a virus! Call this number!' 😱",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Real virus warnings don't ask you to call a number.",
        },
        {
          question: "Your teacher sends a message on the school app about homework. 📚",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Messages from your teacher on the school app are real.",
        },
        {
          question: "A stranger online says: 'Send me your photo and I'll make you famous!' 📸",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Never send photos to strangers online.",
        },
      ],
      defender: [
        {
          question: "You get an email: 'Dear user, your Roblox account will be deleted unless you click this link and enter your password.' What do you think?",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "This is a phishing scam! Real companies never ask for your password in an email. Always go directly to the website yourself.",
        },
        {
          question: "Your school sends an email from school@myschool.edu about a field trip next week with details your teacher mentioned in class.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This looks safe! The email matches what your teacher said, and comes from the official school address.",
        },
        {
          question: "A text message says: 'Congrats! You've been selected to win a free iPhone 15! Click here to claim: bit.ly/fr33phone'",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Classic scam! Suspicious shortened links and 'free' prizes are big red flags. Nobody randomly gives away expensive phones.",
        },
        {
          question: "You see a YouTube ad for a game you like that links to the official app store page.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This is likely safe! Ads linking to official app stores are normal. Always double-check the developer name though.",
        },
        {
          question: "Someone on Discord DMs you: 'Hey, I'm a Minecraft admin. Give me your login to get free diamonds.'",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Scam alert! No real game admin would ask for your password. They don't need it to give you items.",
        },
      ],
      guardian: [
        {
          question: "You receive an email from 'noreply@amaz0n-security.com' saying there's suspicious activity on your parent's account and you need to verify payment info immediately.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "This is a phishing email. Notice 'amaz0n' uses a zero instead of 'o', and the domain isn't amazon.com. Legitimate companies use their real domain and don't pressure you to act immediately.",
        },
        {
          question: "Your school librarian sends a Google Classroom notification about a new reading assignment with a link to a Google Doc.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "This is safe. It came through Google Classroom (a trusted platform), from a known person, linking to a Google Doc — all consistent and expected.",
        },
        {
          question: "A social media ad offers a 'free' cybersecurity course for kids, but requires your parent's credit card 'just for verification, you won't be charged.'",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "If it's truly free, why do they need a credit card? This is a common trick to charge hidden fees later. Never enter payment info for 'free' offers.",
        },
        {
          question: "You find a website that looks like Google but the URL is 'gooogle.com' (three o's). It asks you to sign in.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "This is called 'typosquatting' — a fake website designed to look real. Always check the URL carefully. The real Google is google.com, not gooogle.com.",
        },
        {
          question: "A friend shares a link to a news article from BBC.com about a science discovery. The URL shows https://www.bbc.com/news/science...",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "This appears safe. BBC.com is a well-known news site, the URL uses HTTPS, and it was shared by a friend you know. However, always verify surprising claims!",
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
        {
          question: "Should you tell your password to your best friend? 🤫",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Keep passwords secret! Only share with your parents.",
        },
        {
          question: "Your parent helps you create a password. Is that okay? 👨‍👩‍👧",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Yes! Parents can help you make a strong, safe password.",
        },
        {
          question: "Using '123456' as a password. Good idea? 🔢",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a bad password! It's too easy for bad guys to guess.",
        },
        {
          question: "Writing your password on a sticky note on your computer. 📝",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Never write passwords where others can see them!",
        },
        {
          question: "Using your favorite animal + a number + a symbol, like 'Tiger7!' 🐯",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Good job! Mixing words, numbers, and symbols makes a stronger password.",
        },
      ],
      defender: [
        {
          question: "Which password is the strongest?",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "A password like 'BlueTiger$42Rain' that mixes words, symbols, and numbers is much stronger than simple ones like 'password123'.",
        },
        {
          question: "A website says 'Save your password in your browser for easy login.' Should you?",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Saving passwords in browsers on your OWN device is generally okay, but ask a parent first. Never save them on shared or public computers.",
        },
        {
          question: "Your friend asks for your game password so they can 'help you level up.' What do you do?",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Never share passwords, even with friends! They could accidentally share it or use your account in ways you don't want.",
        },
        {
          question: "Using the same password for every website and game you use.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Dangerous! If one site gets hacked, all your accounts are at risk. Use different passwords for important accounts.",
        },
        {
          question: "A password manager app helps you store all your passwords securely.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Password managers are a great tool! They create and remember strong, unique passwords for you. Ask your parent about using one.",
        },
      ],
      guardian: [
        {
          question: "You're creating an account on a new platform. Which approach is best for your password?",
          options: ["Use your name + birthday", "Create a unique passphrase like 'PurpleDragon$Flies@Night9'", "Unsure"],
          correct: 1,
          explanation: "Passphrases are long, memorable, and hard to crack. Never use personal info like your name or birthday — that's easy for attackers to find online.",
        },
        {
          question: "Two-factor authentication (2FA) adds an extra step when logging in, like a code sent to your phone. Is this worth the hassle?",
          options: ["Yes, it's much safer", "No, passwords are enough", "Unsure"],
          correct: 0,
          explanation: "2FA is one of the best ways to protect accounts. Even if someone steals your password, they can't get in without the second factor.",
        },
        {
          question: "You receive an email saying 'Your password has been compromised. Click here to reset it immediately.' The email looks official.",
          options: ["Click the link to reset", "Go to the website directly instead", "Unsure"],
          correct: 1,
          explanation: "Never click password reset links in unexpected emails. Go directly to the website by typing the URL yourself. The email could be a phishing attempt.",
        },
        {
          question: "A data breach notification says a website you use was hacked. You use the same password on three other sites. What should you do?",
          options: ["Change only the breached site's password", "Change all four passwords", "Unsure"],
          correct: 1,
          explanation: "Change ALL passwords that match the compromised one. This is called 'credential stuffing' — hackers try stolen passwords on other sites automatically.",
        },
        {
          question: "Your friend suggests using a free online 'password strength checker' website. You'd need to type your actual password to test it.",
          options: ["Go ahead, it's helpful", "Don't enter your real password", "Unsure"],
          correct: 1,
          explanation: "Never type your real password into third-party websites! They could be stealing passwords. Use offline tools or your password manager's built-in strength checker.",
        },
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
        {
          question: "A website has lots of flashing 'YOU WIN!' banners. Is it safe? 🎰",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Websites with lots of flashy 'win' messages are usually not safe!",
        },
        {
          question: "Your parent shows you a website for kids' games they checked first. 🎮",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "If a parent checked the website first, it's safe to use!",
        },
        {
          question: "A website asks you to type your name and where you live. 🏠",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Never type where you live on a website! Tell a grown-up.",
        },
        {
          question: "You visit the library website your teacher told you about. 📖",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Websites recommended by teachers are usually safe and helpful!",
        },
        {
          question: "A website says 'Download this to make your computer faster!' ⚡",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Don't download things from websites you don't know! It could be bad software.",
        },
      ],
      defender: [
        {
          question: "You notice a website URL starts with 'http://' instead of 'https://'. The site asks you to enter your email to sign up.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "The 's' in 'https' means secure. Without it, your information isn't encrypted and could be stolen. Avoid entering personal info on http:// sites.",
        },
        {
          question: "You're researching for a school project and find information on Wikipedia.org.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Wikipedia is a generally safe and well-known site. However, remember that anyone can edit it, so verify important facts with other sources too!",
        },
        {
          question: "A search result shows a website called 'free-minecraft-hacks.xyz' offering free game modifications.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Suspicious! '.xyz' domains offering 'free hacks' are often loaded with malware. Stick to official game websites and trusted app stores.",
        },
        {
          question: "You visit your school's official website to check the lunch menu. The URL matches what's on the school letterhead.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Safe! Verifying the URL matches official sources (like school letterheads) is a great habit. This is how you confirm a site is legitimate.",
        },
        {
          question: "A website offers free homework answers but has tons of pop-up ads and asks you to disable your ad blocker.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Red flags everywhere! Excessive pop-ups and pressure to disable ad blockers often mean the site is trying to show you malicious ads or install unwanted software.",
        },
      ],
      guardian: [
        {
          question: "You're shopping for a birthday gift and find a site with prices that are 90% cheaper than everywhere else. The site's URL is 'nikee-outlet-deals.com' (note the double 'e').",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "Multiple red flags: misspelled brand name in URL, prices too good to be true. This is likely a counterfeit goods scam or credit card harvesting site.",
        },
        {
          question: "You need to download a free PDF reader. You go to the official Adobe website (adobe.com) and download it from there.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "Downloading from the official website of a well-known company is the safest approach. Always prefer official sources over third-party download sites.",
        },
        {
          question: "A website claims to let you watch new movies for free. It asks you to install a 'special video player' to watch them.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "This is a classic malware distribution trick. Legitimate streaming services don't require special player downloads. The 'player' is likely malware.",
        },
        {
          question: "You find a coding tutorial site that a well-known tech YouTuber recommended. It has HTTPS, clear contact info, and no suspicious ads.",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "Multiple trust signals: recommended by a known source, uses HTTPS, has transparency. While no site is 100% guaranteed safe, these are strong positive indicators.",
        },
        {
          question: "A website shows a security certificate warning in your browser, saying 'Your connection is not private.' But the content looks fine.",
          options: ["Proceed anyway", "Leave the site", "Unsure"],
          correct: 1,
          explanation: "Never ignore security certificate warnings! They mean the site's identity can't be verified or the connection isn't secure. Even if the content looks fine, your data could be intercepted.",
        },
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
        {
          question: "Someone online asks: 'What school do you go to?' Should you tell them? 🏫",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Never tell strangers online where your school is!",
        },
        {
          question: "Your parent posts a family photo on their private account. 📷",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "When parents share on private accounts they control, that's their decision to make.",
        },
        {
          question: "A game asks for your real birthday and full name to play. 🎂",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Games don't need your real birthday or full name. Ask a parent for help!",
        },
        {
          question: "You tell your parent about a weird message you got online. 💬",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Great job! Always tell a trusted adult about weird messages.",
        },
        {
          question: "A stranger online wants to video chat with you. 📹",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Never video chat with strangers! Tell a grown-up right away.",
        },
      ],
      defender: [
        {
          question: "A fun online quiz asks for your full name, birthday, pet's name, and favorite teacher to generate your 'superhero name.'",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "These quizzes collect personal data that could be used to guess your passwords or security questions! Pet names and teacher names are common security question answers.",
        },
        {
          question: "You want to set up a gaming profile. You use a username like 'CosmicPlayer42' instead of your real name.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "Smart choice! Using a creative username protects your identity. Never use your real name, age, or location in usernames.",
        },
        {
          question: "A classmate asks you to share your location on a messaging app so they can find you at the park.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Even with friends, sharing your live location digitally is risky. The message could be seen by others, or the account could be compromised. Meet up by agreeing on a place instead.",
        },
        {
          question: "You're filling out a form for a legitimate school activity. It asks for your name, grade, and parent's email for permission.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "School activities with parent involvement are typically safe. Having your parent's email for permission shows the organization is being responsible.",
        },
        {
          question: "An app asks for permission to access your contacts, camera, microphone, and location — but it's just a flashlight app.",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "A flashlight app doesn't need access to all that! When apps ask for unnecessary permissions, they're likely collecting your data. Only grant permissions that make sense for the app.",
        },
      ],
      guardian: [
        {
          question: "A social media platform suggests making your profile public to 'get more followers.' Your profile has your school name, city, and photos.",
          options: ["Make it public", "Keep it private", "Unsure"],
          correct: 1,
          explanation: "Keep profiles with personal info private. Public profiles with school names and locations make it easy for strangers to find you in real life. More followers isn't worth the risk.",
        },
        {
          question: "You take a selfie and notice your house number and street sign are visible in the background before posting it.",
          options: ["Post it anyway", "Crop or retake the photo", "Unsure"],
          correct: 1,
          explanation: "Always check photo backgrounds before posting! Visible addresses, license plates, or landmarks can reveal your location. Crop the image or take a new one.",
        },
        {
          question: "A website's privacy policy says they 'may share your data with third-party partners for marketing purposes.'",
          options: ["That's normal, accept it", "Be cautious about what you share", "Unsure"],
          correct: 1,
          explanation: "This means your data could be sold to advertisers. While common, you should minimize what personal info you provide and consider if the service is worth the privacy trade-off.",
        },
        {
          question: "Your friend tags you in a photo at a specific location with your full name visible. You didn't give permission.",
          options: ["It's fine, friends do that", "Ask them to remove the tag", "Unsure"],
          correct: 1,
          explanation: "You have the right to control your digital footprint. Ask your friend to remove the tag, and adjust your privacy settings so tags require your approval first.",
        },
        {
          question: "A legitimate-looking survey offers a $10 gift card for answering questions about your family's income, devices you own, and daily routine.",
          options: ["Worth it for $10", "Too much personal info to share", "Unsure"],
          correct: 1,
          explanation: "This data is extremely valuable and could be used for targeted scams. Information about your family's wealth, devices, and routines helps criminals plan break-ins or social engineering attacks.",
        },
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
