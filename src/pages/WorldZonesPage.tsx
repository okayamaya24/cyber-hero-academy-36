import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORLDS } from "@/data/adventureZones";
import ByteSidekick from "@/components/adventure/ByteSidekick";

export default function WorldZonesPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();

  const world = WORLDS.find((w) => w.id === worldId);

  if (!world) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">World not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className={`bg-gradient-to-br ${world.color} py-6`}>
        <div className="container mx-auto flex items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/adventure")}
            className="text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {world.emoji} {world.name}
            </h1>
            <p className="text-sm text-primary-foreground/80">
              Defeat {world.villain}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 max-w-2xl space-y-4 px-4">
        {world.zones.map((zone, i) => (
          <motion.button
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/adventure/${worldId}/${zone.id}`)}
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-primary/15 bg-card p-5 text-left shadow-card transition-shadow hover:shadow-playful"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
              {zone.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold">{zone.name}</h3>
              <p className="text-sm text-muted-foreground">{zone.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      <ByteSidekick visible size={80} />
    </div>
  );
}
