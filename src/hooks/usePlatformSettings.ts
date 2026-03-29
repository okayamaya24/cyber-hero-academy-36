import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSetting {
  key: string;
  value: boolean;
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platform_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data as unknown as PlatformSetting[]).forEach((s) => {
        map[s.key] = s.value;
      });
      return map;
    },
  });
}

export function useUpdatePlatformSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value } as any)
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_settings"] });
    },
  });
}
