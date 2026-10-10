/** Player progression: XP → level curve in the Wynncraft spirit (1..99). */

export const MAX_LEVEL = 99;

/** XP required to move FROM level `lvl` to `lvl + 1`. */
export function xpToNext(lvl) {
  if (lvl >= MAX_LEVEL) return 0;
  return Math.round(120 + lvl * 55 + Math.pow(lvl, 1.6));
}

/** Total XP required to *reach* a level (level 1 = 0). */
export function totalXpFor(level) {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpToNext(l);
  return sum;
}

/**
 * Resolve a total XP amount into { level, intoLevel, need, pct }.
 */
export function levelFromXp(xp) {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (level < MAX_LEVEL) {
    const need = xpToNext(level);
    if (remaining < need) break;
    remaining -= need;
    level++;
  }
  const need = xpToNext(level);
  return {
    level,
    intoLevel: remaining,
    need,
    pct: need === 0 ? 100 : Math.min(100, Math.round((remaining / need) * 100)),
  };
}

/** Titles earned at milestones. */
export function rankTitle(level) {
  if (level >= 75) return 'Legend of Wynn';
  if (level >= 50) return 'Hero of the Realm';
  if (level >= 30) return 'Seasoned Adventurer';
  if (level >= 15) return 'Guild Adventurer';
  if (level >= 5) return 'Wayfarer';
  return 'New Recruit';
}
