import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Volume2, VolumeX, ScrollText } from 'lucide-react';
import { rankTitle } from '../lib/player.js';

export default function Header({ player, xp, onJournal, sound, toggleSound, onHome }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-950/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <button
          onClick={onHome}
          className="group flex items-center gap-2.5 text-left"
          title="Back to the Quest Board"
        >
          <span className="grid h-9 w-9 place-items-center border border-gold-600 bg-ink-800 text-gold-400 shadow-[inset_0_0_12px_rgba(207,155,46,0.25)]">
            <Swords size={18} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-base font-extrabold tracking-[0.18em] text-gold-200 text-shadow-gold">
              WYNNCRAFT
            </span>
            <span className="block font-display text-[10px] tracking-[0.42em] text-gold-600">
              QUESTMASTER
            </span>
          </span>
        </button>

        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <div className="flex h-8 shrink-0 items-center gap-2 border border-gold-700 bg-ink-800 px-2.5">
            <span className="pixel text-[9px] text-gold-400">LV</span>
            <motion.span
              key={player.level}
              initial={{ scale: 1.6, color: '#fdf4dc' }}
              animate={{ scale: 1, color: '#e3b654' }}
              className="pixel text-[11px] text-gold-400"
            >
              {player.level}
            </motion.span>
          </div>
          <div className="grow">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-parch-400">
                {rankTitle(player.level)}
              </span>
              <span className="pixel text-[8px] text-gold-500">
                {player.intoLevel}/{player.need} XP
              </span>
            </div>
            <div
              className="h-3 border border-ink-600 bg-ink-950 p-[2px]"
              role="progressbar"
              aria-valuenow={player.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Level progress"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-gold-700 via-gold-500 to-gold-200"
                initial={false}
                animate={{ width: `${player.pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                style={{ boxShadow: '0 0 10px rgba(227,182,84,0.55)' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onJournal} className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-[11px]" title="Completed Quest Journal">
            <ScrollText size={14} />
            <span className="hidden sm:inline">Journal</span>
          </button>
          <button
            onClick={toggleSound}
            className="btn-ghost grid h-9 w-9 place-items-center"
            title={sound ? 'Mute sound' : 'Unmute sound'}
            aria-pressed={sound}
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gold-700 to-transparent" />
    </header>
  );
}
