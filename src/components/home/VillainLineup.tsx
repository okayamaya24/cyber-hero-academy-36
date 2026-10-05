import { motion } from "framer-motion";
import keybreaker from "@/assets/home/keybreaker.webp";
import phisherKing from "@/assets/home/phisher-king.webp";
import trollLord from "@/assets/home/troll-lord.webp";
import firewallPhantom from "@/assets/home/firewall-phantom.webp";
import dataThief from "@/assets/home/data-thief.webp";
import malwareMax from "@/assets/home/malware-max.webp";
import shadowbyte from "@/assets/home/shadowbyte.webp";

const villains = [
  { name: "The Keybreaker", world: "North America", trick: "Cracks weak passwords", taunt: "No password can stop me!", image: keybreaker, color: "#ff4444" },
  { name: "The Phisher King", world: "Europe", trick: "Sends fake messages & sneaky links", taunt: "Click the link... I dare you! 🎣", image: phisherKing, color: "#4488cc" },
  { name: "The Troll Lord", world: "Africa", trick: "Stirs up mean comments & drama", taunt: "I live in the comments. I AM the comments.", image: trollLord, color: "#66aa33" },
  { name: "The Firewall Phantom", world: "Asia", trick: "Sneaks into unprotected devices", taunt: "You can't fight what you can't see. 👻", image: firewallPhantom, color: "#6644cc" },
  { name: "The Data Thief", world: "South America", trick: "Steals your personal info", taunt: "Your data passed through me before you knew.", image: dataThief, color: "#cc44aa" },
  { name: "Malware Max", world: "Australia", trick: "Hides viruses in downloads", taunt: "Bugs aren't problems. They're my pets. 🐛", image: malwareMax, color: "#ff8800" },
  { name: "???", world: "Antarctica", trick: "The final boss. Beat the others to find out…", taunt: "I've been watching from the dark since you started.", image: shadowbyte, color: "#8888cc", mystery: true },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function VillainLineup() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.04] bg-[#0a0e1a] py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[#ff4444]/[0.06] blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4444]/30 bg-[#ff4444]/10 px-4 py-2 text-sm font-bold text-[#ff6b6b]">
            🚨 Wanted: Cyber Villains
          </div>
          <h2 className="text-3xl font-black text-white md:text-4xl">Meet the Villains You'll Defeat</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Each one has a sneaky internet trick. Learn to stop their trick, and you beat the villain!
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {villains.map((v, i) => (
            <motion.div
              key={v.world}
              variants={fadeUp}
              className="group relative flex w-full flex-col items-center rounded-2xl p-5 text-center sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
              style={{
                background: `linear-gradient(160deg, ${v.color}18, #0d1323 55%)`,
                border: `1px solid ${v.color}30`,
              }}
              whileHover={{ y: -6, boxShadow: `0 0 32px ${v.color}30` }}
            >
              {/* Taunt bubble */}
              <div
                className="relative mb-3 flex min-h-[4rem] w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold italic text-white/90"
                style={{ background: `${v.color}22`, border: `1px solid ${v.color}40` }}
              >
                "{v.taunt}"
                <span
                  className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
                  style={{ background: "#121827", borderRight: `1px solid ${v.color}40`, borderBottom: `1px solid ${v.color}40` }}
                />
              </div>

              <motion.img
                src={v.image}
                alt={v.mystery ? "A mysterious shadowy villain" : v.name}
                loading="lazy"
                className={`mb-3 h-40 w-40 object-contain ${
                  v.mystery
                    ? "brightness-0 drop-shadow-[0_0_18px_#8888cc] transition duration-500 group-hover:brightness-[0.35]"
                    : "drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                }`}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: "easeInOut" }}
              />

              <h3 className="text-lg font-black text-white">{v.name}</h3>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: v.color }}>
                🌍 {v.world}
              </p>
              <p className="mt-2 text-sm text-gray-400">{v.trick}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
