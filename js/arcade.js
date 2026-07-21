/**
 * Oregon Trail–style arcade minigames — tap-first for phones/tablets.
 * Mobile: tap the canvas or on-screen buttons. Desktop: arrows move, Space acts, Enter starts/continues.
 */
import { getWeapon } from "./data.js?v=race13";

const KEY = {
  left: "ArrowLeft",
  right: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
  action: " ",
  enter: "Enter",
};

export const ARCADE_META = {
  hunt: {
    id: "hunt",
    title: "Forest Hunt",
    blurb: "Animals cross the trail. Tap near one to throw — aim helps you lead the shot.",
    controls: "Tap where an animal is headed",
  },
  portage: {
    id: "portage",
    title: "Portage Carry",
    blurb: "Carry the canoe down the trail. Tap ▲ / ▼ to switch paths and dodge rocks & logs.",
    controls: "Tap ▲ / ▼ to switch paths",
  },
  forage: {
    id: "forage",
    title: "Woodland Harvest",
    blurb: "Tap tiles to move and gather. Watch for mosquitoes!",
    controls: "Tap tiles to move / gather",
  },
  trap: {
    id: "trap",
    title: "Trapline",
    blurb: "Set snares on animal paths, then check them. Don’t spook the critters!",
    controls: "◀▶ spot · ● set/check",
  },
  rapids: {
    id: "rapids",
    title: "River Rapids",
    blurb: "Steer your canoe through rocky water. Stay in the safe channel!",
    controls: "◀▶ steer · ● boost",
  },
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** @returns {{ destroy: Function }} */
export function mountArcade(container, gameId, { difficulty = "beginner", puzzleMaster = false, weapon = null, strongArms = false, calmWater = false, autoPlay = false } = {}, onComplete) {
  container.innerHTML = "";
  container.classList.add("arcade-host");

  const hud = document.createElement("div");
  hud.className = "arcade-hud";

  const canvas = document.createElement("canvas");
  canvas.className = "arcade-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", ARCADE_META[gameId]?.title || "Minigame");

  // Logical size first (fixes iPhone hit-testing after CSS stretch)
  const hostW = container.clientWidth || Math.min(920, window.innerWidth * 0.94);
  const hostH = Math.max(200, (container.clientHeight || window.innerHeight * 0.42) - 8);
  const logicalW = Math.round(Math.min(920, Math.max(300, hostW)));
  const logicalH = Math.round(Math.min(520, Math.max(210, Math.min(hostH, logicalW * 0.62))));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.style.width = `${logicalW}px`;
  canvas.style.height = `${logicalH}px`;
  canvas.width = Math.floor(logicalW * dpr);
  canvas.height = Math.floor(logicalH * dpr);

  const keysHelp = document.createElement("div");
  keysHelp.className = "arcade-keys";
  const tapHints = {
    hunt: "Tap where an animal is headed to throw",
    portage: "Tap ▲ / ▼ (or the trail) to switch paths",
    forage: "Tap a tile to step there · tap again to gather",
  };
  keysHelp.innerHTML = autoPlay
    ? `<span class="cpu-live">🤖 CPU playing — watch!</span>`
    : `<span>${tapHints[gameId] || "Tap Start · use on-screen buttons or swipe the game"}</span>`;

  const touch = document.createElement("div");
  const padKind = gameId === "portage" ? "lanes" : gameId === "forage" ? "none" : "tap";
  touch.className = `arcade-touch${padKind === "lanes" ? " arcade-touch-lanes" : ""}`;
  touch.hidden = !!autoPlay || padKind === "none";
  touch.innerHTML = padKind === "lanes"
    ? `
    <button type="button" class="arcade-pad arcade-pad-lane" data-touch="up" aria-label="Switch to higher path">▲<span>Higher path</span></button>
    <button type="button" class="arcade-pad arcade-pad-lane" data-touch="down" aria-label="Switch to lower path">▼<span>Lower path</span></button>
  `
    : `<button type="button" class="arcade-pad arcade-pad-action arcade-pad-wide" data-touch="action" aria-label="Tap">TAP</button>`;

  container.appendChild(hud);
  container.appendChild(canvas);
  if (!autoPlay) container.appendChild(touch);
  container.appendChild(keysHelp);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const keys = new Set();
  let raf = 0;
  let alive = true;
  let last = performance.now();
  let autoFinishTimer = null;
  let actionCd = 0;
  const held = { left: false, right: false, up: false, down: false };

  const scale =
    difficulty === "hard" ? 1.35 : difficulty === "medium" ? 1.15 : 1;
  const ease = puzzleMaster ? 0.85 : 1;

  const game = createGame(gameId, logicalW, logicalH, scale * ease, { weapon, strongArms, calmWater });
  hud.textContent = autoPlay ? `🤖 CPU · ${game.hud()}` : game.hud();

  if (autoPlay) {
    setTimeout(() => {
      if (!alive || game.started) return;
      game.started = true;
      game.message = "";
    }, 700);
  }

  const onKeyDown = (e) => {
    if (!alive || autoPlay) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    keys.add(e.key);
    if (!game.started && (e.key === KEY.enter || e.key === KEY.action)) {
      game.started = true;
      game.message = "";
      return;
    }
    if (game.done && e.key === KEY.enter) { finish(); return; }
    if (game.started && !game.done && e.key === KEY.action) game.action();
  };
  const onKeyUp = (e) => keys.delete(e.key);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const continueRow = document.createElement("div");
  continueRow.className = "mg-done-row arcade-continue-row";
  continueRow.hidden = true;
  continueRow.innerHTML = `<button type="button" class="btn btn-primary btn-big" data-arcade-continue>Continue →</button>`;
  continueRow.querySelector("[data-arcade-continue]").addEventListener("click", (e) => {
    e.preventDefault();
    finish();
  });
  container.appendChild(continueRow);

  const showContinue = () => {
    continueRow.hidden = false;
    touch.hidden = true;
    hud.textContent = `${game.message || "Challenge finished"} · tap Continue`;
    if (autoPlay && !autoFinishTimer) autoFinishTimer = setTimeout(() => finish(), 2200);
  };

  const bindHold = (btn, dir) => {
    const down = (e) => {
      e.preventDefault();
      held[dir] = true;
      if (!game.started) { game.started = true; game.message = ""; }
    };
    const up = (e) => { e.preventDefault(); held[dir] = false; };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  };
  touch.querySelectorAll("[data-touch]").forEach((btn) => {
    const kind = btn.getAttribute("data-touch");
    if (kind === "action") {
      const fire = (e) => {
        e.preventDefault();
        if (!game.started) { game.started = true; game.message = ""; return; }
        if (game.done) return;
        game.action();
      };
      btn.addEventListener("pointerdown", fire);
    } else if (kind === "up" || kind === "down") {
      const fire = (e) => {
        e.preventDefault();
        if (!game.started) { game.started = true; game.message = ""; return; }
        if (game.done) return;
        if (typeof game.laneStep === "function") game.laneStep(kind === "up" ? -1 : 1);
      };
      btn.addEventListener("pointerdown", fire);
    } else {
      bindHold(btn, kind);
    }
  });

  const canvasPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * logicalW,
      y: ((e.clientY - rect.top) / rect.height) * logicalH,
    };
  };

  const onPointer = (e) => {
    if (!alive || autoPlay) return;
    e.preventDefault();
    canvas.focus();
    const { x, y } = canvasPos(e);
    if (!game.started) {
      game.started = true;
      game.message = "";
      return;
    }
    if (game.done) return;
    if (typeof game.pointer === "function") {
      game.pointer(x, y);
      return;
    }
    if (game.hunterX != null) {
      game.hunterX = Math.max(40, Math.min(logicalW - 40, x));
      if (typeof game.action === "function") game.action();
      return;
    }
    if (game.cols && game.x != null && game.y != null) {
      const tw = logicalW / game.cols;
      const th = (logicalH - 40) / (game.rows || game.cols);
      const tc = Math.max(0, Math.min(game.cols - 1, Math.floor(x / tw)));
      const tr = Math.max(0, Math.min((game.rows || game.cols) - 1, Math.floor(Math.max(0, y - 20) / th)));
      // Tap a cell: step toward it, gather if already there
      if (tc === game.x && tr === game.y && typeof game.action === "function") {
        game.action();
      } else {
        game._touchStep = {
          x: Math.sign(tc - game.x),
          y: Math.sign(tr - game.y),
        };
      }
      return;
    }
    if (typeof game.action === "function") game.action();
  };
  canvas.addEventListener("pointerdown", onPointer);

  function finish() {
    if (!alive) return;
    alive = false;
    if (autoFinishTimer) { clearTimeout(autoFinishTimer); autoFinishTimer = null; }
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("pointerdown", onPointer);
    onComplete(game.result());
  }

  function readMove() {
    const step = game._touchStep;
    if (step) {
      game._touchStep = null;
      return step;
    }
    return {
      x: (keys.has(KEY.right) || held.right ? 1 : 0) - (keys.has(KEY.left) || held.left ? 1 : 0),
      y: (keys.has(KEY.down) || held.down ? 1 : 0) - (keys.has(KEY.up) || held.up ? 1 : 0),
    };
  }

  function cpuMove(dt) {
    actionCd -= dt;
    const move = { x: 0, y: 0 };
    let doAction = false;
    if (game.type === "forage") {
      const items = (game.items || []).filter((it) => !it.taken);
      if (items.length) {
        items.sort((a, b) => Math.abs(a.c - game.x) + Math.abs(a.r - game.y) - (Math.abs(b.c - game.x) + Math.abs(b.r - game.y)));
        const t = items[0];
        move.x = Math.sign(t.c - game.x);
        move.y = Math.sign(t.r - game.y);
        if (t.c === game.x && t.r === game.y && actionCd <= 0) { doAction = true; actionCd = 0.25; }
      }
    } else if (game.type === "hunt") {
      const aliveAnimals = (game.animals || []).filter((a) => !a.hit);
      if (aliveAnimals.length) {
        aliveAnimals.sort((a, b) => Math.abs(a.x - game.hunterX) - Math.abs(b.x - game.hunterX));
        const t = aliveAnimals[0];
        const lead = t.vx > 0 ? 28 : -28;
        move.x = Math.sign((t.x + lead) - game.hunterX);
        if (Math.abs((t.x + lead) - game.hunterX) < 22 && actionCd <= 0) { doAction = true; actionCd = 0.7; }
      }
    } else if (game.type === "portage") {
      const scanNear = (z) => z.x > 30 && z.x < 260;
      const hazardsAhead = (game.hazards || []).filter(scanNear);
      const inMyLane = hazardsAhead.find((z) => z.lane === game.lane);
      if (inMyLane && actionCd <= 0) {
        const busy = new Set(hazardsAhead.map((z) => z.lane));
        const free = [0, 1, 2].find((l) => l !== game.lane && !busy.has(l));
        if (free != null) { game.laneStep(Math.sign(free - game.lane)); actionCd = 0.22; }
      } else if (actionCd <= 0) {
        const bonus = (game.bonuses || []).find((b) => scanNear(b) && b.lane !== game.lane && !b.taken);
        if (bonus && Math.random() < 0.5) { game.laneStep(Math.sign(bonus.lane - game.lane)); actionCd = 0.3; }
      }
    } else if (game.type === "trap") {
      if (actionCd <= 0) { doAction = true; actionCd = 0.8; game.cursor = (game.cursor + 1) % (game.snares?.length || 5); }
    }
    game.update(dt, move, keys);
    if (doAction && typeof game.action === "function") game.action();
  }

  function frame(now) {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (game.started && !game.done) {
      if (autoPlay) cpuMove(dt);
      else game.update(dt, readMove(), keys);
      if (game.done) showContinue();
    }
    game.draw(ctx);
    if (!game.done) hud.textContent = (autoPlay ? "🤖 CPU · " : "") + game.hud();
    else if (continueRow.hidden) showContinue();
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  canvas.focus();

  return {
    destroy() {
      alive = false;
      if (autoFinishTimer) { clearTimeout(autoFinishTimer); autoFinishTimer = null; }
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
    },
  };
}

function keyLegend(gameId) {
  const meta = ARCADE_META[gameId];
  return `<span class="keycap">↑</span><span class="keycap">↓</span><span class="keycap">←</span><span class="keycap">→</span> move
    <span class="keycap">Space</span> action
    <span class="keycap">Enter</span> start / continue
    <span class="arcade-tip">${meta?.controls || ""}</span>`;
}

function createGame(id, w, h, scale, opts = {}) {
  switch (id) {
    case "hunt":
      return createHunt(w, h, scale, opts);
    case "portage":
      return createPortage(w, h, scale, opts);
    case "forage":
      return createForage(w, h, scale, opts);
    case "trap":
      return createTrap(w, h, scale, opts);
    case "rapids":
      return createRapids(w, h, scale, opts);
    default:
      return createHunt(w, h, scale, opts);
  }
}

/* ───────────── HUNT ───────────── */
function createHunt(w, h, scale, opts = {}) {
  const groundY = h - 64;
  const lanes = [groundY - 8, groundY - 28, groundY - 48];
  const weapon = getWeapon(opts.weapon);
  const power = weapon ? weapon.power : 1;
  const weaponEmoji = weapon ? weapon.emoji : "🗡️";
  const spearSpeed = -(420 + power * 50);
  const need = Math.max(4, Math.round(5 * scale));
  const ammo = Math.max(6, Math.round(10 / scale) + power + (opts.strongArms ? 2 : 0));

  return {
    type: "hunt",
    started: false,
    done: false,
    message: "Tap near an animal to throw — you'll auto-lead the shot!",
    hunterX: w / 2,
    aimX: null,
    spears: [],
    animals: [],
    particles: [],
    popups: [],
    bushes: Array.from({ length: 5 }, (_, i) => ({ x: 60 + i * (w / 5), sway: rand(0, Math.PI) })),
    ammo,
    caught: 0,
    need,
    time: 34 / Math.sqrt(scale),
    spawnT: 0.4,
    reload: 0,
    flash: 0,
    weaponEmoji,
    hud() {
      if (!this.started) return `🦌 Forest Hunt — tap to throw`;
      if (this.done) return this.message;
      return `Food ${this.caught}/${this.need} · Spears ${this.ammo} · ${Math.ceil(this.time)}s`;
    },
    action() {
      if (this.ammo <= 0 || this.done || this.reload > 0) return;
      this.ammo -= 1;
      this.reload = 0.32;
      const throwY = groundY - 34;
      let aimX = this.aimX != null ? this.aimX : this.hunterX;
      // Default toss (no target in range) still arcs up and away.
      let targetY = throwY - 40;

      // Aim assist: tapping near a moving animal auto-leads the throw for a fair shot.
      let nearest = null;
      let nearestD = Infinity;
      for (const a of this.animals) {
        if (a.hit) continue;
        const d = Math.abs(a.x - aimX);
        if (d < nearestD) { nearestD = d; nearest = a; }
      }
      if (nearest && nearestD < 80) {
        targetY = nearest.y;
        const travelDist = Math.abs(throwY - targetY);
        const travelTime = travelDist / Math.abs(spearSpeed);
        aimX = nearest.x + nearest.vx * travelTime;
        nearest.targeted = 0.25;
      }
      // Spear flies toward the targeted lane's height — near lanes (below the
      // throw point) need a downward arc, far lanes need an upward one.
      const dirY = Math.sign(targetY - throwY) || -1;
      this.spears.push({ x: aimX, y: throwY, vy: dirY * Math.abs(spearSpeed), life: 1.2, trail: [] });
    },
    pointer(x) {
      if (!this.started) {
        this.started = true;
        this.message = "";
        return;
      }
      if (this.done) return;
      this.hunterX = clamp(x, 36, w - 36);
      this.aimX = this.hunterX;
      this.action();
    },
    update(dt, move) {
      this.time -= dt;
      this.flash = Math.max(0, this.flash - dt);
      this.reload = Math.max(0, this.reload - dt);
      this.hunterX = clamp(this.hunterX + move.x * 260 * dt, 36, w - 36);

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = rand(0.75, 1.4) / scale;
        const kinds = [
          { emoji: "🐇", pts: 1, speed: rand(105, 155), lane: 0, hitR: 26 },
          { emoji: "🦃", pts: 1, speed: rand(90, 130), lane: 1, hitR: 28 },
          { emoji: "🦌", pts: 2, speed: rand(80, 120), lane: 2, hitR: 34 },
          { emoji: "🐿️", pts: 1, speed: rand(120, 170), lane: 0, hitR: 22 },
        ];
        const k = pick(kinds);
        const fromLeft = Math.random() > 0.5;
        this.animals.push({
          ...k,
          x: fromLeft ? -50 : w + 50,
          vx: (fromLeft ? 1 : -1) * k.speed * scale,
          y: lanes[k.lane],
          hit: false,
          targeted: 0,
          bob: rand(0, Math.PI * 2),
        });
      }

      for (const b of this.bushes) b.sway += dt * 1.5;

      for (const s of this.spears) {
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 4) s.trail.shift();
        s.y += s.vy * dt;
        s.life -= dt;
      }
      this.spears = this.spears.filter((s) => s.y > -30 && s.life > 0);

      for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; }
      this.particles = this.particles.filter((p) => p.life > 0);
      for (const p of this.popups) { p.life -= dt; p.y -= 30 * dt; }
      this.popups = this.popups.filter((p) => p.life > 0);

      for (const a of this.animals) {
        if (a.hit) continue;
        a.x += a.vx * dt;
        a.bob += dt * 6;
        a.y = lanes[a.lane] + Math.sin(a.bob) * 3;
        a.targeted = Math.max(0, a.targeted - dt);
        for (const s of this.spears) {
          if (s.life <= 0) continue;
          // Generous, kid-friendly hitbox — the aim assist already did the leading.
          if (Math.abs(s.x - a.x) < a.hitR && Math.abs(s.y - a.y) < 30) {
            a.hit = true;
            this.caught += a.pts;
            this.flash = 0.28;
            s.life = 0;
            this.popups.push({ x: a.x, y: a.y - 30, life: 0.8, color: "#1f6b4a", text: `+${a.pts}` });
            for (let i = 0; i < 8; i++) {
              const ang = rand(0, Math.PI * 2);
              this.particles.push({ x: a.x, y: a.y, vx: Math.cos(ang) * rand(40, 120), vy: Math.sin(ang) * rand(-140, -40), life: 0.5, color: "#e8b86d" });
            }
          }
        }
      }
      this.animals = this.animals.filter((a) => !a.hit && a.x > -90 && a.x < w + 90);

      if (this.caught >= this.need) {
        this.done = true;
        this.message = `Respectful hunt — ${this.caught} packs for camp.`;
      } else if (this.time <= 0 || (this.ammo <= 0 && this.spears.length === 0 && this.reload <= 0)) {
        this.done = true;
        this.message = this.caught > 0
          ? `Hunt ends with ${this.caught}/${this.need}. Take only what you need.`
          : "The woods went quiet. Tap right on an animal next time.";
      }
    },
    draw(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#6ea8c9");
      sky.addColorStop(0.45, "#b7d4a8");
      sky.addColorStop(1, "#3f6b32");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // distant treeline
      for (let i = 0; i < 14; i++) {
        const tx = i * (w / 13);
        ctx.fillStyle = i % 2 ? "#1a3d2c" : "#245239";
        ctx.beginPath();
        ctx.moveTo(tx, groundY - 110 - (i % 3) * 10);
        ctx.lineTo(tx - 22, groundY - 30);
        ctx.lineTo(tx + 22, groundY - 30);
        ctx.fill();
      }

      // trail
      ctx.fillStyle = "#7a5a3a";
      ctx.fillRect(0, groundY - 6, w, 18);
      ctx.fillStyle = "#5c4028";
      ctx.fillRect(0, groundY + 12, w, h - groundY - 12);

      for (const b of this.bushes) {
        const sway = Math.sin(b.sway) * 4;
        ctx.fillStyle = "#2f6b3c";
        ctx.beginPath();
        ctx.ellipse(b.x + sway, groundY - 18, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      if (this.flash > 0) ctx.globalAlpha = 0.75 + Math.sin(this.flash * 40) * 0.25;
      drawPlayerMarker(ctx, this.hunterX, groundY - 16, 32);
      ctx.font = "18px serif";
      ctx.textAlign = "center";
      ctx.fillText(this.weaponEmoji, this.hunterX + 24, groundY - 38);
      // aim line
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(this.hunterX, groundY - 40);
      ctx.lineTo(this.hunterX, 40);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      for (const a of this.animals) {
        // soft ground shadow for readability/depth
        ctx.fillStyle = "rgba(20,30,20,0.28)";
        ctx.beginPath();
        ctx.ellipse(a.x, groundY - 4, a.hitR * 0.7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (a.targeted > 0) {
          ctx.strokeStyle = "rgba(232, 184, 109, 0.85)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.hitR * 0.85, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.font = `${a.emoji === "🦌" ? 42 : 34}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(a.emoji, a.x, a.y);
      }
      for (const s of this.spears) {
        for (let i = 0; i < s.trail.length; i++) {
          const t = s.trail[i];
          ctx.globalAlpha = (i + 1) / (s.trail.length + 1) * 0.35;
          ctx.fillStyle = "#f4f4f4";
          ctx.beginPath();
          ctx.arc(t.x, t.y + 10, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#4a3220";
        ctx.fillRect(s.x - 2, s.y, 4, 26);
        ctx.fillStyle = "#d8d8d8";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - 10);
        ctx.lineTo(s.x - 6, s.y + 2);
        ctx.lineTo(s.x + 6, s.y + 2);
        ctx.fill();
      }
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.life / 0.5);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const p of this.popups) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.8));
        ctx.fillStyle = p.color;
        ctx.font = "bold 18px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;

      // progress bar
      const barX = 16, barY = 12, barW = w - 32, barH = 10;
      ctx.fillStyle = "rgba(20, 38, 31, 0.25)";
      roundRect(ctx, barX, barY, barW, barH, 5);
      ctx.fill();
      ctx.fillStyle = "#e8b86d";
      const pct = Math.max(0, Math.min(1, this.caught / this.need));
      roundRect(ctx, barX, barY, Math.max(barH, barW * pct), barH, 5);
      ctx.fill();

      drawBanner(ctx, w, this);
    },
    result() {
      return {
        type: "hunt",
        score: this.caught * 16,
        won: this.caught >= this.need,
        food: this.caught >= 1 ? "pemmican" : null,
        caught: this.caught,
      };
    },
  };
}

/* ───────────── PORTAGE (3-path lane dodge — fair, tap ▲/▼ to switch) ───────────── */
function createPortage(w, h, scale, opts = {}) {
  const laneCount = 3;
  const trailTop = h * 0.22;
  const trailBottom = h * 0.9;
  const laneH = (trailBottom - trailTop) / laneCount;
  const laneY = (i) => trailTop + laneH * (i + 0.5);
  const playerX = w * 0.24;
  const hitHalf = 24;
  const speed = 108 * Math.min(scale, 1.22);
  const need = Math.round(1500 + scale * 160);
  const maxStamina = 4;
  const spawnGapDiv = Math.min(scale, 1.15);

  const laneNames = ["Shore path", "Main trail", "Moss path"];

  const spawnObstacle = () => {
    const kind = Math.random() < 0.5 ? "rock" : "log";
    const lane = Math.floor(Math.random() * laneCount);
    return { x: w + rand(20, 70), lane, kind, w: kind === "log" ? 58 : 36, done: false };
  };
  const spawnBonus = () => {
    const lane = Math.floor(Math.random() * laneCount);
    return { x: w + rand(20, 70), lane, kind: pick(["berry", "bead"]), taken: false, bob: rand(0, Math.PI * 2) };
  };

  return {
    type: "portage",
    started: false,
    done: false,
    won: false,
    message: "Carry the canoe down the trail — tap ▲ / ▼ to dodge!",
    lane: 1,
    animY: laneY(1),
    hopT: 0,
    dist: 0,
    need,
    stamina: maxStamina,
    maxStamina,
    hazards: [],
    bonuses: [],
    popups: [],
    hitFlash: 0,
    bonusFlash: 0,
    spawnT: 1.1,
    bonusT: rand(1.6, 2.6),
    hud() {
      if (!this.started) return "🛶 Portage — tap ▲ / ▼ to start";
      if (this.done) return this.message;
      return `Carry ${Math.min(100, Math.floor((this.dist / this.need) * 100))}% · ${"❤".repeat(Math.max(0, this.stamina))}${"·".repeat(Math.max(0, this.maxStamina - this.stamina))}`;
    },
    laneStep(dir) {
      if (!this.started) { this.started = true; this.message = ""; return; }
      if (this.done || !dir) return;
      const next = clamp(this.lane + (dir > 0 ? 1 : -1), 0, laneCount - 1);
      if (next !== this.lane) {
        this.lane = next;
        this.hopT = 1;
      }
    },
    action() {
      if (!this.started) { this.started = true; this.message = ""; return; }
    },
    pointer(x, y) {
      if (!this.started) { this.started = true; this.message = ""; return; }
      if (this.done) return;
      this.laneStep(y < h / 2 ? -1 : 1);
    },
    update(dt, move) {
      if (!this.started || this.done) return;
      this.moveCd = Math.max(0, (this.moveCd || 0) - dt);
      if (move && move.y && this.moveCd <= 0) { this.laneStep(move.y); this.moveCd = 0.22; }

      this.hopT = Math.max(0, this.hopT - dt * 2.6);
      const target = laneY(this.lane);
      this.animY += (target - this.animY) * Math.min(1, dt * 12);
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.bonusFlash = Math.max(0, this.bonusFlash - dt);
      for (const p of this.popups) { p.life -= dt; p.y -= 32 * dt; }
      this.popups = this.popups.filter((p) => p.life > 0);

      const scroll = speed * dt;
      this.dist += scroll;

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.hazards.push(spawnObstacle());
        // Rare double-hazard "squeeze" — always leaves exactly one lane free.
        if (scale > 1 && Math.random() < 0.22) {
          const first = this.hazards[this.hazards.length - 1];
          let otherLane = Math.floor(Math.random() * laneCount);
          if (otherLane === first.lane) otherLane = (otherLane + 1) % laneCount;
          this.hazards.push({ ...spawnObstacle(), x: first.x, lane: otherLane });
        }
        this.spawnT = rand(1.5, 2.3) / spawnGapDiv;
      }
      this.bonusT -= dt;
      if (this.bonusT <= 0) {
        this.bonuses.push(spawnBonus());
        this.bonusT = rand(2.2, 3.4);
      }

      for (const z of this.hazards) {
        z.x -= scroll;
        if (!z.done && Math.abs(z.x - playerX) < hitHalf + z.w / 2) {
          z.done = true;
          if (z.lane === this.lane) {
            this.stamina = Math.max(0, this.stamina - 1);
            this.hitFlash = 0.35;
            this.hopT = 1;
            this.popups.push({ x: playerX, y: this.animY - 26, life: 0.8, color: "#a4342a", text: z.kind === "log" ? "Log!" : "Rock!" });
          }
        }
      }
      this.hazards = this.hazards.filter((z) => z.x > -80);

      for (const b of this.bonuses) {
        b.x -= scroll;
        b.bob += dt * 4;
        if (!b.taken && Math.abs(b.x - playerX) < hitHalf + 14) {
          if (b.lane === this.lane) {
            b.taken = true;
            this.bonusFlash = 0.35;
            this.stamina = Math.min(this.maxStamina, this.stamina + (b.kind === "bead" ? 0 : 0.5));
            this.popups.push({ x: playerX, y: this.animY - 26, life: 0.8, color: "#1f6b4a", text: b.kind === "bead" ? "+bead" : "+berry" });
          } else {
            b.taken = true;
          }
        }
      }
      this.bonuses = this.bonuses.filter((b) => b.x > -60 && !(b.taken && b.x < playerX - 20));

      if (this.stamina <= 0) {
        this.done = true;
        this.won = false;
        this.message = "Too many bumps — rest up and try the next carry.";
      } else if (this.dist >= this.need) {
        this.done = true;
        this.won = true;
        this.message = this.stamina >= this.maxStamina
          ? "Perfect carry! Not a single scrape."
          : "Portage complete! The next lake opens ahead.";
      }
    },
    draw(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#9ec9e6");
      sky.addColorStop(0.4, "#cfe8c8");
      sky.addColorStop(1, "#3f6b32");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const shakeX = this.hitFlash > 0 ? Math.sin(this.hitFlash * 90) * 4 * this.hitFlash : 0;
      ctx.save();
      ctx.translate(shakeX, 0);

      const laneColors = ["#a9c98f", "#8fb373", "#6f9a5c"];
      for (let i = 0; i < laneCount; i++) {
        const y0 = trailTop + laneH * i;
        ctx.fillStyle = laneColors[i];
        ctx.fillRect(0, y0, w, laneH);
        if (i === this.lane) {
          ctx.fillStyle = "rgba(255, 244, 200, 0.16)";
          ctx.fillRect(0, y0, w, laneH);
        }
        ctx.strokeStyle = "rgba(60, 40, 20, 0.35)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, y0 + laneH);
        ctx.lineTo(w, y0 + laneH);
        ctx.stroke();
        // motion dashes
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 4;
        ctx.setLineDash([22, 26]);
        ctx.lineDashOffset = -(this.dist * 0.9) % 48;
        ctx.beginPath();
        ctx.moveTo(0, y0 + laneH / 2);
        ctx.lineTo(w, y0 + laneH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = "rgba(63, 107, 50, 0.9)";
      ctx.fillRect(0, 0, w, trailTop);
      ctx.fillRect(0, trailBottom, w, h - trailBottom);

      for (const b of this.bonuses) {
        if (b.taken) continue;
        const y = laneY(b.lane) + Math.sin(b.bob) * 4;
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.fillText(b.kind === "bead" ? "🔵" : "🫐", b.x, y);
      }

      for (const z of this.hazards) {
        const y = laneY(z.lane);
        if (z.kind === "rock") {
          ctx.fillStyle = "#6c655a";
          ctx.beginPath();
          ctx.ellipse(z.x, y, z.w / 2, laneH * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3d372e";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = "#7a5a3a";
          roundRect(ctx, z.x - z.w / 2, y - laneH * 0.22, z.w, laneH * 0.44, 8);
          ctx.fill();
          ctx.strokeStyle = "#4a3220";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 1.5;
          for (let k = -1; k <= 1; k++) {
            ctx.beginPath();
            ctx.moveTo(z.x + k * (z.w / 4), y - laneH * 0.2);
            ctx.lineTo(z.x + k * (z.w / 4), y + laneH * 0.2);
            ctx.stroke();
          }
        }
        // warning glow just before it reaches the player's line
        if (!z.done && z.x - playerX < 120 && z.x - playerX > 0 && z.lane === this.lane) {
          ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 90) * 0.3;
          ctx.strokeStyle = "#e8b86d";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(z.x, y, z.w / 2 + 6, laneH * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // player: canoe carrier, hops when switching lanes / bumped
      const hop = Math.sin(this.hopT * Math.PI) * 16;
      const wobble = this.hitFlash > 0 ? Math.sin(this.hitFlash * 60) * 6 : 0;
      ctx.save();
      ctx.translate(playerX + wobble, this.animY - hop);
      ctx.font = "26px serif";
      ctx.textAlign = "center";
      ctx.fillText("🛶", 0, -20);
      ctx.font = "30px serif";
      ctx.fillText("🚶", 0, 6);
      ctx.restore();
      drawPlayerMarker(ctx, playerX, this.animY - hop + 26, 20);

      for (const p of this.popups) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.8));
        ctx.fillStyle = p.color;
        ctx.font = "bold 16px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      }

      if (this.hitFlash > 0) {
        ctx.fillStyle = `rgba(196, 62, 46, ${this.hitFlash * 0.25})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (this.bonusFlash > 0) {
        ctx.fillStyle = `rgba(232, 184, 109, ${this.bonusFlash * 0.22})`;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // progress bar
      const barX = 16, barY = 12, barW = w - 32, barH = 10;
      ctx.fillStyle = "rgba(20, 38, 31, 0.25)";
      roundRect(ctx, barX, barY, barW, barH, 5);
      ctx.fill();
      ctx.fillStyle = "#e8b86d";
      const pct = Math.max(0, Math.min(1, this.dist / this.need));
      roundRect(ctx, barX, barY, Math.max(barH, barW * pct), barH, 5);
      ctx.fill();
      ctx.font = "16px serif";
      ctx.textAlign = "center";
      ctx.fillText("🛶", barX + barW * pct, barY - 6);

      // current-path label
      if (this.started && !this.done) {
        ctx.font = "bold 13px Fredoka, sans-serif";
        ctx.fillStyle = "rgba(20,38,31,0.65)";
        ctx.textAlign = "left";
        ctx.fillText(laneNames[this.lane], 16, h - 10);
      }

      drawBanner(ctx, w, this);
    },
    result() {
      return {
        type: "portage",
        score: this.won ? Math.max(30, 60 + this.stamina * 10) : 12,
        won: !!this.won,
        energyBonus: this.won ? 12 : 0,
      };
    },
  };
}

/* ───────────── FORAGE ───────────── */
function createForage(w, h, scale, opts = {}) {
  const cols = 10;
  const rows = 7;
  const tw = w / cols;
  const th = (h - 30) / rows;
  const items = [];
  const kinds = [
    { emoji: "🫐", id: "berry", pts: 1 },
    { emoji: "🍁", id: "sap", pts: 1 },
    { emoji: "🐟", id: "fish", pts: 2 },
    { emoji: "🍄", id: "mushroom", pts: 1 },
  ];
  const pests = [];
  const count = Math.round(8 + scale * 2);
  const used = new Set();
  while (items.length < count) {
    const c = Math.floor(Math.random() * cols);
    const r = Math.floor(Math.random() * rows);
    const key = `${c},${r}`;
    if (used.has(key) || (c === 0 && r === 0)) continue;
    used.add(key);
    items.push({ c, r, ...pick(kinds), taken: false });
  }
  for (let i = 0; i < Math.round(3 * scale); i++) {
    pests.push({
      c: Math.floor(Math.random() * cols),
      r: Math.floor(Math.random() * rows),
      t: rand(0, 2),
    });
  }

  return {
    type: "forage",
    started: false,
    done: false,
    message: "Tap a tile to step there — tap your own tile to gather!",
    cols,
    rows,
    x: 0,
    y: 0,
    bag: 0,
    need: Math.max(4, Math.round(5 * scale)),
    time: 35 / Math.sqrt(scale),
    bites: 0,
    biteCd: 0,
    moveCd: 0,
    biteFlash: 0,
    popups: [],
    items,
    pests,
    hud() {
      if (!this.started) return "🫐 Forage — tap a tile to start";
      if (this.done) return this.message;
      return `Bag ${this.bag}/${this.need} · Time ${Math.ceil(this.time)}s · Bites ${this.bites}/6`;
    },
    action() {
      const it = this.items.find((i) => i.c === this.x && i.r === this.y && !i.taken);
      if (!it) return;
      it.taken = true;
      this.bag += it.pts;
      this.popups.push({ x: this.x * tw + tw / 2, y: 24 + this.y * th, life: 0.7, color: "#1f6b4a", text: `+${it.pts}` });
      if (this.bag >= this.need) {
        this.done = true;
        this.message = "Basket full! Respectful foraging for the win.";
      }
    },
    update(dt, move) {
      this.time -= dt;
      this.moveCd -= dt;
      this.biteCd -= dt;
      this.biteFlash = Math.max(0, this.biteFlash - dt);
      for (const p of this.popups) { p.life -= dt; p.y -= 26 * dt; }
      this.popups = this.popups.filter((p) => p.life > 0);
      for (const p of this.pests) {
        p.t -= dt;
        if (p.t <= 0) {
          p.t = rand(0.6, 1.2);
          p.c = clamp(p.c + pick([-1, 0, 1]), 0, cols - 1);
          p.r = clamp(p.r + pick([-1, 0, 1]), 0, rows - 1);
        }
        if (p.c === this.x && p.r === this.y && this.biteCd <= 0) {
          this.bites += 1;
          this.biteCd = 0.8;
          this.biteFlash = 0.35;
          this.popups.push({ x: this.x * tw + tw / 2, y: 24 + this.y * th, life: 0.7, color: "#a4342a", text: "Bite!" });
          p.t = 1.5;
          p.c = clamp(p.c + pick([-2, 2]), 0, cols - 1);
        }
      }
      if (this.moveCd <= 0 && (move.x || move.y)) {
        this.x = clamp(this.x + Math.sign(move.x), 0, cols - 1);
        this.y = clamp(this.y + Math.sign(move.y), 0, rows - 1);
        this.moveCd = 0.14;
      }
      if (this.time <= 0) {
        this.done = true;
        this.message =
          this.bag > 0
            ? `Forage done — ${this.bag} items in the basket.`
            : "Empty basket… the forest keeps its secrets today.";
      }
      if (this.bites >= 6) {
        this.done = true;
        this.message = "Too many mosquito bites! You retreat with what you have.";
      }
    },
    draw(ctx) {
      ctx.fillStyle = "#2d6a4f";
      ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * tw;
          const y = 24 + r * th;
          const here = c === this.x && r === this.y;
          ctx.fillStyle = here ? "rgba(255, 244, 200, 0.5)" : (c + r) % 2 ? "#40916c" : "#52b788";
          ctx.fillRect(x + 1, y + 1, tw - 2, th - 2);
        }
      }
      for (const it of this.items) {
        if (it.taken) continue;
        ctx.font = `${Math.min(tw, th) * 0.55}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(it.emoji, it.c * tw + tw / 2, 24 + it.r * th + th * 0.7);
      }
      for (const p of this.pests) {
        ctx.font = `${Math.min(tw, th) * 0.45}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("🦟", p.c * tw + tw / 2, 24 + p.r * th + th * 0.7);
      }
      ctx.save();
      if (this.biteFlash > 0) ctx.globalAlpha = 0.6 + Math.sin(this.biteFlash * 50) * 0.3;
      drawPlayerMarker(
        ctx,
        this.x * tw + tw / 2,
        24 + this.y * th + th * 0.55,
        Math.min(tw, th) * 0.55
      );
      ctx.restore();
      for (const p of this.popups) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.7));
        ctx.fillStyle = p.color;
        ctx.font = "bold 15px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      if (this.biteFlash > 0) {
        ctx.fillStyle = `rgba(196, 62, 46, ${this.biteFlash * 0.22})`;
        ctx.fillRect(0, 0, w, h);
      }
      drawBanner(ctx, w, this);
    },
    result() {
      return {
        type: "forage",
        score: this.bag * 12 - this.bites * 3,
        won: this.bag >= this.need,
        food: this.bag >= 2 ? "blueberry" : null,
        bag: this.bag,
      };
    },
  };
}

/* ───────────── TRAP ───────────── */
function createTrap(w, h, scale, opts = {}) {
  const spots = 5;
  const pathY = [80, 140, 200, 260, 310];
  return {
    type: "trap",
    started: false,
    done: false,
    message: "Press Enter — set snares, then catch passing critters!",
    cursor: 2,
    snares: Array(spots).fill(null), // null | 'set' | 'caught'
    animals: [],
    catches: 0,
    need: Math.max(2, Math.round(2 * scale)),
    trapsLeft: Math.round(4 / Math.min(scale, 1.2)),
    time: 30 / Math.sqrt(scale),
    spawnT: 0.5,
    hud() {
      if (!this.started) return "🪤 Trapline — press Enter";
      if (this.done) return this.message + " · Enter to continue";
      return `Caught ${this.catches}/${this.need} · Snares left ${this.trapsLeft} · Time ${Math.ceil(this.time)}s`;
    },
    action() {
      const i = this.cursor;
      if (this.snares[i] === "caught") {
        this.snares[i] = null;
        this.catches += 1;
        if (this.catches >= this.need) {
          this.done = true;
          this.message = "Trapline success — food for camp!";
        }
        return;
      }
      if (this.snares[i] == null && this.trapsLeft > 0) {
        this.snares[i] = "set";
        this.trapsLeft -= 1;
      }
    },
    update(dt, move) {
      this.time -= dt;
      if (move.x && !this._moved) {
        this.cursor = clamp(this.cursor + Math.sign(move.x), 0, spots - 1);
        this._moved = true;
      }
      if (!move.x) this._moved = false;

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = rand(1.2, 2.2) / scale;
        const lane = Math.floor(Math.random() * spots);
        this.animals.push({
          lane,
          x: -30,
          speed: rand(80, 140) * scale,
          emoji: pick(["🐇", "🐿️", "🦫"]),
        });
      }

      for (const a of this.animals) {
        a.x += a.speed * dt;
        if (this.snares[a.lane] === "set" && a.x > 120 && a.x < 200) {
          this.snares[a.lane] = "caught";
          a.x = 9999;
        }
      }
      this.animals = this.animals.filter((a) => a.x < w + 40);

      if (this.time <= 0) {
        this.done = true;
        this.message =
          this.catches > 0
            ? `Trapline packed up — ${this.catches} caught.`
            : "No luck on the trapline today.";
      }
    },
    draw(ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#a8dadc");
      grad.addColorStop(1, "#588157");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < spots; i++) {
        const y = pathY[i];
        ctx.strokeStyle = "#6f4e37";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // snare post
        const sx = 160;
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(sx - 4, y - 28, 8, 28);
        if (this.snares[i] === "set") {
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx + 12, y - 10, 10, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.snares[i] === "caught") {
          ctx.font = "28px serif";
          ctx.textAlign = "center";
          ctx.fillText("✨", sx + 16, y - 8);
        }

        if (i === this.cursor) {
          ctx.strokeStyle = "#f4a261";
          ctx.lineWidth = 3;
          ctx.strokeRect(sx - 30, y - 40, 70, 50);
        }
      }

      // player marker
      ctx.font = "32px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧍", 60, pathY[this.cursor] - 8);

      for (const a of this.animals) {
        ctx.font = "28px serif";
        ctx.fillText(a.emoji, a.x, pathY[a.lane] - 6);
      }
      drawBanner(ctx, w, this);
    },
    result() {
      return {
        type: "trap",
        score: this.catches * 20,
        won: this.catches >= this.need,
        food: this.catches >= 1 ? "pemmican" : null,
        catches: this.catches,
      };
    },
  };
}

/* ───────────── RAPIDS ───────────── */
function createRapids(w, h, scale, opts = {}) {
  const maxHits = opts.calmWater ? 6 : 4;
  return {
    type: "rapids",
    started: false,
    done: false,
    message: "Press Enter — steer through the rapids!",
    canoeX: w / 2,
    rocks: [],
    dist: 0,
    need: Math.round(900 * scale),
    hits: 0,
    maxHits,
    boost: 0,
    spawnT: 0,
    hud() {
      if (!this.started) return "🌊 Rapids — press Enter";
      if (this.done) return this.message + " · Enter to continue";
      return `Distance ${Math.floor(this.dist)}/${this.need} · Hits ${this.hits} · Space = paddle boost`;
    },
    action() {
      this.boost = 0.55;
    },
    update(dt, move) {
      this.canoeX = clamp(this.canoeX + move.x * 260 * dt, 50, w - 50);
      const speed = (140 + (this.boost > 0 ? 120 : 0)) * scale;
      this.boost = Math.max(0, this.boost - dt);
      this.dist += speed * dt;

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = rand(0.45, 0.9) / scale;
        this.rocks.push({
          x: rand(40, w - 40),
          y: -30,
          r: rand(16, 28),
        });
      }

      for (const rock of this.rocks) {
        rock.y += speed * dt;
        const dx = rock.x - this.canoeX;
        const dy = rock.y - (h - 70);
        if (Math.hypot(dx, dy) < rock.r + 18) {
          this.hits += 1;
          rock.y = h + 99;
          this.canoeX = clamp(this.canoeX + (dx > 0 ? -40 : 40), 50, w - 50);
        }
      }
      this.rocks = this.rocks.filter((r) => r.y < h + 40);

      if (this.hits >= this.maxHits) {
        this.done = true;
        this.message = "Canoe tipped! You swim to shore with soggy pride.";
      } else if (this.dist >= this.need) {
        this.done = true;
        this.message =
          this.hits === 0
            ? "Perfect run — voyageur legend!"
            : `Rapids cleared with ${this.hits} bump(s)!`;
      }
    },
    draw(ctx) {
      // water
      ctx.fillStyle = "#0077b6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 12; i++) {
        const yy = ((i * 40 + this.dist * 0.4) % (h + 40)) - 20;
        ctx.fillRect(20 + (i % 5) * 120, yy, 80, 6);
      }

      // banks
      ctx.fillStyle = "#2d6a4f";
      ctx.fillRect(0, 0, 36, h);
      ctx.fillRect(w - 36, 0, 36, h);

      for (const rock of this.rocks) {
        ctx.fillStyle = "#6c757d";
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = "44px serif";
      ctx.textAlign = "center";
      ctx.fillText("🛶", this.canoeX, h - 55);
      if (this.boost > 0) {
        ctx.font = "20px serif";
        ctx.fillText("💦", this.canoeX, h - 20);
      }
      drawBanner(ctx, w, this);
    },
    result() {
      const won = this.dist >= this.need && this.hits < this.maxHits;
      return {
        type: "rapids",
        score: won ? Math.max(25, 100 - this.hits * 15) : this.hits >= this.maxHits ? 5 : 40,
        won,
        energyBonus: won ? 10 : 0,
        hits: this.hits,
      };
    },
  };
}

function drawPlayerMarker(ctx, x, y, size = 28) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, -size * 0.15, size * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 244, 200, 0.95)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#c45c4a";
  ctx.stroke();
  ctx.font = `${Math.round(size * 0.95)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⭐", 0, -size * 0.1);
  ctx.restore();
}

function drawBanner(ctx, w, game) {
  if (game.started && !game.done) return;
  ctx.fillStyle = "rgba(255,253,247,0.92)";
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 3;
  const text = game.done ? game.message : game.message;
  ctx.font = "bold 18px Fredoka, sans-serif";
  const tw = Math.min(w - 40, ctx.measureText(text).width + 40);
  const x = (w - tw) / 2;
  const y = 120;
  roundRect(ctx, x, y, tw, 64, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "center";
  wrapText(ctx, text, w / 2, y + 28, tw - 24, 20);
  ctx.font = "14px Fredoka, sans-serif";
  ctx.fillText(game.done ? "Continue →" : "Tap to start", w / 2, y + 52);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = word + " ";
      yy += lineHeight;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, yy);
}

export function isArcadeType(type) {
  return Boolean(ARCADE_META[type]);
}
