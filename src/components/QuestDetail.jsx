import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, Square, Minus, Plus, Swords, Star, Gift, ShieldCheck,
  FileText, Printer, Trophy, Scroll, Clock, ListChecks, RotateCcw, Sparkles,
  Pencil, Trash2, Hourglass,
} from 'lucide-react';
import { TYPE_CHIP } from './typeMeta.js';

/* ---- progress helpers ---- */

function stageProgress(q, st) {
  const stage = q.stages.find((s) => s.id === st.id);
  if (!stage) return 0;
  if (stage.target) return Math.min(1, (st.count || 0) / stage.target);
  return st.done ? 1 : 0;
}

export function questProgress(q) {
  if (!q.stageState.length) return 0;
  const sum = q.stageState.reduce((a, st) => a + stageProgress(q, st), 0);
  return sum / q.stageState.length;
}

/* ---- sub-tracker: [ 0 / 25 ] ---- */

function Counter({ stage, state, onChange }) {
  const target = stage.target;
  const value = Math.min(state.count || 0, target);
  const unit = stage.unit || 'units';
  const step = target >= 20 ? 5 : 1;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="btn-ghost grid h-7 w-7 place-items-center text-xs"
        aria-label={`Remove one ${unit.slice(0, -1)}`}
        disabled={value <= 0}
      >
        <Minus size={12} />
      </button>

      <div className="pixel flex items-center gap-1.5 border border-gold-700 bg-ink-950 px-3 py-1.5 text-[11px] text-gold-300">
        <span className={value >= target ? 'text-moss-500' : ''}>[ {value} / {target} ]</span>
        <span className="text-[8px] text-parch-600">{unit.toUpperCase()}</span>
      </div>

      <button
        onClick={() => onChange(Math.min(target, value + step))}
        className="btn-ghost grid h-7 w-7 place-items-center text-xs"
        aria-label={`Add ${step} ${step === 1 ? unit.replace(/s$/, '') : unit}`}
        disabled={value >= target}
      >
        <Plus size={12} />
      </button>

      <button
        onClick={() => onChange(target)}
        className="btn-ghost px-2 py-1 text-[9px]"
        title={`Mark all ${target} done`}
      >
        All
      </button>

      <div className="h-2 min-w-24 grow border border-ink-600 bg-ink-950 p-[1px]">
        <motion.div
          className="h-full bg-gradient-to-r from-moss-600 to-moss-500"
          initial={false}
          animate={{ width: `${(value / target) * 100}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        />
      </div>
    </div>
  );
}

/* ---- one stage row ---- */

function StageRow({ q, st, index, onToggle, onCount, onEdit, onRemove, editable }) {
  const stage = q.stages[index];
  const done = st.done;
  const locked = !editable;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', minutes: '', target: '' });

  const startEdit = () => {
    setDraft({ title: stage.title, minutes: stage.minutes ?? '', target: stage.target ?? '' });
    setEditing(true);
  };

  const toNum = (v) =>
    v === '' || v == null || Number.isNaN(Number(v)) ? null : Math.max(1, Math.round(Number(v)));

  const save = () => {
    const title = String(draft.title || '').trim() || stage.title;
    const target = toNum(draft.target);
    onEdit(stage.id, {
      title,
      minutes: toNum(draft.minutes),
      target,
      ...(target != null ? { unit: stage.unit || 'questions' } : {}),
    });
    setEditing(false);
  };

  const remove = () => {
    if (q.stages.length <= 1) return;
    const hasProgress = done || (stage.target != null && (st.count || 0) > 0);
    if (
      hasProgress &&
      !window.confirm(`Delete "${stage.title}"? Its progress goes with it, and the XP reward will drop.`)
    ) {
      return;
    }
    onRemove(stage.id);
  };

  return (
    <motion.li
      layout
      className={`relative border-l-2 pl-4 transition-colors ${
        done ? 'border-moss-500' : 'border-ink-600'
      }`}
    >
      <span
        className={`absolute -left-[9px] top-1.5 grid h-4 w-4 place-items-center rounded-full ${
          done ? 'bg-moss-500' : 'bg-ink-600'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />
      </span>

      <div className="pb-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(stage.id)}
            disabled={locked}
            aria-pressed={done}
            aria-label={`Toggle stage ${index + 1}`}
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition ${
              done
                ? 'border-moss-500 bg-moss-600 text-ink-950'
                : 'border-parch-600 bg-transparent hover:border-gold-600'
            } ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {done ? <Check size={13} strokeWidth={3.5} /> : <Square size={9} />}
          </button>

          <div className="min-w-0 grow">
            {editing ? (
              <div className="space-y-2 border border-[#7a6637]/60 bg-[#7a6637]/10 p-3">
                <label className="block">
                  <span className="mb-1 block font-display text-[9px] uppercase tracking-[0.18em] text-[#5c4a26]">
                    Stage title
                  </span>
                  <input
                    className="w-full border border-[#7a6637]/60 bg-white/70 px-2 py-1 text-[15px] text-[#33291a] focus:border-[#a97a1d] focus:outline-none"
                    value={draft.title}
                    maxLength={140}
                    autoFocus
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </label>
                <div className="flex gap-3">
                  <label className="grow">
                    <span className="mb-1 block font-display text-[9px] uppercase tracking-[0.18em] text-[#5c4a26]">
                      Minutes
                    </span>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-[#7a6637]/60 bg-white/70 px-2 py-1 text-[15px] text-[#33291a] focus:border-[#a97a1d] focus:outline-none"
                      value={draft.minutes}
                      placeholder="—"
                      onChange={(e) => setDraft((d) => ({ ...d, minutes: e.target.value }))}
                    />
                  </label>
                  <label className="grow">
                    <span className="mb-1 block font-display text-[9px] uppercase tracking-[0.18em] text-[#5c4a26]">
                      Questions
                    </span>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-[#7a6637]/60 bg-white/70 px-2 py-1 text-[15px] text-[#33291a] focus:border-[#a97a1d] focus:outline-none"
                      value={draft.target}
                      placeholder="—"
                      onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))}
                    />
                  </label>
                </div>
                <p className="text-[11px] italic text-[#5c4a26]">
                  Blank = not applicable. Minutes and questions both feed the quest's XP reward.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={save}
                    className="border border-[#4f7529] bg-[#4f7529]/20 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.15em] text-[#3d5a1f] hover:bg-[#4f7529]/30"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-[#7a6637]/60 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.15em] text-[#5c4a26] hover:bg-[#7a6637]/15"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="pixel text-[8px] text-gold-600">STAGE {index + 1}</span>
                  {stage.minutes != null && (
                    <span className="flex items-center gap-1 text-[10px] text-parch-600">
                      <Clock size={10} /> {stage.minutes} min
                    </span>
                  )}
                  {stage.target != null && (
                    <span className="text-[10px] text-parch-600">
                      {stage.target} {stage.unit || 'units'}
                    </span>
                  )}
                  {editable && (
                    <span className="ml-auto flex gap-1.5">
                      <button
                        onClick={startEdit}
                        aria-label={`Edit stage ${index + 1}`}
                        title="Edit stage"
                        className="border border-[#7a6637]/50 p-1 text-[#7a6637] transition hover:bg-[#7a6637]/20 hover:text-[#33291a]"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={remove}
                        disabled={q.stages.length <= 1}
                        aria-label={`Delete stage ${index + 1}`}
                        title={q.stages.length <= 1 ? 'A quest needs at least one stage' : 'Delete stage'}
                        className="border border-[#7a6637]/50 p-1 text-[#7a6637] transition hover:border-[#a3312a] hover:bg-[#a3312a]/15 hover:text-[#a3312a] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  )}
                </div>
                <p
                  className={`text-[15px] leading-snug ${
                    done ? 'text-parch-600 line-through' : 'text-[#33291a]'
                  }`}
                >
                  {stage.title}
                </p>

                {stage.target != null && (
                  <Counter
                    stage={stage}
                    state={st}
                    onChange={(n) => onCount(stage.id, n)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/* ---- HP / completion bar ---- */

export function effortLabel(quest) {
  const mins = quest.stages.reduce((a, s) => a + (s.minutes || 0), 0);
  const qs = quest.stages.reduce((a, s) => a + (s.target || 0), 0);
  return [mins ? `${mins} min` : null, qs ? `${qs} questions` : null].filter(Boolean).join(' · ') || '—';
}

function CompletionBar({ pct }) {
  const hp = Math.round(pct * 100);
  const color =
    hp >= 100 ? 'from-moss-600 to-moss-500' : hp >= 50 ? 'from-gold-700 to-gold-400' : 'from-blood-600 to-blood-500';

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-display text-[10px] uppercase tracking-[0.3em] text-parch-400">
          Quest Completion
        </span>
        <span className={`pixel text-[11px] ${hp >= 100 ? 'text-moss-500' : 'text-gold-400'}`}>
          {hp}%
        </span>
      </div>
      <div className="flex h-6 gap-[3px] border border-ink-600 bg-ink-950 p-[3px]">
        {Array.from({ length: 20 }).map((_, i) => {
          const filled = i < Math.round(pct * 20);
          return (
            <div key={i} className="relative h-full grow overflow-hidden bg-ink-800">
              <motion.div
                initial={false}
                animate={{ opacity: filled ? 1 : 0 }}
                transition={{ delay: filled ? i * 0.015 : 0 }}
                className={`h-full w-full bg-gradient-to-b ${color}`}
                style={{ boxShadow: filled ? '0 0 6px rgba(227,182,84,0.35)' : 'none' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- main detail view ---- */

export default function QuestDetail({
  quest,
  player,
  onBack,
  onToggleStage,
  onSetCount,
  onEditStage,
  onAddStage,
  onRemoveStage,
  onTurnIn,
  onAbandon,
  onExportMd,
  onPrint,
}) {
  const pct = questProgress(quest);
  const done = quest.status === 'completed';
  const missed = quest.status === 'missed';
  const editable = quest.status === 'active';
  const allDone = pct >= 0.999;
  const chip = TYPE_CHIP[quest.type] || TYPE_CHIP['Side Quest'];
  const Icon = chip.icon;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <button onClick={onBack} className="btn-ghost mb-5 inline-flex items-center gap-1.5 px-3 py-2 text-[11px]">
        <ArrowLeft size={13} /> Quest Board
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ===== Grimoire page ===== */}
        <motion.article
          initial={{ opacity: 0, y: 18, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.4 }}
          className="parchment relative overflow-hidden p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute inset-2 border border-[#7a6637]/40" />
          <div className="pointer-events-none absolute inset-3 border border-[#7a6637]/20" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 ${chip.solid}`}>
                <Icon size={11} />
                <span className="font-display text-[9px] uppercase tracking-[0.18em]">{quest.type}</span>
              </span>
              <span className="border border-[#7a6637]/60 bg-[#7a6637]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-[#5c4a26]">
                Rec. Level {quest.level}
              </span>
              <span className="border border-[#7a6637]/60 bg-[#7a6637]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-[#5c4a26]">
                {quest.category}
              </span>
              {done && (
                <span className="border border-[#4f7529] bg-[#4f7529]/15 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-[#3d5a1f]">
                  ✓ Completed
                </span>
              )}
              {missed && (
                <span className="flex items-center gap-1 border border-[#a3312a] bg-[#a3312a]/12 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-[#a3312a]">
                  <Hourglass size={10} /> Missed — expired
                </span>
              )}
            </div>

            <h1 className="mb-1 font-display text-3xl font-black leading-tight text-[#2b2113] text-shadow-ink sm:text-4xl">
              {quest.title}
            </h1>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-[#7a6637]">
              Quest Giver: {quest.npc}
            </p>

            <div className="mb-5 border-y border-[#7a6637]/40 py-3">
              <p className="text-[17px] italic leading-relaxed" style={{ color: '#3d3018' }}>
                {quest.flavor}
              </p>
            </div>

            {/* Reward strip */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Star, label: 'XP Reward', value: `${quest.xp} XP`, color: 'text-[#a97a1d]' },
                { icon: Sparkles, label: 'Buff', value: quest.buffs, color: 'text-[#4a6b8a]' },
                { icon: Gift, label: 'Loot Drop', value: quest.loot, color: 'text-[#7e241f]' },
              ].map((r) => (
                <div key={r.label} className="border border-[#7a6637]/50 bg-[#7a6637]/10 p-3">
                  <div className={`mb-1 flex items-center gap-1.5 font-display text-[9px] uppercase tracking-[0.2em] ${r.color}`}>
                    <r.icon size={11} /> {r.label}
                  </div>
                  <div className="text-sm font-semibold text-[#33291a]">
                    {r.label === 'XP Reward' ? (
                      <motion.span
                        key={quest.xp}
                        initial={{ scale: 1.3, color: '#a97a1d' }}
                        animate={{ scale: 1, color: '#33291a' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="inline-block origin-left"
                      >
                        {r.value}
                      </motion.span>
                    ) : (
                      r.value
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <CompletionBar pct={pct} />
            </div>

            {/* Stages */}
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] text-[#5c4a26]">
              <ListChecks size={15} /> Stage System
            </h2>
            <ol className="mb-6 space-y-0">
              {quest.stages.map((stage, i) => (
                <StageRow
                  key={stage.id}
                  q={quest}
                  stage={stage}
                  index={i}
                  st={quest.stageState[i]}
                  onToggle={onToggleStage}
                  onCount={onSetCount}
                  onEdit={onEditStage}
                  onRemove={onRemoveStage}
                  editable={editable}
                />
              ))}
            </ol>

            {editable && (
              <button
                onClick={onAddStage}
                className="mb-6 flex items-center gap-1.5 border border-[#7a6637]/60 bg-[#7a6637]/10 px-3 py-2 font-display text-[11px] uppercase tracking-[0.15em] text-[#5c4a26] transition hover:bg-[#7a6637]/25 hover:text-[#33291a]"
              >
                <Plus size={13} /> Add Stage
              </button>
            )}

            {/* Win conditions */}
            <h2 className="mb-2 flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] text-[#5c4a26]">
              <ShieldCheck size={15} /> Win Conditions
            </h2>
            <ul className="mb-2 space-y-1.5">
              {quest.winConditions.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] text-[#3d3018]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a97a1d]" />
                  {w}
                </li>
              ))}
            </ul>

            {quest.meta?.details && (
              <>
                <h2 className="mb-2 mt-5 flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] text-[#5c4a26]">
                  <Scroll size={14} /> Quest Notes
                </h2>
                <p className="whitespace-pre-wrap border border-[#7a6637]/40 bg-[#7a6637]/8 p-3 text-[15px] text-[#3d3018]">
                  {quest.meta.details}
                </p>
              </>
            )}
          </div>
        </motion.article>

        {/* ===== Right rail ===== */}
        <aside className="space-y-4">
          {/* Turn-in panel */}
          <div className="panel p-5">
            <CompletionBar pct={pct} />
            <div className="mt-4">
              {missed ? (
                <div className="border border-blood-500 bg-blood-600/15 p-3 text-center">
                  <Hourglass size={22} className="mx-auto mb-1 text-blood-500" />
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-blood-500">
                    Bounty Expired
                  </p>
                  <p className="mt-1 text-sm text-parch-400">
                    The day ended before this bounty was turned in — no XP. Filed in the journal
                    as a missed deed.
                  </p>
                </div>
              ) : done ? (
                <div className="border border-moss-600 bg-moss-600/15 p-3 text-center">
                  <Trophy size={22} className="mx-auto mb-1 text-moss-500" />
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-moss-500">
                    Quest Complete
                  </p>
                  <p className="mt-1 text-sm text-parch-400">
                    Turned in {new Date(quest.completedAt).toLocaleDateString()} · +{quest.xp} XP
                  </p>
                </div>
              ) : (
                <motion.button
                  onClick={onTurnIn}
                  disabled={!allDone}
                  whileHover={allDone ? { scale: 1.02 } : {}}
                  whileTap={allDone ? { scale: 0.97 } : {}}
                  className={`btn-rpg flex w-full items-center justify-center gap-2 px-4 py-3 text-xs ${
                    allDone ? '' : 'cursor-not-allowed opacity-40 grayscale'
                  }`}
                >
                  <Trophy size={15} /> Turn In Quest
                </motion.button>
              )}
              {!missed && !done && !allDone && (
                <p className="mt-2 text-center text-[11px] text-parch-600">
                  Clear every stage to turn in this quest.
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="panel p-5">
            <h3 className="mb-3 font-display text-[11px] uppercase tracking-[0.25em] text-gold-400">
              Quest Sheet
            </h3>
            <dl className="space-y-2.5 text-sm">
              {[
                ['Type', quest.type],
                ['Rec. Level', quest.level],
                ['XP Reward', `${quest.xp} XP`],
                ['Effort', effortLabel(quest)],
                ['Stages', `${quest.stageState.filter((s) => s.done).length} / ${quest.stages.length} cleared`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink-600 pb-1.5">
                  <dt className="font-display text-[10px] uppercase tracking-[0.15em] text-parch-600">{k}</dt>
                  <dd className="text-right text-parch-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Export */}
          <div className="panel p-5">
            <h3 className="mb-3 font-display text-[11px] uppercase tracking-[0.25em] text-gold-400">
              Export
            </h3>
            <div className="space-y-2">
              <button onClick={onExportMd} className="btn-ghost flex w-full items-center gap-2 px-3 py-2.5 text-[11px]">
                <FileText size={14} /> Download Markdown
              </button>
              <button onClick={onPrint} className="btn-ghost flex w-full items-center gap-2 px-3 py-2.5 text-[11px]">
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-parch-600">
              The printed sheet is a clean notebook template — stages as checkboxes, ruled note
              space, no dark theme.
            </p>
          </div>

          {editable && (
            <button
              onClick={onAbandon}
              className="btn-ghost flex w-full items-center justify-center gap-2 px-3 py-2.5 text-[11px] hover:border-blood-500 hover:text-blood-500"
            >
              <RotateCcw size={13} /> Abandon Quest
            </button>
          )}
        </aside>
      </div>

      {/* Hidden print-only sheet */}
      <PrintSheet quest={quest} player={player} />
    </div>
  );
}

/* ---- printable notebook template ---- */

function PrintSheet({ quest, player }) {
  const totalMins = quest.stages.reduce((a, s) => a + (s.minutes || 0), 0);
  const totalQ = quest.stages.reduce((a, s) => a + (s.target || 0), 0);
  return (
    <section className="print-sheet hidden" aria-hidden="true">
      <div style={{ fontFamily: 'Georgia, serif', color: '#000', padding: '18mm 16mm' }}>
        <div style={{ borderBottom: '3px double #000', paddingBottom: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Wynncraft Questmaster · Quest Sheet
          </div>
          <h1 style={{ fontSize: 26, margin: '6px 0 2px' }}>{quest.title}</h1>
          <div style={{ fontSize: 12 }}>
            {quest.type} · Rec. Level {quest.level} · {quest.xp} XP · Giver: {quest.npc}
            {totalMins ? ` · ~${totalMins} min` : ''}
            {totalQ ? ` · ${totalQ} questions` : ''}
          </div>
        </div>

        <p style={{ fontSize: 13, fontStyle: 'italic', margin: '10px 0' }}>{quest.flavor}</p>

        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '14px 0 6px' }}>
          Stages
        </h2>
        <ol style={{ paddingLeft: 20, fontSize: 13 }}>
          {quest.stages.map((s, i) => (
            <li key={s.id} style={{ marginBottom: 6 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '1.5px solid #000', marginRight: 8, verticalAlign: 'middle' }} />
              <strong>{s.title}</strong>
              {s.minutes != null ? `  [ ${s.minutes} min ]` : ''}
              {s.target != null ? `  [ 0 / ${s.target} ${s.unit || ''} ]` : ''}
            </li>
          ))}
        </ol>

        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '14px 0 6px' }}>
          Win Conditions
        </h2>
        <ul style={{ paddingLeft: 20, fontSize: 13 }}>
          {quest.winConditions.map((w, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{w}</li>
          ))}
        </ul>

        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '14px 0 6px' }}>
          Notes
        </h2>
        {quest.meta?.details && <p style={{ fontSize: 13, margin: '0 0 6px' }}>{quest.meta.details}</p>}
        <div style={{ borderTop: '1px solid #999' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ borderBottom: '1px solid #999', height: 26 }} />
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
          <span>Adventurer: ______________________</span>
          <span>{player ? `${player.title} · Lv ${player.level}` : ''}</span>
          <span>Date: ______________</span>
        </div>
      </div>
    </section>
  );
}
