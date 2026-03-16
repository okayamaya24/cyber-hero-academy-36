/**
 * Level Titles & XP Thresholds
 * 
 * Players earn named ranks as they level up.
 * Levels are calculated as: Math.floor(points / 200) + 1
 */

export interface LevelRank {
  minLevel: number;
  title: string;
  emoji: string;
  description: string;
}

export const LEVEL_RANKS: LevelRank[] = [
  { minLevel: 1,  title: "Cyber Recruit",    emoji: "🌱", description: "Just starting your cyber journey" },
  { minLevel: 3,  title: "Cyber Trainee",     emoji: "📖", description: "Learning the basics of cyber safety" },
  { minLevel: 5,  title: "Cyber Cadet",       emoji: "🎖️", description: "Building strong foundations" },
  { minLevel: 8,  title: "Cyber Scout",       emoji: "🔭", description: "Exploring the digital world safely" },
  { minLevel: 10, title: "Cyber Agent",       emoji: "🕶️", description: "Skilled in spotting threats" },
  { minLevel: 13, title: "Cyber Specialist",  emoji: "⚡", description: "Expert in multiple security areas" },
  { minLevel: 15, title: "Cyber Guardian",    emoji: "🛡️", description: "Protecting the digital realm" },
  { minLevel: 18, title: "Cyber Commander",   emoji: "🎯", description: "Leading the charge against threats" },
  { minLevel: 20, title: "Cyber Hero",        emoji: "🦸", description: "A true champion of cyber safety" },
  { minLevel: 25, title: "Cyber Legend",      emoji: "👑", description: "An unstoppable force of digital safety" },
];

export function getLevelRank(level: number): LevelRank {
  // Find highest matching rank
  let rank = LEVEL_RANKS[0];
  for (const r of LEVEL_RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return rank;
}

export function getNextRank(level: number): LevelRank | null {
  for (const r of LEVEL_RANKS) {
    if (r.minLevel > level) return r;
  }
  return null; // Already at max rank
}

export function getLevelFromPoints(points: number): number {
  return Math.floor(points / 200) + 1;
}

export function getPointsForLevel(level: number): number {
  return (level - 1) * 200;
}

export function getProgressToNextLevel(points: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromPoints(points);
  const currentLevelPoints = getPointsForLevel(level);
  const nextLevelPoints = getPointsForLevel(level + 1);
  const current = points - currentLevelPoints;
  const needed = nextLevelPoints - currentLevelPoints;
  return { current, needed, percent: Math.min((current / needed) * 100, 100) };
}
