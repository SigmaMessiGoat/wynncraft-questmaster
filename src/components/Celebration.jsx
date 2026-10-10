import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronUp, Sparkles } from 'lucide-react';

/* ---------- victory particles ---------- */

const PARTICLE_COLORS = ['#e3b654', '#f3dd9d', '#cf9b2e', '#6d9c3f', '#4a90b8', '#fdf4dc'];

function Particles({ count = 70 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 900,
        y: (Math.random() - 0.5) * 620,
        r: Math.random() * 360 + 90,
        s: 4 + Math.random() * 7,
        d: Math.random() * 0.5,
        c: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        shape: Math.random() > 0.6 ? 'star' : 'rect',
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: b.x, y: b.y, opacity: [1, 1, 0], scale: [0.4, 1.1, 0.8], rotate: b.r }}
          transition={{ duration: 2.4, delay: b.d, ease: [0.16, 0.8, 0.36, 1] }}
          className="absolute left-1/2 top-1/2 block"
          style={{
            width: b.s,
            height: b.s,
            background: b.c,
            borderRadius: b.shape === 'star' ? '2px' : '50%',
            boxShadow: `0 0 8px ${b.c}`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- victory banner ---------- */

export function VictoryOverlay({ quest, xpGained, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!quest) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <Particles />
      <motion.div
        initial={{ scale: 0.6, y: 40, rotateX: 25 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="panel relative w-full max-w-lg p-8 text-center"
        style={{ boxShadow: '0 0 70px rgba(207,155,46,0.35), 0 20px 50px rgba(0,0,0,0.7)' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 12 }}
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border-2 border-gold-500 bg-gold-600/15"
        >
          <Trophy size={38} className="text-gold-400" />
        </motion.div>

        <h2 className="pixel mb-2 text-sm text-gold-300">QUEST COMPLETE!</h2>
        <p className="mb-1 font-display text-2xl font-extrabold text-parch-50">{quest.title}</p>
        <p className="mb-5 text-sm italic text-parch-400">“{quest.flavor.slice(0, 90)}…”</p>

        <div className="rule-ornate mb-4 font-display text-[10px] uppercase tracking-[0.3em]">Rewards</div>

        <div className="mb-6 flex items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 14 }}
          >
            <div className="flex items-center gap-1.5 text-gold-400">
              <Star size={18} fill="currentColor" />
              <span className="pixel text-base">+{xpGained}</span>
            </div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">XP</div>
          </motion.div>
          <div className="h-8 w-px bg-ink-600" />
          <div>
            <div className="font-display text-sm text-parch-100">{quest.buffs}</div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">Buff Gained</div>
          </div>
          <div className="h-8 w-px bg-ink-600" />
          <div>
            <div className="font-display text-sm text-parch-100">{quest.loot}</div>
            <div className="font-display text-[9px] uppercase tracking-[0.2em] text-parch-600">Loot Drop</div>
          </div>
        </div>

        <button onClick={onClose} className="btn-rpg px-6 py-3 text-xs">
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------- level-up popup ---------- */

export function LevelUpOverlay({ level, title, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center px-4"
    >
      <Particles count={50} />
      <motion.div
        initial={{ scale: 0.4, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: -30 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        onClick={onClose}
        className="pointer-events-auto cursor-pointer border-2 border-gold-500 bg-ink-900/95 px-10 py-7 text-center"
        style={{ boxShadow: '0 0 60px rgba(227,182,84,0.5)' }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="mx-auto mb-3 grid h-12 w-12 place-items-center"
        >
          <ChevronUp size={34} className="text-gold-400" />
        </motion.div>
        <div className="pixel mb-3 text-[11px] tracking-widest text-gold-300">LEVEL UP!</div>
        <div className="flex items-center justify-center gap-3">
          <span className="pixel text-2xl text-parch-50">{level - 1}</span>
          <Sparkles size={20} className="text-gold-400" />
          <motion.span
            initial={{ scale: 2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="pixel text-3xl text-gold-400"
          >
            {level}
          </motion.span>
        </div>
        <div className="mt-3 font-display text-sm uppercase tracking-[0.25em] text-parch-200">
          {title}
        </div>
        <div className="mt-1 text-xs text-parch-600">click to dismiss</div>
      </motion.div>
    </motion.div>
  );
}
