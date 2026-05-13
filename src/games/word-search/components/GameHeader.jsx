export default function GameHeader({
  secondsElapsed,
  formatTime
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "20px"
      }}
    >
      <div>
        <button
          onClick={() => { window.location.href = "/missions"; }}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "1px solid rgba(8,182,170,0.35)",
            color: "#08b6aa", borderRadius: "10px", padding: "5px 12px",
            fontSize: "12px", fontWeight: "bold", cursor: "pointer", marginBottom: "8px",
          }}
        >
          ← Back to Games
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: "46px"
          }}
        >
          Cyber Word Search
        </h1>

        <p
          style={{
            color: "#08b6aa",
            fontWeight: "bold"
          }}
        >
          Find hidden cyber words before Byte’s scanner overheats.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#0b1120",
          border: "1px solid #08b6aa",
          padding: "14px 18px",
          borderRadius: "14px",
          fontWeight: "bold",
          color: "#08b6aa",
          fontSize: "18px",
          minWidth: "120px",
          textAlign: "center"
        }}
      >
        ⏱️ {formatTime(secondsElapsed)}
      </div>
    </div>
  );
}