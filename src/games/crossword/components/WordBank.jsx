export default function WordBank({ words, tier }) {
  const realWords = words.map((word) => word.answer);

  const decoyWords = [
    "TRACKER",
    "GLITCH",
    "ROBOT",
    "BREACH",
    "VIRUS",
    "SPYWARE",
    "ENCRYPT"
  ];

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  let displayWords = [...realWords];

  if (tier === "hero") {
    displayWords = shuffle(realWords);
  }

  if (tier === "elite") {
    displayWords = shuffle([...realWords, ...decoyWords.slice(0, 3)]);
  }

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        border: "1px solid #08b6aa",
        borderRadius: "16px",
        padding: "16px",
        color: "white"
      }}
    >
      <h2
        style={{
          color: "#08b6aa",
          textAlign: "center",
          marginTop: 0,
          marginBottom: "14px"
        }}
      >
        Cyber Vocabulary
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          maxHeight: "110px",
          overflowY: "auto",
          paddingRight: "4px"
        }}
      >
        {displayWords.map((word, index) => {
          const isRealWord = realWords.includes(word);

          return (
            <div
              key={`${word}-${index}`}
              style={{
                backgroundColor: "#111827",
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid #08b6aa",
                fontWeight: "bold",
                fontSize: "13px",
                opacity: isRealWord ? 1 : 0.55
              }}
            >
              🔹 {word}
            </div>
          );
        })}
      </div>
    </div>
  );
}