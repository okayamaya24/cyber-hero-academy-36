/**
 * Event Missions System
 * 
 * Seasonal and rotating event missions that reuse existing mini-games
 * with themed content. Events are config-driven — add new events by
 * appending to EVENT_MISSIONS without changing core code.
 */

import type { MiniGameType, AgeTier } from "./missions";

export interface EventMission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Guide ID from the guide registry */
  guideId: string;
  /** When this event is active (inclusive) — null means always available */
  startDate: string | null;
  endDate: string | null;
  /** Mini-game types used in this event */
  games: MiniGameType[];
  /** Badge awarded on completion */
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  /** Tags for filtering/categorization */
  tags: string[];
  /** Whether this event is currently enabled */
  enabled: boolean;
}

export const EVENT_MISSIONS: EventMission[] = [
  {
    id: "cyber-safety-month",
    title: "Cyber Safety Month Challenge",
    description: "October is Cyber Safety Month! Complete special challenges to earn an exclusive badge.",
    emoji: "🛡️",
    guideId: "captain-cyber",
    startDate: null, // Always available for now
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

// ─── HELPERS ─────────────────────────────────────────────────

export function getActiveEvents(date: Date = new Date()): EventMission[] {
  const dateStr = date.toISOString().split("T")[0];
  return EVENT_MISSIONS.filter((e) => {
    if (!e.enabled) return false;
    if (e.startDate && dateStr < e.startDate) return false;
    if (e.endDate && dateStr > e.endDate) return false;
    return true;
  });
}

export function getEventById(id: string): EventMission | undefined {
  return EVENT_MISSIONS.find((e) => e.id === id);
}

export function getEventsByTag(tag: string): EventMission[] {
  return EVENT_MISSIONS.filter((e) => e.enabled && e.tags.includes(tag));
}
