import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRAINING_GAME_CATALOG } from "@/data/trainingGameCatalog";

export interface TrainingGameSetting {
  id: string;
  unlocked: boolean;
  tier_junior: boolean;
  tier_hero: boolean;
  tier_elite: boolean;
  updated_at: string;
}

export function useTrainingGameSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["training_game_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_game_settings")
        .select("*");
      if (error) throw error;

      const rows = (data ?? []) as TrainingGameSetting[];

      // Seed missing games if the table doesn't have all catalog entries
      const existingIds = new Set(rows.map((r) => r.id));
      const missing = TRAINING_GAME_CATALOG.filter((g) => !existingIds.has(g.id));

      if (missing.length > 0) {
        const payload = missing.map((g) => ({
          id: g.id,
          unlocked: false,
          tier_junior: true,
          tier_hero: true,
          tier_elite: true,
          updated_at: new Date().toISOString(),
        }));
        const { data: inserted, error: insertErr } = await supabase
          .from("training_game_settings")
          .upsert(payload as any[], { onConflict: "id" })
          .select();
        if (!insertErr && inserted) {
          return [...rows, ...(inserted as TrainingGameSetting[])];
        }
      }

      return rows;
    },
  });

  // Realtime subscription — invalidate cache on any change
  useEffect(() => {
    const channel = supabase
      .channel("training_game_settings_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "training_game_settings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["training_game_settings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useTrainingGameSettingsMutations() {
  const queryClient = useQueryClient();

  const upsertSetting = useMutation({
    mutationFn: async (setting: Partial<TrainingGameSetting> & { id: string }) => {
      const { error } = await supabase
        .from("training_game_settings")
        .upsert({ ...setting, updated_at: new Date().toISOString() } as any, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training_game_settings"] });
    },
  });

  const bulkUpsert = useMutation({
    mutationFn: async (settings: Array<Partial<TrainingGameSetting> & { id: string }>) => {
      const payload = settings.map((s) => ({ ...s, updated_at: new Date().toISOString() }));
      const { error } = await supabase
        .from("training_game_settings")
        .upsert(payload as any[], { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training_game_settings"] });
    },
  });

  return { upsertSetting, bulkUpsert };
}
