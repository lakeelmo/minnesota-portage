# Handoff — Minnesota Portage

**Date:** 2026-07-20  
**Repo path:** `/Users/admin/Minnesota Trail`  
**Live:** https://lakeelmo.github.io/minnesota-portage/ *(still old map mode until commit/push)*  
**GitHub:** https://github.com/lakeelmo/minnesota-portage (`lakeelmo`)  
**Local play:** `python3 -m http.server 8080` → http://localhost:8080 (use a fresh port or hard-refresh after JS changes)  
**Branch:** `main` — **board-game redesign uncommitted**  
**Save key:** `minnesota-portage-v6` (clears legacy `v5` on new game)

---

## Product (board-game edition)

Educational **turn-based board game** (ages ~9–11) about Minnesota Indigenous / pre-settler history along the **St. Croix valley**. Vanilla ES-module SPA, GitHub Pages–ready. Brand: **Minnesota Portage**.

Quest: carry a birchbark **Story Bundle**, earn **Story Stones**, reach the **Council of Stories**.

### How a turn works

1. **Roll** the die (Beginner 1–4, Medium/Hard 1–6).
2. **Move** exactly that many hops — glowing legal spaces; branches = strategy.
3. **Resolve** the space:
   - **Knowledge** → Story Card (deep trivia) → stone on correct answer
   - **Path** → often Story Card, sometimes a light trail event
   - **Challenge** → minigame (rice / memory / dig / portage / forage arcade)
   - **Camp** → heal
   - **Hazard** → math / scare / toll
   - **Council** → win if you have enough stones (4 / 5 / 7 by difficulty)

### Story Cards

- Large deck in `js/quizdeck.js` (~40 questions), shuffled answers.
- Drawn **at random with no repeats** until the deck is exhausted, then reshuffles.
- HUD shows cards remaining.

### Characters

- No name/personality typing.
- Pick a cast member (you play **as that kid’s name**) + a trail gift (power).
- 1–4 hotseat players.

### Layout

- **Fullscreen** desktop playfield (no phone chrome frame).
- **Landscape-friendly** on phones: board + side panel (dice / space info).
- Portrait phones stack the side panel under the board.

---

## Key files (new / primary)

| Path | Role |
|------|------|
| `js/board.js` | Board graph spaces + BFS move helpers |
| `js/boardgame.js` | Dice, move, land resolve, turns |
| `js/quizdeck.js` | Deep Story Card deck + no-repeat draw |
| `js/main.js` | Screens + turn handlers |
| `js/ui.js` | Title, cast pick, board SVG, sheets |
| `js/state.js` | Run model, save `v6` |
| `js/quest.js` | Board-game quest copy |
| `js/minigames.js` / `js/arcade.js` | Challenges (reused) |
| `css/main.css` | Fullscreen + `.board-*` landscape rules |

Legacy `js/game.js` / old trail map flow are **unused** by `main.js` now (safe to delete later).

---

## Known gaps / next work

1. **Commit + push** so GitHub Pages matches the board game.
2. Real-phone landscape playtest (iOS Safari).
3. On-screen arcade controls for touch.
4. Optional: remove dead `js/game.js` + tracked unused PNGs.
5. Optional: more board spaces / alternate routes.
6. Dice animation polish.

---

## Commands

```bash
cd "/Users/admin/Minnesota Trail"
python3 -m http.server 8080
# Hard refresh; clear localStorage minnesota-portage-v6 if needed
```

---

## Suggested first message for the next agent

> Read `HANDOFF.md`. Board-game mode is local/uncommitted: dice movement, Story Cards with no repeats, simplified cast, landscape fullscreen. Playtest landscape on phone; commit/push when asked.
