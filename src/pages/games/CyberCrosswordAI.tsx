import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CrosswordGame from "@/games/crossword/CrosswordGame.jsx";

export default function CyberCrosswordAI() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#040218]">
      <button
        onClick={() => navigate("/missions")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <CrosswordGame />
    </div>
  );
}
