import { useState, useRef, useCallback } from "react";
import { HEROES } from "./heroesData";

// ── Types ──────────────────────────────────────────────────────────────────

interface Suit {
  key: string;
  label: string;
  hex: string;
}

interface Skin {
  key: string;
  label: string;
  sub: string;
  dot: string;
  chars: { girl: string; boy: string };
}

interface Titles {
  girl: Record<string, string>;
  boy: Record<string, string>;
}

export interface CyberHeroConfig {
  gender: "girl" | "boy";
  skin: string;
  suitKey: string;
  accessory: string;
  name: string;
  heroSrc: string;
}

interface CyberHeroCreatorProps {
  onSave?: (config: CyberHeroConfig) => void;
  saving?: boolean;
  childName?: string;
}

// ── Static data ────────────────────────────────────────────────────────────

const SUITS: Suit[] = [
  { key: "blue",   label: "Blue",   hex: "#2563eb" },
  { key: "green",  label: "Green",  hex: "#22c55e" },
  { key: "purple", label: "Purple", hex: "#9333ea" },
  { key: "pink",   label: "Pink",   hex: "#ec4899" },
  { key: "teal",   label: "Teal",   hex: "#06b6d4" },
];

const SKINS: Skin[] = [
  { key: "light", label: "Light",        sub: "Fair complexion",  dot: "#F5C8A0", chars: { girl: "girl-light",  boy: "boy-light"  } },
  { key: "tan",   label: "Tan",          sub: "Olive / tan skin", dot: "#D4956A", chars: { girl: "girl-tan",    boy: "boy-tan"    } },
  { key: "brown", label: "Medium Brown", sub: "Brown skin",       dot: "#C0784A", chars: { girl: "girl-brown",  boy: "boy-dark"   } },
  { key: "dark",  label: "Dark",         sub: "Deep brown skin",  dot: "#8B4513", chars: { girl: "girl-puffs",  boy: "boy-black"  } },
];

const TITLES: Titles = {
  girl: { none: "Cyber Guardian", tablet: "Data Wizard",  shield: "Cyber Sentinel", magnifier: "Code Detective" },
  boy:  { none: "Cyber Ranger",   tablet: "Byte Master",  shield: "Net Defender",   magnifier: "Link Sleuth"    },
};

const ACCESSORIES = [
  { key: "none",      label: "✕ None"      },
  { key: "tablet",    label: "📱 Tablet"    },
  { key: "shield",    label: "🛡️ Shield"    },
  { key: "magnifier", label: "🔍 Magnifier" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getHeroSrc(gender: string, skin: string, suitIdx: number, acc: string): string {
  const char = SKINS.find(s => s.key === skin)!.chars[gender as "girl" | "boy"];
  const suit = SUITS[suitIdx].key;
  const key  = acc === "none" ? `${char}-${suit}` : `${char}-${acc}-${suit}`;
  return HEROES[key] ?? HEROES[`${char}-${suit}`] ?? "";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CyberHeroCreator({ onSave, saving, childName }: CyberHeroCreatorProps) {
  const [gender, setGender] = useState<"girl" | "boy">("girl");
  const [skin,   setSkin]   = useState("light");
  const [suit,   setSuit]   = useState(0);
  const [acc,    setAcc]    = useState("none");
  const [name,   setName]   = useState(childName ?? "");
  const [swapping, setSwapping] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroSrc = getHeroSrc(gender, skin, suit, acc);
  const char    = SKINS.find(s => s.key === skin)!.chars[gender];
  const doneSrc = HEROES[acc === "none" ? `${char}-${SUITS[suit].key}` : `${char}-${acc}-${SUITS[suit].key}`]
                  ?? HEROES[`${char}-${SUITS[suit].key}`] ?? "";

  const badge   = name.trim() ? name.trim().toUpperCase() : "CYBER HERO";
  const tagline = `${TITLES[gender][acc]} · ${SUITS[suit].label} Squad`;

  const triggerSwap = useCallback(() => {
    if (swapTimer.current) clearTimeout(swapTimer.current);
    setSwapping(true);
    swapTimer.current = setTimeout(() => setSwapping(false), 260);
  }, []);

  const handleGender = (g: "girl" | "boy") => { triggerSwap(); setGender(g); };
  const handleSkin   = (k: string)         => { triggerSwap(); setSkin(k);   };
  const handleSuit   = (i: number)         => { triggerSwap(); setSuit(i);   };
  const handleAcc    = (k: string)         => { triggerSwap(); setAcc(k);    };

  const heroTitle = `${name.trim() || "Cyber Hero"} — ACTIVATED!`;
  const heroText  = `You are now a certified ${TITLES[gender][acc]}! ${SUITS[suit].label} Squad is counting on you. Protect the internet, defeat cyber villains, and keep everyone safe online!`;

  const handleSaveClick = () => {
    if (onSave) {
      onSave({
        gender,
        skin,
        suitKey: SUITS[suit].key,
        accessory: acc,
        name: name.trim() || "Cyber Hero",
        heroSrc,
      });
    } else {
      setShowDone(true);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Orbitron:wght@700;900&display=swap');
        .chy-wrap *{box-sizing:border-box;margin:0;padding:0}
        .chy-page{width:100%;max-width:980px;font-family:'Nunito',sans-serif}
        .chy-hdr{background:linear-gradient(135deg,#0b1a3d,#162d5e);border-radius:20px 20px 0 0;padding:.9rem 1.5rem;display:flex;align-items:center;gap:14px;border-bottom:3px solid #00e5ff}
        .chy-shield{width:48px;height:48px;background:linear-gradient(135deg,#00e5ff,#0061ff);border-radius:50% 50% 42% 42%;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 22px rgba(0,229,255,.45)}
        .chy-hdr-title{font-family:'Orbitron',sans-serif;font-size:18px;color:#00e5ff;font-weight:900;letter-spacing:1px}
        .chy-hdr-sub{font-size:10.5px;color:rgba(255,255,255,.5);margin-top:3px}
        .chy-main{display:grid;grid-template-columns:1fr 330px;background:#09142a;border-radius:0 0 20px 20px;overflow:hidden;min-height:600px;position:relative}
        .chy-preview{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:1.5rem 1rem 1.4rem;background:radial-gradient(ellipse at 50% 28%,#19296a 0%,#09142a 68%);border-right:1px solid rgba(0,229,255,.12);position:relative;overflow:hidden}
        .chy-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.04) 1px,transparent 1px);background-size:30px 30px;pointer-events:none}
        .chy-stage{position:relative;width:310px;height:440px;display:flex;align-items:flex-end;justify-content:center}
        .chy-hero-img{max-width:100%;max-height:100%;object-fit:contain;object-position:bottom center;transition:opacity .26s,transform .26s;filter:drop-shadow(0 18px 28px rgba(0,229,255,.28))}
        .chy-hero-img.swap{opacity:0;transform:scale(.92) translateY(5px)}
        .chy-glow{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:170px;height:26px;border-radius:50%;background:rgba(0,229,255,.18);filter:blur(14px);pointer-events:none}
        .chy-badge{font-family:'Orbitron',sans-serif;font-size:13px;color:#00e5ff;letter-spacing:2.5px;text-transform:uppercase;margin-top:12px;text-shadow:0 0 14px rgba(0,229,255,.5);text-align:center;min-height:20px}
        .chy-tagline{font-size:11px;color:rgba(255,255,255,.4);text-align:center;margin-top:4px;min-height:16px}
        .chy-dots{display:flex;gap:7px;margin-top:10px;justify-content:center}
        .chy-dot{width:11px;height:11px;border-radius:50%;opacity:.28;cursor:pointer;transition:all .2s;border:none}
        .chy-dot.on{opacity:1;transform:scale(1.4);box-shadow:0 0 7px currentColor}
        .chy-sp{position:absolute;border-radius:50%}
        @keyframes chy-sp{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
        @keyframes chy-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .chy-floating{animation:chy-fl 3.4s ease-in-out infinite}
        .chy-opts{padding:1rem;background:#0d1d3a;display:flex;flex-direction:column;gap:11px;overflow-y:auto;max-height:600px}
        .chy-lbl{font-family:'Orbitron',sans-serif;font-size:8px;color:#00e5ff;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;opacity:.8}
        .chy-gbtns{display:flex;gap:6px}
        .chy-gb{flex:1;padding:9px 6px;border:1.5px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.65);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;text-align:center}
        .chy-gb:hover,.chy-gb.on{border-color:#00e5ff;background:rgba(0,229,255,.13);color:#00e5ff;box-shadow:0 0 12px rgba(0,229,255,.18)}
        .chy-skin-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
        .chy-sk{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1.5px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(255,255,255,.03);cursor:pointer;transition:all .15s;position:relative}
        .chy-sk:hover,.chy-sk.on{border-color:#00e5ff;background:rgba(0,229,255,.11);box-shadow:0 0 10px rgba(0,229,255,.14)}
        .chy-sk-dot{width:26px;height:26px;border-radius:50%;flex-shrink:0;border:2px solid rgba(255,255,255,.2)}
        .chy-sk-name{font-size:10.5px;color:rgba(255,255,255,.7);font-weight:700;line-height:1.3}
        .chy-sk-sub{font-size:8.5px;color:rgba(255,255,255,.35);margin-top:1px}
        .chy-sk.on .chy-sk-name{color:#00e5ff}
        .chy-sk-tick{display:none;position:absolute;top:4px;right:6px;color:#00e5ff;font-size:11px}
        .chy-sk.on .chy-sk-tick{display:block}
        .chy-swatches{display:flex;gap:6px;flex-wrap:wrap}
        .chy-sw-wrap{display:flex;flex-direction:column;align-items:center;cursor:pointer;gap:3px}
        .chy-sw{width:33px;height:33px;border-radius:50%;border:2.5px solid transparent;transition:all .18s;cursor:pointer}
        .chy-sw:hover{transform:scale(1.12)}
        .chy-sw.on{border-color:#fff;box-shadow:0 0 0 2.5px #00e5ff;transform:scale(1.18)}
        .chy-sw-lbl{font-size:8px;color:rgba(255,255,255,.42);font-weight:700}
        .chy-btnrow{display:flex;flex-wrap:wrap;gap:5px}
        .chy-ob{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.13);border-radius:9px;color:rgba(255,255,255,.68);font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;padding:6px 9px;cursor:pointer;transition:all .15s;white-space:nowrap}
        .chy-ob:hover,.chy-ob.on{border-color:#00e5ff;background:rgba(0,229,255,.14);color:#00e5ff;box-shadow:0 0 9px rgba(0,229,255,.2)}
        .chy-div{height:1px;background:rgba(255,255,255,.07)}
        .chy-ni{width:100%;padding:8px 12px;border-radius:9px;border:1.5px solid rgba(0,229,255,.3);background:rgba(0,229,255,.05);color:#fff;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;outline:none;transition:border-color .2s}
        .chy-ni:focus{border-color:#00e5ff}
        .chy-ni::placeholder{color:rgba(255,255,255,.28)}
        .chy-save{width:100%;padding:13px;background:linear-gradient(135deg,#00b4ff,#0050ff);border:none;border-radius:11px;color:#fff;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(0,100,255,.38)}
        .chy-save:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,100,255,.5)}
        .chy-save:active{transform:translateY(0)}
        .chy-save:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .chy-done{position:absolute;inset:0;background:rgba(4,9,24,.95);border-radius:0 0 20px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:30;padding:2rem;text-align:center}
        .chy-done-stars{font-size:28px;margin-bottom:10px;letter-spacing:7px}
        .chy-done-title{font-family:'Orbitron',sans-serif;font-size:19px;color:#00e5ff;font-weight:900;text-shadow:0 0 24px rgba(0,229,255,.6);margin-bottom:12px}
        .chy-done-img{height:215px;object-fit:contain;filter:drop-shadow(0 0 30px rgba(0,229,255,.5));margin-bottom:14px}
        .chy-done-text{font-size:13px;color:rgba(255,255,255,.75);line-height:1.75;margin-bottom:20px;max-width:320px}
        .chy-mission{padding:13px 34px;background:linear-gradient(135deg,#ff7b00,#ff2500);border:none;border-radius:13px;color:#fff;font-family:'Orbitron',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;cursor:pointer;box-shadow:0 4px 24px rgba(255,70,0,.5);transition:all .2s}
        .chy-mission:hover{transform:scale(1.06)}
        .chy-edit{margin-top:14px;font-size:12px;color:rgba(255,255,255,.38);cursor:pointer;text-decoration:underline;background:none;border:none}
        @media(max-width:680px){.chy-main{grid-template-columns:1fr}.chy-opts{max-height:none}}
      `}</style>

      <div className="chy-wrap">
        <div className="chy-page" style={{ margin: "0 auto" }}>

          {/* Header */}
          <div className="chy-hdr">
            <div className="chy-shield">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" opacity=".92"/>
                <path d="M9 12l2 2 4-4" stroke="#0061ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div>
              <div className="chy-hdr-title">CYBER HERO CREATOR</div>
              <div className="chy-hdr-sub">8 heroes &nbsp;·&nbsp; 4 skin tones &nbsp;·&nbsp; 5 suit colors &nbsp;·&nbsp; 4 accessories</div>
            </div>
          </div>

          {/* Main grid */}
          <div className="chy-main">

            {/* Preview panel */}
            <div className="chy-preview">
              <div className="chy-grid-bg" />
              <div className="chy-sp" style={{ width:6,height:6,top:44,left:36,background:"#00e5ff",animation:"chy-sp 2.5s ease-in-out infinite" }} />
              <div className="chy-sp" style={{ width:5,height:5,top:82,right:32,background:"#ff7c00",animation:"chy-sp 2.5s .8s ease-in-out infinite" }} />
              <div className="chy-sp" style={{ width:5,height:5,bottom:155,left:26,background:"#a855f7",animation:"chy-sp 2.5s 1.6s ease-in-out infinite" }} />
              <div className="chy-sp" style={{ width:4,height:4,bottom:80,right:40,background:"#00e5ff",animation:"chy-sp 2.5s 2.3s ease-in-out infinite" }} />

              <div className="chy-stage chy-floating">
                <img
                  className={`chy-hero-img${swapping ? " swap" : ""}`}
                  src={heroSrc}
                  alt="Your cyber hero"
                />
                <div className="chy-glow" />
              </div>

              <div className="chy-badge">{badge}</div>
              <div className="chy-tagline">{tagline}</div>

              <div className="chy-dots">
                {SUITS.map((s, i) => (
                  <button
                    key={s.key}
                    className={`chy-dot${i === suit ? " on" : ""}`}
                    style={{ background: s.hex }}
                    onClick={() => handleSuit(i)}
                    aria-label={s.label}
                  />
                ))}
              </div>
            </div>

            {/* Options panel */}
            <div className="chy-opts">

              {/* Gender */}
              <div>
                <div className="chy-lbl">👤 Hero Type</div>
                <div className="chy-gbtns">
                  {(["girl", "boy"] as const).map(g => (
                    <button
                      key={g}
                      className={`chy-gb${gender === g ? " on" : ""}`}
                      onClick={() => handleGender(g)}
                    >
                      {g === "girl" ? "👧 Girl" : "👦 Boy"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chy-div" />

              {/* Skin tone */}
              <div>
                <div className="chy-lbl">🎨 Skin Tone</div>
                <div className="chy-skin-grid">
                  {SKINS.map(sk => (
                    <div
                      key={sk.key}
                      className={`chy-sk${skin === sk.key ? " on" : ""}`}
                      onClick={() => handleSkin(sk.key)}
                    >
                      <div className="chy-sk-dot" style={{ background: sk.dot }} />
                      <div style={{ flex: 1 }}>
                        <div className="chy-sk-name">{sk.label}</div>
                        <div className="chy-sk-sub">{sk.sub}</div>
                      </div>
                      <div className="chy-sk-tick">✓</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chy-div" />

              {/* Suit color */}
              <div>
                <div className="chy-lbl">🦺 Suit Color</div>
                <div className="chy-swatches">
                  {SUITS.map((s, i) => (
                    <div key={s.key} className="chy-sw-wrap" onClick={() => handleSuit(i)}>
                      <div
                        className={`chy-sw${i === suit ? " on" : ""}`}
                        style={{ background: s.hex }}
                      />
                      <div className="chy-sw-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chy-div" />

              {/* Accessory */}
              <div>
                <div className="chy-lbl">⚡ Tech Accessory</div>
                <div className="chy-btnrow">
                  {ACCESSORIES.map(a => (
                    <button
                      key={a.key}
                      className={`chy-ob${acc === a.key ? " on" : ""}`}
                      onClick={() => handleAcc(a.key)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chy-div" />

              {/* Name */}
              <div>
                <div className="chy-lbl">🏷️ Your Hero Name</div>
                <input
                  className="chy-ni"
                  type="text"
                  placeholder="Enter your hero name…"
                  maxLength={20}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <button
                className="chy-save"
                onClick={handleSaveClick}
                disabled={saving}
              >
                {saving ? "⏳ SAVING..." : "⚡ SAVE MY HERO!"}
              </button>
            </div>

            {/* Done overlay */}
            {showDone && (
              <div className="chy-done">
                <div className="chy-done-stars">⭐ ⭐ ⭐</div>
                <div className="chy-done-title">{heroTitle}</div>
                <img className="chy-done-img" src={doneSrc} alt="Your hero" />
                <div className="chy-done-text">{heroText}</div>
                <button className="chy-mission" onClick={() => alert(`🚀 Launching missions for ${name.trim() || "Cyber Hero"} — ${TITLES[gender][acc]}!`)}>
                  🚀 START MISSIONS!
                </button>
                <button className="chy-edit" onClick={() => setShowDone(false)}>
                  ✏️ Edit my hero
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
