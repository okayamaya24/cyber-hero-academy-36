// Scam Sorter messages, written around how kids 8–12 actually get targeted:
// game chat, DMs, YouTube comments, texts, and pop-ups.
//
// channel: "text" | "game" | "dm" | "youtube" | "email" | "popup"
// type:    "scam" | "safe"
// clue:    shown after answering — this is where the learning happens

// Starter mode: obvious tricks, short messages
export const STARTER_CARDS = [
  {
    id: "s1", channel: "game", from: "xX_FreeRobux_Xx",
    text: "omg im giving away 10,000 FREE robux 😱 just tell me ur password so i can send it!!",
    type: "scam",
    clue: "Nobody needs your password to GIVE you something. Real Robux only come from the official store.",
  },
  {
    id: "s2", channel: "text", from: "Mom ❤️",
    text: "Running 10 mins late to pick you up from practice. Wait inside with Coach!",
    type: "safe",
    clue: "It's from Mom's saved contact, it's about your real day, and it doesn't ask for anything.",
  },
  {
    id: "s3", channel: "youtube", from: "Top YouTuber Giveaway ✔️",
    text: "CONGRATS you WON my iPad giveaway!! 🎉 Message me on Telegram to claim your prize",
    type: "scam",
    clue: "Big YouTubers don't pick winners in the comments. Fake accounts copy famous names to trick you.",
  },
  {
    id: "s4", channel: "game", from: "System Alert",
    text: "⚠️ Your account will be BANNED in 1 hour! Log in here to stop it: game-appeal-help.net",
    type: "scam",
    clue: "Games don't warn you in chat with a link. A countdown plus a strange link is a classic trick.",
  },
  {
    id: "s5", channel: "dm", from: "Jayden (from class)",
    text: "did u finish the math worksheet? number 4 is so hard lol",
    type: "safe",
    clue: "Someone you know, asking about real homework. No links and nothing asked for.",
  },
  {
    id: "s6", channel: "popup", from: "Pop-up",
    text: "🚨 YOUR TABLET HAS 3 VIRUSES! Tap here to clean it NOW!",
    type: "scam",
    clue: "Websites can't scan your tablet. Scary pop-ups want you to tap without thinking. Close it and tell a grown-up.",
  },
  {
    id: "s7", channel: "dm", from: "cool_gamer_14",
    text: "ur really good at fortnite! whats ur address? i'll mail u a free gift card 🎁",
    type: "scam",
    clue: "Never share where you live. Online strangers offering gifts is a big warning sign. Tell a grown-up!",
  },
  {
    id: "s8", channel: "text", from: "Grandpa",
    text: "Happy birthday kiddo! 🎂 Can't wait to see you Saturday.",
    type: "safe",
    clue: "A family member you know, saying something kind. No links, no asks.",
  },
  {
    id: "s9", channel: "game", from: "FREE V-BUCKS 🔥",
    text: "V-BUCKS GENERATOR!! Type your username + password and get 50,000 V-Bucks!",
    type: "scam",
    clue: "Free V-Bucks generators are ALWAYS fake. They exist to steal your account.",
  },
  {
    id: "s10", channel: "email", from: "Ms. Rivera (your teacher)",
    text: "Great job on your science project today! See you tomorrow. 🔬",
    type: "safe",
    clue: "Your real teacher, talking about something that really happened. Nothing to click.",
  },
  {
    id: "s11", channel: "dm", from: "Ava ⭐",
    text: "OMG is this you in this video?? 😂 bit.ly/x9k2",
    type: "scam",
    clue: "Even from a friend, \"is this you?\" with a short link is a trick. Their account might be hacked. Ask them in person!",
  },
  {
    id: "s12", channel: "game", from: "Teammate",
    text: "let's go to the castle next, i'll cover you!",
    type: "safe",
    clue: "Normal game talk. No links, no secrets, no asking for anything.",
  },
];

// Pro mode: sneakier tricks that look more real
export const PRO_CARDS = [
  {
    id: "p1", channel: "dm", from: "Discord Nitro 🎁",
    text: "Hey! Discord is giving free Nitro to active users this week. Claim yours: discord-nitro.gift-claim.com",
    type: "scam",
    clue: "Read the address: the real company would just be discord.com. Extra words like \"gift-claim\" are a trick.",
  },
  {
    id: "p2", channel: "text", from: "+1 (555) 019-2234",
    text: "Hi, this is Game Support. We found a problem with your account. Reply with the 6-digit code we just sent you.",
    type: "scam",
    clue: "A code sent to you is like a key to your account. Real support NEVER asks for it. Someone is trying to log in as you!",
  },
  {
    id: "p3", channel: "email", from: "Roblox <no-reply@roblox.com>",
    text: "Your login code is 482913. Never share this code with anyone. If you didn't ask for it, you can ignore this email.",
    type: "safe",
    clue: "It comes from the real roblox.com and tells you NOT to share the code. Just never give that code to anyone.",
  },
  {
    id: "p4", channel: "youtube", from: "SkinDrops4U",
    text: "free skins for the first 100 people!! link in my bio 👀👀",
    type: "scam",
    clue: "\"First 100 people\" makes you rush. Free-skin links lead to fake login pages that steal accounts.",
  },
  {
    id: "p5", channel: "game", from: "TradeKing_77",
    text: "trade me your rare pet first, then i'll give you TWO legendaries 🤝 promise",
    type: "scam",
    clue: "\"You go first\" trades are one of the most common game scams. Only use the game's official trade window.",
  },
  {
    id: "p6", channel: "dm", from: "Leo (your friend)",
    text: "my account got hacked last night 😩 if u get weird messages from me just ignore them",
    type: "safe",
    clue: "A friend warning you. They're not asking for anything or sending links.",
  },
  {
    id: "p7", channel: "email", from: "Minecraft Team <minecraft.rewards@gmail.com>",
    text: "You've earned a 5,000 Minecoins bonus! Confirm your login to claim it before midnight.",
    type: "scam",
    clue: "Real companies don't email from @gmail.com. A prize plus a deadline plus \"confirm your login\" = scam.",
  },
  {
    id: "p8", channel: "popup", from: "Pop-up",
    text: "Your video player is out of date. Download VideoPlayer_Update.exe to keep watching.",
    type: "scam",
    clue: "Never download from a pop-up. Real updates come from your device's settings or official app store.",
  },
  {
    id: "p9", channel: "text", from: "+1 (555) 017-8841",
    text: "hey it's Mia from soccer, this is my new number! can u buy me a $25 gift card? i'll pay u back tmrw",
    type: "scam",
    clue: "\"New number\" + asking for gift cards is a famous trick. Check with Mia in person or on her old number.",
  },
  {
    id: "p10", channel: "email", from: "Lincoln Elementary <office@lincolnelementary.org>",
    text: "Reminder: Picture day is this Friday. Order forms went home in your take-home folder.",
    type: "safe",
    clue: "From your school's real address, about a real event, with no link or login.",
  },
  {
    id: "p11", channel: "game", from: "[MOD] Alex",
    text: "[MOD] You've been reported for cheating. Send me your password so we can check your account.",
    type: "scam",
    clue: "Anyone can type [MOD] before their name. Real moderators never need your password.",
  },
  {
    id: "p12", channel: "dm", from: "Aunt Kim",
    text: "Saw your drawing on the fridge at your mom's. It's amazing!! 🎨",
    type: "safe",
    clue: "A family member you know, being nice. No links, no asks.",
  },
  {
    id: "p13", channel: "dm", from: "lexi_xo_2014",
    text: "hiii you seem really cool 😊 can we chat somewhere private? don't tell your parents ok?",
    type: "scam",
    clue: "Anyone who asks you to keep secrets from your parents is NOT safe. Block them and tell a trusted grown-up.",
  },
  {
    id: "p14", channel: "text", from: "Delivery Notice",
    text: "Your package could not be delivered. Update your address now: parcel-redelivery-help.co",
    type: "scam",
    clue: "Not expecting a package? Strange address with extra words? That's a fake delivery text.",
  },
  {
    id: "p15", channel: "email", from: "Google <no-reply@accounts.google.com>",
    text: "New sign-in on a Chromebook. If this was you, you don't need to do anything.",
    type: "safe",
    clue: "From the real google.com and no urgent ask. If it WASN'T you, tell a grown-up and change your password in the app.",
  },
  {
    id: "p16", channel: "youtube", from: "YouTube",
    text: "New video from a channel you subscribe to: \"I built a castle in 24 hours!\"",
    type: "safe",
    clue: "A normal notification about a channel you already follow. Nothing to type in.",
  },
];
