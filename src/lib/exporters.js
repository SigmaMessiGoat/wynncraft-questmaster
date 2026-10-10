/** Export quests as clean Markdown, download as .md, or print a notebook sheet. */

export function questToMarkdown(quest, player = null) {
  const L = [];
  L.push(`# ${quest.title}`);
  L.push('');
  L.push(`> _${quest.flavor}_`);
  L.push('');
  L.push(`| | |`);
  L.push(`|---|---|`);
  L.push(`| **Quest Giver** | ${quest.npc} |`);
  L.push(`| **Type** | ${quest.type} |`);
  L.push(`| **Recommended Level** | ${quest.level} |`);
  L.push(`| **XP Reward** | ${quest.xp} XP |`);
  L.push(`| **Buff** | ${quest.buffs} |`);
  L.push(`| **Loot Drop** | ${quest.loot} |`);
  if (quest.meta?.duration || quest.meta?.count) {
    L.push(`| **Est. Effort** | ${[quest.meta.duration, quest.meta.count].filter(Boolean).join(' + ')} |`);
  }
  L.push('');
  L.push('## Stages');
  L.push('');
  quest.stages.forEach((s, i) => {
    const mark = quest.stageState?.[i]?.done ? 'x' : ' ';
    const effort = s.target ? `[ ${quest.stageState?.[i]?.count ?? 0} / ${s.target} ${s.unit || 'units'} ]` : `[ ${s.minutes} min ]`;
    L.push(`- [${mark}] **Stage ${i + 1}:** ${s.title} ${effort}`);
  });
  L.push('');
  L.push('## Win Conditions');
  L.push('');
  quest.winConditions.forEach((w) => L.push(`- ${w}`));
  L.push('');
  L.push('## Notes');
  L.push('');
  L.push(quest.meta?.details ? quest.meta.details : '_Write your notes here._');
  L.push('');
  if (player) {
    L.push('---');
    const when = quest.completedAt || quest.missedAt || quest.createdAt || Date.now();
    L.push(
      quest.status === 'missed'
        ? `_**Missed** — expired ${new Date(when).toLocaleDateString()}, no XP awarded._`
        : `_Turned in by **${player.title}** (Level ${player.level}) on ${new Date(when).toLocaleDateString()}_`,
    );
    L.push('');
  }
  return L.join('\n');
}

export function journalToMarkdown(quests, player) {
  const L = [];
  L.push('# Completed Quest Journal');
  L.push('');
  L.push(`Adventurer rank: **${player.title}** — Level ${player.level} — ${player.xp} total XP`);
  L.push('');
  quests.forEach((q, i) => {
    const missed = q.status === 'missed';
    const when = q.completedAt || q.missedAt || q.createdAt;
    L.push(`## ${i + 1}. ${q.title}`);
    L.push('');
    L.push(
      missed
        ? `_${q.type} · Rec. Lv ${q.level} · MISSED (expired ${new Date(when).toLocaleDateString()}) — no XP awarded_`
        : `_${q.type} · Rec. Lv ${q.level} · ${q.xp} XP · Completed ${new Date(when).toLocaleDateString()}_`,
    );
    L.push('');
    L.push(`> ${q.flavor}`);
    L.push('');
    q.stages.forEach((s, si) => L.push(`- [${missed ? ' ' : 'x'}] Stage ${si + 1}: ${s.title}`));
    L.push('');
  });
  return L.join('\n');
}

export function downloadMarkdown(text, filename) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Printable notebook template — uses the hidden .print-sheet DOM region. */
export function printQuest() {
  window.print();
}
