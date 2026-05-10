export default function MissionBriefing({ tier }) {
  const briefings = {
    junior: {
      title: "🌟 Junior Hero Mission",
      text: "Byte needs your help learning the basics of online safety. Look for simple words about being safe, kind, and careful online.",
      reward: "+100 XP max"
    },
    hero: {
      title: "🛡️ Cyber Hero Mission",
      text: "Use your cybersecurity knowledge to solve clues about passwords, scams, phishing, malware, and digital protection.",
      reward: "+150 XP max"
    },
    elite: {
      title: "⚡ Elite Cyber Mission",
      text: "Advanced training unlocked. Solve challenging clues about encryption, ransomware, biometrics, VPNs, and real cyber defense concepts.",
      reward: "+300 XP max"
    }
  };

  const briefing = briefings[tier];

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        border: "1px solid #08b6aa",
        borderRadius: "16px",
        padding: "18px",
        marginBottom: "24px"
      }}
    >
      <h2 style={{ color: "#08b6aa", marginTop: 0 }}>
        {briefing.title}
      </h2>

      <p>{briefing.text}</p>

      <strong style={{ color: "#facc15" }}>
        Reward: {briefing.reward}
      </strong>
    </div>
  );
}