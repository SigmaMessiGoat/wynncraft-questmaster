import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowLeft, Clock, ListOrdered, StickyNote, Feather, Loader2 } from 'lucide-react';
import { generateQuest, QUEST_TYPES } from '../lib/generator.js';

const CHANNEL_LINES = [
  'Consulting the Archivists…',
  'Transmuting your task into lore…',
  'Forging stages and win conditions…',
  'Balancing XP rewards…',
  'Sealing the quest scroll…',
];

export default function NewQuestForm({ onCreate, onCancel }) {
  const [form, setForm] = useState({ name: '', duration: '', count: '', details: '', type: '' });
  const [error, setError] = useState('');
  const [channeling, setChanneling] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const timers = useRef([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || channeling) return;
    setError('');
    setChanneling(true);
    setLineIdx(0);

    CHANNEL_LINES.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(setTimeout(() => setLineIdx(i), i * 380));
    });

    // Simulated AI latency — feels like a remote quest-giver responding.
    timers.current.push(
      setTimeout(() => {
        try {
          const quest = generateQuest(form);
          if (form.type && QUEST_TYPES.includes(form.type)) quest.type = form.type;
          onCreate(quest);
        } catch (err) {
          setError(err.message);
          setChanneling(false);
        }
      }, CHANNEL_LINES.length * 380 + 250),
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onCancel} className="btn-ghost mb-6 inline-flex items-center gap-1.5 px-3 py-2 text-[11px]">
        <ArrowLeft size={13} /> Back to board
      </button>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 sm:p-8">
        <div className="rule-ornate mb-3 font-display text-[10px] uppercase tracking-[0.4em]">
          Quest Registration
        </div>
        <h1 className="mb-1 font-display text-3xl font-extrabold text-parch-50 text-shadow-gold">
          Post a New Quest
        </h1>
        <p className="mb-7 text-parch-400">
          Give the Questmaster a raw task — he will spin it into a full RPG quest with flavour
          text, stages, XP and loot.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="q-name" className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold-400">
              <Feather size={12} /> Task Name <span className="text-blood-500">*</span>
            </label>
            <input
              id="q-name"
              className="field"
              placeholder="e.g. Study Math, Football Training, Clean Room"
              value={form.name}
              onChange={set('name')}
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="q-dur" className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold-400">
                <Clock size={12} /> Duration <span className="font-body text-[10px] normal-case tracking-normal text-parch-600">(optional)</span>
              </label>
              <input
                id="q-dur"
                className="field"
                placeholder="e.g. 45 mins / 2 hours"
                value={form.duration}
                onChange={set('duration')}
                maxLength={30}
              />
            </div>
            <div>
              <label htmlFor="q-count" className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold-400">
                <ListOrdered size={12} /> Question Count <span className="font-body text-[10px] normal-case tracking-normal text-parch-600">(optional)</span>
              </label>
              <input
                id="q-count"
                className="field"
                placeholder="e.g. 25 questions"
                value={form.count}
                onChange={set('count')}
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <label htmlFor="q-details" className="mb-1.5 flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold-400">
              <StickyNote size={12} /> Details / Notes <span className="font-body text-[10px] normal-case tracking-normal text-parch-600">(optional)</span>
            </label>
            <textarea
              id="q-details"
              className="field min-h-[88px] resize-y"
              placeholder="e.g. Algebra chapter 4, focus on simultaneous equations, past paper 2"
              value={form.details}
              onChange={set('details')}
              maxLength={400}
            />
          </div>

          <div>
            <span className="mb-1.5 block font-display text-[11px] uppercase tracking-[0.2em] text-gold-400">
              Quest Type Override
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: '' }))}
                className={`px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.15em] transition ${
                  form.type === '' ? 'border border-gold-500 bg-gold-600/20 text-gold-200' : 'btn-ghost'
                }`}
              >
                Auto
              </button>
              {QUEST_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.15em] transition ${
                    form.type === t ? 'border border-gold-500 bg-gold-600/20 text-gold-200' : 'btn-ghost'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="border border-blood-500 bg-blood-600/20 px-3 py-2 text-sm text-parch-100">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={channeling} className="btn-rpg flex items-center gap-2 px-5 py-3 text-xs disabled:opacity-60">
              {channeling ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {channeling ? 'Channeling…' : 'Generate Quest'}
            </button>
            <button type="button" onClick={onCancel} className="btn-ghost px-4 py-3 text-xs">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

      {/* Channeling overlay */}
      <AnimatePresence>
        {channeling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/85 backdrop-blur-[2px]"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-gold-600/60"
                style={{ boxShadow: '0 0 40px rgba(207,155,46,0.35), inset 0 0 24px rgba(207,155,46,0.2)' }}
              >
                <Wand2 size={30} className="text-gold-400" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={lineIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="font-display text-sm tracking-[0.25em] text-gold-300 uppercase"
                >
                  {CHANNEL_LINES[lineIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="mx-auto mt-5 h-1.5 w-56 overflow-hidden border border-ink-600 bg-ink-950">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-700 to-gold-300"
                  initial={{ width: '5%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: CHANNEL_LINES.length * 0.38 + 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
