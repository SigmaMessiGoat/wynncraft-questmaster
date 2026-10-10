# Wynncraft Questmaster

A gamified life & study task manager styled after MMORPG quest logs. Turn "Study Math",
"Football Training" or "Clean Room" into a full Wynncraft-style quest with lore, stages,
XP, buffs and loot — then tick the stages off and turn the quest in.

## Run it

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # production bundle in dist/
npm test         # unit tests for the quest generator + level curve
```

## Stack

React 18 · Tailwind CSS v4 · Framer Motion · Lucide React · Vite — no backend, everything
persists to `localStorage` under `wynncraft-questmaster:v1`.

## Features

- **AI quest generation (simulated)** — [src/lib/generator.js](src/lib/generator.js) detects a
  task's category (study / sport / fitness / chores / creative / work / errand), then returns an
  RPG quest title, NPC flavour text, recommended level, quest type, a stage system, XP, buff,
  loot drop and win conditions. Count-based tasks ("25 questions") get burst stages with
  `[ 0 / 25 ]` sub-trackers; duration-based tasks get timed stages scaled to the requested
  length. Pure and deterministic per input — covered by [generator.test.js](src/lib/generator.test.js).
- **Quest Board dashboard** — active quests, recently turned-in quests, total XP, player level
  with a segmented XP bar, and per-quest progress.
- **Grimoire quest detail** — parchment quest-log page with stage checkboxes, interactive
  counters, a segmented Quest Completion / HP bar, win conditions and quest notes.
- **Turn-in ceremony** — synthesized WebAudio fanfare (no audio assets), Framer Motion particle
  burst, XP award, level-up popup, and the quest is archived to the Completed Quest Journal.
- **Export** — clean Markdown download per quest or for the whole journal, plus a print/PDF
  notebook template (black-on-white checkboxes, ruled note lines; the dark app is hidden in
  print media).

## Layout

```
src/
  App.jsx                  state, routing, persistence, turn-in flow
  components/              Header, QuestBoard, NewQuestForm, QuestDetail,
                           Journal, Celebration (victory + level-up), typeMeta
  lib/                     generator, player (XP curve), storage, sound, exporters
```
