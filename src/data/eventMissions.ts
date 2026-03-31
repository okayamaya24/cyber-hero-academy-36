import type { MiniGameType } from "./missions";
import { supabase } from "@/integrations/supabase/client";

export interface EventMission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  guideId: string;
  startDate: string | null;
  endDate: string | null;
  games: MiniGameType[];
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  tags: string[];
  enabled: boolean;
}

// Static fallback data in case DB is unavailable
const FALLBACK_EVENTS: EventMission[] = [
  {
    id: "cyber-safety-month",
    title: "Cyber Safety Month Challenge",
    description: "October is Cyber Safety Month! Complete special challenges to earn an exclusive badge.",
    emoji: "🛡️",
    guideId: "captain-cyber",
    startDate: null,
    endDate: null,
    games: ["email-detective", "sort-game", "word-search", "boss-battle"],
    badgeId: "cyber-safety-month",
    badgeName: "Safety Champion",
    badgeIcon: "🏅",
    tags: ["seasonal", "cyber-safety"],
    enabled: true,
  },
  {
    id: "back-to-school",
    title: "Back-to-School Safety",
    description: "New school year, new online safety skills! Learn to protect yourself at school and online.",
    emoji: "🎒",
    guideId: "professor-hoot",
    startDate: null,
    endDate: null,
    games: ["secret-keeper", "quiz", "memory", "sort-game"],
    badgeId: "back-to-school-hero",
    badgeName: "School Safety Star",
    badgeIcon: "⭐",
    tags: ["seasonal", "school"],
    enabled: true,
  },
  {
    id: "holiday-hacker-hunt",
    title: "Holiday Hacker Hunt",
    description: "Hackers love the holidays! Learn to spot holiday-themed scams and stay safe while shopping.",
    emoji: "🎄",
    guideId: "detective-whiskers",
    startDate: null,
    endDate: null,
    games: ["email-detective", "word-search", "sort-game", "boss-battle"],
    badgeId: "holiday-hero",
    badgeName: "Holiday Hero",
    badgeIcon: "🎁",
    tags: ["seasonal", "holidays"],
    enabled: true,
  },
  {
    id: "summer-safety-camp",
    title: "Summer Internet Safety Camp",
    description: "Summer adventures await — both online and offline! Learn to stay safe during summer break.",
    emoji: "☀️",
    guideId: "robo-buddy",
    startDate: null,
    endDate: null,
    games: ["password-builder", "memory", "secret-keeper", "boss-battle"],
    badgeId: "summer-camper",
    badgeName: "Summer Camper",
    badgeIcon: "⛺",
    tags: ["seasonal", "summer"],
    enabled: true,
  },
  {
    id: "password-week",
    title: "World Password Day Challenge",
    description: "Celebrate World Password Day by mastering the art of unbreakable passwords!",
    emoji: "🔐",
    guideId: "robo-buddy",
    startDate: null,
    endDate: null,
    games: ["password-builder", "memory", "word-search", "boss-battle"],
    badgeId: "password-week-champ",
    badgeName: "Password Week Champion",
    badgeIcon: "🔑",
    tags: ["event", "passwords"],
    enabled: true,
  },
];

// Cache to avoid repeated DB calls
let cachedEvents: EventMission[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

// Map DB status to enabled + date fields
function mapDbEventToEventMission(dbEvent: any): EventMission {
  return {
    id: dbEvent.id,
    title: dbEvent.name,
    description: dbEvent.description ?? "",
    emoji: dbEvent.display_day ? "📅" : "🎉",
    guideId: "captain-cyber",
    startDate: dbEvent.start_date ?? null,
    endDate: dbEvent.end_date ?? null,
    games: ["email-detective", "sort-game", "word-search", "boss-battle"],
    badgeId: dbEvent.badge_id ?? dbEvent.id,
    badgeName: dbEvent.name,
    badgeIcon: "🏅",
    tags: ["event"],
    enabled: dbEvent.status === "live",
  };
}

export async function fetchActiveEventsFromDB(): Promise<EventMission[]> {
  const now = Date.now();
  if (cachedEvents && now - cacheTime < CACHE_TTL) {
    return cachedEvents;
  }

  try {
    const { data, error } = await supabase.from("events").select("*").eq("status", "live");

    if (error || !data || data.length === 0) {
      return FALLBACK_EVENTS.filter((e) => e.enabled);
    }

    cachedEvents = data.map(mapDbEventToEventMission);
    cacheTime = now;
    return cachedEvents;
  } catch {
    return FALLBACK_EVENTS.filter((e) => e.enabled);
  }
}

// Sync version for components that can't use async
// Uses fallback data — components should use fetchActiveEventsFromDB() instead
export function getActiveEvents(date: Date = new Date()): EventMission[] {
  const dateStr = date.toISOString().split("T")[0];
  return FALLBACK_EVENTS.filter((e) => {
    if (!e.enabled) return false;
    if (e.startDate && dateStr < e.startDate) return false;
    if (e.endDate && dateStr > e.endDate) return false;
    return true;
  });
}

export function getEventById(id: string): EventMission | undefined {
  return FALLBACK_EVENTS.find((e) => e.id === id);
}

export function getEventsByTag(tag: string): EventMission[] {
  return FALLBACK_EVENTS.filter((e) => e.enabled && e.tags.includes(tag));
}
