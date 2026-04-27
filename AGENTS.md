# AGENTS Guide

## Project Snapshot
- Single-page React + Vite app for EN<->RU flashcards with two modes: learning and dictionary management.
- Runtime state is fully client-side; persistence uses browser `localStorage` (`cards_dictionary`).
- Existing `README.md` is the default Vite template; treat source files as the canonical behavior docs.

## Architecture and Data Flow
- Entry point: `src/main.jsx` mounts `App` in `StrictMode` and imports `src/index.css` (global styles).
- Orchestrator: `src/App.jsx` owns app state (`words`, `view`, `directionEnRu`, `currentWordIndex`) and switches between learn/manage views.
- Learning UI: `src/FlashCard.jsx` renders current pair, flip animation, and TTS playback via `window.speechSynthesis`.
- Management UI: `src/WordManager.jsx` edits/deletes/adds words and toggles `learned`; `App` passes `words` + `setWords` directly.
- Learn queue is derived, not stored: `learningWords = words.filter(w => !w.learned)` in `App`.

## Data Contracts
- Internal word shape: `{ id: number, en: string, ru: string, learned?: boolean }`.
- Import format (JSON file) is dictionary-style object, e.g. `{ "hello": "привет" }` (`words.json`, `mock-words.json`).
- Import path in `App` converts object entries to array and appends to existing words; no dedupe and no schema migration.
- `learned` may be missing on imported items; code treats missing as false (`!w.learned`, `!!w.learned`).

## Developer Workflows
- Install deps: `npm install`.
- Dev server: `npm run dev`.
- Lint: `npm run lint` (ESLint flat config in `eslint.config.js`; no test runner is configured).
- Production build: `npm run build`; local preview: `npm run preview`.
- GitHub Pages deploy is configured as `npm run deploy` (`gh-pages -d dist`) with `predeploy` build step.

## Project-Specific Conventions
- Keep app logic in `App` and pass minimal props to child components; avoid introducing shared state libraries unless requested.
- Preserve `cards_dictionary` key and import contract to avoid breaking existing users' browser data.
- When changing navigation/index logic, keep `currentWordIndex` bounds reset behavior in sync with filtered `learningWords`.
- UI styling is centralized in `src/index.css`; `src/App.css` is template leftover and currently unused.
- Existing code style in components uses semicolons and double quotes in JSX strings; match local style in edited files.

## Integration Points and Risks
- Browser-only APIs: `localStorage`, `FileReader`, and Speech Synthesis API (`SpeechSynthesisUtterance`). Guard if adding SSR/tests.
- `FlashCard` uses `e.stopPropagation()` on play button so audio clicks do not trigger card flip; preserve this interaction.
- `Date.now()` is used for IDs in add/import flows; avoid assumptions of strict uniqueness across very fast inserts.

