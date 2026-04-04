import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingGameSetting {
  id: string;
  unlocked: boolean;
  tier_junior: boolean;
  tier_hero: boolean;
  tier_elite: boolean;
  updated_at: string;
}

export function useTrainingGameSettings() {
  return useQuery({
    queryKey: ["training_game_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_game_settings")
        .select("*");
      if (error) throw error;
      return (data ?? []) as TrainingGameSetting[];
    },
  });
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
