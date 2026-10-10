// Unit tests for the generator engine + progression curve. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateQuest, detectCategory, parseMeasure, buildStages, recommendLevel, QUEST_TYPES,
  computeXp, isExpired, endOfDay,
} from './generator.js';
import { levelFromXp, xpToNext, rankTitle } from './player.js';

test('category detection', () => {
  assert.equal(detectCategory('Study Math'), 'study');
  assert.equal(detectCategory('Football Training'), 'sport');
  assert.equal(detectCategory('Clean Room'), 'chores');
  assert.equal(detectCategory('Gym workout'), 'fitness');
  assert.equal(detectCategory('Design poster'), 'creative');
  assert.equal(detectCategory('Weekly report'), 'work');
  assert.equal(detectCategory('Buy groceries'), 'errand');
  assert.equal(detectCategory('Water the plants'), 'generic');
});

test('measure parsing', () => {
  assert.deepEqual(parseMeasure('Physics past paper'), null);
  const q = parseMeasure('Solve 25 questions of algebra');
  assert.equal(q.kind, 'count');
  assert.equal(q.value, 25);
  const h = parseMeasure('Study for 1.5 hours');
  assert.equal(h.kind, 'time');
  assert.equal(h.value, 90);
  const m = parseMeasure('Clean', '45 mins');
  assert.equal(m.kind, 'time');
  assert.equal(m.value, 45);
});

test('quest shape', () => {
  const quest = generateQuest({ name: 'Study Math', count: '25 questions', details: 'Algebra chapter 4' });
  assert.match(quest.title, /^Quest: /);
  assert.ok(quest.flavor.length > 40, 'has NPC flavor text');
  assert.ok(quest.level >= 1 && quest.level <= 99);
  assert.ok(QUEST_TYPES.includes(quest.type));
  assert.ok(quest.stages.length >= 4, 'at least 4 stages');
  assert.ok(quest.xp > 0);
  assert.ok(quest.buffs && quest.loot);
  assert.ok(quest.winConditions.length >= 2);
  assert.equal(quest.stageState.length, quest.stages.length);
  assert.equal(quest.status, 'active');
});

test('count-based quests get sub-trackers', () => {
  const quest = generateQuest({ name: 'Past papers', count: '25 questions' });
  const targetTotal = quest.stages.reduce((a, s) => a + (s.target || 0), 0);
  assert.ok(targetTotal >= 25, `question bursts cover the count (got ${targetTotal})`);
  assert.ok(quest.stages.some((s) => s.target > 0));
});

test('duration scales stages', () => {
  const short = buildStages({ category: 'chores', name: 'Clean Room', measure: { kind: 'time', value: 20, unit: 'mins' } });
  const long = buildStages({ category: 'chores', name: 'Clean Room', measure: { kind: 'time', value: 120, unit: 'mins' } });
  const sum = (arr) => arr.reduce((a, s) => a + s.minutes, 0);
  assert.ok(sum(long) > sum(short));
  assert.ok(Math.abs(sum(short) - 20) <= 5, `short ≈ 20 mins, got ${sum(short)}`);
});

test('deterministic per input', () => {
  const a = generateQuest({ name: 'Football Training' });
  const b = generateQuest({ name: 'Football Training' });
  assert.equal(a.title, b.title);
  assert.equal(a.flavor, b.flavor);
  assert.equal(a.xp, b.xp);
});

test('different tasks feel different', () => {
  const a = generateQuest({ name: 'Study Math' });
  const b = generateQuest({ name: 'Clean Room' });
  assert.notEqual(a.title, b.title);
});

test('level curve', () => {
  assert.equal(levelFromXp(0).level, 1);
  let xp = 0;
  for (let i = 0; i < 5; i++) xp += xpToNext(i + 1);
  assert.equal(levelFromXp(xp).level, 6, 'cumulative xp reaches level 6');
  assert.equal(levelFromXp(xp).intoLevel, 0);
  assert.equal(levelFromXp(xp - 1).level, 5, 'one xp short stays at 5');
  assert.ok(rankTitle(1) !== rankTitle(50));
  assert.equal(levelFromXp(999999999).level, 99, 'caps at 99');
});

test('recommendations', () => {
  assert.ok(recommendLevel('chores', null) < recommendLevel('study', { kind: 'time', value: 120 }));
  assert.throws(() => generateQuest({ name: '   ' }), /name/i, 'empty quest name rejected');
});

/* ---- stage edits drive XP ---- */

test('xp is derived from stages', () => {
  const base = { level: 10, type: 'Side Quest' };
  const empty = computeXp({ ...base, stages: [] });

  assert.equal(
    computeXp({ ...base, stages: [{ minutes: 10 }] }) - empty,
    15,
    'a 10-minute stage = 15 XP',
  );
  assert.equal(
    computeXp({ ...base, stages: [{ target: 25 }] }) - empty,
    75,
    '25 questions = 75 XP',
  );

  assert.equal(
    computeXp({ ...base, type: 'Main Quest', stages: [] })
      - computeXp({ ...base, type: 'Side Quest', stages: [] }),
    45,
    'Main Quest bonus (60) beats Side Quest (15) by 45',
  );
});

test('removing a stage lowers xp, adding one raises it', () => {
  const quest = generateQuest({ name: 'Clean Room', duration: '45 mins' });
  const before = quest.xp;
  assert.equal(before, computeXp(quest), 'generated xp equals the derived formula');

  const withoutLast = quest.stages.slice(0, -1);
  assert.ok(
    computeXp({ level: quest.level, type: quest.type, stages: withoutLast }) < before,
    'dropping a stage can only reduce the reward',
  );

  const withExtra = [...quest.stages, { title: 'Bonus pass', minutes: 20 }];
  assert.equal(
    computeXp({ level: quest.level, type: quest.type, stages: withExtra }) - before,
    30,
    'a 20-minute stage adds exactly 30 XP (20 × 1.5)',
  );
});

/* ---- daily bounty expiry ---- */

test('daily bounties expire at midnight after the day they were posted', () => {
  const now = new Date('2026-10-09T15:30:00').getTime();
  const bounty = {
    type: 'Daily Bounty', status: 'active',
    createdAt: new Date('2026-10-09T08:00:00').getTime(),
  };

  assert.equal(isExpired(bounty, now), false, 'not expired on the same day');
  assert.equal(isExpired(bounty, endOfDay(bounty.createdAt)), false, 'still alive at 23:59:59.999');
  assert.equal(
    isExpired(bounty, new Date('2026-10-10T00:00:01').getTime()),
    true,
    'expired one second past midnight',
  );
});

test('non-bounty quests never expire, and neither do settled ones', () => {
  const old = Date.now() - 10 * 86400000;
  assert.equal(isExpired({ type: 'Main Quest', status: 'active', createdAt: old }), false);
  assert.equal(isExpired({ type: 'Skill Quest', status: 'active', createdAt: old }), false);
  assert.equal(isExpired({ type: 'Daily Bounty', status: 'completed', createdAt: old }), false,
    'a turned-in bounty is settled, not expired');
  assert.equal(isExpired({ type: 'Daily Bounty', status: 'missed', createdAt: old }), false,
    'already-swept bounty stays missed');
});
