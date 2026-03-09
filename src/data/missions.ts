import { AlertTriangle, Lock, Eye, Shield } from "lucide-react";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

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
  questions: Question[];
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
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
    questions: [
      {
        question: "You get an email saying 'You won a million dollars! Click here!' What should you do?",
        options: ["Click the link right away!", "Tell a trusted adult", "Reply with your address", "Share it with friends"],
        correct: 1,
        explanation: "Always tell a trusted adult! Real prizes don't come from surprise emails.",
      },
      {
        question: "A pop-up says 'Your computer has a virus! Call this number!' Is this real?",
        options: ["Yes, call immediately", "No, it's probably a scam", "Maybe, ask a friend", "Click 'Fix Now'"],
        correct: 1,
        explanation: "These pop-ups are almost always scams! Close the window and tell an adult.",
      },
      {
        question: "Someone you don't know online asks for your home address. What do you do?",
        options: ["Give it to them", "Say no and tell an adult", "Ask them why", "Give a fake address"],
        correct: 1,
        explanation: "Never share personal info with strangers online. Always tell a trusted adult!",
      },
    ],
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
    questions: [
      {
        question: "Which is the STRONGEST password?",
        options: ["password123", "MyDog!Runs2Fast#", "12345678", "abc"],
        correct: 1,
        explanation: "Strong passwords mix uppercase, lowercase, numbers, and special characters!",
      },
      {
        question: "Should you share your password with your best friend?",
        options: ["Yes, they're my friend", "No, passwords are private", "Only in person", "Yes, if they ask nicely"],
        correct: 1,
        explanation: "Passwords should only be shared with your parents or guardians. Nobody else!",
      },
      {
        question: "How often should you change your password?",
        options: ["Never", "Every few months", "Only when you forget it", "Every hour"],
        correct: 1,
        explanation: "Changing passwords regularly helps keep your accounts safe!",
      },
    ],
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
    questions: [
      {
        question: "What does the lock icon 🔒 in your browser mean?",
        options: ["The website is locked", "The connection is secure", "You can't visit the site", "It's a game"],
        correct: 1,
        explanation: "The lock means the website uses encryption to keep your info safe!",
      },
      {
        question: "Which website address looks safest?",
        options: ["http://free-games.xyz", "https://www.school.edu", "http://win-prize-now.com", "ftp://download.net"],
        correct: 1,
        explanation: "Look for 'https://' and familiar domains like .edu, .gov, or well-known sites!",
      },
      {
        question: "A website asks you to download a 'free game.' What should you do?",
        options: ["Download it right away", "Ask a parent/teacher first", "Give your email to get it", "Share the link everywhere"],
        correct: 1,
        explanation: "Always ask a trusted adult before downloading anything!",
      },
    ],
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
    questions: [
      {
        question: "Which of these is personal information you should protect?",
        options: ["Your favorite color", "Your home address", "Your favorite movie", "Your favorite food"],
        correct: 1,
        explanation: "Your home address is personal info! Never share it with strangers online.",
      },
      {
        question: "Is it safe to post your full name and school on social media?",
        options: ["Yes, everyone does it", "No, keep that private", "Only on weekends", "Only if your profile is pretty"],
        correct: 1,
        explanation: "Keep personal details like your full name and school private online!",
      },
      {
        question: "An online quiz asks for your birthday and phone number. What should you do?",
        options: ["Fill it in to get results", "Skip it or ask an adult", "Use your friend's info", "Fill in everything"],
        correct: 1,
        explanation: "Quizzes that ask for personal info might be trying to collect your data!",
      },
    ],
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
