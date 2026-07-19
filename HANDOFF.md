# Handoff — Minnesota Portage (map-game + art restyle)

**Date:** 2026-07-19  
**Repo path:** `/Users/admin/Minnesota Trail`  
**Live (older published build):** https://lakeelmo.github.io/minnesota-portage/  
**GitHub:** https://github.com/lakeelmo/minnesota-portage  
**Local play:** `python3 -m http.server 8080` → http://localhost:8080  
**Branch:** `main` (tracks `origin/main`). **Many uncommitted local changes** — do not assume Pages has the map-game rev yet.

---

## User intent (north star)

1. **Interactive map game** — click your path, avoid enemies, feel like a real game (not a scrolling document).
2. **Single window, phone/tablet** — **no page scrolling**; everything fits in one viewport.
3. **Art style:** classic American river-adventure **pen-and-ink book plates** (Huckleberry Finn–era illustration *aesthetic*), with **light watercolor wash** on cream paper.  
   - **Do NOT** copy racist caricature from historical Huck Finn plates. Respectful, accurate Indigenous depiction only.
4. **Each stop/challenge** has its own illustration; culturally careful pre-settlement Minnesota (esp. **St. Croix valley** Dakota & Ojibwe).
5. **Playable characters** grounded in St. Croix valley peoples/places (user asked for “actual people”; current design uses **fictional youth rooted in real places/nations**, not sacred figures — see Characters).
6. Educational, interactive, ages ~9–11.

---

## What is already done (local, uncommitted)

### Gameplay / UI
**Status:** Map shell marked **FINISHED** by [Finish no-scroll map shell](e6283f7c-1b11-4ef2-b97b-8dfa27f682db) (2026-07-19). Still smoke-test on a real phone viewport before calling the loop done.

- Fixed **device shell**: `#app` max-width ~480–520px, `100dvh`, `html/body` `overflow: hidden` (`css/main.css`).
- **Map-first trail screen** (`js/ui.js` `renderTrail`):
  - Compact HUD
  - Full `map-stage` with SVG nodes/edges
  - Dock: Bag / Rest / Exit
  - Encounters as **bottom-sheet overlay** (not a long scroll stack)
  - Bag as modal
- **Click-to-travel graph** (`js/game.js`):
  - `canTravelTo`, `mapTravel`, `reachableStops`
  - Stops have `x`, `y`, `links[]` (forward-only)
  - `BRANCH_PAIRS` + `foeNodes` so player can pick a branch to avoid a foe token
- Save key: `minnesota-portage-v4` (`js/state.js`)
- Quest copy: St. Croix Great Portage (`js/quest.js`)
- Pronunciation audio chips still exist (`js/audio.js`)

### Content
- Stops rewritten around **St. Croix valley** water roads (`js/data.js` `TRAIL_STOPS`) with `art:` paths.
- Characters rewritten to 8 St. Croix valley youth (`js/characters.js`).

### Art assets (local `assets/`)
Ink/watercolor-ish plates generated and aliased to data IDs:

| Role | Files |
|------|--------|
| Map BG | `map-st-croix.png` (also copied → `trail-map-bg.png`) |
| Stops | `stop-water-roads.png`, `stop-glacial-lakes.png`, `stop-maple-sugaring.png`, `stop-manoomin.png`, `stop-portage-carry.png`, `stop-pictographs.png`, `stop-hunt-forage.png`, `stop-pipestone.png`, `stop-bdote.png`, `stop-fur-trade.png`, `stop-dig-site.png`, `stop-headwaters.png`, `stop-finale.png` (+ duplicates with shorter names) |
| Chars | `char-makoons.png`, `char-waase.png`, plus others (`char-ziigwan`, `migizi`, `wiyaka`, `cetan`, `tasina`, `rivercloud`, and older experimental names) |

**Art consistency problem:** some portraits are true ink+wash; others are leftover modern/AI styles. User wants **one consistent ink + watercolor style** across all characters and stops.

---

## Characters (current IDs — keep unless extended carefully)

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

**Note for next agent:** User asked for “actual people.” Current set is **fictional kids with real cultural/place grounding**. If replacing with named historical figures, research carefully (St. Croix Dakota/Ojibwe), avoid sacred persons, keep age-appropriate, and keep living-culture framing. Prefer consulting NPS St. Croix / tribal education sources.

---

## Key files

| File | Role |
|------|------|
| `js/ui.js` | Title, setup, **map UI**, overlays, bag |
| `js/game.js` | Encounters, **mapTravel**, foes on nodes |
| `js/data.js` | Stops graph, branch pairs, items |
| `js/characters.js` | Playable cast + doodle fallback SVG |
| `js/main.js` | Screens, `mapTravel` / bag handlers |
| `js/state.js` | Run model, `minnesota-portage-v4` |
| `js/quest.js` | Quest copy |
| `css/main.css` | Device shell + trail/map/overlay styles (**may have some duplicate blocks** — clean if needed) |
| `assets/*` | Map, stop, character art |

---

## Known gaps / next work (priority order)

1. ~~Unify all art~~ — 8 playable portraits now ink+watercolor (ziigwan/wiyaka/tasina/rivercloud regenerated 2026-07-19).
2. ~~Polish map readability~~ — stronger edges/nodes/glow; duplicate CSS shell removed.
3. ~~Smoke-test loop~~ — verified Begin → setup → traveler → intro → quiz → map travel → branch (foe markers visible) → stop art in sheets. `overflow:hidden`, no page scroll.
4. **Commit + push + Pages** when ready (local still ahead of published SPA until push).
5. Optional: trim unused legacy `assets/char-*.png` outfit/old-name portraits to shrink the repo.
6. Optional: if user wants named historical figures instead of fictional valley youth, research carefully.

---

## How the map game is supposed to work

1. After intro (“Lift the Bundle”), player sees St. Croix map.
2. **Glowing** nodes = adjacent `links` from current stop (`reachableStops`).
3. Tap a glowing node → `mapTravel` → energy/hunger → arrive → encounter sheet.
4. Some branch nodes carry **foe** tokens (`foeNodes`); picking the other branch avoids them.
5. Bag/Rest/Exit in bottom dock when no encounter is open.

---

## Commands

```bash
cd "/Users/admin/Minnesota Trail"
python3 -m http.server 8080
# Hard refresh browser; clear localStorage if old save breaks (key: minnesota-portage-v4)

# gh (if needed):
# /Users/admin/Projects/wwi-letters/.tools/bin/gh
```

---

## Do not regress

- Respectful Dakota/Ojibwe framing; dig is **practice** only; Bdote/Pipestone treated with care.
- Kid doodle SVG remains as fallback when portrait missing; outfits still layer on SVG.
- Keep ES modules / static hosting (GitHub Pages).

---

## Suggested first message for the new agent

> Read `HANDOFF.md`. Continue Minnesota Portage: unify ink+watercolor art for all 8 characters + stop plates, smoke-test the no-scroll map travel loop on a phone-sized viewport, fix any broken dismiss/travel wiring, then commit and redeploy to GitHub Pages when I ask.
