import { CHARACTERS, SUPERPOWERS, renderPortrait } from "./characters.js?v=race13";
import { DIFFICULTIES } from "./data.js?v=race13";
import { getActivePlayer } from "./state.js?v=race13";
import { BOARD, getSpace } from "./board.js?v=race13";
import { deckRemaining } from "./quizdeck.js?v=race13";
import { QUEST } from "./quest.js?v=race13";
import { ARCADE_META, isArcadeType } from "./arcade.js?v=race13";
import { linkNativeWords, bindSayButtons, unlockAudio } from "./audio.js?v=race13";
import { legalMoves, playerPosition } from "./boardgame.js?v=race13";
import { artForTopic, playerLabel } from "./labels.js?v=race13";

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
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function clampInt(v, min, max) {
  return Math.max(min, Math.min(max, Number(v) || min));
}

export function renderTitle(onStart, onContinue, hasSave) {
  const node = el(`
    <section class="screen title-screen">
      <div class="title-hero">
        <div class="title-hero-content">
          <div class="brand">
            <h1>Minnesota Portage</h1>
            <p class="brand-fun">Race the valley. Reach the Council.</p>
          </div>
          <p class="title-lede">${QUEST.short}</p>
          <div class="btn-row title-cta">
            <button class="btn btn-primary btn-big" data-action="start">Begin the Portage</button>
            ${hasSave ? `<button class="btn btn-blue" data-action="continue">Continue</button>` : ""}
          </div>
          <p class="title-ages">Ages 9–11 · race · questions · challenges</p>
          <div class="title-cast" aria-hidden="true">
            ${CHARACTERS.slice(0, 6).map((c) => renderPortrait(c.id, { size: 80, className: "title-portrait" })).join("")}
          </div>
        </div>
      </div>
    </section>
  `);
  node.querySelector('[data-action="start"]')?.addEventListener("click", () => { unlockAudio(); onStart(); });
  node.querySelector('[data-action="continue"]')?.addEventListener("click", () => { unlockAudio(); onContinue(); });
  return node;
}

export function renderPartySetup(setup, handlers) {
  const node = el(`
    <section class="screen setup-screen">
      <div class="paper-card setup-card">
        <h2 class="section-title">Gather the crew</h2>
        <p class="hint">1 player races a CPU rival. 2–4 players hotseat. No typing names.</p>
        <div class="setup-grid two">
          <div class="field">
            <label for="playerCount">Human players</label>
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
            <span class="hint">Die: 1 / 2 / 3 / 🎮 (~40% challenges). Harder = tougher CPU.</span>
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
        <p class="hint">Tap a traveler — you play as <strong>${sel.name}</strong>.</p>
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
            ${idx + 1 >= total ? "Start Race →" : "Next Player →"}
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

function phaseHint(state) {
  const active = getActivePlayer(state);
  if (state.encounter?.kind === "minigame") return "Full-screen challenge — arrows + click";
  if (state.encounter) return active?.isCpu ? `CPU · ${active.name} answering…` : "Answer to stay on this space";
  if (state.turnPhase === "pick") return `Rolled ${state.dice} — tap a glowing GO space`;
  return `${active?.name || "You"}${active?.isCpu ? " (CPU)" : ""} — roll the die`;
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

function renderBoardSvg(state) {
  const legal = new Set(legalMoves(state));
  const active = getActivePlayer(state);
  const activePos = playerPosition(state);

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
      edges.push(`
        <line class="board-edge-glow" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />
        <line class="board-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />
      `);
    }
  }

  const nodes = BOARD.map((s) => {
    const glow = legal.has(s.id);
    const isHere = s.id === activePos;
    const kind = s.kind === "finish" ? "kind-finish" : s.kind === "start" ? "kind-start" : "";
    return `
      <g class="board-node ${glow ? "legal" : ""} ${isHere ? "here" : ""} ${kind}"
         data-space="${s.id}" ${glow ? `data-move="${s.id}"` : ""}>
        <circle class="legal-glow" cx="${s.x}" cy="${s.y}" r="52" />
        <circle class="legal-ring" cx="${s.x}" cy="${s.y}" r="38" />
        <circle class="board-disc-shadow" cx="${s.x}" cy="${s.y + 3}" r="24" />
        <circle class="board-disc" cx="${s.x}" cy="${s.y}" r="23" />
        <text class="board-icon" x="${s.x}" y="${s.y + 8}" text-anchor="middle">${s.icon || "•"}</text>
        <text class="board-label" x="${s.x}" y="${s.y + 48}" text-anchor="middle">${s.name}</text>
        <g class="legal-badge" transform="translate(${s.x}, ${s.y - 38})">
          <rect x="-26" y="-13" width="52" height="24" rx="12" />
          <text y="4" text-anchor="middle">GO</text>
        </g>
      </g>`;
  }).join("");

  const tokens = (state.players || []).map((p, i) => {
    const sp = getSpace(p.position || "start");
    if (!sp) return "";
    const isActive = i === state.activePlayer;
    const color = p.isCpu ? "#1a4a63" : (i === 0 ? "#c45c4a" : i === 1 ? "#2f6f8f" : i === 2 ? "#6a8f4e" : "#b86b3c");
    const label = playerLabel(p, 8);
    const n = state.players.length;
    const offsetX = n > 1 ? (i % 2 === 0 ? -16 : 16) : 0;
    const offsetY = n > 2 ? (i < 2 ? -12 : 12) : (n > 1 ? (i === 0 ? -10 : 10) : -6);
    const flagW = Math.max(44, label.length * 7.2);
    return `
      <g class="player-token ${isActive ? "token-active" : "token-idle"}" data-token="${p.id}"
         transform="translate(${sp.x + offsetX}, ${sp.y + offsetY})">
        <circle class="player-halo" r="42" style="stroke:${color}" />
        <circle class="player-pawn" r="18" style="fill:${color}" />
        <text class="player-mark" y="6" text-anchor="middle">${p.isCpu ? "🤖" : "⭐"}</text>
        <g class="player-flag" transform="translate(0, -28)">
          <rect x="${-flagW / 2}" y="-12" width="${flagW}" height="20" rx="10" style="fill:${color}" />
          <text y="3" text-anchor="middle">${label}</text>
        </g>
      </g>`;
  }).join("");

  return `
    <svg class="board-svg" viewBox="0 0 1200 780" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="goGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffe08a" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#d4a017" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="boardWash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7eb6c9" stop-opacity="0.35"/>
          <stop offset="45%" stop-color="#dfece6" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#2f6b4f" stop-opacity="0.28"/>
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect class="board-sky" x="0" y="0" width="1200" height="780" fill="#b7cfc8"/>
      <image href="assets/map-st-croix.jpg" x="0" y="0" width="1200" height="780" opacity="0.38" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="1200" height="780" fill="url(#boardWash)" />
      <text class="board-title-art" x="600" y="48" text-anchor="middle">St. Croix Valley Race</text>
      ${edges.join("")}
      ${nodes}
      ${tokens}
    </svg>
  `;
}

function bindMoveNodes(root, handlers) {
  root.querySelectorAll("[data-move]").forEach((g) => {
    const id = g.getAttribute("data-move");
    g.onclick = () => handlers.move(id);
  });
}

function encounterShellClass(enc) {
  if (!enc) return "";
  if (enc.kind === "minigame") return "sheet-fullscreen";
  if (enc.kind === "story-card") return "sheet-quiz";
  return "sheet-card";
}

export function syncTrail(root, state, handlers) {
  if (!root?.classList?.contains("board-screen")) return false;
  const active = getActivePlayer(state);
  const space = getSpace(playerPosition(state));
  const remaining = deckRemaining(state.usedQuizIds || []);
  const legal = new Set(legalMoves(state));

  const who = root.querySelector(".hud-who strong");
  if (who) who.textContent = `${active?.name || "Traveler"}${active?.isCpu ? "" : ""}`;
  const sub = root.querySelector(".hud-sub");
  if (sub) sub.textContent = `${space?.name || "…"} · ${active?.isCpu ? `${playerLabel(active)}'s turn` : state.turnPhase}`;

  const setMeter = (cls, value, max) => {
    const fill = root.querySelector(`.${cls} .meter-fill`);
    const val = root.querySelector(`.${cls} .meter-val`);
    const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
    if (fill) fill.style.width = `${pct}%`;
    if (val) val.textContent = String(value);
  };
  setMeter("m-health", state.health, state.maxHealth);
  setMeter("m-energy", state.energy, state.maxEnergy);

  const scores = root.querySelector(".hud-scores");
  if (scores) {
    scores.innerHTML = `
      <span>⭐ ${state.score || 0}</span>
      <span>📜 ${remaining}</span>
      <span>${(state.players || []).map((p) => {
        const pr = getSpace(p.position)?.progress ?? 0;
        return `${p.isCpu ? "🤖" : "🧑"}${playerLabel(p, 6)} ${pr}`;
      }).join(" · ")}</span>`;
  }

  const coach = root.querySelector(".board-coach");
  if (coach) coach.textContent = phaseHint(state);

  const dice = root.querySelector(".dice-face");
  if (dice) {
    const label = state.diceFace?.label || (state.dice != null ? state.dice : "—");
    dice.textContent = label;
    dice.classList.toggle("dice-challenge", state.diceFace?.type === "minigame");
  }
  const rollBtn = root.querySelector('[data-a="roll"]');
  if (rollBtn) {
    const can = state.turnPhase === "roll" && !state.encounter && !active?.isCpu;
    rollBtn.disabled = !can;
  }

  const sideTitle = root.querySelector(".side-space h3");
  const sideBlurb = root.querySelector(".side-space p");
  if (sideTitle) sideTitle.textContent = `${space?.icon || ""} ${space?.name || ""}`;
  if (sideBlurb) sideBlurb.textContent = space?.blurb || "";

  const log = root.querySelector(".side-log");
  if (log) log.innerHTML = (state.log || []).slice(-5).map((l) => `<div>${l}</div>`).join("");

  root.querySelectorAll(".board-node").forEach((g) => {
    const id = g.getAttribute("data-space");
    const isLegal = legal.has(id);
    g.classList.toggle("legal", isLegal);
    g.classList.toggle("here", id === playerPosition(state));
    if (isLegal) g.setAttribute("data-move", id);
    else g.removeAttribute("data-move");
  });
  bindMoveNodes(root, handlers);

  (state.players || []).forEach((p, i) => {
    const token = root.querySelector(`[data-token="${p.id}"]`);
    const sp = getSpace(p.position || "start");
    if (!token || !sp) return;
    const offsetX = state.players.length > 1 ? (i === 0 ? -16 : 16) : 0;
    const offsetY = state.players.length > 1 ? (i === 0 ? -10 : 10) : -6;
    token.setAttribute("transform", `translate(${sp.x + offsetX}, ${sp.y + offsetY})`);
    token.classList.toggle("token-active", i === state.activePlayer);
  });

  let overlay = root.querySelector(".encounter-overlay");
  const enc = state.encounter;
  const encKey = enc
    ? [
        enc.kind,
        enc.card?.id || enc.game?.type || "",
        enc.answered,
        enc.hintShown,
        enc.picked,
        enc.cpuFocus,
        enc.cpuReveal,
        enc.cpuWon,
        enc.game?.caught,
        enc.game?.ticksLeft,
        enc.game?.done,
        enc.game?.moves,
        enc.game?.attemptsLeft,
        enc.game?.bag,
        (enc.game?.flipped || []).join("-"),
        (enc.game?.cards || []).map((c) => `${c.id}:${c.flipped ? 1 : 0}${c.matched ? "m" : ""}`).join(","),
        (enc.game?.cells || []).map((c) => (c.revealed ? "1" : "0")).join(""),
        (enc.game?.pods || []).map((p) => p.phase[0]).join(""),
      ].join(":")
    : "";

  if (!enc) {
    overlay?.remove();
    root.dataset.encKey = "";
  } else {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "encounter-overlay";
      overlay.innerHTML = `<div class="sheet sheet-board ${encounterShellClass(enc)}"><div class="sheet-body" id="encounter"></div></div>`;
      root.appendChild(overlay);
      root.dataset.encKey = "";
    } else {
      const sheet = overlay.querySelector(".sheet");
      if (sheet) sheet.className = `sheet sheet-board ${encounterShellClass(enc)}`;
    }

    const softRice = enc.kind === "minigame" && enc.game?.type === "rice"
      && root.dataset.encKey?.startsWith("minigame:rice:") && !enc.game.done;
    if (softRice) {
      const board = overlay.querySelector("[data-mg]");
      if (board) renderMinigameBoard(board, enc.game, handlers, enc);
      root.dataset.encKey = encKey;
    } else if (root.dataset.encKey !== encKey) {
      fillEncounter(overlay.querySelector("#encounter"), state, handlers);
      root.dataset.encKey = encKey;
    }
  }
  return true;
}

export function syncMinigameOnly(root, state, handlers) {
  const board = root?.querySelector?.("[data-mg]");
  const enc = state.encounter;
  if (!board || !enc?.game) return false;
  renderMinigameBoard(board, enc.game, handlers, enc);
  if (enc.game.done) {
    const panel = root.querySelector("#encounter");
    const full = panel?.querySelector(".mg-full");
    if (full && !full.querySelector("[data-a=done]")) {
      const row = document.createElement("div");
      row.className = "mg-footer";
      row.innerHTML = `<button class="btn btn-primary btn-big" data-a="done">Continue →</button>`;
      row.querySelector("[data-a=done]").onclick = handlers.minigameDone;
      full.appendChild(row);
    }
  }
  return true;
}

export function renderTrail(state, handlers) {
  const active = getActivePlayer(state);
  const space = getSpace(playerPosition(state));
  const remaining = deckRemaining(state.usedQuizIds || []);

  const node = el(`
    <section class="screen board-screen">
      <header class="board-hud">
        <div class="hud-who">
          ${renderPortrait(active?.characterId || "makoons", { size: 44, className: "hud-portrait" })}
          <div>
            <strong>${active?.name || "Traveler"}</strong>
            <span class="hud-sub">${space?.name || "…"}</span>
          </div>
        </div>
        <div class="hud-meters">
          ${meter("❤", state.health, state.maxHealth, "m-health")}
          ${meter("⚡", state.energy, state.maxEnergy, "m-energy")}
        </div>
        <div class="hud-scores">
          <span>⭐ ${state.score || 0}</span>
          <span>📜 ${remaining}</span>
          <span>${(state.players || []).map((p) => `${p.isCpu ? "🤖" : "🧑"}${playerLabel(p, 6)} ${getSpace(p.position)?.progress ?? 0}`).join(" · ")}</span>
        </div>
      </header>
      <div class="board-layout">
        <div class="board-stage">
          ${renderBoardSvg(state)}
          <div class="board-coach">${phaseHint(state)}</div>
        </div>
        <aside class="board-side">
          <div class="dice-panel">
            <div class="dice-face" aria-live="polite">${state.diceFace?.label || "—"}</div>
            <button type="button" class="btn btn-primary btn-big dice-roll-btn" data-a="roll"
              ${state.turnPhase === "roll" && !state.encounter && !active?.isCpu ? "" : "disabled"}>
              🎲 Roll
            </button>
            <p class="hint dice-hint">1 · 2 · 3 · 🎮</p>
          </div>
          <div class="side-space">
            <h3>${space?.icon || ""} ${space?.name || ""}</h3>
            <p>${space?.blurb || ""}</p>
          </div>
          <div class="side-log">${(state.log || []).slice(-5).map((l) => `<div>${l}</div>`).join("")}</div>
          <div class="btn-row side-actions">
            <button class="btn btn-ghost" data-a="exit">Save & Exit</button>
          </div>
        </aside>
      </div>
      ${state.encounter ? `<div class="encounter-overlay"><div class="sheet sheet-board ${encounterShellClass(state.encounter)}"><div class="sheet-body" id="encounter"></div></div></div>` : ""}
    </section>
  `);

  const rollBtn = node.querySelector('[data-a="roll"]');
  if (rollBtn) {
    const onRoll = (e) => {
      e.preventDefault();
      if (rollBtn.disabled) return;
      handlers.roll();
    };
    rollBtn.addEventListener("click", onRoll);
    rollBtn.addEventListener("touchend", onRoll, { passive: false });
  }
  node.querySelector('[data-a="exit"]')?.addEventListener("click", handlers.exit);
  bindMoveNodes(node, handlers);
  if (state.encounter) fillEncounter(node.querySelector("#encounter"), state, handlers);
  return node;
}

function fillEncounter(panel, state, handlers) {
  const enc = state.encounter;
  if (!enc || !panel) return;
  const active = getActivePlayer(state);
  const cpuLock = !!active?.isCpu;

  if (enc.kind === "intro") {
    panel.innerHTML = `
      <h2>📜 ${enc.title}</h2>
      <p class="intro-text">${enc.text}</p>
      <div class="btn-row"><button class="btn btn-primary btn-big" data-a="go">Start the race</button></div>
    `;
    panel.querySelector("[data-a=go]").onclick = handlers.introGo;
    return;
  }

  if (enc.kind === "story-card") {
    const c = enc.card;
    const art = artForTopic(c.topic, enc.space);
    const who = playerLabel(active, 14);
    panel.innerHTML = `
      <div class="quiz-card">
        <header class="quiz-card-top">
          <p class="card-topic">${c.topic || "Trail question"}</p>
          <p class="quiz-who">${cpuLock ? `🤖 ${who}` : who}</p>
        </header>
        <div class="quiz-art" style="background-image:url('${art}')" role="img" aria-label="${c.topic || "Valley scene"}">
          <span class="quiz-art-icon">${enc.space?.icon || "📜"}</span>
        </div>
        <h2 class="quiz-q">${c.q}</h2>
        ${enc.answered ? `<p class="learn-box compact-teach">${linkNativeWords(c.teach)}</p>` : ""}
        <p class="pane-label">${cpuLock ? (enc.answered ? `${who} answered` : enc.cpuFocus != null ? `${who} picks…` : `${who} is reading…`) : enc.answered ? "Result" : "Choose an answer"}</p>
        <div class="quiz-options quiz-stack">
          ${c.choices.map((t, i) => {
            let cls = "btn quiz-option";
            if (enc.answered) {
              if (i === c.answer) cls += " correct";
              else if (i === enc.picked) cls += " wrong";
            } else if (cpuLock && enc.cpuFocus === i) {
              cls += " cpu-focus";
            }
            return `<button type="button" class="${cls}" data-i="${i}" ${enc.answered || cpuLock ? "disabled" : ""}><span class="opt-letter">${String.fromCharCode(65 + i)}</span><span class="opt-text">${t}</span></button>`;
          }).join("")}
        </div>
        ${!enc.answered && !cpuLock && state.hintsLeft > 0 ? `<button type="button" class="btn btn-purple hint-btn" data-a="hint">💡 Hint (${state.hintsLeft})</button>` : ""}
        ${enc.hintShown && !enc.answered ? `<p class="hint hint-inline">💡 ${c.hint}</p>` : ""}
        <div class="quiz-footer">
          <button type="button" class="btn btn-primary btn-big" data-a="next"
            ${!enc.answered || cpuLock ? "disabled" : ""}
            ${!enc.answered ? 'aria-hidden="true"' : ""}>
            ${cpuLock && enc.answered ? `${who} continuing…` : enc.answered ? "Continue →" : "Tap an answer"}
          </button>
        </div>
      </div>
    `;
    if (!enc.answered && !cpuLock) {
      panel.querySelectorAll("[data-i]").forEach((btn) => {
        const go = () => handlers.storyAnswer(Number(btn.dataset.i));
        btn.addEventListener("click", go);
        btn.addEventListener("touchend", (e) => { e.preventDefault(); go(); }, { passive: false });
      });
      panel.querySelector("[data-a=hint]")?.addEventListener("click", handlers.storyHint);
    } else if (enc.answered && !cpuLock) {
      panel.querySelector("[data-a=next]")?.addEventListener("click", handlers.storyNext);
    }
    bindSayButtons(panel);
    return;
  }

  if (enc.kind === "minigame") {
    const game = enc.game;
    const arcade = isArcadeType(game.type);
    const meta = arcade ? ARCADE_META[game.type] : null;
    const title = meta?.title || enc.title || "Trail challenge";
    const blurb = enc.blurb || meta?.blurb || "";

    panel.innerHTML = `
      <div class="mg-full">
        <header class="mg-full-head">
          ${cpuLock ? `<p class="pane-label cpu-live">🤖 ${active?.name || "CPU"} is playing</p>` : ""}
          <h2>${title}</h2>
          <p class="mg-controls">${cpuLock ? "Watch them play" : (enc.controls || meta?.controls || "Tap the game")}</p>
          <p class="mg-blurb">${blurb}</p>
        </header>
        <div class="minigame-board mg-full-board ${arcade ? "arcade-board" : ""}" data-mg data-arcade="${arcade ? game.type : ""}"></div>
        ${!arcade && game.done ? `
          <div class="mg-footer">
            <button class="btn btn-primary btn-big" data-a="done" ${cpuLock ? "disabled" : ""}>
              ${cpuLock ? "Finishing…" : "Continue →"}
            </button>
          </div>` : ""}
      </div>
    `;
    const board = panel.querySelector("[data-mg]");
    if (!arcade) {
      renderMinigameBoard(board, game, handlers, enc);
      if (!cpuLock) panel.querySelector("[data-a=done]")?.addEventListener("click", handlers.minigameDone);
    } else {
      board.innerHTML = `<div class="arcade-placeholder"><p>${cpuLock ? "Starting…" : "Tap to play"}</p></div>`;
    }
    return;
  }

  if (enc.kind === "victory") {
    panel.innerHTML = `
      <div class="win-banner">
        <h2>🔥 ${enc.title}</h2>
        <p>${enc.text}</p>
        <p>Score <strong>${state.score}</strong> · Correct ${state.questionsCorrect}/${state.questionsTotal}</p>
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
}

function renderMinigameBoard(board, game, handlers, enc) {
  if (!board) return;
  if (game.type === "dig") {
    board.innerHTML = `
      <p class="mg-msg">${game.message}</p>
      <div class="dig-grid dig-grid-lg">
        ${game.cells.map((c) => `
          <button class="dig-cell ${c.revealed ? "dug" : ""} ${c.artifact && c.revealed ? "found" : ""}"
            ${c.revealed || game.done ? "disabled" : ""} data-dig="${c.i}">
            ${c.revealed ? (c.artifact ? c.artifact.emoji : "·") : "⬜"}
          </button>`).join("")}
      </div>
      <p class="hint">Digs left: ${game.attemptsLeft} · Click squares</p>
    `;
    board.querySelectorAll("[data-dig]").forEach((btn) => {
      btn.onclick = () => handlers.mg({ type: "dig", i: Number(btn.dataset.dig) });
    });
  } else if (game.type === "memory") {
    board.innerHTML = `
      <p class="mg-msg">${game.message}</p>
      <div class="memory-grid memory-grid-lg" style="--mem-cols:${Math.ceil(Math.sqrt(game.cards.length * 1.1))}">
        ${game.cards.map((c) => `
          <button type="button" class="memory-card ${c.flipped || c.matched ? "flipped" : ""} ${c.matched ? "matched" : ""}"
            data-mem="${c.id}" ${c.matched || game.done ? "disabled" : ""} aria-label="${c.flipped || c.matched ? c.label : "Hidden pictograph"}">
            ${c.flipped || c.matched
              ? `<img class="mem-art" src="${c.art}" alt="${c.label}" draggable="false" />`
              : `<span class="mem-back" aria-hidden="true">◼</span>`}
          </button>`).join("")}
      </div>
      <p class="hint">Tap two cards · ${game.pairs || Math.floor(game.cards.length / 2)} pairs · Moves ${game.moves || 0}</p>
    `;
    board.querySelectorAll("[data-mem]").forEach((btn) => {
      const flip = () => handlers.mg({ type: "memory-flip", id: btn.dataset.mem });
      btn.addEventListener("click", flip);
      btn.addEventListener("touchend", (e) => { e.preventDefault(); flip(); }, { passive: false });
    });
  } else if (game.type === "rice") {
    board.innerHTML = `
      <div class="rice-hud">
        <span>🌾 ${game.caught}/${game.goal}</span>
        <span class="rice-timer">${game.ticksLeft}s</span>
      </div>
      <div class="rice-mole-grid rice-mole-lg">
        ${game.pods.map((p) => `
          <button class="rice-mole ${p.phase}" data-pod="${p.id}" ${p.phase === "empty" || game.done ? "disabled" : ""}>
            ${p.phase === "ripe" ? "🌾" : p.phase === "green" ? "🌱" : "·"}
          </button>`).join("")}
      </div>
      <p class="hint">Click golden 🌾 only — leave 🌱 to grow</p>
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
        <p>Score ${state.score}.</p>
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
