/** localStorage persistence for quests + player. Never throws on corrupt data. */

const KEY = 'wynncraft-questmaster:v1';

const EMPTY = { quests: [], xp: 0, turnIns: 0, sound: true };

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.quests)) return { ...EMPTY };
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — app keeps working in memory */
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
