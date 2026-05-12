export default function CompletionModal({
  missionComplete,
  getStars,
  getXP,
  formatTime,
  secondsElapsed,
  bestStreak,
  resetGame
}) {
  if (!missionComplete) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px"
      }}
    >
      <div
        style={{
          backgroundColor: "#04142d",
          border: "2px solid #08b6aa",
          borderRadius: "24px",
          padding: "36px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: "0 0 40px rgba(8,182,170,0.45)"
        }}
      >
        <h1
          style={{
            color: "#08b6aa",
            fontSize: "38px",
            marginBottom: "12px"
          }}
        >
          🎉 Mission Complete!
        </h1>

        <div
          style={{
            fontSize: "42px",
            marginBottom: "18px"
          }}
        >
          {getStars()}
        </div>

        <div
          style={{
            color: "#fff",
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "14px"
          }}
        >
          +{getXP()} XP
        </div>

        <div
          style={{
            color: "#cbd5e1",
            marginBottom: "10px",
            fontSize: "18px"
          }}
        >
          ⏱️ Time: {formatTime(secondsElapsed)}
        </div>

        <div
          style={{
            color: "#facc15",
            fontWeight: "bold",
            marginBottom: "10px",
            fontSize: "18px"
          }}
        >
          🔥 Best Streak: {bestStreak}
        </div>

        <div
          style={{
            color: "#08b6aa",
            fontWeight: "bold",
            marginBottom: "24px",
            fontSize: "18px"
          }}
        >
          ⚡ Cyber Mission Successful
        </div>

        <button
          onClick={resetGame}
          style={{
            backgroundColor: "#08b6aa",
            color: "#000",
            border: "none",
            padding: "14px 26px",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}