import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import QuestBoard from './components/QuestBoard.jsx';
import NewQuestForm from './components/NewQuestForm.jsx';
import QuestDetail from './components/QuestDetail.jsx';
import Journal from './components/Journal.jsx';
import { VictoryOverlay, LevelUpOverlay } from './components/Celebration.jsx';
import { loadState, saveState, clearState } from './lib/storage.js';
import { levelFromXp, rankTitle } from './lib/player.js';
import { playVictory, playLevelUp, playTick, playStageDone } from './lib/sound.js';
import { questToMarkdown, journalToMarkdown, downloadMarkdown, printQuest } from './lib/exporters.js';
import { computeXp, isExpired } from './lib/generator.js';

const VIEW = { BOARD: 'board', NEW: 'new', QUEST: 'quest', JOURNAL: 'journal' };

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [view, setView] = useState({ name: VIEW.BOARD });
  const [victory, setVictory] = useState(null); // { quest, xpGained }
  const [levelUp, setLevelUp] = useState(null); // { level, title }
  const soundOn = state.sound !== false;

  /* persist */
  useEffect(() => {
    saveState(state);
  }, [state]);

  /* Daily Bounties expire at midnight — sweep on load, then every minute. */
  useEffect(() => {
    const sweep = () => {
      setState((s) => {
        const now = Date.now();
        if (!s.quests.some((q) => isExpired(q, now))) return s;
        return {
          ...s,
          quests: s.quests.map((q) =>
            isExpired(q, now) ? { ...q, status: 'missed', missedAt: now } : q,
          ),
        };
      });
    };
    sweep();
    const timer = setInterval(sweep, 60_000);
    const onVisible = () => document.visibilityState === 'visible' && sweep();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const player = useMemo(() => {
    const p = levelFromXp(state.xp);
    return { ...p, title: rankTitle(p.level) };
  }, [state.xp]);

  const stats = useMemo(() => {
    const stagesDone = state.quests.reduce(
      (a, q) => a + q.stageState.filter((s) => s.done).length, 0,
    );
    const completed = state.quests.filter((q) => q.status === 'completed');
    const totalXp = completed.reduce((a, q) => a + q.xp, 0);
    return { stagesDone, totalXp, completed: completed.length };
  }, [state.quests]);

  const activeQuest = view.name === VIEW.QUEST
    ? state.quests.find((q) => q.id === view.id)
    : null;

  const completed = useMemo(
    () => state.quests.filter((q) => q.status === 'completed'),
    [state.quests],
  );

  /* Journal archives both turned-in and missed quests, newest first. */
  const journalQuests = useMemo(
    () =>
      state.quests
        .filter((q) => q.status === 'completed' || q.status === 'missed')
        .sort(
          (a, b) =>
            (b.completedAt || b.missedAt || b.createdAt) -
            (a.completedAt || a.missedAt || a.createdAt),
        ),
    [state.quests],
  );

  /* ---- navigation ---- */
  const go = useCallback((name, id = null) => {
    setView({ name, id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ---- quest lifecycle ---- */
  const createQuest = useCallback((quest) => {
    setState((s) => ({ ...s, quests: [quest, ...s.quests] }));
    playTick();
    go(VIEW.QUEST, quest.id);
  }, [go]);

  const patchQuest = useCallback((id, fn) => {
    setState((s) => ({
      ...s,
      quests: s.quests.map((q) => (q.id === id ? fn({ ...q }) : q)),
    }));
  }, []);

  const toggleStage = useCallback((questId, stageId) => {
    patchQuest(questId, (q) => {
      const stageState = q.stageState.map((st) => {
        if (st.id !== stageId) return st;
        const stage = q.stages.find((x) => x.id === stageId);
        const done = !st.done;
        // Counted stages snap their counter to full/zero on manual toggle.
        const count = stage.target != null ? (done ? stage.target : 0) : st.count;
        return { ...st, done, count };
      });
      return { ...q, stageState, progress: completedRatio(q, stageState) };
    });
    if (soundOn) playStageDone();
  }, [patchQuest, soundOn]);

  const setStageCount = useCallback((questId, stageId, count) => {
    patchQuest(questId, (q) => {
      const stageState = q.stageState.map((st) => {
        if (st.id !== stageId) return st;
        const stage = q.stages.find((x) => x.id === stageId);
        const c = Math.max(0, Math.min(count, stage.target));
        return { ...st, count: c, done: c >= stage.target };
      });
      return { ...q, stageState, progress: completedRatio(q, stageState) };
    });
    if (soundOn) playTick();
  }, [patchQuest, soundOn]);

  /** Stage edits/adds/removes re-derive XP — the reward follows the work. */
  const withDerivedXp = (q) => ({
    ...q,
    xp: computeXp({ level: q.level, type: q.type, stages: q.stages }),
  });

  const editStage = useCallback((questId, stageId, patch) => {
    patchQuest(questId, (q) => {
      const stages = q.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s));
      const stageState = q.stageState.map((st) => {
        if (st.id !== stageId) return st;
        const stage = stages.find((x) => x.id === stageId);
        if (stage.target == null) return { ...st, count: 0 }; // now timed/unmeasured
        const count = Math.min(st.count || 0, stage.target); // clamp to new target
        return { ...st, count, done: count >= stage.target };
      });
      const next = withDerivedXp({ ...q, stages, stageState });
      return { ...next, progress: completedRatio(next, stageState) };
    });
    if (soundOn) playTick();
  }, [patchQuest, soundOn]);

  const addStage = useCallback((questId) => {
    patchQuest(questId, (q) => {
      let id;
      do {
        id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      } while (q.stages.some((s) => s.id === id));

      const stages = [...q.stages, {
        id,
        order: q.stages.length + 1,
        title: 'New stage — describe the step',
        minutes: 10,
        target: null,
      }];
      const stageState = [...q.stageState, { id, done: false, count: 0 }];
      const next = withDerivedXp({ ...q, stages, stageState });
      return { ...next, progress: completedRatio(next, stageState) };
    });
    if (soundOn) playTick();
  }, [patchQuest, soundOn]);

  const removeStage = useCallback((questId, stageId) => {
    patchQuest(questId, (q) => {
      if (q.stages.length <= 1) return q; // a quest needs at least one stage
      const stages = q.stages
        .filter((s) => s.id !== stageId)
        .map((s, i) => ({ ...s, order: i + 1 }));
      const stageState = q.stageState.filter((st) => st.id !== stageId);
      const next = withDerivedXp({ ...q, stages, stageState });
      return { ...next, progress: completedRatio(next, stageState) };
    });
    if (soundOn) playTick();
  }, [patchQuest, soundOn]);

  const turnIn = useCallback(() => {
    const q = activeQuest;
    if (!q) return;
    const before = levelFromXp(state.xp);
    const afterXp = state.xp + q.xp;
    const after = levelFromXp(afterXp);

    patchQuest(q.id, (qq) => ({ ...qq, status: 'completed', completedAt: Date.now(), progress: 1 }));
    setState((s) => ({ ...s, xp: s.xp + q.xp, turnIns: (s.turnIns || 0) + 1 }));

    if (soundOn) playVictory();
    setVictory({ quest: { ...q, status: 'completed', completedAt: Date.now() }, xpGained: q.xp });

    if (after.level > before.level) {
      setTimeout(() => {
        if (soundOn) playLevelUp();
        setLevelUp({ level: after.level, title: rankTitle(after.level) });
      }, 2600);
    }
  }, [activeQuest, state.xp, patchQuest, soundOn]);

  const abandon = useCallback(() => {
    const q = activeQuest;
    if (!q) return;
    if (!window.confirm(`Abandon "${q.title}"? The scroll will be torn from the board.`)) return;
    setState((s) => ({ ...s, quests: s.quests.filter((x) => x.id !== q.id) }));
    go(VIEW.BOARD);
  }, [activeQuest, go]);

  /* ---- exports ---- */
  const exportQuestMd = useCallback((q) => {
    downloadMarkdown(questToMarkdown(q, player), `${slug(q.title)}.md`);
  }, [player]);

  const exportJournalMd = useCallback(() => {
    downloadMarkdown(journalToMarkdown(journalQuests, { ...player, xp: state.xp }), 'completed-quest-journal.md');
  }, [journalQuests, player, state.xp]);

  /* ---- sound toggle ---- */
  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, sound: s.sound === false }));
  }, []);


  return (
    <div className="min-h-screen">
      <Header
        player={player}
        xp={state.xp}
        sound={soundOn}
        toggleSound={toggleSound}
        onHome={() => go(VIEW.BOARD)}
        onJournal={() => go(VIEW.JOURNAL)}
      />

      <main>
        {view.name === VIEW.BOARD && (
          <QuestBoard
            quests={state.quests}
            stats={{ ...stats, totalXp: state.xp }}
            onOpen={(id) => go(VIEW.QUEST, id)}
            onNew={() => go(VIEW.NEW)}
          />
        )}

        {view.name === VIEW.NEW && (
          <NewQuestForm onCreate={createQuest} onCancel={() => go(VIEW.BOARD)} />
        )}

        {view.name === VIEW.QUEST && activeQuest && (
          <QuestDetail
            quest={activeQuest}
            player={player}
            onBack={() => go(VIEW.BOARD)}
            onToggleStage={(stageId) => toggleStage(activeQuest.id, stageId)}
            onSetCount={(stageId, n) => setStageCount(activeQuest.id, stageId, n)}
            onEditStage={(stageId, patch) => editStage(activeQuest.id, stageId, patch)}
            onAddStage={() => addStage(activeQuest.id)}
            onRemoveStage={(stageId) => removeStage(activeQuest.id, stageId)}
            onTurnIn={turnIn}
            onAbandon={() => abandon()}
            onExportMd={() => exportQuestMd(activeQuest)}
            onPrint={printQuest}
          />
        )}

        {view.name === VIEW.QUEST && !activeQuest && (
          <div className="mx-auto max-w-xl px-4 py-20 text-center">
            <p className="font-display text-lg text-parch-400">This quest has vanished from the board.</p>
            <button onClick={() => go(VIEW.BOARD)} className="btn-rpg mt-4 px-4 py-2.5 text-xs">
              Return
            </button>
          </div>
        )}

        {view.name === VIEW.JOURNAL && (
          <Journal
            quests={journalQuests}
            player={{ ...player, xp: state.xp }}
            onBack={() => go(VIEW.BOARD)}
            onOpen={(id) => go(VIEW.QUEST, id)}
            onExportAll={exportJournalMd}
            onPrint={printQuest}
          />
        )}
      </main>

      <footer className="mt-10 border-t border-ink-700 py-6 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-parch-600">
          Wynncraft Questmaster · a fan-made life &amp; study quest log
        </p>
        <button
          onClick={() => {
            if (window.confirm('Erase ALL quests and XP? This cannot be undone.')) {
              clearState();
              setState(loadState());
              go(VIEW.BOARD);
            }
          }}
          className="mt-2 text-[11px] text-parch-600 underline decoration-dotted hover:text-blood-500"
        >
          Reset all data
        </button>
      </footer>

      <AnimatePresence>
        {victory && (
          <VictoryOverlay
            quest={victory.quest}
            xpGained={victory.xpGained}
            onClose={() => setVictory(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelUp && (
          <LevelUpOverlay
            level={levelUp.level}
            title={levelUp.title}
            onClose={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- helpers ---- */

function completedRatio(q, stageState) {
  if (!stageState.length) return 0;
  const sum = stageState.reduce((a, st) => {
    const stage = q.stages.find((s) => s.id === st.id);
    if (!stage) return a;
    if (stage.target) return a + Math.min(1, (st.count || 0) / stage.target);
    return a + (st.done ? 1 : 0);
  }, 0);
  return sum / stageState.length;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
