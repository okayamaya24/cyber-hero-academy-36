import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ByteBuddy from "@/games/shared/ByteBuddy";
import phisherKingArt from "@/assets/home/phisher-king.webp";

/**
 * WiFi Watch (Europe · Oslo) — a story mission instead of quiz/sort/word-search.
 * The Phisher King has set up fake hotspots around Oslo. The Guardian picks the
 * real network in three places, decides what's safe on public WiFi, then
 * shuts down his fake "WiFi Support" trap. Mistakes change the ending.
 */

type Network = { name: string; locked: boolean; bars: 1 | 2 | 3; real?: boolean; why: string };
type Location = {
  id: string;
  icon: string;
  place: string;
  scene: string;
  sign: string;
  networks: Network[];
  win: string;
};

const LOCATIONS: Location[] = [
  {
    id: "cafe",
    icon: "☕",
    place: "Fjord Café",
    scene: "You sit down with a hot chocolate. Your tablet wants WiFi.",
    sign: "WiFi: FjordCafe_Guest · password is on your receipt",
    networks: [
      { name: "FjordCafe_Guest_FREE", locked: false, bars: 3, why: "Extra words like FREE are a trick. The sign says FjordCafe_Guest, nothing else." },
      { name: "FjordCafe_Guest", locked: true, bars: 2, real: true, why: "It matches the café's sign exactly. Always check the official name!" },
      { name: "Fjord Cafe Guest", locked: false, bars: 3, why: "Close, but spaces instead of underscores. The Phisher King made a look-alike!" },
      { name: "FREE WiFi - Super Fast!", locked: false, bars: 3, why: "A random 'free' network nobody posted on a sign. Classic trap." },
    ],
    win: "Café saved!",
  },
  {
    id: "library",
    icon: "📚",
    place: "Oslo Library",
    scene: "Homework time! The library is packed and everyone needs WiFi.",
    sign: "Network: OsloLibrary-Public · ask the front desk for the password",
    networks: [
      { name: "OsloLibrary-Public", locked: false, bars: 3, why: "Same name, but it doesn't ask for a password, and the sign says it should. A copycat!" },
      { name: "Oslo_Library_Fast", locked: false, bars: 3, why: "'Fast' sounds great, but it's not the name on the sign." },
      { name: "OsloLibrary-Public", locked: true, bars: 2, real: true, why: "Right name AND it asks for the password from the desk, just like the sign says." },
      { name: "Library Guest WiFi", locked: false, bars: 2, why: "Not the official name. When in doubt, ask the librarian!" },
    ],
    win: "Library saved!",
  },
  {
    id: "station",
    icon: "🚉",
    place: "Oslo Central Station",
    scene: "Your train is late. The Phisher King's sneakiest hotspots are here!",
    sign: "Free station WiFi: OsloCentral_Free · it will never ask for a password",
    networks: [
      { name: "OsloCentral-Free", locked: true, bars: 3, why: "A lock doesn't make it real! The name uses a dash, and the sign says no password." },
      { name: "OsloCentral_Free", locked: false, bars: 2, real: true, why: "Matches the sign exactly, and the sign says it's free with no password. The NAME is what matters!" },
      { name: "OsloCentral_Free_2", locked: false, bars: 3, why: "A '2' on the end is a copycat trick." },
      { name: "Station Free Internet", locked: false, bars: 3, why: "Not the official name on the station's sign." },
    ],
    win: "Station saved!",
  },
];

const SAFE_CARDS = [
  { text: "Watch a funny cat video", safe: true, why: "Watching videos is fine on public WiFi. You're not typing anything secret." },
  { text: "Type your game password", safe: false, why: "Wait until you're home, or ask a grown-up to use their phone's data. Fake hotspots can see what you type." },
  { text: "Look up a cookie recipe", safe: true, why: "Searching for fun stuff is OK. Nothing private there!" },
  { text: "Buy V-Bucks with Mom's card", safe: false, why: "Never pay for anything on public WiFi. Card numbers are exactly what hackers want." },
];

const TRAP = [
  {
    from: "Station WiFi Support 📶",
    text: "Hi! Your free WiFi time is up 😢 Type your email and password to get 1 more hour!",
    options: [
      { text: "Type my email and password", good: false, villain: "Mwahaha! Thanks for the password! 🎣", byte: "Real WiFi never asks for your email password. That was the Phisher King in disguise!" },
      { text: "Don't answer, and ask a station worker", good: true, villain: "Hey! Don't ask a REAL person! 😤", byte: "Perfect! When something asks for a password, check with a real grown-up first." },
      { text: "Reply: 'Who is this?'", good: false, villain: "Oh, just a friendly helper... 😏", byte: "Chatting back keeps the trick going. Better to ignore it and ask a real person." },
    ],
  },
  {
    from: "Station WiFi Support 📶",
    text: "OK OK!! Just tell me your school's name and you get UNLIMITED WiFi forever! 🎁",
    options: [
      { text: "Tell them my school", good: false, villain: "Ooh, now I know where to find you! 🎣", byte: "Your school's name tells strangers where you are. Never share it online!" },
      { text: "Say no and tell a grown-up", good: true, villain: "NOOO! My hotspot... it's shutting down! 📡💥", byte: "YES! You saw right through him. Oslo's WiFi is safe again!" },
    ],
  },
];

type Step =
  | { kind: "intro" }
  | { kind: "wifi"; loc: number }
  | { kind: "safe" }
  | { kind: "trap"; msg: number }
  | { kind: "end" };

interface Props {
  playerName: string;
  onFinish: (stars: number) => void; // mission won: save progress and leave
  onExit: () => void; // back to the map without finishing
}

function Bars({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-label={`${n} of 3 signal bars`}>
      {[1, 2, 3].map((b) => (
        <span key={b} className={`w-[4px] rounded-sm ${b <= n ? "bg-slate-700" : "bg-slate-300"}`} style={{ height: 4 + b * 4 }} />
      ))}
    </span>
  );
}

function PhisherSays({ text, angry }: { text: string; angry?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <motion.img
        key={text}
        src={phisherKingArt}
        alt="The Phisher King"
        className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(68,136,204,0.7)]"
        animate={angry ? { rotate: [0, -6, 6, -4, 0], scale: [1, 0.95, 1] } : { y: [0, -4, 0] }}
        transition={angry ? { duration: 0.6 } : { repeat: Infinity, duration: 2.5 }}
      />
      <div className="rounded-2xl rounded-bl-sm border border-[#4488cc]/50 bg-[#4488cc]/15 px-3 py-2 text-sm font-bold italic text-sky-100">
        "{text}"
      </div>
    </div>
  );
}

export default function WiFiWatchMission({ playerName, onFinish, onExit }: Props) {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [mistakes, setMistakes] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [safeIdx, setSafeIdx] = useState(0);
  const [safeAnswer, setSafeAnswer] = useState<boolean | null>(null);
  const [trapPick, setTrapPick] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);

  const firstName = playerName.trim().split(/\s+/)[0] || "Guardian";
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const lost = mistakes >= 6;

  function restart() {
    setStep({ kind: "intro" });
    setMistakes(0);
    setSaved([]);
    setPicked(null);
    setSafeIdx(0);
    setSafeAnswer(null);
    setTrapPick(null);
  }

  // ── WiFi pick ──
  function pickNetwork(i: number, loc: Location) {
    if (picked !== null && loc.networks[picked]?.real) return;
    setPicked(i);
    if (loc.networks[i].real) setSaved((s) => [...s, loc.id]);
    else setMistakes((m) => m + 1);
  }

  const header = (
    <div className="mb-4 flex items-center justify-between gap-3">
      <button onClick={onExit} className="rounded-lg border border-white/15 px-3 py-1 text-xs font-bold text-white/60 hover:text-white">
        ◄ Map
      </button>
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300/70">Europe · Oslo</p>
        <h1 className="text-lg font-black text-white">📶 WiFi Watch</h1>
      </div>
      <div className="flex gap-1" aria-label="Places saved">
        {LOCATIONS.map((l) => (
          <span
            key={l.id}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${saved.includes(l.id) ? "bg-emerald-400/25 ring-2 ring-emerald-400" : "bg-white/5 opacity-40"}`}
            title={l.place}
          >
            {l.icon}
          </span>
        ))}
      </div>
    </div>
  );

  // Oslo skyline: windows light up as places are saved
  const skyline = (
    <div className="pointer-events-none mt-6 flex h-16 items-end justify-center gap-1 opacity-80" aria-hidden>
      {[40, 58, 34, 64, 46, 52, 38].map((h, i) => (
        <div key={i} className="relative w-10 rounded-t-sm bg-[#0e1a33]" style={{ height: h }}>
          {Array.from({ length: Math.floor(h / 14) }).map((_, w) => (
            <span
              key={w}
              className="absolute left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-sm transition-colors duration-700"
              style={{ top: 6 + w * 12, background: saved.length > (i % 3) ? "#facc15" : "#1e2a44" }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  let body: JSX.Element;

  if (step.kind === "intro") {
    body = (
      <div className="space-y-4">
        <PhisherSays text={`Welcome to Oslo, ${firstName}! I've hidden FAKE WiFi all over the city. Connect to mine and I'll see everything you type! 🎣`} />
        <ByteBuddy mood="think" title="Uh-oh, fake hotspots! 📡" size={56} compact>
          A fake hotspot pretends to be real WiFi. The trick: look for the official network name on a sign, or ask a worker. Let's save Oslo!
        </ByteBuddy>
        <button
          onClick={() => setStep({ kind: "wifi", loc: 0 })}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 py-4 text-lg font-black text-[#06111f]"
        >
          Start the mission! 🚀
        </button>
      </div>
    );
  } else if (step.kind === "wifi") {
    const loc = LOCATIONS[step.loc];
    const chosen = picked !== null ? loc.networks[picked] : null;
    const done = chosen?.real;
    body = (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-2xl">{loc.icon}</p>
          <p className="font-black text-white">{loc.place}</p>
          <p className="text-sm text-white/70">{loc.scene}</p>
          <div className="mt-3 rounded-lg border-2 border-dashed border-amber-300/60 bg-amber-200 px-3 py-2 font-mono text-sm font-bold text-amber-950 shadow-inner">
            📋 {loc.sign}
          </div>
        </div>

        {/* Phone WiFi list */}
        <div className="mx-auto max-w-sm overflow-hidden rounded-[28px] border-4 border-slate-700 bg-slate-100 shadow-2xl">
          <div className="bg-slate-200 px-4 py-2 text-center text-xs font-bold text-slate-500">Settings › Wi-Fi</div>
          <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Choose a network</p>
          <ul className="divide-y divide-slate-200">
            {loc.networks.map((n, i) => {
              const isPicked = picked === i;
              const state = !isPicked ? "" : n.real ? "bg-emerald-100" : "bg-rose-100";
              return (
                <li key={n.name + i}>
                  <button
                    onClick={() => pickNetwork(i, loc)}
                    disabled={!!done}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-slate-800 transition-colors hover:bg-white disabled:cursor-default ${state}`}
                  >
                    <span className="min-w-0 truncate font-semibold">{n.name}</span>
                    <span className="flex shrink-0 items-center gap-2 text-slate-500">
                      {n.locked && <span aria-label="needs a password">🔒</span>}
                      <Bars n={n.bars} />
                      {isPicked && <span>{n.real ? "✅" : "❌"}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <AnimatePresence mode="wait">
          {chosen && (
            <motion.div key={picked} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {!chosen.real && <PhisherSays text="Gotcha! That one's MINE! 😈 Try again..." />}
              <ByteBuddy mood={chosen.real ? "happy" : "oops"} title={chosen.real ? `${loc.win} 🎉` : "That's a fake!"} size={52} compact>
                {chosen.why}
              </ByteBuddy>
              {done && (
                <button
                  autoFocus
                  onClick={() => {
                    setPicked(null);
                    if (step.loc + 1 < LOCATIONS.length) setStep({ kind: "wifi", loc: step.loc + 1 });
                    else setStep({ kind: "safe" });
                  }}
                  className="w-full rounded-2xl border-2 border-sky-400 bg-sky-400/15 py-3 font-black text-sky-200"
                >
                  {step.loc + 1 < LOCATIONS.length ? `On to the ${LOCATIONS[step.loc + 1].place} →` : "Next challenge →"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  } else if (step.kind === "safe") {
    const card = SAFE_CARDS[safeIdx];
    const answered = safeAnswer !== null;
    const right = answered && safeAnswer === card.safe;
    body = (
      <div className="space-y-4">
        <ByteBuddy mood="think" title="You're on the real station WiFi now!" size={52} compact>
          But public WiFi is shared with strangers. Is this OK to do here, or should it wait until you're home?
        </ByteBuddy>
        <p className="text-center text-xs font-bold text-white/50">
          {safeIdx + 1} of {SAFE_CARDS.length}
        </p>
        <motion.div
          key={safeIdx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl border-2 p-6 text-center text-xl font-black text-white ${!answered ? "border-white/15 bg-white/5" : right ? "border-emerald-400 bg-emerald-400/10" : "border-rose-400 bg-rose-400/10"}`}
        >
          {card.text}
        </motion.div>
        {!answered ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSafeAnswer(true);
                if (!card.safe) setMistakes((m) => m + 1);
              }}
              className="rounded-2xl border-2 border-emerald-400 bg-emerald-400/10 py-4 font-black text-emerald-300"
            >
              👍 OK here
            </button>
            <button
              onClick={() => {
                setSafeAnswer(false);
                if (card.safe) setMistakes((m) => m + 1);
              }}
              className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 py-4 font-black text-amber-300"
            >
              🏠 Wait for home
            </button>
          </div>
        ) : (
          <>
            <ByteBuddy mood={right ? "happy" : "oops"} title={right ? "Exactly right!" : "Hmm, not quite!"} size={48} compact>
              {card.why}
            </ByteBuddy>
            <button
              autoFocus
              onClick={() => {
                setSafeAnswer(null);
                if (safeIdx + 1 < SAFE_CARDS.length) setSafeIdx(safeIdx + 1);
                else setStep({ kind: "trap", msg: 0 });
              }}
              className="w-full rounded-2xl border-2 border-sky-400 bg-sky-400/15 py-3 font-black text-sky-200"
            >
              Next →
            </button>
          </>
        )}
      </div>
    );
  } else if (step.kind === "trap") {
    const msg = TRAP[step.msg];
    const choice = trapPick !== null ? msg.options[trapPick] : null;
    body = (
      <div className="space-y-4">
        {/* Phone chat */}
        <div className="mx-auto max-w-sm overflow-hidden rounded-[28px] border-4 border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/30 text-sm">📶</span>
            <div>
              <p className="text-sm font-bold text-white">{msg.from}</p>
              <p className="text-[10px] text-white/40">new message</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <motion.div
              key={step.msg}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-700 px-3 py-2 text-sm text-white"
            >
              {msg.text}
            </motion.div>
            {choice && (
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-sky-500 px-3 py-2 text-right text-sm font-semibold text-white">
                {choice.text}
              </div>
            )}
          </div>
        </div>

        {!choice || !choice.good ? (
          <div className="space-y-2">
            <p className="text-center text-xs font-bold text-white/50">What do you do?</p>
            {msg.options.map((o, i) => (
              <button
                key={o.text}
                disabled={trapPick === i}
                onClick={() => {
                  setTrapPick(i);
                  if (!o.good) setMistakes((m) => m + 1);
                }}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left font-semibold text-white hover:border-sky-400 disabled:opacity-40"
              >
                {o.text}
              </button>
            ))}
          </div>
        ) : null}

        {choice && (
          <motion.div key={trapPick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <PhisherSays text={choice.villain} angry={choice.good} />
            <ByteBuddy mood={choice.good ? "happy" : "oops"} title={choice.good ? "Nice move!" : "Careful!"} size={48} compact>
              {choice.byte}
            </ByteBuddy>
            {choice.good && (
              <button
                autoFocus
                onClick={() => {
                  setTrapPick(null);
                  if (step.msg + 1 < TRAP.length) setStep({ kind: "trap", msg: step.msg + 1 });
                  else setStep({ kind: "end" });
                }}
                className="w-full rounded-2xl border-2 border-sky-400 bg-sky-400/15 py-3 font-black text-sky-200"
              >
                {step.msg + 1 < TRAP.length ? "He's typing again... →" : "Finish the mission →"}
              </button>
            )}
          </motion.div>
        )}
      </div>
    );
  } else {
    // ── Endings: led it / did it together / he got away ──
    body = lost ? (
      <div className="space-y-4 text-center">
        <p className="text-5xl">📡</p>
        <h2 className="text-2xl font-black text-white">The Phisher King got away!</h2>
        <PhisherSays text="Mwahaha! My fake hotspots are still out there! See you next time! 🎣" />
        <ByteBuddy mood="oops" title="That's OK, Guardian!" size={52} compact>
          Fake hotspots fool lots of grown-ups too. Remember: match the name on the official sign. Want to try again?
        </ByteBuddy>
        <button onClick={restart} className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 py-4 text-lg font-black text-[#06111f]">
          Try again 🔄
        </button>
      </div>
    ) : (
      <div className="space-y-4 text-center">
        <motion.p initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} className="text-5xl">
          🏆
        </motion.p>
        <h2 className="text-2xl font-black text-white">{stars === 3 ? "You led the mission!" : "You and Byte saved Oslo!"}</h2>
        <div className="flex justify-center gap-1 text-3xl">
          {[1, 2, 3].map((s) => (
            <span key={s} className={s <= stars ? "" : "opacity-20"}>
              ⭐
            </span>
          ))}
        </div>
        <motion.div
          initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="mx-auto max-w-xs rounded-2xl border-2 border-amber-300 bg-amber-300/10 p-4"
        >
          <p className="text-4xl">📡</p>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Trophy collected!</p>
          <p className="font-black text-white">The Phisher King's Fake Router</p>
          <p className="text-xs text-white/50">(it's very broken now)</p>
        </motion.div>
        <ByteBuddy mood="happy" title={stars === 3 ? `Not one trick fooled you, ${firstName}! 🎉` : "We make a great team! 🎉"} size={52} compact>
          Remember: on public WiFi, match the exact name on the sign, and save passwords and buying for home.
        </ByteBuddy>
        <PhisherSays text="Grr... you saved the WiFi. But my hooks are still out there. Come find me in my LAIR... if you dare! 🎣" />
        <button
          disabled={finishing}
          onClick={() => {
            setFinishing(true);
            onFinish(stars);
          }}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 py-4 text-lg font-black text-[#06111f] disabled:opacity-60"
        >
          {finishing ? "Saving…" : "Back to the map 🗺️"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-4">
      {header}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.kind + ("loc" in step ? step.loc : "") + ("msg" in step ? step.msg : "")}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {body}
        </motion.div>
      </AnimatePresence>
      {skyline}
    </div>
  );
}
