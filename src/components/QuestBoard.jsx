import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Swords, BookOpen, CalendarCheck, Sparkles, ChevronRight, Trophy, Timer, ListChecks } from 'lucide-react';
import { TYPE_CHIP } from './typeMeta.js';

const TYPE_META = TYPE_CHIP;

function questEffort(q) {
  const mins = q.stages.reduce((a, s) => a + (s.minutes || 0), 0);
  const qs = q.stages.reduce((a, s) => a + (s.target || 0), 0);
  return [mins ? `${mins} min` : null, qs ? `${qs} questions` : null].filter(Boolean).join(' · ') || 'Quick task';
}

const QuestCard = React.forwardRef(function QuestCard({ q, onOpen, index }, ref) {
  const meta = TYPE_META[q.type] || TYPE_META['Side Quest'];
  const Icon = meta.icon;
  const total = q.stageState.length;
  const done = q.stageState.filter((s) => s.done).length;
  const pct = Math.round((done / total) * 100);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      ref={ref}
      onClick={() => onOpen(q.id)}
      className="panel group w-full p-4 text-left"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`mb-1.5 inline-flex items-center gap-1.5 border px-2 py-0.5 ${meta.chip}`}>
            <Icon size={11} />
            <span className="font-display text-[9px] uppercase tracking-[0.18em]">{q.type}</span>
          </div>
          <h3 className="truncate font-display text-lg font-bold text-parch-50 group-hover:text-gold-200">
            {q.title}
          </h3>
        </div>
        <div className="shrink-0 text-center">
          <div className="pixel border border-gold-700 bg-ink-950 px-2 py-1 text-[10px] text-gold-400">
            Lv {q.level}
          </div>
        </div>
      </div>

      <p className="mb-3 line-clamp-2 text-sm italic leading-snug text-parch-400">
        “{q.flavor.slice(0, 110)}…”
      </p>

      <div className="mb-2 flex items-center gap-3 text-[11px] text-parch-600">
        <span className="flex items-center gap-1"><Timer size={11} /> {questEffort(q)}</span>
        <span className="flex items-center gap-1 text-gold-500"><Star size={11} /> {q.xp} XP</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 grow border border-ink-600 bg-ink-950 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-moss-600 to-moss-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="pixel text-[8px] text-parch-600">{done}/{total}</span>
        <ChevronRight size={15} className="text-gold-600 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
});

function StatCard({ icon: Icon, label, value, accent = 'text-gold-400' }) {
  return (
    <div className="panel flex items-center gap-3 px-4 py-3">
      <Icon size={20} className={accent} />
      <div>
        <div className={`pixel text-sm ${accent}`}>{value}</div>
        <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">{label}</div>
      </div>
    </div>
  );
}

export default function QuestBoard({ quests, stats, onOpen, onNew }) {
  const active = quests.filter((q) => q.status === 'active');
  const completed = quests.filter((q) => q.status === 'completed');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel relative mb-8 overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 text-gold-700/15">
          <Swords size={190} strokeWidth={1} />
        </div>
        <div className="relative">
          <div className="rule-ornate mb-3 font-display text-[10px] uppercase tracking-[0.4em]">
            The Notice Board
          </div>
          <h1 className="mb-2 font-display text-3xl font-extrabold text-parch-50 text-shadow-gold sm:text-4xl">
            Quest Board
          </h1>
          <p className="max-w-xl text-parch-400">
            Turn your study sessions, training and chores into legendary quests. Tick the stages,
            earn XP, and grow from New Recruit to Legend of Wynn.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Swords} label="Active Quests" value={active.length} />
            <StatCard icon={Trophy} label="Turned In" value={completed.length} accent="text-moss-500" />
            <StatCard icon={Star} label="Total XP" value={stats.totalXp} />
            <StatCard icon={ListChecks} label="Stages Cleared" value={stats.stagesDone} accent="text-parch-200" />
          </div>
        </div>
      </motion.section>

      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-wide text-gold-400">
          Active Quests
        </h2>
        <button onClick={onNew} className="btn-rpg flex items-center gap-2 px-4 py-2.5 text-xs">
          <Plus size={15} /> New Quest
        </button>
      </div>

      {active.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="panel grid place-items-center px-6 py-14 text-center"
        >
          <div className="mb-3 text-gold-700"><BookOpen size={42} strokeWidth={1.2} /></div>
          <h3 className="mb-1 font-display text-xl text-parch-200">The board is bare</h3>
          <p className="mb-5 max-w-sm text-parch-400">
            No adventurer lasts long without a task. Post your first quest and let the Questmaster
            craft the stages for you.
          </p>
          <button onClick={onNew} className="btn-rpg px-5 py-2.5 text-xs">
            <Plus size={14} className="mr-1 inline" /> Post a Quest
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {active.map((q, i) => (
              <QuestCard key={q.id} q={q} index={i} onOpen={onOpen} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 font-display text-xl font-bold tracking-wide text-moss-500">
            Recently Turned In
          </h2>
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {completed.slice(0, 3).map((q, i) => (
                <motion.button
                  key={q.id}
                  layout
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onOpen(q.id)}
                  className="panel flex items-center gap-4 px-4 py-3 text-left hover:border-gold-700"
                >
                  <Trophy size={17} className="shrink-0 text-gold-400" />
                  <span className="grow truncate font-display text-sm text-parch-100">{q.title}</span>
                  <span className="pixel hidden text-[8px] text-moss-500 sm:block">
                    {new Date(q.completedAt).toLocaleDateString()}
                  </span>
                  <span className="pixel text-[9px] text-gold-500">+{q.xp} XP</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
