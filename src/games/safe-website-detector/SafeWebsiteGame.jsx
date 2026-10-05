import ByteBuddy, { byteOpener } from "../shared/ByteBuddy";
import { useState } from "react";

// ── Age / mode routing ────────────────────────────────────────────────────
function getMode() {
  const age = parseInt(new URLSearchParams(window.location.search).get("age") || "0");
  if (age >= 5 && age <= 8) return "kids";
  if (age > 8)              return "pro";
  return "picker";
}

function getInitialTier() {
  const age = parseInt(new URLSearchParams(window.location.search).get("age") || "0");
  if (age >= 9  && age <= 11) return "junior";
  if (age >= 12 && age <= 14) return "hero";
  if (age > 14)               return "elite";
  return "junior";
}

// ── Scenario pools ────────────────────────────────────────────────────────

const KIDS_SCENARIOS = [
  {
    id: "k1",
    name: "Free Robux Giveaway",
    url: "http://free-robux-now.xyz",
    context: "A pop-up says you just WON free Robux! Click to claim your prize!",
    emoji: "🎮",
    status: "danger",
    clues: [
      "Real games never give away free things through pop-ups like this.",
      "The web address looks very strange — it's not roblox.com.",
      "It starts with http://, so it isn't even a private connection. Big warning sign!"
    ]
  },
  {
    id: "k2",
    name: "YouTube Video",
    url: "https://www.youtube.com/watch?v=funny-cats",
    context: "Your friend sent a link to a funny cat video on YouTube.",
    emoji: "🐱",
    status: "ok",
    clues: [
      "The address says youtube.com — that's the real YouTube.",
      "It has https:// (a private connection). Scam sites can too, so the name matters most!",
      "No warnings, no prizes, no scary messages."
    ]
  },
  {
    id: "k3",
    name: "Minecraft Free Download",
    url: "http://minecraft-free-download.net",
    context: "A website says you can download Minecraft for FREE right now!",
    emoji: "⛏️",
    status: "danger",
    clues: [
      "Minecraft costs money — free downloads like this are usually fake.",
      "The address is NOT minecraft.net — it says minecraft-free-download.net.",
      "It uses http://, so anything you type isn't private."
    ]
  },
  {
    id: "k4",
    name: "PBS Kids",
    url: "https://pbskids.org",
    context: "You want to play games on the PBS Kids website.",
    emoji: "🌈",
    status: "ok",
    clues: [
      "pbskids.org is the real PBS Kids website.",
      "The name is spelled exactly right, and it uses https:// for privacy.",
      "No promises of free prizes or scary warnings."
    ]
  },
  {
    id: "k5",
    name: "Netflix Account Warning",
    url: "https://netflix-verify-account.com",
    context: "An email says your Netflix is about to be deleted! Click to save it now!",
    emoji: "📺",
    status: "danger",
    clues: [
      "The real Netflix website is netflix.com — this one is different.",
      "It is trying to scare you into clicking fast.",
      "Your parents should check Netflix directly, not through this link."
    ]
  },
  {
    id: "k6",
    name: "Google Search",
    url: "https://www.google.com",
    context: "You want to search for a homework topic on Google.",
    emoji: "🔍",
    status: "ok",
    clues: [
      "google.com is the real Google — spelled correctly.",
      "The name is spelled exactly right, with nothing extra added.",
      "No strange words or offers in the address."
    ]
  },
  {
    id: "k7",
    name: "Win a Free iPad",
    url: "http://click-here-win-ipad-now.biz",
    context: "A website says you are the LUCKY WINNER of a free iPad! Click now!",
    emoji: "🎁",
    status: "danger",
    clues: [
      "Nobody gives away free iPads on the internet — this is a trick.",
      "The address looks random and suspicious.",
      "Websites that end in .biz are often used for scams."
    ]
  },
  {
    id: "k8",
    name: "School Homework Portal",
    url: "https://learn.myschool.edu",
    context: "Your teacher told you to visit the school homework website.",
    emoji: "📚",
    status: "ok",
    clues: [
      "School websites usually end in .edu — this one does.",
      "The name is spelled exactly right, with nothing extra added.",
      "No scary messages or prize offers."
    ]
  },
  {
    id: "k9",
    name: "Roblox Item Hack",
    url: "http://roblox-item-hack-2024.ru",
    context: "Someone online says this website will give you free items in Roblox.",
    emoji: "🎯",
    status: "danger",
    clues: [
      "Roblox's real website is roblox.com — this is completely different.",
      "The word 'hack' in a web address is always a bad sign.",
      "Websites ending in .ru are from Russia and are often used for scams."
    ]
  },
  {
    id: "k10",
    name: "National Geographic Kids",
    url: "https://kids.nationalgeographic.com",
    context: "You want to read about animals on National Geographic Kids.",
    emoji: "🦁",
    status: "ok",
    clues: [
      "nationalgeographic.com is a real, trusted website.",
      "kids. at the start means it's the kids section.",
      "A trusted brand, spelled exactly right."
    ]
  }
];

const PRO_SCENARIOS = {
  junior: [
    {
      id: "j1",
      name: "Free V-Bucks Offer",
      url: "http://free-vbucks-fortnite.com",
      context: "A website promises 10,000 free V-Bucks if you enter your Epic Games login.",
      status: "fake",
      clues: [
        "The real Fortnite store is epicgames.com — this domain is completely different.",
        "No game ever gives away free in-game currency through random websites.",
        "Uses http://, so the connection isn't even private."
      ]
    },
    {
      id: "j2",
      name: "Google Homepage",
      url: "https://www.google.com",
      context: "You want to search for information about cybersecurity.",
      status: "safe",
      clues: [
        "google.com is spelled correctly — no number substitutions or extra words.",
        "https:// means the connection is encrypted, but the correct spelling is what proves it's really Google.",
        "One of the most visited websites in the world — no red flags."
      ]
    },
    {
      id: "j3",
      name: "Amazon Login",
      url: "https://www.amazonn.com",
      context: "You click a link in an email to sign into your Amazon account.",
      status: "fake",
      clues: [
        "Look closely — the URL says 'amazonn' with two n's, not 'amazon'.",
        "A single extra letter in a domain name means it's a fake copy.",
        "Always type amazon.com yourself rather than clicking email links."
      ]
    },
    {
      id: "j4",
      name: "BBC News",
      url: "https://www.bbc.com/news",
      context: "You want to read a news article for a school project.",
      status: "safe",
      clues: [
        "bbc.com is the official BBC website — well-known, trusted news source.",
        "A recognisable brand with no tricks in the URL.",
        "Just reading news — not asking for passwords or personal info."
      ]
    },
    {
      id: "j5",
      name: "Netflix Login Page",
      url: "https://netflixlogin.com",
      context: "A text message says your Netflix is expiring — click to renew.",
      status: "fake",
      clues: [
        "The real Netflix is netflix.com — netflixlogin.com is a different domain entirely.",
        "Urgent 'your account is expiring' messages are a classic scam tactic.",
        "Netflix only asks you to log in at netflix.com, never a third-party domain."
      ]
    },
    {
      id: "j6",
      name: "Steam Store",
      url: "https://store.steampowered.com",
      context: "You want to buy a new PC game on Steam.",
      status: "safe",
      clues: [
        "store.steampowered.com is Steam's official store — correct domain.",
        "A domain you'd expect for a major gaming platform.",
        "Valve's Steam has used this domain for years — no red flags."
      ]
    },
    {
      id: "j7",
      name: "Prize Winner Page",
      url: "http://you-are-the-winner-claim-prize-now.com",
      context: "A pop-up says you're the 1,000,000th visitor and won a prize!",
      status: "fake",
      clues: [
        "Nobody randomly wins prizes just for visiting a website — this is a scam.",
        "The domain is long and full of urgency words like 'winner' and 'claim now'.",
        "Uses http:// — not secure, and designed to steal your information."
      ]
    },
    {
      id: "j8",
      name: "NASA Website",
      url: "https://www.nasa.gov/solar-system",
      context: "You want to read about the solar system for your science class.",
      status: "safe",
      clues: [
        ".gov means it's an official US government website — very trustworthy.",
        "nasa.gov is the real NASA — spelled correctly with no tricks.",
        "Only real government agencies can get a .gov address, so it's very hard to fake."
      ]
    },
    {
      id: "j9",
      name: "PayPal Login",
      url: "https://paypal-secure-login.net",
      context: "You get an email saying there's a problem with your PayPal account.",
      status: "fake",
      clues: [
        "PayPal's real website is paypal.com — this one ends in .net.",
        "Hyphenating a brand name (paypal-secure) is a common phishing trick.",
        "Legitimate PayPal emails always link to paypal.com, never other domains."
      ]
    },
    {
      id: "j10",
      name: "Wikipedia Article",
      url: "https://en.wikipedia.org/wiki/Internet_safety",
      context: "You want to learn more about internet safety.",
      status: "safe",
      clues: [
        "en.wikipedia.org is Wikipedia's official English site — real and trusted.",
        "A real .org address with nothing suspicious added.",
        "Read-only reference site, not asking for any account or payment info."
      ]
    }
  ],
  hero: [
    {
      id: "h1",
      name: "Amazon Security Alert",
      url: "https://amaz0n-security-alert.net",
      context: "An email warns your Amazon account has been locked. Click to restore access.",
      status: "fake",
      clues: [
        "'amaz0n' uses the number zero — the real site is amazon.com.",
        "The domain ends in .net, not .com like the real Amazon.",
        "Urgency + account threat = classic phishing tactic."
      ]
    },
    {
      id: "h2",
      name: "PayPal Login",
      url: "https://paypal.com.secure-login.biz",
      context: "You're directed to log into PayPal to confirm a payment.",
      status: "fake",
      clues: [
        "The real domain is everything after the last dot before the path — that's secure-login.biz.",
        "paypal.com is just a subdomain here, not the actual site.",
        "Legitimate PayPal logins only come from paypal.com."
      ]
    },
    {
      id: "h3",
      name: "Apple Support Page",
      url: "https://support.apple.com/iphone/repair",
      context: "You're looking up how to repair your iPhone screen.",
      status: "safe",
      clues: [
        "support.apple.com is the official Apple support subdomain.",
        "A well-known brand — no red flags.",
        "Informational page, not asking for passwords or payment."
      ]
    },
    {
      id: "h4",
      name: "Instagram Account Verify",
      url: "http://instagram-verify-now.ru",
      context: "A message says your Instagram will be deleted unless you verify now.",
      status: "fake",
      clues: [
        "Instagram's real site is instagram.com — this is different.",
        ".ru is the country domain for Russia — suspicious for a US social media platform.",
        "Uses http:// not https://, and the urgency is a pressure tactic."
      ]
    },
    {
      id: "h5",
      name: "Microsoft Support",
      url: "https://support.microsoft.com/en-us/windows",
      context: "You need help fixing a Windows update issue.",
      status: "safe",
      clues: [
        "support.microsoft.com is the official Microsoft help center.",
        "A real company subdomain — safe.",
        "No alarming language, no request for passwords."
      ]
    },
    {
      id: "h6",
      name: "Discord Free Nitro",
      url: "https://discord.gift/free-nitro-click-here",
      context: "Someone DMs you a link saying you got free Discord Nitro.",
      status: "fake",
      clues: [
        "discord.gift is NOT the official Discord website (discord.com).",
        "Promises of free premium subscriptions via DMs are almost always scams.",
        "The URL tries to look official with the Discord name — that's the trick."
      ]
    },
    {
      id: "h7",
      name: "Google Docs Link",
      url: "https://docs.google.com/document/d/1BxiMVs0XRA",
      context: "A classmate shares their school project with you.",
      status: "safe",
      clues: [
        "docs.google.com is the real Google Docs domain.",
        "It's Google — trusted.",
        "The URL structure matches a standard Google Docs link."
      ]
    },
    {
      id: "h8",
      name: "Facebook Login",
      url: "https://faceb00k-login.com",
      context: "A link in your email takes you to a Facebook login page.",
      status: "fake",
      clues: [
        "faceb00k uses two zeros instead of the letter 'o' — a common spoofing trick.",
        "The real site is facebook.com with no hyphens or number substitutions.",
        "Fake login pages steal your username and password."
      ]
    },
    {
      id: "h9",
      name: "Wikipedia Cybersecurity",
      url: "https://en.wikipedia.org/wiki/Cybersecurity",
      context: "You're researching cybersecurity for a school report.",
      status: "safe",
      clues: [
        "en.wikipedia.org is Wikipedia's English-language domain.",
        "A real .org address — no red flags.",
        "It's a read-only informational article, not asking for anything."
      ]
    },
    {
      id: "h10",
      name: "Steam Free Game Offer",
      url: "https://steam-free-game-offer.com",
      context: "A website claims Steam is giving away a popular game for free today only.",
      status: "fake",
      clues: [
        "The official Steam store is store.steampowered.com — not this domain.",
        "'Today only' urgency is a manipulation tactic.",
        "Steam free game giveaways happen on steampowered.com, not third-party domains."
      ]
    }
  ],
  elite: [
    {
      id: "e1",
      name: "PayPal",
      url: "https://www.paypa1.com",
      context: "You receive an invoice that links to PayPal for payment.",
      status: "fake",
      clues: [
        "paypa1.com uses the number '1' instead of the letter 'l' — a homoglyph attack.",
        "At a glance these look identical — attackers count on you not noticing.",
        "Always check the URL character by character before entering payment info."
      ]
    },
    {
      id: "e2",
      name: "VS Code GitHub Repo",
      url: "https://github.com/microsoft/vscode",
      context: "You want to view the source code for Visual Studio Code.",
      status: "safe",
      clues: [
        "github.com is the real GitHub — no substitutions or tricks.",
        "microsoft is the official org name and vscode is a verified repo.",
        "A trusted platform — no indicators of compromise."
      ]
    },
    {
      id: "e3",
      name: "Shortened Link",
      url: "https://bit.ly/3xFr33G1ft",
      context: "Someone on Reddit posts a 'free gift card' link using bit.ly.",
      status: "fake",
      clues: [
        "URL shorteners hide the real destination — you have no idea where this leads.",
        "The alias '3xFr33G1ft' (Free Gift with leet-speak) is a red flag.",
        "Legitimate companies rarely need to hide URLs — shorteners are a common phishing vector."
      ]
    },
    {
      id: "e4",
      name: "Chase Bank Login",
      url: "https://secure-login.chase-bank.com",
      context: "A text message alerts you to suspicious activity and links here to verify.",
      status: "fake",
      clues: [
        "The real Chase domain is chase.com — chase-bank.com is a completely different domain.",
        "secure-login is just a subdomain designed to look trustworthy.",
        "Banks send official communications from their real domain, never third-party domains."
      ]
    },
    {
      id: "e5",
      name: "IRS Tax Refund",
      url: "https://www.irs.gov/refunds",
      context: "You want to check the status of a tax refund.",
      status: "safe",
      clues: [
        ".gov domains are exclusively reserved for US government agencies — they cannot be purchased by anyone else.",
        "irs.gov is the official Internal Revenue Service website.",
        "A real .gov address — only government agencies can get one."
      ]
    },
    {
      id: "e6",
      name: "Netflix Account Update",
      url: "https://netflix.com.account-update.net",
      context: "An email says your Netflix payment failed and links here.",
      status: "fake",
      clues: [
        "The actual domain is account-update.net — everything before the last dot-before-path is a subdomain.",
        "netflix.com is just a subdomain here designed to fool a quick glance.",
        "Real Netflix never sends you to a .net domain for account issues."
      ]
    },
    {
      id: "e7",
      name: "Punycode Apple Site",
      url: "https://www.xn--pple-43d.com",
      context: "A sponsored ad links to what appears to be an Apple website.",
      status: "fake",
      clues: [
        "xn-- is a punycode prefix — this encodes an internationalized character (like ä) that looks like 'a'.",
        "The rendered URL looks like apple.com in many browsers but is actually äpple.com.",
        "This is a sophisticated visual spoofing attack using Unicode homoglyphs."
      ]
    },
    {
      id: "e8",
      name: "Shopify CDN Asset",
      url: "https://cdn.shopify.com/s/files/1/0001/store/logo.png",
      context: "You're inspecting a website's network requests and see this URL loading.",
      status: "safe",
      clues: [
        "cdn.shopify.com is Shopify's official content delivery network subdomain.",
        "CDN URLs serving static assets (images, files) from known platforms are normal.",
        "The path structure matches Shopify's standard asset delivery format."
      ]
    },
    {
      id: "e9",
      name: "Flash Player Update",
      url: "https://update-adobe-flash-player-now.com",
      context: "A website says your Flash Player is out of date and must be updated immediately.",
      status: "fake",
      clues: [
        "Adobe Flash Player was permanently discontinued in December 2020 — no legitimate updates exist.",
        "Fake 'update required' prompts are one of the oldest malware delivery methods.",
        "Official Adobe software updates only come from adobe.com."
      ]
    },
    {
      id: "e10",
      name: "Google OAuth",
      url: "https://accounts.google.com/o/oauth2/auth?client_id=app",
      context: "A third-party app requests permission to access your Google account.",
      status: "safe",
      clues: [
        "accounts.google.com is Google's official authentication subdomain.",
        "/o/oauth2/auth is the standard OAuth2 authorization endpoint path.",
        "Legitimate OAuth flows always originate from the real identity provider's domain."
      ]
    }
  ]
};

// ── Helper: shuffle ───────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Mode Picker ───────────────────────────────────────────────────────────
function ModePicker() {
  return (
    <div style={{
      minHeight: "100vh", position: "relative",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "Arial", color: "white", gap: "20px",
      padding: "24px"
    }}>
      <button
        onClick={() => { window.location.href = "/missions"; }}
        style={{
          position: "absolute", top: "18px", left: "18px",
          display: "flex", alignItems: "center", gap: "6px",
          background: "none", border: "1px solid rgba(8,182,170,0.35)",
          color: "#08b6aa", borderRadius: "10px", padding: "6px 14px",
          fontSize: "13px", fontWeight: "bold", cursor: "pointer",
        }}
      >
        ← Back to Games
      </button>
      <div style={{ fontSize: "60px" }}>🔍</div>
      <h1 style={{ fontSize: "32px", color: "#08b6aa", margin: 0, textAlign: "center" }}>
        Safe Website Detector
      </h1>
      <p style={{ color: "#94a3b8", textAlign: "center", margin: 0 }}>
        Pick your level to begin
      </p>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Starter",  emoji: "⭐", age: 6  },
          { label: "Explorer", emoji: "🌟", age: 10 },
          { label: "Defender", emoji: "🛡️", age: 13 },
          { label: "Expert",   emoji: "⚡", age: 15 }
        ].map(({ label, emoji, age }) => (
          <button key={age} onClick={() => {
            window.location.href = `?age=${age}`;
          }} style={{
            background: "rgba(8,182,170,0.1)", border: "2px solid #08b6aa",
            borderRadius: "18px", padding: "22px 32px", cursor: "pointer",
            color: "white", fontSize: "18px", fontWeight: "bold"
          }}>
            {emoji} {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Kids Game ─────────────────────────────────────────────────────────────
function KidsGame() {
  const [gameState, setGameState] = useState("start");
  const [scenarios]              = useState(() => shuffle(KIDS_SCENARIOS));
  const [index, setIndex]        = useState(0);
  const [lives, setLives]        = useState(5);
  const [score, setScore]        = useState(0);
  const [revealedClues, setRevealedClues] = useState([]);
  const [result, setResult]      = useState(null); // "correct" | "wrong" | null
  const [locked, setLocked]      = useState(false);
  const [breakdown, setBreakdown] = useState({ correct: 0, wrong: 0 });

  const scenario = scenarios[index];
  const total    = scenarios.length;

  function revealClue(i) {
    if (revealedClues.includes(i)) return;
    setRevealedClues(prev => [...prev, i]);
  }

  function choose(answer) {
    if (locked || gameState !== "playing") return;
    setLocked(true);

    const correct = answer === scenario.status;
    const cluesUsed = revealedClues.length;
    const pts = correct ? (cluesUsed === 0 ? 15 : cluesUsed === 1 ? 10 : cluesUsed === 2 ? 5 : 2) : 0;

    setResult(correct ? "correct" : "wrong");
    setScore(s => s + pts);
    setBreakdown(b => ({ correct: b.correct + (correct ? 1 : 0), wrong: b.wrong + (correct ? 0 : 1) }));

    if (!correct) setLives(l => l - 1);
  }

  // Byte's explanation stays up until the kid taps Next
  function goNext() {
    setResult(null);
    setLocked(false);
    if (lives <= 0 || index + 1 >= total) {
      setGameState("over");
    } else {
      setIndex(i => i + 1);
      setRevealedClues([]);
    }
  }

  if (gameState === "start") {
    return (
      <div style={{
        minHeight: "100vh", position: "relative", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Arial", color: "white", gap: "20px", padding: "24px"
      }}>
        <button
          onClick={() => { window.location.href = "/missions"; }}
          style={{
            position: "absolute", top: "18px", left: "18px",
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "1px solid rgba(167,139,250,0.35)",
            color: "#a78bfa", borderRadius: "10px", padding: "6px 14px",
            fontSize: "13px", fontWeight: "bold", cursor: "pointer",
          }}
        >
          ← Back to Games
        </button>
        <div style={{ fontSize: "64px" }}>🔍</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", color: "#a78bfa", margin: 0, textAlign: "center" }}>
          Safe Website Detective
        </h1>
        <p style={{ color: "#facc15", fontWeight: "bold", textAlign: "center", margin: 0 }}>
          Can you tell if a website is SAFE or DANGEROUS?
        </p>
        <div style={{
          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: "16px", padding: "18px 24px", fontSize: "14px",
          color: "#cbd5e1", lineHeight: "2", textAlign: "center", maxWidth: "340px"
        }}>
          <div>🔎 Tap clues to investigate each website</div>
          <div><span style={{ color: "#22c55e" }}>✅ LOOKS SAFE</span> — if the website seems okay</div>
          <div><span style={{ color: "#ef4444" }}>🚨 DANGER!</span> — if something looks wrong</div>
          <div style={{ color: "#a78bfa", marginTop: "4px" }}>❤️ You have 5 lives — use them wisely!</div>
        </div>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <ByteBuddy mood="think" title="Let's investigate! 🔍" size={56} compact>
            Read the website name letter by letter. Tap clues if you need help, and I'll explain each answer!
          </ByteBuddy>
        </div>
        <button onClick={() => setGameState("playing")} style={{
          background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "white",
          border: "none", padding: "14px 36px", borderRadius: "14px",
          fontWeight: "bold", fontSize: "17px", cursor: "pointer",
          boxShadow: "0 0 20px rgba(167,139,250,0.4)"
        }}>
          Start Investigating! 🔍
        </button>
      </div>
    );
  }

  if (gameState === "over") {
    const accuracy = total > 0 ? Math.round((breakdown.correct / total) * 100) : 0;
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Arial", color: "white", gap: "16px", padding: "24px"
      }}>
        <div style={{ fontSize: "52px" }}>{accuracy >= 80 ? "🏆" : accuracy >= 50 ? "🛡️" : "💪"}</div>
        <h1 style={{ fontSize: "32px", color: "#a78bfa", margin: 0 }}>
          {lives <= 0 ? "Oh no! You ran out of lives!" : "Investigation Complete!"}
        </h1>
        <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "20px", margin: 0 }}>
          Score: {score}
        </p>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <ByteBuddy mood={accuracy >= 60 ? "happy" : "oops"} title={accuracy >= 60 ? "Great detective work! 🎉" : "Good try, Guardian!"} size={56} compact>
            {accuracy >= 60
              ? "You're getting really good at spotting fake websites!"
              : "Fake sites are tricky. Remember: read the name letter by letter. Let's try again!"}
          </ByteBuddy>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
          background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: "16px", padding: "20px 28px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#22c55e" }}>{breakdown.correct}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Correct</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ef4444" }}>{breakdown.wrong}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Wrong</div>
          </div>
          <div style={{ textAlign: "center", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#a78bfa" }}>{accuracy}%</div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Accuracy</div>
          </div>
        </div>
        <button onClick={() => window.location.reload()} style={{
          background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "white",
          border: "none", padding: "13px 32px", borderRadius: "14px",
          fontWeight: "bold", fontSize: "16px", cursor: "pointer"
        }}>
          Play Again 🔍
        </button>
      </div>
    );
  }

  const cardBg = result === "correct" ? "rgba(34,197,94,0.15)"
               : result === "wrong"   ? "rgba(239,68,68,0.15)"
               : "rgba(167,139,250,0.05)";
  const cardBorder = result === "correct" ? "#22c55e"
                   : result === "wrong"   ? "#ef4444"
                   : "rgba(167,139,250,0.3)";

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      fontFamily: "Arial", color: "white", padding: "20px"
    }}>
      {/* HUD */}
      <div style={{ maxWidth: "500px", margin: "0 auto 16px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", color: "#a78bfa", textAlign: "center" }}>
          🔍 Safe Website Detective
        </h1>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "10px", padding: "10px 14px",
          background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: "12px", fontSize: "15px", fontWeight: "bold"
        }}>
          <span>Score: <span style={{ color: "#a78bfa" }}>{score}</span></span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>{index + 1}/{total}</span>
          <span>{"❤️".repeat(lives)}{"🖤".repeat(5 - lives)}</span>
        </div>
      </div>

      {/* Card */}
      <div style={{
        maxWidth: "500px", margin: "0 auto",
        background: cardBg, border: `2px solid ${cardBorder}`,
        borderRadius: "24px", padding: "20px",
        boxShadow: result === "correct" ? "0 0 30px rgba(34,197,94,0.3)"
                 : result === "wrong"   ? "0 0 30px rgba(239,68,68,0.3)"
                 : "none",
        transition: "all 0.2s"
      }}>
        {/* Fake browser */}
        <div style={{
          background: "#111827", borderRadius: "12px", overflow: "hidden",
          border: "1px solid #334155", marginBottom: "16px"
        }}>
          <div style={{
            background: "#1f2937", padding: "8px 12px",
            borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span style={{ fontSize: "16px" }}>
              {scenario.url.startsWith("https") ? "🔒" : "⚠️"}
            </span>
            <div style={{
              flex: 1, background: "#020617", borderRadius: "999px",
              padding: "6px 14px", fontSize: "12px", color: "#94a3b8",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {scenario.url}
            </div>
          </div>
          <div style={{
            padding: "24px", textAlign: "center",
            minHeight: "100px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            <div style={{ fontSize: "44px" }}>{scenario.emoji}</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{scenario.name}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>{scenario.context}</div>
          </div>
        </div>

        {/* Clues */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", color: "#a78bfa", fontWeight: "bold" }}>
            🔎 Detective Clues
          </div>
          {scenario.clues.map((clue, i) => {
            const revealed = revealedClues.includes(i);
            return (
              <button key={i} onClick={() => revealClue(i)} style={{
                textAlign: "left", padding: "12px 14px", borderRadius: "12px",
                border: revealed ? "1px solid #22c55e" : "1px solid #334155",
                background: revealed ? "rgba(34,197,94,0.1)" : "#111827",
                color: revealed ? "#bbf7d0" : "#cbd5e1",
                cursor: revealed ? "default" : "pointer",
                fontWeight: "bold", fontSize: "13px", lineHeight: "1.5"
              }}>
                {revealed ? `✅ ${clue}` : `🔎 Tap to reveal clue ${i + 1}`}
              </button>
            );
          })}
        </div>

        {/* Byte explains the answer */}
        {result && (
          <div style={{ marginBottom: "12px" }}>
            <ByteBuddy mood={result === "correct" ? "happy" : "oops"} title={byteOpener(result === "correct", scenario.id)}>
              {scenario.status === "ok" ? "This one was safe. " : "This one was dangerous! "}
              {scenario.clues[0]}
            </ByteBuddy>
          </div>
        )}

        {/* Answer buttons (swap to Next once answered) */}
        {result ? (
          <button onClick={goNext} autoFocus style={{
            width: "100%", padding: "16px", borderRadius: "14px", border: "2px solid #a78bfa",
            background: "rgba(167,139,250,0.15)", color: "#c4b5fd", fontWeight: "900", fontSize: "17px", cursor: "pointer"
          }}>
            {lives <= 0 || index + 1 >= total ? "See my score 🏁" : "Next website →"}
          </button>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button onClick={() => choose("ok")} disabled={locked} style={{
            padding: "16px", borderRadius: "14px",
            border: "2px solid #22c55e", background: "rgba(34,197,94,0.1)",
            color: "#22c55e", fontWeight: "900", fontSize: "16px",
            cursor: locked ? "default" : "pointer", opacity: locked ? 0.6 : 1
          }}>
            ✅ LOOKS SAFE
          </button>
          <button onClick={() => choose("danger")} disabled={locked} style={{
            padding: "16px", borderRadius: "14px",
            border: "2px solid #ef4444", background: "rgba(239,68,68,0.1)",
            color: "#ef4444", fontWeight: "900", fontSize: "16px",
            cursor: locked ? "default" : "pointer", opacity: locked ? 0.6 : 1
          }}>
            🚨 DANGER!
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

// ── Pro Game ──────────────────────────────────────────────────────────────
function ProGame() {
  const initialTier              = getInitialTier();
  const [tier, setTier]          = useState(initialTier);
  const [gameState, setGameState] = useState("start");
  const [scenarios, setScenarios] = useState(() => shuffle(PRO_SCENARIOS[initialTier]));
  const [index, setIndex]        = useState(0);
  const [lives, setLives]        = useState(3);
  const [score, setScore]        = useState(0);
  const [revealedClues, setRevealedClues] = useState([]);
  const [result, setResult]      = useState(null);
  const [locked, setLocked]      = useState(false);
  const [breakdown, setBreakdown] = useState({ correct: 0, wrong: 0 });

  const scenario = scenarios[index];
  const total    = scenarios.length;

  function switchTier(t) {
    setTier(t);
    setScenarios(shuffle(PRO_SCENARIOS[t]));
    setIndex(0); setLives(3); setScore(0);
    setRevealedClues([]); setResult(null); setLocked(false);
    setBreakdown({ correct: 0, wrong: 0 });
    setGameState("start");
  }

  function revealClue(i) {
    if (revealedClues.includes(i)) return;
    setRevealedClues(prev => [...prev, i]);
  }

  function choose(answer) {
    if (locked || gameState !== "playing") return;
    setLocked(true);

    const correct = answer === scenario.status;
    const cluesUsed = revealedClues.length;
    const pts = correct ? (cluesUsed === 0 ? 15 : cluesUsed === 1 ? 10 : cluesUsed === 2 ? 5 : 2) : 0;

    setResult(correct ? "correct" : "wrong");
    setScore(s => s + pts);
    setBreakdown(b => ({ correct: b.correct + (correct ? 1 : 0), wrong: b.wrong + (correct ? 0 : 1) }));

    if (!correct) setLives(l => l - 1);
  }

  function goNext() {
    setResult(null); setLocked(false);
    if (lives <= 0 || index + 1 >= total) {
      setGameState("over");
    } else {
      setIndex(i => i + 1);
      setRevealedClues([]);
    }
  }

  const accentColor = tier === "elite" ? "#facc15" : tier === "junior" ? "#22d3ee" : "#08b6aa";
  const accentGlow  = tier === "elite" ? "rgba(250,204,21,0.3)" : tier === "junior" ? "rgba(34,211,238,0.3)" : "rgba(8,182,170,0.3)";

  if (gameState === "start") {
    return (
      <div style={{
        minHeight: "100vh", position: "relative", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Arial", color: "white", gap: "18px", padding: "24px"
      }}>
        <button
          onClick={() => { window.location.href = "/missions"; }}
          style={{
            position: "absolute", top: "18px", left: "18px",
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: `1px solid ${accentColor}55`,
            color: accentColor, borderRadius: "10px", padding: "6px 14px",
            fontSize: "13px", fontWeight: "bold", cursor: "pointer",
          }}
        >
          ← Back to Games
        </button>
        <div style={{ fontSize: "60px" }}>🔍</div>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", color: accentColor, margin: 0, textAlign: "center" }}>
          Safe Website Detector
        </h1>

        {/* Tier buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {[["junior","🌟 Junior"],["hero","🛡️ Hero"],["elite","⚡ Elite"]].map(([t, label]) => {
            const tc = t === "elite" ? "#facc15" : t === "junior" ? "#22d3ee" : "#08b6aa";
            return (
              <button key={t} onClick={() => switchTier(t)} style={{
                background: tier === t ? tc : "rgba(255,255,255,0.05)",
                color: tier === t ? "#000" : "#fff",
                border: `1px solid ${tc}`,
                padding: "9px 18px", borderRadius: "12px",
                fontWeight: "bold", fontSize: "14px", cursor: "pointer"
              }}>{label}</button>
            );
          })}
        </div>

        <div style={{
          background: `rgba(8,182,170,0.08)`, border: `1px solid rgba(8,182,170,0.25)`,
          borderRadius: "16px", padding: "18px 26px", fontSize: "13px",
          color: "#94a3b8", lineHeight: "2.1", textAlign: "center", maxWidth: "400px"
        }}>
          <div>🔎 Reveal clues to investigate each URL</div>
          <div><span style={{ color: "#22c55e" }}>✅ SAFE</span> — looks legitimate</div>
          <div><span style={{ color: "#ef4444" }}>🚨 FAKE</span> — signs of a malicious site</div>
          <div style={{ color: accentColor, marginTop: "4px" }}>
            Fewer clues used = more points (max 15)
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: "400px" }}>
          <ByteBuddy mood="think" title="Ready, detective?" size={56} compact>
            Fake sites copy real ones closely. Check the exact spelling and anything added before the real name!
          </ByteBuddy>
        </div>
        <button onClick={() => setGameState("playing")} style={{
          background: `linear-gradient(135deg,${accentColor},${tier === "elite" ? "#d97706" : "#059f94"})`,
          color: "#000", border: "none", padding: "13px 36px", borderRadius: "14px",
          fontWeight: "bold", fontSize: "17px", cursor: "pointer",
          boxShadow: `0 0 20px ${accentGlow}`
        }}>
          Start Mission
        </button>
      </div>
    );
  }

  if (gameState === "over") {
    const accuracy = total > 0 ? Math.round((breakdown.correct / total) * 100) : 0;
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "Arial", color: "white", gap: "16px", padding: "24px"
      }}>
        <div style={{ fontSize: "48px" }}>{lives <= 0 ? "💀" : "🏆"}</div>
        <h1 style={{ fontSize: "30px", color: lives <= 0 ? "#ef4444" : accentColor, margin: 0 }}>
          {lives <= 0 ? "System Compromised" : "Investigation Complete"}
        </h1>
        <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "20px", margin: 0 }}>
          Score: {score}
        </p>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <ByteBuddy mood={accuracy >= 60 ? "happy" : "oops"} title={accuracy >= 60 ? "Sharp eyes! 🎉" : "Don't give up!"} size={56} compact>
            {accuracy >= 60
              ? "Those fakes didn't fool you. Try a harder level next!"
              : "The sneakiest fakes add words before the real name. Look closely and try again!"}
          </ByteBuddy>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
          background: `rgba(8,182,170,0.06)`, border: "1px solid rgba(8,182,170,0.2)",
          borderRadius: "16px", padding: "20px 28px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: "bold", color: "#22c55e" }}>{breakdown.correct}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Correct</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: "bold", color: "#ef4444" }}>{breakdown.wrong}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Wrong</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "26px", fontWeight: "bold", color: accentColor }}>{accuracy}%</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Accuracy</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => switchTier(tier)} style={{
            background: `linear-gradient(135deg,${accentColor},${tier === "elite" ? "#d97706" : "#059f94"})`,
            color: "#000", border: "none", padding: "12px 28px", borderRadius: "12px",
            fontWeight: "bold", fontSize: "15px", cursor: "pointer"
          }}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const cardBg     = result === "correct" ? "rgba(34,197,94,0.1)"
                   : result === "wrong"   ? "rgba(239,68,68,0.1)"
                   : "rgba(8,182,170,0.04)";
  const cardBorder = result === "correct" ? "#22c55e"
                   : result === "wrong"   ? "#ef4444"
                   : "#1e3a5f";

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      fontFamily: "Arial", color: "white", padding: "20px"
    }}>
      {/* HUD */}
      <div style={{ maxWidth: "720px", margin: "0 auto 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "22px", color: accentColor }}>🔍 Safe Website Detector</h1>
          <div style={{ display: "flex", gap: "8px" }}>
            {[["junior","🌟"],["hero","🛡️"],["elite","⚡"]].map(([t, emoji]) => {
              const tc = t === "elite" ? "#facc15" : t === "junior" ? "#22d3ee" : "#08b6aa";
              return (
                <button key={t} onClick={() => switchTier(t)} style={{
                  background: tier === t ? tc : "transparent",
                  color: tier === t ? "#000" : "#fff",
                  border: `1px solid ${tc}`, padding: "6px 12px",
                  borderRadius: "10px", fontWeight: "bold", fontSize: "12px", cursor: "pointer"
                }}>{emoji} {t.charAt(0).toUpperCase() + t.slice(1)}</button>
              );
            })}
          </div>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "10px", padding: "10px 14px",
          background: "rgba(8,182,170,0.06)", border: "1px solid rgba(8,182,170,0.15)",
          borderRadius: "12px", fontSize: "15px", fontWeight: "bold"
        }}>
          <span>Score: <span style={{ color: accentColor }}>{score}</span></span>
          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Site {index + 1}/{total}</span>
          <span>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span>
        </div>
      </div>

      {/* Card */}
      <div style={{
        maxWidth: "720px", margin: "0 auto",
        background: cardBg, border: `2px solid ${cardBorder}`,
        borderRadius: "24px", overflow: "hidden",
        boxShadow: result === "correct" ? "0 0 35px rgba(34,197,94,0.2)"
                 : result === "wrong"   ? "0 0 35px rgba(239,68,68,0.2)"
                 : `0 0 25px ${accentGlow}`,
        transition: "all 0.2s"
      }}>
        {/* Fake browser bar */}
        <div style={{
          background: "#111827", padding: "10px 16px",
          borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          <span style={{ fontSize: "18px" }}>
            {scenario.url.startsWith("https") ? "🔒" : "⚠️"}
          </span>
          <div style={{
            flex: 1, background: "#020617", border: "1px solid #334155",
            borderRadius: "999px", padding: "8px 16px",
            color: "#e2e8f0", fontWeight: "bold", fontSize: "13px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            letterSpacing: "0.01em"
          }}>
            {scenario.url}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 0 }}>
          {/* Left: site preview */}
          <div style={{
            padding: "32px 28px", borderRight: "1px solid #1e293b",
            display: "flex", flexDirection: "column", justifyContent: "center",
            alignItems: "center", textAlign: "center", gap: "12px", minHeight: "280px"
          }}>
            <div style={{ fontSize: "56px" }}>🌐</div>
            <h2 style={{ fontSize: "clamp(20px,3vw,30px)", margin: 0, color: "#fff" }}>
              {scenario.name}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: 0, maxWidth: "320px" }}>
              {scenario.context}
            </p>
          </div>

          {/* Right: clues + buttons */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", color: accentColor, fontWeight: "bold" }}>
              🔎 Detective Clues
            </div>
            {scenario.clues.map((clue, i) => {
              const revealed = revealedClues.includes(i);
              return (
                <button key={i} onClick={() => revealClue(i)} style={{
                  textAlign: "left", padding: "11px 13px", borderRadius: "12px",
                  border: revealed ? "1px solid #22c55e" : "1px solid #334155",
                  background: revealed ? "rgba(34,197,94,0.08)" : "#0b1929",
                  color: revealed ? "#bbf7d0" : "#94a3b8",
                  cursor: revealed ? "default" : "pointer",
                  fontSize: "12px", lineHeight: "1.6", fontWeight: revealed ? "bold" : "normal"
                }}>
                  {revealed ? `✅ ${clue}` : `🔎 Reveal Clue ${i + 1}`}
                </button>
              );
            })}

            {/* Byte explains the answer */}
            {result && (
              <ByteBuddy mood={result === "correct" ? "happy" : "oops"} title={byteOpener(result === "correct", scenario.id)} size={48} compact>
                {scenario.status === "safe" ? "This one was legit. " : "This one was fake! "}
                {scenario.clues[0]}
              </ByteBuddy>
            )}

            {result ? (
              <button onClick={goNext} autoFocus style={{
                marginTop: "auto", width: "100%", padding: "14px 8px", borderRadius: "12px",
                border: `2px solid ${accentColor}`, background: "rgba(8,182,170,0.12)", color: accentColor,
                fontWeight: "900", fontSize: "15px", cursor: "pointer"
              }}>
                {lives <= 0 || index + 1 >= total ? "See my score 🏁" : "Next website →"}
              </button>
            ) : (
            <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button onClick={() => choose("safe")} disabled={locked} style={{
                padding: "14px 8px", borderRadius: "12px",
                border: "2px solid #22c55e", background: "rgba(34,197,94,0.08)",
                color: "#22c55e", fontWeight: "900", fontSize: "14px",
                cursor: locked ? "default" : "pointer", opacity: locked ? 0.55 : 1
              }}>
                ✅ SAFE
              </button>
              <button onClick={() => choose("fake")} disabled={locked} style={{
                padding: "14px 8px", borderRadius: "12px",
                border: "2px solid #ef4444", background: "rgba(239,68,68,0.08)",
                color: "#ef4444", fontWeight: "900", fontSize: "14px",
                cursor: locked ? "default" : "pointer", opacity: locked ? 0.55 : 1
              }}>
                🚨 FAKE
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const mode = getMode();
  if (mode === "kids")   return <KidsGame />;
  if (mode === "pro")    return <ProGame />;
  return <ModePicker />;
}
