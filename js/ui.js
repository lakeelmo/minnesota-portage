import { CHARACTERS, SUPERPOWERS, renderPortrait } from "./characters.js";
import { DIFFICULTIES, getWeapon } from "./data.js";
import { getActivePlayer } from "./state.js";
import { BOARD, getSpace } from "./board.js";
import { deckRemaining } from "./quizdeck.js";
import { QUEST } from "./quest.js";
import { ARCADE_META, isArcadeType } from "./arcade.js";
import { sayButton, linkNativeWords, bindSayButtons, unlockAudio } from "./audio.js";
import { legalMoves } from "./boardgame.js";

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2600);
}

function clampInt(v, min, max) {
  return Math.max(min, Math.min(max, Number(v) || min));
}

/* ─────────────────────────── TITLE ─────────────────────────── */

export function renderTitle(onStart, onContinue, hasSave) {
  const cast = CHARACTERS.map((c) => c.id);
  const node = el(`
    <section class="screen title-screen">
      <div class="title-hero">
        <div class="title-hero-content">
          <div class="brand">
            <h1>Minnesota Portage</h1>
            <p class="brand-fun">Carry the canoe. Carry the stories.</p>
          </div>
          <p class="title-lede">${QUEST.short}</p>
          <div class="btn-row title-cta">
            <button class="btn btn-primary btn-big" data-action="start">Begin the Portage</button>
            ${hasSave ? `<button class="btn btn-blue" data-action="continue">Continue</button>` : ""}
          </div>
          <p class="title-ages">Ages 9–11 · board game · Story Cards · landscape-ready</p>
          <div class="title-cast" aria-hidden="true">
            ${cast.map((id) => renderPortrait(id, { size: 88, className: "title-portrait" })).join("")}
          </div>
        </div>
      </div>
    </section>
  `);
  node.querySelector('[data-action="start"]')?.addEventListener("click", () => { unlockAudio(); onStart(); });
  node.querySelector('[data-action="continue"]')?.addEventListener("click", () => { unlockAudio(); onContinue(); });
  return node;
}

/* ─────────────────────────── PARTY + CAST (simplified) ─────────────────────────── */

export function renderPartySetup(setup, handlers) {
  const node = el(`
    <section class="screen setup-screen">
      <div class="paper-card setup-card">
        <h2 class="section-title">Gather the crew</h2>
        <p class="hint">Hotseat board game — each player picks a valley traveler (no typing names).</p>
        <div class="setup-grid two">
          <div class="field">
            <label for="playerCount">Players</label>
            <input id="playerCount" type="number" min="1" max="4" value="${setup.playerCount}" />
          </div>
          <div class="field">
            <label>Difficulty</label>
            <div class="choice-pills" data-diff>
              ${Object.values(DIFFICULTIES).map((d) => `
                <button type="button" class="pill ${setup.difficulty === d.id ? "active" : ""}" data-id="${d.id}">
                  ${d.label}${d.recommended ? " ⭐" : ""}
                </button>`).join("")}
            </div>
            <span class="hint">${DIFFICULTIES[setup.difficulty]?.tag || ""} · Beginner uses a 4-sided die</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" data-action="back">Back</button>
          <button class="btn btn-primary" data-action="next">Choose Travelers →</button>
        </div>
      </div>
    </section>
  `);
  node.querySelector("#playerCount").addEventListener("change", (e) => handlers.setCount(clampInt(e.target.value, 1, 4)));
  node.querySelectorAll("[data-diff] .pill").forEach((btn) => btn.addEventListener("click", () => handlers.setDifficulty(btn.dataset.id)));
  node.querySelector('[data-action="back"]').addEventListener("click", handlers.back);
  node.querySelector('[data-action="next"]').addEventListener("click", handlers.next);
  return node;
}

export function renderCharacterCreator(setup, draft, handlers) {
  const idx = setup.draftingIndex;
  const total = setup.playerCount;
  const taken = new Set(setup.players.map((p) => p.characterId));
  const sel = CHARACTERS.find((c) => c.id === draft.characterId) || CHARACTERS[0];
  const node = el(`
    <section class="screen setup-screen">
      <div class="paper-card setup-card cast-card">
        <h2 class="section-title">Player ${idx + 1} of ${total}</h2>
        <p class="hint">Tap a traveler — you play as <strong>${sel.name}</strong> (${sel.nation}).</p>
        <div class="cast-grid">
          ${CHARACTERS.map((c) => {
            const used = taken.has(c.id) && c.id !== draft.characterId;
            return `
              <button type="button" class="cast-pick ${draft.characterId === c.id ? "active" : ""}" data-char="${c.id}" ${used ? "disabled" : ""}>
                ${renderPortrait(c.id, { size: 72, className: "cast-portrait" })}
                <span class="cast-name">${c.name}</span>
                <span class="cast-nation">${c.nation}</span>
              </button>`;
          }).join("")}
        </div>
        <p class="cast-blurb">${sel.blurb}</p>
        <div class="field">
          <label>Trail gift</label>
          <div class="choice-pills wrap" data-power>
            ${SUPERPOWERS.map((p) => `
              <button type="button" class="pill ${draft.powerId === p.id ? "active" : ""}" data-id="${p.id}" title="${p.desc}">
                ${p.icon} ${p.name}
              </button>`).join("")}
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" data-action="back">Back</button>
          <button class="btn btn-primary" data-action="save">
            ${idx + 1 >= total ? "Start Board Game →" : "Next Player →"}
          </button>
        </div>
      </div>
    </section>
  `);
  node.querySelectorAll("[data-char]").forEach((btn) => btn.addEventListener("click", () => handlers.setChar(btn.dataset.char)));
  node.querySelectorAll("[data-power] .pill").forEach((btn) => btn.addEventListener("click", () => handlers.setPower(btn.dataset.id)));
  node.querySelector('[data-action="back"]').addEventListener("click", handlers.back);
  node.querySelector('[data-action="save"]').addEventListener("click", handlers.save);
  return node;
}

/* ─────────────────────────── BOARD TABLE ─────────────────────────── */

function kindClass(kind) {
  return `kind-${kind || "path"}`;
}

function phaseHint(state) {
  const active = getActivePlayer(state);
  if (state.encounter) return "Resolve the card or challenge";
  if (state.turnPhase === "pick") return `Rolled ${state.dice} — tap a bright GO space`;
  return `${active?.name || "You"} — roll the die`;
}

function stonesNeed(state) {
  return state.difficulty === "beginner" ? 4 : state.difficulty === "hard" ? 7 : 5;
}

function renderBoardSvg(state) {
  const legal = new Set(state.turnPhase === "pick" ? (state.legal || legalMoves(state)) : []);
  const pos = state.position;
  const here = getSpace(pos);
  const vb = "0 0 1200 780";

  const edges = [];
  const seen = new Set();
  for (const s of BOARD) {
    for (const n of s.links || []) {
      const key = [s.id, n].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const a = getSpace(s.id);
      const b = getSpace(n);
      if (!a || !b) continue;
      edges.push(`<line class="board-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`);
    }
  }

  const nodes = BOARD.map((s) => {
    const glow = legal.has(s.id);
    const isHere = s.id === pos;
    return `
      <g class="board-node ${kindClass(s.kind)} ${isHere ? "here" : ""} ${glow ? "legal" : ""}"
         data-space="${s.id}" ${glow ? `data-move="${s.id}"` : ""} role="button" tabindex="${glow ? 0 : -1}">
        <circle class="legal-ring" cx="${s.x}" cy="${s.y}" r="38" />
        <circle class="board-disc" cx="${s.x}" cy="${s.y}" r="24" />
        <text class="board-icon" x="${s.x}" y="${s.y + 7}" text-anchor="middle">${s.icon || "•"}</text>
        <text class="board-label" x="${s.x}" y="${s.y + 48}" text-anchor="middle">${s.name}</text>
        <g class="legal-badge" transform="translate(${s.x}, ${s.y - 34})">
          <rect x="-22" y="-12" width="44" height="22" rx="11" />
          <text y="4" text-anchor="middle">GO</text>
        </g>
      </g>`;
  }).join("");

  const token = here
    ? `<g class="player-token" data-player-token transform="translate(${here.x}, ${here.y})">
         <circle class="player-halo" r="46" />
         <circle class="player-pawn" r="18" />
         <text class="player-you" y="5" text-anchor="middle">YOU</text>
       </g>`
    : "";

  return `
    <svg class="board-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-label="St. Croix valley board">
      <image href="assets/map-st-croix.jpg" x="0" y="0" width="1200" height="780" opacity="0.28" preserveAspectRatio="xMidYMid slice" />
      ${edges.join("")}
      ${nodes}
      ${token}
    </svg>
  `;
}

function bindMoveNodes(root, handlers) {
  root.querySelectorAll("[data-move]").forEach((g) => {
    const id = g.getAttribute("data-move");
    g.onclick = () => handlers.move(id);
    g.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handlers.move(id); }
    };
  });
}

function encounterShellClass(enc) {
  if (!enc) return "";
  if (enc.kind === "story-card" || enc.kind === "hazard-math" || enc.kind === "intro") return "sheet-card";
  if (enc.kind === "minigame") return "sheet-card sheet-challenge";
  return "sheet-card";
}

/** Patch an existing board screen instead of remounting (avoids flashy reloads). */
export function syncTrail(root, state, handlers) {
  if (!root?.classList?.contains("board-screen")) return false;
  const active = getActivePlayer(state);
  const space = getSpace(state.position);
  const need = stonesNeed(state);
  const remaining = deckRemaining(state.usedQuizIds || []);
  const legal = new Set(state.turnPhase === "pick" ? (state.legal || legalMoves(state)) : []);

  const who = root.querySelector(".hud-who strong");
  if (who) who.textContent = active?.name || "Traveler";
  const sub = root.querySelector(".hud-sub");
  if (sub) sub.textContent = `${space?.name || "…"} · ${state.turnPhase === "pick" ? "choose space" : state.turnPhase === "roll" ? "your roll" : "resolve"}`;

  const setMeter = (cls, value, max) => {
    const fill = root.querySelector(`.${cls} .meter-fill`);
    const val = root.querySelector(`.${cls} .meter-val`);
    const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
    if (fill) fill.style.width = `${pct}%`;
    if (val) val.textContent = String(value);
  };
  setMeter("m-health", state.health, state.maxHealth);
  setMeter("m-energy", state.energy, state.maxEnergy);
  setMeter("m-rations", state.rations, state.maxRations);

  const scores = root.querySelector(".hud-scores");
  if (scores) {
    scores.innerHTML = `
      <span title="Story Stones">🪨 ${state.storyStones || 0}/${need}</span>
      <span title="Score">⭐ ${state.score || 0}</span>
      <span title="Story Cards left">📜 ${remaining}</span>`;
  }

  const coach = root.querySelector(".board-coach");
  if (coach) coach.textContent = phaseHint(state);

  const dice = root.querySelector(".dice-face");
  if (dice) dice.textContent = state.dice ? String(state.dice) : "—";
  const rollBtn = root.querySelector('[data-a="roll"]');
  if (rollBtn) rollBtn.disabled = !(state.turnPhase === "roll" && !state.encounter);

  const sideTitle = root.querySelector(".side-space h3");
  const sideBlurb = root.querySelector(".side-space p");
  const sideKind = root.querySelector(".side-space .hint strong");
  if (sideTitle) sideTitle.textContent = `${space?.icon || ""} ${space?.name || ""}`;
  if (sideBlurb) sideBlurb.textContent = space?.blurb || "";
  if (sideKind) sideKind.textContent = space?.kind || "";

  const log = root.querySelector(".side-log");
  if (log) log.innerHTML = (state.log || []).slice(-4).map((l) => `<div>${l}</div>`).join("");

  // Board highlights + player token
  root.querySelectorAll(".board-node").forEach((g) => {
    const id = g.getAttribute("data-space");
    const isLegal = legal.has(id);
    const isHere = id === state.position;
    g.classList.toggle("legal", isLegal);
    g.classList.toggle("here", isHere);
    if (isLegal) g.setAttribute("data-move", id);
    else g.removeAttribute("data-move");
    g.setAttribute("tabindex", isLegal ? "0" : "-1");
  });
  bindMoveNodes(root, handlers);

  const token = root.querySelector("[data-player-token]");
  if (token && space) token.setAttribute("transform", `translate(${space.x}, ${space.y})`);

  // Encounter overlay
  let overlay = root.querySelector(".encounter-overlay");
  const encKey = state.encounter
    ? `${state.encounter.kind}:${state.encounter.card?.id || state.encounter.game?.type || ""}:${state.encounter.answered || false}:${state.encounter.hintShown || false}:${state.encounter.game?.ticksLeft ?? ""}:${state.encounter.game?.caught ?? ""}`
    : "";
  if (!state.encounter) {
    overlay?.remove();
    root.dataset.encKey = "";
  } else {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "encounter-overlay";
      overlay.innerHTML = `<div class="sheet sheet-board ${encounterShellClass(state.encounter)}"><div class="sheet-body" id="encounter"></div></div>`;
      root.appendChild(overlay);
      root.dataset.encKey = "";
    } else {
      const sheet = overlay.querySelector(".sheet");
      if (sheet) sheet.className = `sheet sheet-board ${encounterShellClass(state.encounter)}`;
    }
    // Soft rice ticks: only refresh mole grid
    const softRice = state.encounter.kind === "minigame"
      && state.encounter.game?.type === "rice"
      && root.dataset.encKey?.startsWith("minigame:rice:")
      && !state.encounter.game.done;
    if (softRice) {
      const board = overlay.querySelector("[data-mg]");
      if (board) renderMinigameBoard(board, state.encounter.game, handlers);
      root.dataset.encKey = encKey;
    } else if (root.dataset.encKey !== encKey) {
      fillEncounter(overlay.querySelector("#encounter"), state, handlers);
      root.dataset.encKey = encKey;
    }
  }
  return true;
}

/** Update only the rice/memory board during ticks — no full trail sync flash. */
export function syncMinigameOnly(root, state, handlers) {
  const board = root?.querySelector?.("[data-mg]");
  const game = state.encounter?.game;
  if (!board || !game) return false;
  renderMinigameBoard(board, game, handlers);
  if (game.done) {
    const panel = root.querySelector("#encounter");
    if (panel && !panel.querySelector("[data-a=done]")) {
      const row = document.createElement("div");
      row.className = "btn-row";
      row.innerHTML = `<button class="btn btn-primary" data-a="done">Continue →</button>`;
      row.querySelector("[data-a=done]").onclick = handlers.minigameDone;
      panel.appendChild(row);
    }
  }
  return true;
}

function meter(label, value, max, cls) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
  return `
    <div class="meter ${cls}">
      <span class="meter-label">${label}</span>
      <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
      <span class="meter-val">${value}</span>
    </div>`;
}

export function renderTrail(state, handlers) {
  const active = getActivePlayer(state);
  const space = getSpace(state.position);
  const need = stonesNeed(state);
  const remaining = deckRemaining(state.usedQuizIds || []);

  const node = el(`
    <section class="screen board-screen">
      <header class="board-hud">
        <div class="hud-who">
          ${renderPortrait(active?.characterId || "makoons", { size: 44, className: "hud-portrait" })}
          <div>
            <strong>${active?.name || "Traveler"}</strong>
            <span class="hud-sub">${space?.name || "…"} · your roll</span>
          </div>
        </div>
        <div class="hud-meters">
          ${meter("❤", state.health, state.maxHealth, "m-health")}
          ${meter("⚡", state.energy, state.maxEnergy, "m-energy")}
          ${meter("🌾", state.rations, state.maxRations, "m-rations")}
        </div>
        <div class="hud-scores">
          <span title="Story Stones">🪨 ${state.storyStones || 0}/${need}</span>
          <span title="Score">⭐ ${state.score || 0}</span>
          <span title="Story Cards left">📜 ${remaining}</span>
        </div>
      </header>

      <div class="board-layout">
        <div class="board-stage">
          ${renderBoardSvg(state)}
          <div class="board-coach">${phaseHint(state)}</div>
        </div>
        <aside class="board-side">
          <div class="dice-panel">
            <div class="dice-face" aria-live="polite">${state.dice ? state.dice : "—"}</div>
            <button class="btn btn-primary btn-big" data-a="roll" ${state.turnPhase === "roll" && !state.encounter ? "" : "disabled"}>
              🎲 Roll die
            </button>
            <p class="hint dice-hint">${state.difficulty === "beginner" ? "Die: 1–4" : "Die: 1–6"} · move exactly that many hops</p>
          </div>
          <div class="side-space">
            <h3>${space?.icon || ""} ${space?.name || ""}</h3>
            <p>${space?.blurb || ""}</p>
            <p class="hint">Kind: <strong>${space?.kind || ""}</strong></p>
          </div>
          <div class="side-log">
            ${(state.log || []).slice(-4).map((l) => `<div>${l}</div>`).join("")}
          </div>
          <div class="btn-row side-actions">
            <button class="btn btn-ghost" data-a="exit">Save & Exit</button>
          </div>
        </aside>
      </div>

      ${state.encounter ? `<div class="encounter-overlay"><div class="sheet sheet-board ${encounterShellClass(state.encounter)}"><div class="sheet-body" id="encounter"></div></div></div>` : ""}
    </section>
  `);

  node.querySelector('[data-a="roll"]')?.addEventListener("click", handlers.roll);
  node.querySelector('[data-a="exit"]')?.addEventListener("click", handlers.exit);
  bindMoveNodes(node, handlers);

  if (state.encounter) {
    fillEncounter(node.querySelector("#encounter"), state, handlers);
    node.dataset.encKey = `${state.encounter.kind}:${state.encounter.card?.id || ""}`;
  }
  return node;
}

function fillEncounter(panel, state, handlers) {
  const enc = state.encounter;
  if (!enc || !panel) return;
  const active = getActivePlayer(state);

  if (enc.kind === "intro") {
    panel.innerHTML = `
      <h2>📜 ${enc.title}</h2>
      <p>${enc.text}</p>
      <div class="btn-row"><button class="btn btn-primary btn-big" data-a="go">Lift the Bundle — let's play</button></div>
    `;
    panel.querySelector("[data-a=go]").onclick = handlers.introGo;
    return;
  }

  if (enc.kind === "story-card") {
    const c = enc.card;
    panel.innerHTML = `
      <div class="card-top">
        <p class="card-topic">${c.topic || "Story Card"}</p>
        <h2 class="card-title">${enc.title}</h2>
        <p class="quiz-q">${c.q}</p>
      </div>
      <div class="quiz-options quiz-grid">
        ${c.choices.map((t, i) => {
          let cls = "btn quiz-option";
          if (enc.answered) {
            if (i === c.answer) cls += " correct";
            else if (i === enc.picked) cls += " wrong";
          }
          return `<button class="${cls}" data-i="${i}" ${enc.answered ? "disabled" : ""}>${t}</button>`;
        }).join("")}
      </div>
      <div class="card-foot">
        ${!enc.answered && state.hintsLeft > 0 ? `<button class="btn btn-purple" data-a="hint">💡 Hint (${state.hintsLeft})</button>` : ""}
        ${enc.hintShown && !enc.answered ? `<p class="hint">💡 ${c.hint}</p>` : ""}
        ${enc.answered ? `<p class="learn-box compact-teach">${linkNativeWords(c.teach)}</p>
          <button class="btn btn-primary btn-big" data-a="next">Continue →</button>` : ""}
      </div>
    `;
    if (!enc.answered) {
      panel.querySelectorAll("[data-i]").forEach((btn) => {
        btn.onclick = () => handlers.storyAnswer(Number(btn.dataset.i));
      });
      panel.querySelector("[data-a=hint]")?.addEventListener("click", handlers.storyHint);
    } else {
      panel.querySelector("[data-a=next]").onclick = handlers.storyNext;
    }
    bindSayButtons(panel);
    return;
  }

  if (enc.kind === "camp" || enc.kind === "event" || enc.kind === "council-gate") {
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p>${enc.text}</p>
      <div class="btn-row"><button class="btn btn-primary" data-a="ok">Continue →</button></div>
    `;
    panel.querySelector("[data-a=ok]").onclick = handlers.ack;
    return;
  }

  if (enc.kind === "hazard") {
    const w = getWeapon(state.equippedWeapon);
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p>${enc.text}</p>
      <div class="btn-row">
        <button class="btn btn-primary" data-a="brave">Face it with math</button>
        <button class="btn btn-blue" data-a="scare">Scare it off ${w ? `(${w.emoji})` : ""}</button>
        <button class="btn btn-ghost" data-a="pay">Pay energy toll</button>
      </div>
    `;
    panel.querySelector("[data-a=brave]").onclick = () => handlers.hazard("brave");
    panel.querySelector("[data-a=scare]").onclick = () => handlers.hazard("scare");
    panel.querySelector("[data-a=pay]").onclick = () => handlers.hazard("pay");
    return;
  }

  if (enc.kind === "hazard-math") {
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p class="math-q">${enc.question}</p>
      <div class="quiz-options">
        ${enc.choices.map((c, i) => `<button class="btn quiz-option" data-i="${i}">${c}</button>`).join("")}
      </div>
    `;
    panel.querySelectorAll("[data-i]").forEach((btn) => {
      btn.onclick = () => handlers.hazardMath(Number(btn.dataset.i));
    });
    return;
  }

  if (enc.kind === "minigame") {
    const game = enc.game;
    const arcade = isArcadeType(game.type);
    const meta = arcade ? ARCADE_META[game.type] : null;
    panel.innerHTML = `
      <h2 class="mg-title">${enc.title}</h2>
      ${arcade ? `<p class="arcade-intro">${meta?.blurb || ""}</p>` : `<p class="hint">${enc.space?.blurb || ""}</p>`}
      <div class="minigame-board ${arcade ? "arcade-board" : ""}" data-mg data-arcade="${arcade ? game.type : ""}"></div>
      ${!arcade && game.done ? `<div class="btn-row"><button class="btn btn-primary" data-a="done">Continue →</button></div>` : ""}
    `;
    const board = panel.querySelector("[data-mg]");
    if (!arcade) {
      renderMinigameBoard(board, game, handlers);
      if (game.done) panel.querySelector("[data-a=done]").onclick = handlers.minigameDone;
    } else {
      board.innerHTML = `<div class="arcade-placeholder">Click the game, then press <kbd>Enter</kbd> to start.</div>`;
    }
    return;
  }

  if (enc.kind === "finale") {
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p>${enc.text}</p>
      <p><strong>${active?.name}</strong>, which discovery will you share first?</p>
      <div class="btn-row"><button class="btn btn-primary btn-big" data-a="fin">Open the Bundle</button></div>
    `;
    panel.querySelector("[data-a=fin]").onclick = handlers.finale;
    return;
  }

  if (enc.kind === "victory") {
    panel.innerHTML = `
      <div class="win-banner">
        <h2>🔥 ${enc.title}</h2>
        <p>${enc.text}</p>
        <p>Score <strong>${state.score}</strong> · Stones <strong>${state.storyStones}</strong> · Cards correct ${state.questionsCorrect}/${state.questionsTotal}</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-a="again">Play again</button>
          <button class="btn btn-ghost" data-a="home">Home</button>
        </div>
      </div>
    `;
    panel.querySelector("[data-a=again]").onclick = handlers.again;
    panel.querySelector("[data-a=home]").onclick = handlers.home;
    return;
  }

  if (enc.kind === "defeat") {
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p>${enc.text}</p>
      <div class="btn-row">
        <button class="btn btn-primary" data-a="again">Try again</button>
        <button class="btn btn-ghost" data-a="home">Home</button>
      </div>
    `;
    panel.querySelector("[data-a=again]").onclick = handlers.again;
    panel.querySelector("[data-a=home]").onclick = handlers.home;
  }
}

function renderMinigameBoard(board, game, handlers) {
  if (!board) return;
  if (game.type === "dig") {
    board.innerHTML = `
      <p class="mg-msg">${game.message}</p>
      <div class="dig-grid">
        ${game.cells.map((c) => `
          <button ${c.revealed || game.done ? "disabled" : ""} data-dig="${c.i}">
            ${c.revealed ? (c.artifact ? c.artifact.emoji : "·") : "⬜"}
          </button>`).join("")}
      </div>
      <p class="hint">Digs left: ${game.attemptsLeft}</p>
    `;
    board.querySelectorAll("[data-dig]").forEach((btn) => {
      btn.onclick = () => handlers.mg({ type: "dig", i: Number(btn.dataset.dig) });
    });
  } else if (game.type === "memory") {
    board.innerHTML = `
      <p class="mg-msg">${game.message}</p>
      <div class="memory-grid">
        ${game.cards.map((c) => `
          <button class="memory-card ${c.flipped || c.matched ? "flipped" : ""} ${c.matched ? "matched" : ""}"
            data-mem="${c.id}" ${c.matched || game.done ? "disabled" : ""}>
            ${c.flipped || c.matched ? c.symbol : "?"}
          </button>`).join("")}
      </div>
    `;
    board.querySelectorAll("[data-mem]").forEach((btn) => {
      btn.onclick = () => handlers.mg({ type: "memory-flip", id: btn.dataset.mem });
    });
  } else if (game.type === "rice") {
    board.innerHTML = `
      <div class="rice-hud">
        <span>🌾 ${game.caught}/${game.goal}</span>
        <span class="rice-timer">${game.ticksLeft}s</span>
      </div>
      <div class="rice-mole-grid">
        ${game.pods.map((p) => `
          <button class="rice-mole ${p.phase}" data-pod="${p.id}" ${p.phase === "empty" || game.done ? "disabled" : ""}>
            ${p.phase === "ripe" ? "🌾" : p.phase === "green" ? "🌱" : ""}
          </button>`).join("")}
      </div>
    `;
    board.querySelectorAll("[data-pod]").forEach((btn) => {
      btn.onclick = () => handlers.mg({ type: "rice-catch", id: btn.dataset.pod });
    });
  }
}

export function renderGameOver(state, handlers) {
  const node = el(`
    <section class="screen setup-screen">
      <div class="paper-card">
        <h2>Trail ended</h2>
        <p>Score ${state.score}. Stones ${state.storyStones}.</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-a="again">Play again</button>
          <button class="btn btn-ghost" data-a="home">Home</button>
        </div>
      </div>
    </section>
  `);
  node.querySelector("[data-a=again]").onclick = handlers.again;
  node.querySelector("[data-a=home]").onclick = handlers.home;
  return node;
}
