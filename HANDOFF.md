# Handoff — Minnesota Portage

**Date:** 2026-07-20  
**Repo path:** `/Users/admin/Minnesota Trail`  
**Live:** https://lakeelmo.github.io/minnesota-portage/  
**GitHub:** https://github.com/lakeelmo/minnesota-portage (`lakeelmo`)  
**Local play:** `python3 -m http.server 8080` → http://localhost:8080  
**Branch:** `main` @ `fbe21ce` (pushed to `origin/main`)  
**Save key:** `minnesota-portage-v5` — clear `localStorage` if an old save fights you.

---

## Product

Educational kid game (ages ~9–11) about Minnesota Indigenous / pre-settler history along the **St. Croix valley**. Vanilla ES-module SPA, no build step, GitHub Pages–ready. Brand: **Minnesota Portage** (was Minnesota Trail Fun Fun).

Quest framing: carry a birchbark **Story Bundle**, gather **Story Stones**, reach the **Council of Stories**. A portage = canoe over land *and* carrying living knowledge.

---

## User intent (north star)

1. Interactive **map as the game** — choose routes, strategy, not a scrolling document.
2. **Single phone/tablet window, no page scrolling** (`100dvh`, `overflow:hidden` on `html/body/#app`).
3. Art: classic American river-adventure **ink + light watercolor** book plates. Interpret technique only — **never** racist caricature.
4. Per-stop illustrations; sensitive depictions of pre-settlement Dakota/Ojibwe life.
5. Playable characters rooted in St. Croix valley peoples (currently **fictional youth** tied to real places/nations — user once asked for “actual people”; clarify before inventing named historical figures).
6. Fun and engaging for kids: quizzes must not always be answer A; map should involve following migratory animals and dodging predators; minigames must fit the frame without scrolling.

---

## What’s done (published)

### Shell + map
- Fixed device frame; trail is map-first with HUD + SVG graph + dock (Bag / Rest / Exit).
- Encounters = bottom sheets; bag = modal.
- **2-hop paddle range** (`paddleRange: 2`): glowing destinations include nodes 1–2 hops ahead.
- A **2-hop path skips** the intermediate stop (strategic dodge tradeoff).
- **Mobile predators** (`state.predators`) move up to 2 hops toward the player after each paddle; landing on one → foe fight.
- **Migratory herds** (`state.migrators` — deer 🦌, geese 🪿) drift routes; landing on one → food + score + chance of animal friend.
- Legacy static `foeNodes` on branch pairs still exist alongside mobile predators.
- Coach toast: `Up to 2 hops · follow 🦌 · dodge 🐺`

### Quizzes
- Choices are **shuffled** at encounter time via `shuffleChoices()` in `js/data.js` (stop quizzes + campfire trivia + math already shuffled). Correct answer is **not** always index 0.
- Encounter stores `choices` + `answer`; companion “cross out 2” uses those.

### Minigames
- **Manoomin rice** = whack-a-mole (`createRiceGame` / `tickRiceGame` / `catchRicePod` in `js/minigames.js`): golden 🌾 flash then fade; tap ripe, leave 🌱; timed; interval driven from `js/main.js`.
- Dig / memory / Oregon Trail–style arcade (`js/arcade.js`) still present.
- Sheets tightened for no-scroll: compact story clamp, smaller stop art / dig / memory / rice grids, arcade `max-height ~32vh`. Minigames omit large stop art + long learn box in the sheet body.

### Art
- JPEG plates in git (~14MB total): `map-st-croix.jpg`, `char-*.jpg` (8 IDs), `stop-*.jpg` matching `data.js`.
- Local untracked leftover PNGs (experimental names / duplicates) — safe to delete; not required for the game.

### Characters (8)

| id | Name | Nation | Home |
|----|------|--------|------|
| makoons | Makoons | Ojibwe | Upper St. Croix lakes |
| waase | Waase | Ojibwe | Namekagon River |
| ziigwan | Ziigwan | Ojibwe | Yellow Lake |
| migizi | Migizi | Ojibwe | Falls of the St. Croix |
| wiyaka | Wíyaka | Dakota | St. Croix–Mississippi confluence |
| cetan | Čhetáŋ | Dakota | Kaphóža / lower St. Croix |
| tasina | Tašína | Dakota | St. Croix prairie edge |
| rivercloud | River Cloud | Dakota | St. Croix river bluffs |

---

## Key files

| Path | Role |
|------|------|
| `js/main.js` | Screens, `mapTravel`, bag, rice tick interval, arcade mount |
| `js/ui.js` | Title, map SVG (predators/herds), trail shell, encounter sheets |
| `js/game.js` | Encounters, `pathToStop` / `mapTravel`, predator & migrator turns, quiz shuffle wiring |
| `js/data.js` | Stops graph, `shuffleChoices`, `spawnPredators`, `spawnMigrators`, items |
| `js/minigames.js` | Dig, memory, **rice mole** |
| `js/arcade.js` | Hunt / portage / forage / trap / rapids canvases |
| `js/characters.js` | Cast + portraits (`assets/char-{id}.jpg`) |
| `js/state.js` | Run model, save `minnesota-portage-v5` |
| `js/quest.js` | Quest copy (mentions 2-hop + wildlife) |
| `js/audio.js` | Pronunciation (Web Speech) |
| `css/main.css` | Device shell + map + sheet + mole styles |
| `assets/` | Map, stop, character JPEGs |

---

## How play should feel

1. Begin → crew/difficulty → pick traveler → intro sheet → Lift the Bundle.
2. Quiz at Water Roads (shuffled answers) → Story Stone → map.
3. Tap a glowing stop (1 or 2 hops). Predators then move 2; herds drift.
4. Follow herds for snacks; get caught by a predator → foe math/scare/toll.
5. At Manoomin: tap flashing ripe rice before it fades.
6. Branch routes still matter; reach Council of Stories.

---

## Known gaps / good next work

1. **Sheet internal scroll** — page scroll is off, but some encounter sheets (esp. arcade + long quizzes) may still scroll *inside* `.sheet-body`. Tighten further if kids hit it on real phones.
2. **Arcade on touch** — keyboard-heavy; consider on-screen controls for tablets.
3. **2-hop skip UX** — confirm skip toast/copy is clear so kids know they skipped a Story Stone stop on purpose.
4. **Predator feel** — tune spawn dens / chase so beginner isn’t unfair; hard stays spicy.
5. **Delete local junk PNGs** under `assets/` (untracked) to declutter.
6. **Optional:** named historical figures only with careful research; don’t invent sacred personhood.
7. **Playtest full path** on a real phone (iOS Safari): title → finale, rice mole, 2-hop dodge, bag/rest.

---

## Cultural / design constraints

- Dakota & Ojibwe = living cultures; dig = practice only; sacred sites look-don’t-touch.
- Avoid purple/cream AI clichés; avoid racist “Huck Finn” caricature tropes.
- Keep ES modules / static Pages hosting.

---

## Commands

```bash
cd "/Users/admin/Minnesota Trail"
python3 -m http.server 8080
# Hard refresh; clear localStorage key minnesota-portage-v5 if needed
```

---

## Suggested first message for the new agent

> Read `HANDOFF.md`. Minnesota Portage is live at https://lakeelmo.github.io/minnesota-portage/ (`main` @ fbe21ce). Playtest the 2-hop map chase (predators + migratory herds), shuffled quizzes, and rice whack-a-mole on a phone viewport; fix any remaining in-sheet scrolling or unfair predator pacing; then commit/push when I ask.
