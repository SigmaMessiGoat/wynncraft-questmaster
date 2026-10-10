/**
 * Questmaster generator — the "AI" that transmutes a raw task into a
 * Wynncraft-style quest. Pure, deterministic-per-input functions so they can be
 * unit tested, with enough seeded variety that different tasks feel distinct.
 */

export const QUEST_TYPES = ['Main Quest', 'Skill Quest', 'Daily Bounty', 'Side Quest'];

const TITLES = {
  study: [
    'Deriving Success', 'The Codex of Comprehension', 'Pages of the Ascendant',
    "The Scholar's Burden", 'Runes of Recall', 'The Diligent Scribe',
    'Thesis of the Amber Tower', 'Chapters Unturned',
  ],
  sport: [
    'Pitch Mastery', 'Temple of Tendons', 'The Iron Drill',
    'Sprints of the Swift', 'Glory on the Grass', 'The Athlete\'s Trial',
    'Legends of the Late Run', 'Forged in the Final Third',
  ],
  fitness: [
    'The Iron Pilgrimage', 'Ascension of the Lifter', 'Sweat of the Valiant',
    'The Barbarian\'s Warm-Up', 'Reps of Renown', 'Trial by Iron',
  ],
  chores: [
    'The Great Purification', 'Sweeping of the Sanctum', 'Dustbane',
    'The Hoarder\'s Reckoning', 'Shrine of the Spotless', 'Curse of the Cluttered',
    'Reclaiming the Realm', 'The Tidy Throne',
  ],
  creative: [
    'Brush of the Bold', 'The Inspired Frenzy', 'Canvas of Dreams',
    'Ink of the Eternal', 'The Muse\'s Bargain', 'Chords of Creation',
  ],
  work: [
    'Deadline of Doom', 'The Productivity Protocol', 'Mandate of the Manager',
    'Inbox of the Infinite', 'The Focused Offensive', 'Milestones of Might',
  ],
  errand: [
    'The Long Road', 'Burdens of the Everyday', 'March to the Market',
    'The Patient Errand', 'Trials of the Mundane',
  ],
  generic: [
    'Path of Progress', 'The Unfinished Oath', 'A Task Most Foul',
    'The Reluctant Hero\'s Duty', 'Obligation of the Realm', 'The Wayward Chore',
  ],
};

const FLAVOR = {
  study: [
    "Ah, {name}! The Archivists of Wynn have need of a sharp mind. {brief} Study well, adventurer — knowledge is the only weapon that never dulls. Return to me when your understanding is complete.",
    "Scholar, the library gates grow heavy with your absence. {brief} Take up your quill and conquer {name}; the secrets within will serve you long after the ink dries.",
    "Few have the discipline for {name}, but I see fire in your eyes. {brief} Clear each stage, and I shall see your name etched into the Hall of Scholars.",
  ],
  sport: [
    "Coach Brennus of Wynn has been watching you, recruit. {brief} Your body is the vessel, {name} is the trial. Train true, and the pitch shall fear your name.",
    "The arena roars for another champion! {brief} Warm up well — even legends pull a hamstring without preparation. Complete {name} and claim your glory.",
    "Speed, grit, and a little bit of madness — that's what {name} demands. {brief} Give me everything across every stage, and the crowd will sing of you.",
  ],
  fitness: [
    "The Blacksmith of Iron requests your presence at the forge, warrior. {brief} {name} shall bend metal and will alike. Mind your form, lest the weights bend you.",
    "Every rep is a hammer blow against weakness. {brief} Take on {name} and emerge tempered — the Guild rewards only those who finish what they start.",
  ],
  chores: [
    "By the Crown, this realm has fallen into chaos! {brief} Only one hero can restore order to {name}. Fetch your broom, adventurer — destiny awaits (and so does the dust).",
    "The Quartermaster refuses to work in these conditions. {brief} Cleansing {name} is unglamorous work, but a tidy home is the first upgrade any hero should buy.",
    "They say a cluttered room means a cluttered soul... {brief} Prove the bards wrong. Conquer {name} stage by stage.",
  ],
  creative: [
    "The Muse whispers your name in the Guild halls. {brief} {name} is no mere task — it is a work of art waiting to be unleashed. Dare to make something magnificent.",
    "Artists of Wynn hone their craft daily, and so must you. {brief} Give {name} your full vision; perfection is optional, finishing is not.",
  ],
  work: [
    "The Guild Master has reviewed your ledger, and the numbers are... lacking. {brief} Complete {name} and the treasury (and your reputation) shall recover.",
    "Another deadline approaches like a charging boar. {brief} Steel yourself: {name} will not slay itself. One stage at a time, hero.",
  ],
  errand: [
    "Not every hero fights monsters, adventurer — some simply must get things done. {brief} Handle {name} with honor and the village will remember your name.",
    "The road is long and your errand longer still. {brief} Set forth, complete {name}, and return to me with tidings of success.",
  ],
  generic: [
    "Well met, adventurer! A new task has appeared on the notice board. {brief} {name} may seem small, but every hero begins with a single step. Complete each stage and claim your reward.",
    "The elders speak of one who might complete {name}... {brief} Could that hero be you? Take the quest, clear the stages, and prove them right.",
    "Trouble brews, and only {name} can settle it. {brief} No quest is too humble for a true hero. The board is yours — begin.",
  ],
};

const BUFFS = {
  study: ['Focus (+10% Concentration)', 'Recall (+15% Memory Retention)', 'Insight (Untangled a tough concept)'],
  sport: ['Endurance (+10 Stamina)', 'Reflexes (+5 Agility)', 'Teamwork (Morale Up)'],
  fitness: ['Strength (+5 STR)', 'Stamina (+10 STA)', 'Discipline (Willpower Up)'],
  chores: ['Fresh Air (Room +Comfort)', 'Order (+5 Stability)', 'Pride of the Realm (Mood Up)'],
  creative: ['Inspiration (+10% Creativity)', 'Flow State (Distraction Immune)'],
  work: ['Efficiency (+10% Output)', 'Momentum (Next task -10% effort)'],
  errand: ['Preparedness (+5 Gold saved)', 'Swift Feet (+5 Movement)'],
  generic: ['Momentum (+10% Progress)', 'Fortune (Luck Up)'],
};

const LOOT = {
  study: ['Tome of Margins', 'Highlighter of Truth', 'XP: Double Notes'],
  sport: ['Wynncraft Football', 'Energy Bar', 'Sweat-Soaked Headband'],
  fitness: ['Protein Draught', 'Chalk of Grip', 'Iron Token'],
  chores: ['Bundle of Folded Clothes', 'Shiny Sink Rune', 'Room of the Realm'],
  creative: ['Sketch of Legend', 'Rare Pigment', 'Unfinished Masterpiece'],
  work: ['Signed Report Scroll', 'Filled-in Timesheet', 'Gold Coin of Salary'],
  errand: ['Receipt of Purchase', 'Spare Key', 'Filled Backpack'],
  generic: ['Consumable: Energy Potion', 'Common: Polished Token', 'XP Boost (5 min)'],
};

const WIN = {
  study: [
    'All study stages cleared without skipping review',
    'You can explain the topic aloud with no notes',
    'Notes archived in the Grimoire',
  ],
  sport: [
    'Every training stage completed in order',
    'Cool-down finished — no hero left cramping',
    'Session logged with the Coach',
  ],
  chores: [
    'Zero clutter detected on final inspection',
    'The Quartermaster signs off on the cleanse',
    'All zones returned to glory',
  ],
  generic: [
    'Every stage ticked off in the Quest Log',
    'No stage left incomplete',
    'Turn in the quest before rest',
  ],
};

/* ---------- utilities ---------- */

/** Deterministic string hash → stable per task name. */
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pick(arr, seed) {
  return arr[seed % arr.length];
}

/** Detect which flavour family a task belongs to. */
export function detectCategory(name = '', details = '') {
  const text = `${name} ${details}`.toLowerCase();
  const rules = [
    ['study', /\b(study|studying|revision|revise|exam|test|homework|essay|read|reading|notes|flashcard|paper|questions?|maths?|math|physics|chemistry|biology|history|geography|language|learn|learning|course|lecture|chapter|past paper|drill|paper)\b/],
    ['sport', /\b(football|soccer|training|practice|match|game|drill|sprint|coach|pitch|team|run|running|race|swim|basketball|tennis|cricket|rugby)\b/],
    ['fitness', /\b(gym|workout|lift|lifting|weights|bodybuilding|push-?ups?|sit-?ups?|exercise|fitness|cardio|abs|press-?ups?)\b/],
    ['chores', /\b(clean|cleaning|cleaning|tidy|tidying|room|laundry|dishes|kitchen|vacuum|dusting|declutter|wash|organise|organize|bin|scrub|mop)\b/],
    ['creative', /\b(draw|drawing|paint|painting|sketch|art|design|write|writing|story|music|guitar|piano|song|edit|video|craft)\b/],
    ['work', /\b(work|report|email|inbox|project|deadline|slides?|spreadsheet|clients?|meeting|task|job|office|proposal)\b/],
    ['errand', /\b(shop|shopping|groceries|buy|pick up|collect|post office|bank|errand|appointment|call|phone)\b/],
  ];
  for (const [cat, re] of rules) if (re.test(text)) return cat;
  return 'generic';
}

/** Parse "25 questions", "45 mins", "1 hour" style constraints from the brief. */
export function parseMeasure(name = '', details = '') {
  const text = `${name} ${details}`;
  const q = text.match(/(\d+)\s*(?:\+)?\s*(questions?|qs|problems?|exercises?|sums?|papers?)/i);
  if (q) return { kind: 'count', value: parseInt(q[1], 10), unit: 'questions' };
  const h = text.match(/(\d+(?:\.\d+)?)\s*(?:-|\s)?\s*(hours?|hrs?|h)\b/i);
  if (h) return { kind: 'time', value: Math.round(parseFloat(h[1]) * 60), unit: 'mins' };
  const m = text.match(/(\d+)\s*(?:-|\s)?\s*(mins?|minutes?|m)\b/i);
  if (m) return { kind: 'time', value: parseInt(m[1], 10), unit: 'mins' };
  return null;
}

/** Recommend a level 1–99 in Wynncraft fashion from effort + type. */
export function recommendLevel(category, measure) {
  const base = {
    study: 24, sport: 20, fitness: 22, chores: 12, creative: 18, work: 26, errand: 8, generic: 15,
  }[category];
  const extra = measure
    ? measure.kind === 'time'
      ? Math.round(measure.value / 15)
      : Math.round(measure.value / 10)
    : 0;
  return Math.max(1, Math.min(99, base + extra));
}

export function recommendType(category, measure) {
  if (category === 'chores' || category === 'errand') return 'Daily Bounty';
  if (category === 'study' || category === 'sport' || category === 'fitness') {
    if (measure && measure.kind === 'count' && measure.value <= 15) return 'Side Quest';
    return 'Main Quest';
  }
  if (category === 'creative') return 'Skill Quest';
  if (measure && measure.kind === 'time' && measure.value <= 20) return 'Side Quest';
  return category === 'work' ? 'Main Quest' : 'Skill Quest';
}

/* ---------- stage building ---------- */

/**
 * Build 4–6 timed/measured micro-objective stages.
 * count = number of measurable units (e.g. 25 questions) → splits into bursts.
 */
export function buildStages({ category, name, measure }) {
  const seed = hashStr(name);
  const short = name.replace(/^(study|do|complete|finish)\s+/i, '').trim() || name;
  const unit = measure && measure.kind === 'count' ? measure.value : null;
  const totalMins = measure && measure.kind === 'time' ? measure.value : null;

  const patterns = {
    study: [
      { title: `Review the battlefield — skim notes on ${short}`, mins: 10 },
      { title: 'Concept Breakdown — read and summarise key ideas', mins: 20 },
      { title: 'Active Recall — questions without notes', mins: 25 },
      { title: 'Mark & patch mistakes', mins: 10 },
      { title: 'Final recap — teach it back to an empty chair', mins: 5 },
    ],
    sport: [
      { title: 'Dynamic warm-up — mobility and pulse raiser', mins: 10 },
      { title: 'Technical drill — quality reps, slow then fast', mins: 15 },
      { title: 'Conditioning block — high intensity effort', mins: 15 },
      { title: 'Game-speed scenario / match play', mins: 15 },
      { title: 'Cool-down and stretch', mins: 5 },
    ],
    fitness: [
      { title: 'Warm-up — 10 min cardio + mobility', mins: 10 },
      { title: 'Compound lifts — main strength work', mins: 20 },
      { title: 'Accessory work — isolate and sculpt', mins: 15 },
      { title: 'Finisher — AMRAP burnout', mins: 5 },
      { title: 'Stretch & log the session', mins: 5 },
    ],
    chores: [
      { title: 'Survey the damage — set the timer, gather supplies', mins: 5 },
      { title: 'Zone 1 sweep — clear surface clutter', mins: 15 },
      { title: 'Zone 2 deep clean — floors, corners, dust', mins: 20 },
      { title: 'Reset & organise — everything has a home', mins: 10 },
      { title: 'Final inspection walk-through', mins: 5 },
    ],
    creative: [
      { title: 'Gather references and tools', mins: 10 },
      { title: 'Rough first pass — quantity over quality', mins: 25 },
      { title: 'Refine the details', mins: 20 },
      { title: 'Final polish and export', mins: 10 },
    ],
    work: [
      { title: 'Triage — list every deliverable', mins: 10 },
      { title: 'Deep work block 1 — hardest piece first', mins: 25 },
      { title: 'Deep work block 2 — push to the finish', mins: 25 },
      { title: 'Review, format, send', mins: 10 },
    ],
    errand: [
      { title: 'Make the list and check stock at home', mins: 5 },
      { title: 'Travel to the destination', mins: 15 },
      { title: 'Complete the errand', mins: 20 },
      { title: 'Return home and put everything away', mins: 10 },
    ],
    generic: [
      { title: `Prepare for ${short} — gather what you need`, mins: 5 },
      { title: 'First push — the hardest 40%', mins: 20 },
      { title: 'Second push — keep the momentum', mins: 20 },
      { title: 'Finish strong and tidy up', mins: 10 },
    ],
  };

  const stages = [];
  if (unit) {
    // Measurable stage system: warm-up + split question bursts + review.
    const bursts = unit <= 12 ? [unit] : unit <= 30 ? [Math.ceil(unit / 3), Math.ceil(unit / 3), unit - 2 * Math.ceil(unit / 3)] : [10, 10, unit - 20];
    stages.push({ title: `Warm-up — 3 easy ${short.toLowerCase()} questions to start`, minutes: 5, target: null });
    bursts.forEach((n, i) => {
      if (n <= 0) return;
      stages.push({
        title: `Question Burst ${i + 1} — solve ${n} ${n === 1 ? 'question' : 'questions'}`,
        minutes: null,
        target: n,
        unit: 'questions',
      });
    });
    stages.push({ title: 'Mark answers and note every mistake', minutes: 10, target: null });
    stages.push({ title: 'Rework the wrong answers until they stick', minutes: 10, target: null });
  } else {
    const pattern = patterns[category] || patterns.generic;
    if (totalMins) {
      // Scale the template to the requested duration.
      const fixedSum = pattern.reduce((a, s) => a + s.mins, 0);
      const scale = totalMins / fixedSum;
      pattern.forEach((s) => stages.push({
        title: s.title,
        minutes: Math.max(3, Math.round(s.mins * scale)),
        target: null,
      }));
    } else {
      pattern.forEach((s) => stages.push({ title: s.title, minutes: s.mins, target: null }));
    }
  }
  return stages.map((s, i) => ({ id: `s${i + 1}`, order: i + 1, ...s }));
}

/* ---------- main entry ---------- */

/**
 * XP for a quest — DERIVED from its level, type and stages, so editing a
 * stage (duration, question target, adding/removing) changes the reward.
 */
export function computeXp({ level = 1, type = 'Side Quest', stages = [] }) {
  const totalMinutes = stages.reduce((a, s) => a + (s.minutes || 0), 0);
  const questionTotal = stages.reduce((a, s) => a + (s.target || 0), 0);
  const typeBonus = type === 'Main Quest' ? 60 : type === 'Skill Quest' ? 40 : 15;
  return Math.round(40 + level * 6 + totalMinutes * 1.5 + questionTotal * 3 + typeBonus);
}

/** Last millisecond of the local day containing `ts`. */
export function endOfDay(ts) {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Daily Bounties expire at midnight after the day they were posted.
 * Everything else never expires.
 */
export function isExpired(quest, now = Date.now()) {
  if (!quest || quest.status !== 'active' || quest.type !== 'Daily Bounty') return false;
  return now > endOfDay(quest.createdAt || now);
}

/** Transform a raw task into a full Wynncraft quest object. */
export function generateQuest({ name, duration = '', count = '', details = '' }) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('A quest needs a name, adventurer.');

  const detailsClean = (details || '').trim();
  const brief = [duration && `The elders allot you ${duration}.`,
    count && `You must clear ${count}.`,
    detailsClean]
    .filter(Boolean)
    .join(' ')
    .replace(/([^.!?])$/, '$1.');

  const seed = hashStr(trimmed.toLowerCase());
  const category = detectCategory(trimmed, details);
  const measure = parseMeasure(trimmed, `${duration} ${count} ${details}`);
  const title = pick(TITLES[category] || TITLES.generic, seed);
  const flavor = pick(FLAVOR[category] || FLAVOR.generic, seed >> 3)
    .replaceAll('{name}', trimmed)
    .replaceAll('{brief}', brief ? `${brief}` : 'No further instructions were given — improvise, hero.');

  const npcByCat = {
    study: 'Archivist Thorne', sport: 'Coach Brennus', fitness: 'Blacksmith Borin',
    chores: 'Quartermaster Mira', creative: 'Muse-keeper Elowen', work: 'Guild Master Aldric',
    errand: 'Quartermaster Mira', generic: 'Herald of Wynn',
  };

  const level = recommendLevel(category, measure);
  const type = recommendType(category, measure);
  const stages = buildStages({ category, name: trimmed, measure });

  const xp = computeXp({ level, type, stages });

  return {
    id: `q_${Date.now().toString(36)}_${seed.toString(36).slice(0, 4)}`,
    title: `Quest: ${title}`,
    bareTitle: title,
    name: trimmed,
    npc: npcByCat[category] || npcByCat.generic,
    category,
    type,
    level,
    xp,
    flavor,
    brief,
    buffs: pick(BUFFS[category] || BUFFS.generic, seed >> 5),
    loot: pick(LOOT[category] || LOOT.generic, seed >> 7),
    winConditions: WIN[category] || WIN.generic,
    stages,
    meta: { duration: duration || '', count: count || '', details: details || '' },
    createdAt: Date.now(),
    status: 'active',
    progress: 0,
    stageState: stages.map((s) => ({ id: s.id, done: false, count: 0 })),
    completedAt: null,
  };
}
