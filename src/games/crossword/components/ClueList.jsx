import { useEffect, useRef } from "react";

export default function ClueList({ words, activeWord, setActiveWord }) {
  const clueRefs = useRef({});

  const across = words.filter((word) => word.direction === "across");
  const down = words.filter((word) => word.direction === "down");

  useEffect(() => {
    if (!activeWord) return;

    const key = `${activeWord.id}-${activeWord.direction}`;
    const clueElement = clueRefs.current[key];

    if (clueElement) {
      clueElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeWord]);

  function clueStyle(word) {
    const isActive =
      activeWord &&
      activeWord.id === word.id &&
      activeWord.direction === word.direction;

    return {
      padding: "8px",
      borderRadius: "10px",
      cursor: "pointer",
      marginBottom: "6px",
      transition: "0.2s ease",
      backgroundColor: isActive ? "#08b6aa" : "transparent",
      color: isActive ? "#000" : "#fff",
      border: isActive ? "none" : "1px solid transparent",
      lineHeight: 1.35,
      fontSize: "14px"
    };
  }

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        border: "1px solid #08b6aa",
        borderRadius: "16px",
        padding: "16px",
        height: "fit-content",
        color: "white"
      }}
    >
      <h2
        style={{
          color: "#08b6aa",
          marginTop: 0,
          marginBottom: "12px",
          textAlign: "center",
          fontSize: "24px"
        }}
      >
        🧩 Mission Clues
      </h2>

      <div style={{ marginBottom: "12px" }}>
        <h3
          style={{
            color: "#facc15",
            margin: "8px 0",
            textAlign: "center"
          }}
        >
          Across
        </h3>

        {across.map((word) => (
          <div
            key={`${word.id}-across`}
            ref={(el) => {
              clueRefs.current[`${word.id}-${word.direction}`] = el;
            }}
            style={clueStyle(word)}
            onClick={() => setActiveWord(word)}
          >
            <strong>{word.id}.</strong> {word.clue}
          </div>
        ))}
      </div>

      {down.length > 0 && (
        <div>
          <h3
            style={{
              color: "#facc15",
              margin: "8px 0",
              textAlign: "center"
            }}
          >
            Down
          </h3>

          {down.map((word) => (
            <div
              key={`${word.id}-down`}
              ref={(el) => {
                clueRefs.current[`${word.id}-${word.direction}`] = el;
              }}
              style={clueStyle(word)}
              onClick={() => setActiveWord(word)}
            >
              <strong>{word.id}.</strong> {word.clue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}