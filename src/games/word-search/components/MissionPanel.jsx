export default function MissionPanel({
  words,
  foundWords,
  streak,
  bestStreak,
  message
}) {
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: "#020617",
        border: "1px solid #08b6aa",
        borderRadius: "28px",
        padding: "22px",
        boxShadow: "0 0 35px rgba(8,182,170,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "18px",
          color: "#08b6aa",
          fontSize: "clamp(26px, 2vw, 38px)",
          fontWeight: "900"
        }}
      >
        Mission Words
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flexShrink: 0
        }}
      >
        {words.map((word) => {
          const found = foundWords.includes(word);

          return (
            <div
              key={word}
              style={{
                padding: "12px 14px",
                borderRadius: "16px",
                background: found
                  ? "linear-gradient(135deg, #14d8cc 0%, #11b9b0 100%)"
                  : "#081225",
                color: found ? "#000" : "#fff",
                fontWeight: "900",
                fontSize: "clamp(15px, 1vw, 20px)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "48px",
                textDecoration: found ? "line-through" : "none",
                boxShadow: found
                  ? "0 0 18px rgba(20,216,204,0.28)"
                  : "none",
                transition: "all 0.25s ease"
              }}
            >
              <span style={{ fontSize: "22px" }}>
                {found ? "✅" : "🔎"}
              </span>

              <span>{word}</span>
            </div>
          );
        })}
      </div>

      {message && (
        <div
          key={message}
          style={{
            marginTop: "18px",
            backgroundColor: "#081225",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "18px",
            padding: "16px",
            fontSize: "clamp(18px, 1.4vw, 30px)",
            fontWeight: "900",
            color: "#ffd21f",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255,210,31,0.15)",
            animation: "popFeedback 0.35s ease"
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "18px",
          color: "#ffd21f",
          fontWeight: "900",
          fontSize: "clamp(18px, 1.2vw, 26px)"
        }}
      >
        Found: {foundWords.length}/{words.length}
      </div>

      <div
        style={{
          marginTop: "14px",
          backgroundColor: "#081225",
          borderRadius: "18px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div
          style={{
            color: "#08d4ca",
            fontWeight: "900",
            fontSize: "clamp(16px, 1vw, 22px)"
          }}
        >
        </div>

      </div>

      <style>
        {`
          @keyframes popFeedback {
            0% {
              transform: scale(0.9);
              opacity: 0;
            }
            60% {
              transform: scale(1.04);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}