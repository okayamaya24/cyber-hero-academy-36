export default function TierButtons({
  tier,
  changeTier,
  resetGame
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "24px",
        flexWrap: "wrap"
      }}
    >
      <button
        onClick={() => changeTier("junior")}
        style={tierButtonStyle(tier === "junior")}
      >
        🌟 Junior
      </button>

      <button
        onClick={() => changeTier("hero")}
        style={tierButtonStyle(tier === "hero")}
      >
        🛡️ Hero
      </button>

      <button
        onClick={() => changeTier("elite")}
        style={tierButtonStyle(tier === "elite")}
      >
        ⚡ Elite
      </button>

      <button
        onClick={resetGame}
        style={{
          backgroundColor: "#08b6aa",
          color: "#000",
          border: "none",
          padding: "10px 18px",
          borderRadius: "12px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        🔄 New Puzzle
      </button>
    </div>
  );
}

function tierButtonStyle(active) {
  return {
    backgroundColor: active ? "#08b6aa" : "#111827",
    color: active ? "#000" : "#fff",
    border: "1px solid #08b6aa",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  };
}