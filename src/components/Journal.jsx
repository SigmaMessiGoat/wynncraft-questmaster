import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Download, Printer, Trash2, Star, Hourglass } from 'lucide-react';

const isMissed = (q) => q.status === 'missed';
const finishedAt = (q) => q.completedAt || q.missedAt || q.createdAt;

export default function Journal({ quests, player, onBack, onOpen, onExportAll, onPrint }) {
  const missedCount = quests.filter(isMissed).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={onBack} className="btn-ghost mb-6 inline-flex items-center gap-1.5 px-3 py-2 text-[11px]">
        <ArrowLeft size={13} /> Quest Board
      </button>

      <div className="panel mb-6 p-6">
        <div className="rule-ornate mb-3 font-display text-[10px] uppercase tracking-[0.4em]">
          Archive of Deeds
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-parch-50 text-shadow-gold">
              Completed Quest Journal
            </h1>
            <p className="mt-1 text-parch-400">
              Every quest you have turned in — plus any daily bounty that expired — recorded for
              the historians of Wynn.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onExportAll} className="btn-ghost flex items-center gap-1.5 px-3 py-2.5 text-[11px]">
              <Download size={13} /> Export All (.md)
            </button>
            <button onClick={onPrint} className="btn-ghost flex items-center gap-1.5 px-3 py-2.5 text-[11px]">
              <Printer size={13} /> Print
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6 border-t border-ink-600 pt-4">
          <div>
            <div className="pixel text-lg text-gold-400">
              {quests.filter((q) => !isMissed(q)).length}
            </div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">Quests Cleared</div>
          </div>
          <div>
            <div className={`pixel text-lg ${missedCount ? 'text-blood-500' : 'text-parch-600'}`}>
              {missedCount}
            </div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">Missed</div>
          </div>
          <div>
            <div className="pixel text-lg text-gold-400">
              {quests.filter((q) => !isMissed(q)).reduce((a, q) => a + q.xp, 0)}
            </div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">XP From Turn-Ins</div>
          </div>
          <div>
            <div className="pixel text-lg text-gold-400">{player?.level ?? 1}</div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">Player Level</div>
          </div>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-14 text-center">
          <Trophy size={40} className="mb-3 text-gold-700" strokeWidth={1.2} />
          <h3 className="mb-1 font-display text-lg text-parch-200">The archive is empty</h3>
          <p className="max-w-sm text-parch-400">
            Turn in your first quest and it will be preserved here forever (well — until you clear
            your browser data).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quests.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="panel flex items-center gap-4 p-4"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center border border-gold-700 bg-ink-950">
                {isMissed(q) ? (
                  <Hourglass size={18} className="text-blood-500" />
                ) : (
                  <Trophy size={18} className="text-gold-400" />
                )}
              </div>
              <button onClick={() => onOpen(q.id)} className="min-w-0 grow text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-base text-parch-50 hover:text-gold-200">
                    {q.title}
                  </span>
                  {isMissed(q) && (
                    <span className="shrink-0 border border-blood-500 bg-blood-600/15 px-1.5 py-0.5 font-display text-[8px] uppercase tracking-[0.15em] text-blood-500">
                      Missed
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-parch-600">
                  <span>{q.type}</span>
                  <span>· Rec. Lv {q.level}</span>
                  <span>· {q.stages.length} stages</span>
                  <span>
                    ·{' '}
                    {new Date(finishedAt(q)).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </button>
              <div className="pixel flex shrink-0 items-center gap-1 text-[10px] text-gold-500">
                {isMissed(q) ? (
                  <span className="text-blood-500">NO XP</span>
                ) : (
                  <>
                    <Star size={11} fill="currentColor" /> +{q.xp}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PrintJournal quests={quests} player={player} />
    </div>
  );
}

/** Printable archive — same notebook-template treatment as the quest sheet. */
function PrintJournal({ quests, player }) {
  return (
    <section className="print-sheet hidden" aria-hidden="true">
      <div style={{ fontFamily: 'Georgia, serif', color: '#000', padding: '18mm 16mm' }}>
        <div style={{ borderBottom: '3px double #000', paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Wynncraft Questmaster · Completed Quest Journal
          </div>
          <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>
            Archive of Deeds — {quests.length} {quests.length === 1 ? 'Quest' : 'Quests'}
          </h1>
          <div style={{ fontSize: 12 }}>
            {player ? `${player.title} · Level ${player.level} · ${player.xp ?? 0} total XP` : ''}
          </div>
        </div>

        {quests.map((q) => (
          <div key={q.id} style={{ marginBottom: 18, pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: 16, margin: '0 0 2px' }}>{q.title}</h2>
            <div style={{ fontSize: 11, marginBottom: 4 }}>
              {isMissed(q) ? 'Missed (expired)' : q.type}
              {!isMissed(q) && ` · ${q.type}`}
              {' · Rec. Level '}{q.level}{' · '}
              {isMissed(q) ? '0' : q.xp}{' XP · '}
              {isMissed(q) ? 'Expired' : 'Completed'}{' '}
              {new Date(finishedAt(q)).toLocaleDateString()}
            </div>
            <p style={{ fontSize: 12, fontStyle: 'italic', margin: '0 0 6px' }}>{q.flavor}</p>
            <ul style={{ paddingLeft: 18, fontSize: 12, margin: 0 }}>
              {q.stages.map((s, i) => (
                <li key={s.id} style={{ marginBottom: 3 }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, border: '1.5px solid #000', marginRight: 8, verticalAlign: 'middle' }} />
                  {s.title}
                  {s.minutes != null ? `  [ ${s.minutes} min ]` : ''}
                  {s.target != null ? `  [ ${s.target} ${s.unit || ''} ]` : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
