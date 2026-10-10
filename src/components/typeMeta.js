import { Swords, Sparkles, CalendarCheck, BookOpen } from 'lucide-react';

/** Shared quest-type presentation (cards + grimoire chips). */
export const TYPE_CHIP = {
  'Main Quest': {
    icon: Swords,
    solid: 'bg-gold-600/20 text-gold-200 border-gold-700',
    chip: 'bg-gold-600/20 text-gold-200 border-gold-700',
  },
  'Skill Quest': {
    icon: Sparkles,
    solid: 'bg-mana-500/20 text-[#2f6d8f] border-mana-500/50',
    chip: 'bg-mana-500/15 text-mana-500 border-mana-500/40',
  },
  'Daily Bounty': {
    icon: CalendarCheck,
    solid: 'bg-moss-500/20 text-[#3d5a1f] border-moss-500/50',
    chip: 'bg-moss-500/15 text-moss-500 border-moss-500/40',
  },
  'Side Quest': {
    icon: BookOpen,
    solid: 'bg-[#7a6637]/15 text-[#5c4a26] border-[#7a6637]/60',
    chip: 'bg-parch-400/10 text-parch-200 border-parch-600/40',
  },
};
