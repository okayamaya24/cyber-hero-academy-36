const FOUND_WORD_COLORS = [
  "#08b6aa",
  "#22c55e",
  "#facc15",
  "#a855f7",
  "#fb7185",
  "#38bdf8",
  "#f97316",
  "#14b8a6"
];

export default function WordGrid({
  grid,
  size,
  selectedCells,
  foundCells,
  startDrag,
  enterCell,
  endDrag
}) {
  function isSelected(row, col) {
    return selectedCells.some(
      (cell) => cell.row === row && cell.col === col
    );
  }

  function getFoundColor(row, col) {
    const foundCell = foundCells.find(
      (cell) => cell.row === row && cell.col === col
    );

    if (!foundCell) return null;

    return FOUND_WORD_COLORS[
      foundCell.wordIndex % FOUND_WORD_COLORS.length
    ];
  }

  function getFoundWordLines() {
    const groups = {};

    foundCells.forEach((cell) => {
      if (cell.wordIndex === undefined) return;

      if (!groups[cell.wordIndex]) {
        groups[cell.wordIndex] = [];
      }

      groups[cell.wordIndex].push(cell);
    });

    return Object.entries(groups).map(([wordIndex, cells]) => {
      const first = cells[0];
      const last = cells[cells.length - 1];

      return {
        wordIndex: Number(wordIndex),
        start: first,
        end: last,
        color:
          FOUND_WORD_COLORS[
            Number(wordIndex) % FOUND_WORD_COLORS.length
          ]
      };
    });
  }

  function getCellSize() {
    if (size <= 8) {
      return `min(52px, calc((100vh - 440px) / ${size}))`;
    }

    if (size <= 10) {
      return `min(44px, calc((100vh - 460px) / ${size}))`;
    }

    if (size <= 12) {
      return `min(38px, calc((100vh - 470px) / ${size}))`;
    }

    return `min(30px, calc((100vh - 480px) / ${size}))`;
  }

  function getGap() {
    if (size <= 8) return "5px";
    if (size <= 10) return "4px";
    if (size <= 12) return "3px";
    return "2px";
  }

  function getPadding() {
    if (size <= 8) return "12px";
    if (size <= 10) return "10px";
    if (size <= 12) return "8px";
    return "6px";
  }

  function getFontSize() {
    if (size <= 8) return "clamp(18px, 2vw, 26px)";
    if (size <= 10) return "clamp(16px, 1.6vw, 22px)";
    if (size <= 12) return "clamp(14px, 1.3vw, 18px)";
    return "clamp(11px, 1vw, 15px)";
  }

  function getSvgPoint(cell) {
    return {
      x: ((cell.col + 0.5) / size) * 100,
      y: ((cell.row + 0.5) / size) * 100
    };
  }

  const foundLines = getFoundWordLines();

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        width: "fit-content",
        maxWidth: "100%",
        maxHeight: "100%",
        margin: "0 auto",
        gridTemplateColumns: `repeat(${size}, ${getCellSize()})`,
        gap: getGap(),
        backgroundColor: "#0b1120",
        border: "1px solid #08b6aa",
        borderRadius: "20px",
        padding: getPadding(),
        boxShadow: "0 0 30px rgba(8,182,170,0.25)",
        overflow: "hidden"
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: getPadding(),
          width: `calc(100% - (${getPadding()} * 2))`,
          height: `calc(100% - (${getPadding()} * 2))`,
          pointerEvents: "none",
          zIndex: 3
        }}
      >
        {foundLines.map((line) => {
          const start = getSvgPoint(line.start);
          const end = getSvgPoint(line.end);

          return (
            <line
              key={line.wordIndex}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={line.color}
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity="0.65"
              style={{
                filter: `drop-shadow(0 0 6px ${line.color})`
              }}
            />
          );
        })}
      </svg>

      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const selected = isSelected(rowIndex, colIndex);
          const foundColor = getFoundColor(rowIndex, colIndex);
          const found = !!foundColor;

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              onMouseDown={() => startDrag(rowIndex, colIndex)}
              onMouseEnter={() => enterCell(rowIndex, colIndex)}
              onTouchStart={() => startDrag(rowIndex, colIndex)}
              onTouchEnd={endDrag}
              style={{
                position: "relative",
                zIndex: 4,
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: size >= 12 ? "7px" : "10px",
                border: selected
                  ? "2px solid #facc15"
                  : found
                  ? `2px solid ${foundColor}`
                  : "1px solid #334155",
                backgroundColor: selected
                  ? "#facc15"
                  : found
                  ? `${foundColor}dd`
                  : "#111827",
                color: selected || found ? "#000" : "#fff",
                fontWeight: "bold",
                fontSize: getFontSize(),
                cursor: "pointer",
                touchAction: "none",
                transition: "all 0.2s ease",
                boxShadow: found
                  ? `0 0 12px ${foundColor}66`
                  : "none"
              }}
            >
              {letter}
            </button>
          );
        })
      )}
    </div>
  );
}