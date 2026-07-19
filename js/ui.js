import { CHARACTERS, SUPERPOWERS, CLOTHING, renderDoodle, renderPortrait, getClothing } from "./characters.js";
import { DIFFICULTIES, WEAPONS, getWeapon, PARTY_FEELINGS, personalityFlavor, pickRandom } from "./data.js";
import { getActivePlayer } from "./state.js";
import { ARCADE_META, isArcadeType } from "./arcade.js";
import { COMPANIONS, getCompanion, companionLine } from "./companions.js";
import { getAnimal } from "./animals.js";
import { QUEST, questProgress } from "./quest.js";
import { sayButton, linkNativeWords, bindSayButtons, unlockAudio } from "./audio.js";

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

function escapeAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function clampInt(v, min, max) {
  return Math.max(min, Math.min(max, Number(v) || min));
}

/* ─────────────────────────── TITLE ─────────────────────────── */

export function renderTitle(onStart, onContinue, hasSave) {
  const cast = ["waver", "elegant", "willow", "sprout", "flurry"];
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
          <p class="title-ages">Ages 9–11 · history · puzzles · teamwork</p>
          <div class="title-cast" aria-hidden="true">
            ${cast.map((id) => renderPortrait(id, { size: 96, className: "title-portrait" })).join("")}
          </div>
        </div>
      </div>
    </section>
  `);
  node.querySelector('[data-action="start"]')?.addEventListener("click", () => { unlockAudio(); onStart(); });
  node.querySelector('[data-action="continue"]')?.addEventListener("click", () => { unlockAudio(); onContinue(); });
  return node;
}

/* ─────────────────────────── PARTY SETUP ─────────────────────────── */

export function renderPartySetup(setup, handlers) {
  const node = el(`
    <section class="screen">
      <div class="paper-card">
        <h2 class="section-title">Gather your portage crew</h2>
        <p class="hint">1–10 players (hotseat). More players = more foes on the water roads!</p>
        <div class="setup-grid two">
          <div class="field">
            <label for="playerCount">How many players?</label>
            <input id="playerCount" type="number" min="1" max="10" value="${setup.playerCount}" />
          </div>
          <div class="field">
            <label>Difficulty</label>
            <div class="choice-pills" data-diff>
              ${Object.values(DIFFICULTIES).map((d) => `
                <button type="button" class="pill ${setup.difficulty === d.id ? "active" : ""}" data-id="${d.id}" title="${d.tag}">
                  ${d.label}${d.recommended ? " ⭐" : ""}
                </button>`).join("")}
            </div>
            <span class="hint" data-difftag>${DIFFICULTIES[setup.difficulty]?.tag || ""}</span>
          </div>
        </div>
        <div class="field companion-toggle">
          <label>Trail companion</label>
          <label class="switch-row">
            <input type="checkbox" id="companionOn" ${setup.companionOn ? "checked" : ""} />
            <span>Bring an AI trail companion (auto-picked). Solo explorers get one for sure!</span>
          </label>
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" data-action="back">Back</button>
          <button class="btn btn-primary" data-action="next">Create Characters →</button>
        </div>
      </div>
    </section>
  `);

  node.querySelector("#playerCount").addEventListener("change", (e) => handlers.setCount(clampInt(e.target.value, 1, 10)));
  node.querySelectorAll("[data-diff] .pill").forEach((btn) => btn.addEventListener("click", () => handlers.setDifficulty(btn.dataset.id)));
  node.querySelector("#companionOn").addEventListener("change", (e) => handlers.setCompanion(e.target.checked));
  node.querySelector('[data-action="back"]').addEventListener("click", handlers.back);
  node.querySelector('[data-action="next"]').addEventListener("click", handlers.next);
  return node;
}

/* ─────────────────────────── CHARACTER CREATOR ─────────────────────────── */

export function renderCharacterCreator(setup, draft, handlers) {
  const idx = setup.draftingIndex;
  const total = setup.playerCount;
  const node = el(`
    <section class="screen">
      <div class="paper-card">
        <h2 class="section-title">Player ${idx + 1} of ${total}</h2>
        <p class="hint">Pick a doodle hero, name them, add a personality, and choose a superpower.</p>

        <div class="creator-grid">
          <div class="creator-preview">
            ${renderPortrait(draft.characterId, { size: 140 })}
            <div class="preview-name">${escapeAttr(draft.name) || "Your hero"}</div>
          </div>
          <div class="creator-fields">
            <div class="setup-grid two">
              <div class="field">
                <label for="pname">Your name</label>
                <input id="pname" maxlength="16" placeholder="Explorer name" value="${escapeAttr(draft.name)}" />
              </div>
              <div class="field">
                <label for="ppers">Personality</label>
                <input id="ppers" maxlength="40" placeholder="brave, silly, curious, kind…" value="${escapeAttr(draft.personality)}" />
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Choose your character</label>
          <div class="char-grid" data-chars>
            ${CHARACTERS.map((c) => `
              <button type="button" class="doodle-card ${draft.characterId === c.id ? "picked" : ""}" data-id="${c.id}">
                ${c.portrait ? renderPortrait(c.id, { size: 72 }) : renderDoodle(c.id, { size: 58 })}
                <div class="label">${c.name}</div>
              </button>`).join("")}
          </div>
        </div>

        <div class="field">
          <label>Superpower</label>
          <div class="power-grid" data-powers>
            ${SUPERPOWERS.map((p) => `
              <button type="button" class="power-card ${draft.powerId === p.id ? "active" : ""}" data-id="${p.id}">
                <h4>${p.icon} ${p.name}</h4>
                <p>${p.desc}</p>
              </button>`).join("")}
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" data-action="back">Back</button>
          <button class="btn btn-primary" data-action="save">${idx + 1 < total ? "Next Player →" : "Hit the Trail! →"}</button>
        </div>
      </div>
    </section>
  `);

  node.querySelectorAll("[data-chars] .doodle-card").forEach((card) => card.addEventListener("click", () => handlers.setChar(card.dataset.id)));
  node.querySelectorAll("[data-powers] .power-card").forEach((card) => card.addEventListener("click", () => handlers.setPower(card.dataset.id)));
  node.querySelector("#pname").addEventListener("input", (e) => handlers.setName(e.target.value));
  node.querySelector("#ppers").addEventListener("input", (e) => handlers.setPersonality(e.target.value));
  node.querySelector('[data-action="back"]').addEventListener("click", handlers.back);
  node.querySelector('[data-action="save"]').addEventListener("click", handlers.save);
  return node;
}

/* ─────────────────────────── TRAIL MAP ─────────────────────────── */

function mapLayout(n) {
  const perRow = 5;
  const rows = Math.ceil(n / perRow);
  const W = 1000, padX = 95, padTop = 74, rowH = 150;
  const H = padTop + (rows - 1) * rowH + 70;
  const usableW = W - padX * 2;
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const ltr = row % 2 === 0;
    const c = ltr ? col : perRow - 1 - col;
    const x = perRow === 1 ? W / 2 : padX + usableW * (c / (perRow - 1));
    const y = padTop + row * rowH;
    nodes.push({ x, y, i });
  }
  return { W, H, nodes };
}

export function renderTrailMap(state) {
  const stops = state.stops;
  const { W, H, nodes } = mapLayout(stops.length);
  const cur = Math.max(0, state.stopIndex);

  const pathD = nodes.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(" ");

  const nodeSvg = nodes.map((p) => {
    const stop = stops[p.i];
    const done = p.i < cur;
    const current = p.i === cur && state.stopIndex >= 0;
    const cls = done ? "map-node done" : current ? "map-node current" : "map-node ahead";
    const reveal = done || current;
    const label = reveal ? stop.name : "???";
    return `
      <g class="${cls}" data-node="${p.i}" data-name="${escapeAttr(stop.name)}" data-reveal="${reveal}" transform="translate(${p.x},${p.y})">
        <circle r="27" />
        <text class="map-icon" y="8">${stop.icon || "•"}</text>
        <text class="map-num" y="-34">${p.i + 1}</text>
        ${done ? `<text class="map-check" x="20" y="-16">✅</text>` : ""}
        ${reveal ? `<text class="map-label" y="46">${label.length > 16 ? label.slice(0, 15) + "…" : label}</text>` : ""}
      </g>`;
  }).join("");

  // Markers on the current node: you + companion + animals
  const curNode = nodes[cur] || nodes[0];
  const animalEmojis = (state.animalFriends || []).map((id) => getAnimal(id)?.emoji || "").join("");
  const compIcon = state.companion ? state.companion.icon : "";
  const markers = `
    <g class="map-markers" transform="translate(${curNode.x},${curNode.y - 54})">
      <text class="marker-you" text-anchor="middle">📍</text>
      <text class="marker-crew" y="-2" x="26">${compIcon}${animalEmojis}</text>
    </g>`;

  return `
    <div class="trail-map-wrap">
      <div class="map-title">Your portage path to the Council of Stories</div>
      <svg class="trail-map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Trail map across Minnesota waters and woods">
        <path class="map-path-under" d="${pathD}" />
        <path class="map-path" d="${pathD}" />
        ${nodeSvg}
        ${markers}
      </svg>
      <div class="map-legend">
        <span><b class="dot done"></b> visited</span>
        <span><b class="dot current"></b> you are here</span>
        <span><b class="dot ahead"></b> still ahead</span>
      </div>
    </div>`;
}

/* ─────────────────────────── HUD ─────────────────────────── */

function statusChips(state) {
  const chips = [];
  (state.ailments || []).forEach((a) => chips.push(`<span class="chip ailment" title="${a.name}">${a.emoji} ${a.name}</span>`));
  if (state.rations <= 20) chips.push(`<span class="chip warn">🍽️ Getting hungry!</span>`);
  if (!chips.length) chips.push(`<span class="chip ok">✨ Feeling good</span>`);
  return `<div class="status-chips">${chips.join("")}</div>`;
}

function companionCard(state) {
  const c = state.companion;
  if (!c) return "";
  return `
    <div class="companion-card">
      <div class="companion-doodle">${renderDoodle(c.characterId, { size: 40, clothingId: c.clothingId })}</div>
      <div class="companion-info">
        <div class="companion-name">${c.icon} ${c.name} <span class="companion-tag">companion</span></div>
        <div class="companion-pers">${c.personality} · helps left: ${c.helpsLeft}</div>
      </div>
    </div>`;
}

function hud(state) {
  const stop = state.stopIndex < 0 ? state.start : state.stops[Math.min(state.stopIndex, state.stops.length - 1)];
  const locName = stop?.name || "Portage";
  const biome = state.stopIndex < 0 ? state.start.biome : stop?.biome || "forest";
  const active = getActivePlayer(state);
  const eqW = getWeapon(state.equippedWeapon);
  const qp = questProgress(state);
  const animalStrip = (state.animalFriends || []).map((id) => {
    const a = getAnimal(id);
    return `<span class="friend-chip" title="${a?.perk || ""}">${a?.emoji || ""}</span>`;
  }).join("");

  return `
    <div class="hud">
      <div class="quest-banner" title="${QUEST.short}">
        <span class="quest-label">${QUEST.itemEmoji} ${QUEST.title}</span>
        <span class="quest-stones">${QUEST.stoneEmoji} Story Stones: ${qp.stones}/${qp.total || "—"}</span>
        <span class="quest-hint">Goal: ${QUEST.goalStops}</span>
      </div>
      <div class="hud-top">
        <div class="location-badge">📍 ${locName}</div>
        <div class="hud-turn">${state.players.length > 1 ? `🎲 ${active.name}'s turn` : ""}</div>
        <div class="hud-score">⭐ ${state.score}</div>
      </div>
      <div class="hud-bars">
        <div class="bar"><span>❤️ Health</span><div class="bar-track"><div class="bar-fill health" style="width:${(state.health / state.maxHealth) * 100}%"></div></div><span>${state.health}</span></div>
        <div class="bar"><span>⚡ Energy</span><div class="bar-track"><div class="bar-fill energy" style="width:${(state.energy / state.maxEnergy) * 100}%"></div></div><span>${state.energy}</span></div>
        <div class="bar"><span>🍖 Food</span><div class="bar-track"><div class="bar-fill rations" style="width:${(state.rations / state.maxRations) * 100}%"></div></div><span>${state.rations}</span></div>
      </div>
      ${companionCard(state)}
      ${statusChips(state)}
      <div class="party-strip">
        ${state.players.map((p, i) => {
          const cloth = getClothing(p.clothingId);
          return `<div class="party-chip ${i === state.activePlayer ? "active-turn" : ""}">
            <span class="mini">${renderDoodle(p.characterId, { size: 26, clothingId: p.clothingId })}</span>
            <span>${p.name || "Player"} ${cloth?.emoji || ""}</span>
          </div>`;
        }).join("")}
        ${eqW ? `<div class="party-chip weapon-chip" title="Equipped weapon">${eqW.emoji} ${eqW.name}</div>` : ""}
        ${animalStrip ? `<div class="party-chip friends">${animalStrip}</div>` : ""}
      </div>
    </div>
    <div class="biome scene ${biome}">
      <div class="biome-bg"></div>
      <div class="party-on-trail">
        ${state.players.map((p, i) => renderDoodle(p.characterId, {
          size: 46,
          clothingId: p.clothingId,
          animalEmoji: i === 0 ? (getAnimal((state.animalFriends || [])[0])?.emoji || "") : "",
        })).join("")}
        ${state.companion ? renderDoodle(state.companion.characterId, { size: 42, clothingId: state.companion.clothingId, className: "companion-onscene" }) : ""}
      </div>
      <div class="biome-content">
        <div class="story-box" id="story-slot"></div>
      </div>
    </div>
  `;
}

/* ─────────────────────────── TRAIL SCREEN ─────────────────────────── */

export function renderTrail(state, handlers) {
  const active = getActivePlayer(state);
  const node = el(`
    <section class="screen">
      ${hud(state)}
      ${renderTrailMap(state)}
      <div class="paper-card encounter-panel" id="encounter"></div>
      <div class="paper-card gear-card">
        <h3 class="section-title" style="font-size:1.3rem">🎒 Snacks, medicine & gear</h3>
        <div class="inventory" data-inv>
          ${state.inventory.length
            ? state.inventory.map((item, i) => {
                const med = item.type === "medicine";
                return `<button class="item-chip ${med ? "medicine" : ""}" data-eat="${i}">${item.emoji} ${item.name}${med ? " 💊" : ` (+${item.energy}⚡${item.health ? ` +${item.health}❤️` : ""})`}</button>`;
              }).join("")
            : `<span class="hint">No snacks left — hunt, forage, or find helpers!</span>`}
        </div>

        <div class="gear-actions">
          <button class="btn btn-blue" data-action="rest">🏕️ Make camp (rest)</button>
        </div>

        <div class="gear-row">
          <span class="hint">Weapons (equip for hunts & scaring foes):</span>
          <div class="weapon-row" data-weapons>
            ${state.weaponsOwned.map((id) => {
              const w = getWeapon(id);
              const eq = state.equippedWeapon === id;
              return `<button class="weapon-btn ${eq ? "equipped" : ""}" data-weapon="${id}" title="${w?.desc || ""}">${w?.emoji || ""} ${w?.name || id}</button>`;
            }).join("")}
          </div>
        </div>

        <div class="gear-row">
          <span class="hint">Outfits for ${active.name} (changes their look!):</span>
          <div class="clothing-row" data-clothes>
            ${state.clothingOwned.map((id) => {
              const c = getClothing(id);
              const eq = active.clothingId === id;
              return `<button class="cloth-btn ${eq ? "equipped" : ""}" data-cloth="${id}">${c.emoji} ${c.name}</button>`;
            }).join("")}
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" data-action="title">Save & Exit</button>
        </div>
      </div>
    </section>
  `);

  const story = node.querySelector("#story-slot");
  const panel = node.querySelector("#encounter");
  fillEncounter(story, panel, state, handlers);

  node.querySelectorAll("[data-eat]").forEach((btn) => btn.addEventListener("click", () => handlers.eat(Number(btn.dataset.eat))));
  node.querySelectorAll("[data-cloth]").forEach((btn) => btn.addEventListener("click", () => handlers.equip(btn.dataset.cloth)));
  node.querySelectorAll("[data-weapon]").forEach((btn) => btn.addEventListener("click", () => handlers.equipWeapon(btn.dataset.weapon)));
  node.querySelector('[data-action="rest"]').addEventListener("click", handlers.rest);
  node.querySelector('[data-action="title"]').addEventListener("click", handlers.exit);
  node.querySelectorAll("[data-node]").forEach((g) => {
    if (g.getAttribute("data-reveal") === "true") {
      g.style.cursor = "pointer";
      g.addEventListener("click", () => handlers.mapPeek(Number(g.dataset.node)));
    }
  });
  return node;
}

/* ─────────────────────────── Narration helpers ─────────────────────────── */

function beatLine(state, stop) {
  const p = getActivePlayer(state);
  const parts = [];
  if (stop?.beat) parts.push(stop.beat);
  parts.push(pickRandom(PARTY_FEELINGS));
  const flav = personalityFlavor(p.name, p.personality);
  if (flav && Math.random() < 0.6) parts.push(flav);
  return parts.join(" ");
}

function storyWithBeat(state, stop) {
  return `<span class="story-main">${linkNativeWords(stop.story)}</span><span class="story-beat">${beatLine(state, stop)}</span>`;
}

/* ─────────────────────────── ENCOUNTERS ─────────────────────────── */

function fillEncounter(story, panel, state, handlers) {
  const enc = state.encounter;
  const active = getActivePlayer(state);
  if (!enc) {
    story.textContent = "The trail waits…";
    panel.innerHTML = `<p>Loading encounter…</p>`;
    return;
  }

  if (enc.kind === "intro") {
    const briefing = QUEST.briefing(active.name, state.companion?.name).replace(/\n/g, "<br/>");
    story.innerHTML = `<span class="story-main">${linkNativeWords(enc.text)}</span>${state.companion ? `<span class="story-beat">${companionLine(state.companion, "start", active.name)}</span>` : ""}`;
    panel.innerHTML = `
      <h2>${QUEST.itemEmoji} ${enc.title}</h2>
      <p class="quest-brief">${briefing}</p>
      <p class="learn-box">A <strong>portage</strong> is when you carry a canoe over land between waters.
        ${sayButton("portage")} · Hear ${sayButton("boozhoo")} · ${sayButton("manoomin")}</p>
      <div class="btn-row"><button class="btn btn-primary btn-big" data-a="go">Lift the Bundle — let's go!</button></div>
    `;
    panel.querySelector("[data-a=go]").onclick = () => { unlockAudio(); handlers.introGo(); };
    bindSayButtons(panel);
    bindSayButtons(story);
    return;
  }

  if (enc.kind === "helper") {
    const h = enc.helper;
    story.textContent = "A friendly face waves from the path.";
    panel.innerHTML = `
      <div class="npc">
        ${renderDoodle(pickRandom(CHARACTERS).id, { size: 56 })}
        <div class="bubble"><strong>${h.name}:</strong> ${h.line}</div>
      </div>
      <div class="btn-row"><button class="btn btn-primary" data-a="ok">Thanks, ${h.name}!</button></div>
    `;
    panel.querySelector("[data-a=ok]").onclick = handlers.helperOk;
    return;
  }

  if (enc.kind === "foe") {
    const eqW = getWeapon(state.equippedWeapon);
    story.innerHTML = `<span class="story-main">Uh-oh… trouble on the trail!</span>${state.companion ? `<span class="story-beat">${companionLine(state.companion, "foe", active.name)}</span>` : ""}`;
    panel.innerHTML = `
      <div class="npc foe">
        <div class="foe-face">😤</div>
        <div class="bubble"><strong>${enc.foe.name}:</strong> ${enc.text}</div>
      </div>
      <div class="btn-row">
        <button class="btn btn-orange" data-a="brave">Face them with math!</button>
        ${eqW ? `<button class="btn btn-purple" data-a="scare">Scare it off (${eqW.emoji} ${eqW.name})</button>` : ""}
        <button class="btn btn-ghost" data-a="pay">Pay the toll</button>
      </div>
    `;
    panel.querySelector("[data-a=brave]").onclick = () => handlers.foe("brave");
    panel.querySelector("[data-a=pay]").onclick = () => handlers.foe("pay");
    panel.querySelector("[data-a=scare]")?.addEventListener("click", () => handlers.foe("scare"));
    return;
  }

  if (enc.kind === "foe-math") {
    story.textContent = "Quick! Solve it before the foe pounces!";
    panel.innerHTML = `
      <h2>${enc.title}</h2>
      <p class="math-q">${enc.question}</p>
      <div class="quiz-options">
        ${enc.choices.map((c, i) => `<button class="btn quiz-option" data-i="${i}">${c}</button>`).join("")}
      </div>
    `;
    panel.querySelectorAll("[data-i]").forEach((btn) => (btn.onclick = () => handlers.foeMath(Number(btn.dataset.i))));
    return;
  }

  if (enc.kind === "trivia") {
    const t = enc.trivia;
    story.textContent = "You pause at a crackling campfire for a quick brain-stretch.";
    panel.innerHTML = `
      <h2>🔥 ${enc.title}</h2>
      <p style="font-weight:600">${t.q}</p>
      <div class="quiz-options">
        ${t.choices.map((c, i) => {
          let cls = "btn quiz-option";
          if (enc.answered) {
            if (i === t.a) cls += " correct";
            else if (i === enc.picked) cls += " wrong";
          }
          return `<button class="${cls}" data-i="${i}" ${enc.answered ? "disabled" : ""}>${c}</button>`;
        }).join("")}
      </div>
      ${enc.answered ? `<p class="learn-box">💡 ${t.hint}</p><div class="btn-row"><button class="btn btn-primary" data-a="next">Continue →</button></div>` : ""}
    `;
    if (!enc.answered) panel.querySelectorAll("[data-i]").forEach((btn) => (btn.onclick = () => handlers.trivia(Number(btn.dataset.i))));
    else panel.querySelector("[data-a=next]").onclick = handlers.triviaNext;
    return;
  }

  if (enc.kind === "quiz") {
    const stop = enc.stop;
    story.innerHTML = storyWithBeat(state, stop);
    const elim = enc.eliminated || [];
    panel.innerHTML = `
      <h2>${stop.name}</h2>
      <div class="learn-box"><strong>Trail fact:</strong> ${linkNativeWords(stop.learn)}</div>
      <p class="quiz-q"><strong>${active.name}</strong>, ${stop.question}</p>
      ${enc.hintUsed ? `<p class="hint">💡 Hint: ${stop.hint}</p>` : ""}
      ${enc.tip ? `<p class="companion-tip">${enc.tip}</p>` : ""}
      ${enc.helpNote && !enc.answered ? `<p class="companion-tip">${enc.helpNote}</p>` : ""}
      <div class="quiz-options">
        ${stop.choices.map((c, i) => {
          let cls = "btn quiz-option";
          const crossed = elim.includes(i) && !enc.answered;
          if (enc.answered) {
            if (i === stop.answer) cls += " correct";
            else if (i === enc.picked) cls += " wrong";
          }
          if (crossed) cls += " crossed";
          return `<button class="${cls}" data-i="${i}" ${enc.answered || crossed ? "disabled" : ""}>${c}</button>`;
        }).join("")}
      </div>
      ${enc.answered && enc.companionReact ? `<p class="companion-tip">${enc.companionReact}</p>` : ""}
      <div class="btn-row">
        ${!enc.answered && state.hintsLeft > 0 && !enc.hintUsed ? `<button class="btn btn-purple" data-a="hint">💡 Time Echo hint (${state.hintsLeft})</button>` : ""}
        ${!enc.answered && state.companion && state.companion.helpsLeft > 0 ? `<button class="btn btn-blue" data-a="help">${state.companion.name}: cross out 2 (${state.companion.helpsLeft})</button>` : ""}
        ${!enc.answered && state.companion && !state.companion.tipUsedThisQuiz ? `<button class="btn btn-ghost" data-a="tip">${state.companion.name}: free tip</button>` : ""}
        ${enc.answered ? `<button class="btn btn-primary" data-a="next">Add Story Stone →</button>` : ""}
      </div>
    `;
    if (!enc.answered) {
      panel.querySelectorAll("[data-i]").forEach((btn) => {
        if (!btn.disabled) btn.onclick = () => handlers.quiz(Number(btn.dataset.i));
      });
      panel.querySelector("[data-a=hint]")?.addEventListener("click", handlers.hint);
      panel.querySelector("[data-a=help]")?.addEventListener("click", handlers.companionHelp);
      panel.querySelector("[data-a=tip]")?.addEventListener("click", handlers.companionTip);
    } else {
      panel.querySelector("[data-a=next]").onclick = handlers.quizNext;
    }
    bindSayButtons(panel);
    bindSayButtons(story);
    return;
  }

  if (enc.kind === "minigame") {
    const stop = enc.stop;
    const game = enc.game;
    const arcade = isArcadeType(game.type);
    const meta = arcade ? ARCADE_META[game.type] : null;
    const eqW = getWeapon(state.equippedWeapon);
    story.innerHTML = storyWithBeat(state, stop);
    panel.innerHTML = `
      <h2>${stop.name}</h2>
      <div class="learn-box"><strong>Learn:</strong> ${linkNativeWords(stop.learn)}</div>
      ${arcade ? `<p class="arcade-intro">${meta.blurb}${game.type === "hunt" && eqW ? ` <em>(${active.name} readies the ${eqW.emoji} ${eqW.name}.)</em>` : ""}</p>` : `<p>${game.message}</p>`}
      <div class="minigame-board ${arcade ? "arcade-board" : ""}" data-mg data-arcade="${arcade ? game.type : ""}"></div>
      ${!arcade && game.done ? `<div class="btn-row"><button class="btn btn-primary" data-a="done">Continue →</button></div>` : ""}
    `;
    const board = panel.querySelector("[data-mg]");
    if (!arcade) {
      renderMinigameBoard(board, game, handlers);
      if (game.done) panel.querySelector("[data-a=done]").onclick = handlers.minigameDone;
    } else {
      board.innerHTML = `<div class="arcade-placeholder">Click the game screen, then press <kbd>Enter</kbd> to start.</div>`;
    }
    return;
  }

  if (enc.kind === "finale") {
    const stop = enc.stop;
    story.innerHTML = storyWithBeat(state, stop);
    panel.innerHTML = `
      <h2>${stop.name}</h2>
      <div class="learn-box"><strong>Remember:</strong> ${linkNativeWords(stop.learn)}</div>
      <p>You carried <strong>${state.storyStones || 0} Story Stones</strong> in the Bundle.
        <strong>${active.name}</strong>, which discovery will you share first?
        ${state.companion ? ` ${state.companion.name} leans in, ready to cheer.` : ""}</p>
      <div class="btn-row"><button class="btn btn-primary btn-big" data-a="fin">Open the Bundle & finish</button></div>
    `;
    panel.querySelector("[data-a=fin]").onclick = handlers.finale;
    bindSayButtons(panel);
    bindSayButtons(story);
    return;
  }

  if (enc.kind === "victory") {
    story.textContent = "The lake sparkles. The Bundle is open. You did it!";
    panel.innerHTML = renderVictoryInner(state);
    wireVictory(panel, handlers);
  }

  bindSayButtons(panel);
  bindSayButtons(story);
}

function renderMinigameBoard(board, game, handlers) {
  if (game.type === "dig") {
    board.innerHTML = `
      <p class="hint">Digs left: ${game.attemptsLeft}</p>
      <div class="dig-grid">
        ${game.cells.map((c) => {
          let content = "", cls = "dig-cell";
          if (c.revealed) {
            if (c.artifact) { content = c.artifact.emoji; cls += " found"; }
            else { content = "·"; cls += " empty"; }
          }
          return `<button class="${cls}" data-dig="${c.i}" ${c.revealed || game.done ? "disabled" : ""}>${content}</button>`;
        }).join("")}
      </div>`;
    board.querySelectorAll("[data-dig]").forEach((btn) => (btn.onclick = () => handlers.mg({ type: "dig", index: Number(btn.dataset.dig) })));
  } else if (game.type === "memory") {
    board.innerHTML = `
      <p class="hint">Moves: ${game.moves}</p>
      <div class="memory-grid">
        ${game.cards.map((c) => {
          const show = c.flipped || c.matched;
          return `<button class="memory-card ${show ? "flipped" : ""} ${c.matched ? "matched" : ""}" data-mem="${c.id}">${show ? c.symbol : "?"}</button>`;
        }).join("")}
      </div>`;
    board.querySelectorAll("[data-mem]").forEach((btn) => (btn.onclick = () => handlers.mg({ type: "memory-flip", cardId: btn.dataset.mem })));
  } else if (game.type === "rice") {
    board.innerHTML = `
      <p class="hint">Ripe gathered: ${game.caught}/${game.goal}</p>
      <div class="rice-static-grid">
        ${game.pods.map((p) => {
          if (p.caught) return `<button class="rice-static caught" disabled>${p.ripe ? "✓" : "·"}</button>`;
          return `<button class="rice-static ${p.ripe ? "ripe" : "green"}" data-pod="${p.id}">${p.ripe ? "🌾" : "🌱"}</button>`;
        }).join("")}
      </div>`;
    board.querySelectorAll("[data-pod]").forEach((btn) => (btn.onclick = () => handlers.mg({ type: "rice-catch", podId: btn.dataset.pod })));
  }
}

/* ─────────────────────────── VICTORY ─────────────────────────── */

function renderVictoryInner(state) {
  const enc = state.encounter || {};
  const party = enc.party;
  const accuracy = enc.accuracy ?? 100;
  const badges = enc.badges || [];
  const active = state.players[0];
  const confetti = party
    ? `<div class="confetti">${Array.from({ length: 26 }).map((_, i) => `<span style="left:${(i * 3.9) % 100}%;animation-delay:${(i % 8) * 0.18}s;background:${["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#7c3aed", "#f472b6"][i % 6]}"></span>`).join("")}</div>`
    : "";
  const dancers = `
    <div class="dancers ${party ? "partying" : ""}">
      ${state.players.slice(0, 6).map((p) => renderDoodle(p.characterId, { size: 60, clothingId: p.clothingId, expr: "sing" })).join("")}
      ${state.companion ? renderDoodle(state.companion.characterId, { size: 58, clothingId: state.companion.clothingId, expr: "happy" }) : ""}
    </div>`;

  return `
    <div class="victory ${party ? "is-party" : "is-quiet"}">
      ${confetti}
      <div class="win-banner">
        <h2>${party ? "🎉 Portage Party! 🎉" : "🛶 Portage Complete"}</h2>
        <p class="win-sub">${party
          ? `${active?.name || "Explorer"} carried the Bundle well — time to celebrate!`
          : "You reached the Council of Stories. A calm, proud finish."}</p>
      </div>
      ${dancers}
      ${state.companion ? `<p class="companion-cheer">${companionLine(state.companion, "win", active?.name || "friend")}</p>` : ""}
      ${badges.length ? `<div class="badges">${badges.map((b) => `<span class="badge">${b.emoji} ${b.label}</span>`).join("")}</div>` : ""}
      <div class="stat-grid">
        <div class="stat-tile"><div class="num">${state.score}</div>Score</div>
        <div class="stat-tile"><div class="num">${state.questionsCorrect}/${state.questionsTotal}</div>Quizzes (${accuracy}%)</div>
        <div class="stat-tile"><div class="num">${state.artifacts.length}</div>Artifacts</div>
        <div class="stat-tile"><div class="num">${(state.animalFriends || []).length}</div>Animal friends</div>
      </div>
      <div class="learn-box">
        <strong>Things you learned:</strong>
        <ul>${state.learned.map((l) => `<li>${l}</li>`).join("") || "<li>Every step taught you something!</li>"}</ul>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" data-a="again">Play again</button>
        <button class="btn btn-ghost" data-a="home">Home</button>
      </div>
    </div>
  `;
}

function wireVictory(panel, handlers) {
  panel.querySelector("[data-a=again]").onclick = handlers.again;
  panel.querySelector("[data-a=home]").onclick = handlers.home;
}

export function renderGameOver(state, handlers) {
  if (state.won) {
    const node = el(`<section class="screen"><div class="paper-card">${renderVictoryInner(state)}</div></section>`);
    wireVictory(node, handlers);
    return node;
  }
  const node = el(`
    <section class="screen">
      <div class="paper-card win-banner game-over">
        <h2>💤 Out of health…</h2>
        <p>The trail got tough this time. Eat snacks, rest at camp, cure ailments, and try a gentler difficulty!</p>
        <div class="stat-tile" style="display:inline-block;margin:1rem auto"><div class="num">${state.score}</div>Score</div>
        <div class="btn-row">
          <button class="btn btn-primary" data-a="again">Try again</button>
          <button class="btn btn-ghost" data-a="home">Home</button>
        </div>
      </div>
    </section>
  `);
  node.querySelector("[data-a=again]").onclick = handlers.again;
  node.querySelector("[data-a=home]").onclick = handlers.home;
  return node;
}
