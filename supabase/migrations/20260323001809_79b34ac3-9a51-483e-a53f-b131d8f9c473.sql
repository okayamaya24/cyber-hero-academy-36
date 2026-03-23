-- Add unique constraints for upsert operations
ALTER TABLE public.mission_progress ADD CONSTRAINT mission_progress_child_mission_unique UNIQUE (child_id, mission_id);
ALTER TABLE public.zone_progress ADD CONSTRAINT zone_progress_child_zone_unique UNIQUE (child_id, zone_id);
ALTER TABLE public.continent_progress ADD CONSTRAINT continent_progress_child_continent_unique UNIQUE (child_id, continent_id);