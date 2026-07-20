/**
 * Oregon Trail–style arcade minigames.
 * Controls: Arrow keys move · Space action · Enter start/skip-end
 */
import { getWeapon } from "./data.js?v=race8";

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
    blurb: "Animals cross the clearing. Aim carefully — take only what your party needs!",
    controls: "← → or click to aim · Space / click throw · Enter start",
  },
  portage: {
    id: "portage",
    title: "Portage Carry",
    blurb: "Carry the canoe between lakes. Dodge rocks and mud puddles!",
    controls: "Arrow keys or click a direction · Space rest · Enter start",
  },
  forage: {
    id: "forage",
    title: "Resource Forage",
    blurb: "Explore the woods for berries, sap, and fish. Watch for buzzing pests!",
    controls: "Arrow keys or click to move · Space / click gather · Enter start",
  },
  trap: {
    id: "trap",
    title: "Trapline",
    blurb: "Set snares on animal paths, then check them. Don’t spook the critters!",
    controls: "← → or click spot · Space / click set · Enter start",
  },
  rapids: {
    id: "rapids",
    title: "River Rapids",
    blurb: "Steer your canoe through rocky water. Stay in the safe channel!",
    controls: "← → or click to steer · Space boost · Enter start",
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
export function mountArcade(container, gameId, { difficulty = "beginner", puzzleMaster = false, weapon = null, strongArms = false, calmWater = false } = {}, onComplete) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  canvas.className = "arcade-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", ARCADE_META[gameId]?.title || "Minigame");

  const hud = document.createElement("div");
  hud.className = "arcade-hud";

  const keysHelp = document.createElement("div");
  keysHelp.className = "arcade-keys";
  keysHelp.innerHTML = keyLegend(gameId);

  container.innerHTML = "";
  container.appendChild(hud);
  container.appendChild(canvas);
  container.appendChild(keysHelp);

  const ctx = canvas.getContext("2d");
  const keys = new Set();
  let raf = 0;
  let alive = true;
  let last = performance.now();

  const scale =
    difficulty === "hard" ? 1.25 : difficulty === "medium" ? 1.1 : 1;
  const ease = puzzleMaster ? 0.85 : 1;

  const game = createGame(gameId, canvas.width, canvas.height, scale * ease, { weapon, strongArms, calmWater });
  hud.textContent = game.hud();

  const onKeyDown = (e) => {
    if (!alive) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys.add(e.key);

    if (!game.started && (e.key === KEY.enter || e.key === KEY.action)) {
      game.started = true;
      game.message = "";
      return;
    }
    if (game.done && e.key === KEY.enter) {
      finish();
      return;
    }
    if (game.started && !game.done && e.key === KEY.action) {
      game.action();
    }
  };
  const onKeyUp = (e) => keys.delete(e.key);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const onPointer = (e) => {
    if (!alive) return;
    e.preventDefault();
    canvas.focus();
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    if (!game.started) {
      game.started = true;
      game.message = "";
      return;
    }
    if (game.done) {
      finish();
      return;
    }
    // Steer toward click, then fire action
    if (typeof game.pointer === "function") {
      game.pointer(x, y);
    } else {
      if (game.hunterX != null) game.hunterX = Math.max(40, Math.min(canvas.width - 40, x));
      if (game.canoeX != null) game.canoeX = Math.max(30, Math.min(canvas.width - 30, x));
      if (game.cursor != null && Array.isArray(game.snares)) {
        game.cursor = Math.max(0, Math.min(game.snares.length - 1, Math.floor((x / canvas.width) * game.snares.length)));
      }
      // Grid games (portage / forage)
      if (game.cols && game.x != null && game.y != null) {
        const tw = canvas.width / game.cols;
        const th = (canvas.height - 40) / (game.rows || game.cols);
        game.x = Math.max(0, Math.min(game.cols - 1, Math.floor(x / tw)));
        game.y = Math.max(0, Math.min((game.rows || game.cols) - 1, Math.floor(Math.max(0, y - 20) / th)));
      }
      if (typeof game.action === "function") game.action();
    }
  };
  canvas.addEventListener("pointerdown", onPointer);

  canvas.focus();

  function finish() {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("pointerdown", onPointer);
    onComplete(game.result());
  }

  function frame(now) {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (game.started && !game.done) {
      const move = {
        x: (keys.has(KEY.right) ? 1 : 0) - (keys.has(KEY.left) ? 1 : 0),
        y: (keys.has(KEY.down) ? 1 : 0) - (keys.has(KEY.up) ? 1 : 0),
      };
      game.update(dt, move, keys);
      if (game.done) {
        hud.textContent = game.hud();
      }
    }

    game.draw(ctx);
    hud.textContent = game.hud();
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      alive = false;
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
  const groundY = h - 70;
  const weapon = getWeapon(opts.weapon);
  const power = weapon ? weapon.power : 1;
  const weaponEmoji = weapon ? weapon.emoji : "🗡️";
  const spearSpeed = -(380 + power * 60);
  const g = {
    type: "hunt",
    started: false,
    done: false,
    message: "Press Enter to begin the hunt!",
    hunterX: w / 2,
    spears: [],
    animals: [],
    ammo: Math.round(8 / scale) + power * 2 + (opts.strongArms ? 2 : 0),
    caught: 0,
    need: Math.max(2, Math.round(3 * scale)),
    time: 28 / Math.sqrt(scale),
    spawnT: 0,
    flash: 0,
    weaponEmoji,
    hud() {
      if (!this.started) return `🌲 Forest Hunt (${weaponEmoji}${weapon ? " " + weapon.name : ""}) — press Enter`;
      if (this.done) return this.message + " · Enter to continue";
      return `Meat packs ${this.caught}/${this.need} · Shots ${this.ammo} · Time ${Math.ceil(this.time)}s`;
    },
    action() {
      if (this.ammo <= 0 || this.done) return;
      this.ammo -= 1;
      this.spears.push({ x: this.hunterX, y: groundY - 30, vy: spearSpeed });
    },
    update(dt, move) {
      this.time -= dt;
      this.flash = Math.max(0, this.flash - dt);
      this.hunterX = clamp(this.hunterX + move.x * 220 * dt, 40, w - 40);

      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = rand(0.9, 1.8) / scale;
        const kinds = [
          { emoji: "🐇", pts: 1, speed: rand(90, 140), y: groundY - 10 },
          { emoji: "🦌", pts: 2, speed: rand(70, 110), y: groundY - 18 },
          { emoji: "🦃", pts: 1, speed: rand(100, 160), y: groundY - 14 },
        ];
        const k = pick(kinds);
        const fromLeft = Math.random() > 0.5;
        this.animals.push({
          ...k,
          x: fromLeft ? -40 : w + 40,
          vx: (fromLeft ? 1 : -1) * k.speed * scale,
          hit: false,
        });
      }

      for (const s of this.spears) s.y += s.vy * dt;
      this.spears = this.spears.filter((s) => s.y > -20);

      for (const a of this.animals) {
        if (a.hit) continue;
        a.x += a.vx * dt;
        for (const s of this.spears) {
          if (Math.abs(s.x - a.x) < 28 && Math.abs(s.y - a.y) < 36) {
            a.hit = true;
            this.caught += a.pts;
            this.flash = 0.25;
            s.y = -99;
          }
        }
      }
      this.animals = this.animals.filter((a) => !a.hit && a.x > -80 && a.x < w + 80);

      if (this.caught >= this.need) {
        this.done = true;
        this.message = `Great hunt! ${this.caught} packs — enough for the party.`;
      } else if (this.time <= 0 || (this.ammo <= 0 && this.spears.length === 0)) {
        this.done = true;
        this.message =
          this.caught > 0
            ? `Hunt over — ${this.caught} packs gathered.`
            : "The animals got away. Trail snacks will have to do!";
      }
    },
    draw(ctx) {
      // sky + trees
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#87ceeb");
      grad.addColorStop(0.55, "#c8e6c9");
      grad.addColorStop(0.55, "#5a8f3c");
      grad.addColorStop(1, "#3d6b2a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // doodle pines
      for (let i = 0; i < 8; i++) {
        const tx = 40 + i * 80;
        ctx.fillStyle = "#1b4332";
        ctx.beginPath();
        ctx.moveTo(tx, groundY - 90);
        ctx.lineTo(tx - 28, groundY - 20);
        ctx.lineTo(tx + 28, groundY - 20);
        ctx.fill();
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "#6b4226";
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // hunter
      ctx.save();
      if (this.flash > 0) ctx.globalAlpha = 0.7 + Math.sin(this.flash * 40) * 0.3;
      ctx.font = "42px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧍", this.hunterX, groundY - 8);
      ctx.font = "20px serif";
      ctx.fillText(this.weaponEmoji, this.hunterX + 20, groundY - 22);
      ctx.restore();

      for (const a of this.animals) {
        ctx.font = "36px serif";
        ctx.textAlign = "center";
        ctx.fillText(a.emoji, a.x, a.y);
      }
      for (const s of this.spears) {
        ctx.fillStyle = "#5c4033";
        ctx.fillRect(s.x - 2, s.y, 4, 22);
        ctx.fillStyle = "#c0c0c0";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - 8);
        ctx.lineTo(s.x - 6, s.y + 2);
        ctx.lineTo(s.x + 6, s.y + 2);
        ctx.fill();
      }

      drawBanner(ctx, w, this);
    },
    result() {
      return {
        type: "hunt",
        score: this.caught * 15,
        won: this.caught >= this.need,
        food: this.caught >= 1 ? "pemmican" : null,
        caught: this.caught,
      };
    },
  };
  return g;
}

/* ───────────── PORTAGE ───────────── */
function createPortage(w, h, scale, opts = {}) {
  const cols = 12;
  const rows = 8;
  const tw = w / cols;
  const th = (h - 40) / rows;
  const hazards = new Set();
  const hazardCount = Math.round(10 * scale);
  while (hazards.size < hazardCount) {
    const c = 1 + Math.floor(Math.random() * (cols - 2));
    const r = 1 + Math.floor(Math.random() * (rows - 2));
    hazards.add(`${c},${r}`);
  }

  return {
    type: "portage",
    started: false,
    done: false,
    message: "Press Enter — carry the canoe to the far lake!",
    cols,
    rows,
    x: 0,
    y: Math.floor(rows / 2),
    stamina: 100,
    slips: 0,
    goalX: cols - 1,
    moveCd: 0,
    hud() {
      if (!this.started) return "🛶 Portage — press Enter";
      if (this.done) return this.message + " · Enter to continue";
      return `Stamina ${Math.ceil(this.stamina)} · Slips ${this.slips} · Reach the blue lake →`;
    },
    action() {
      this.stamina = clamp(this.stamina + 18, 0, 100);
    },
    update(dt, move) {
      this.moveCd -= dt;
      this.stamina = clamp(this.stamina - dt * 4 * scale, 0, 100);
      if (this.stamina <= 0) {
        this.done = true;
        this.message = "Too tired — you rest and try a shorter carry next time.";
        return;
      }
      if (this.moveCd > 0) return;
      if (!move.x && !move.y) return;

      const nx = clamp(this.x + Math.sign(move.x), 0, cols - 1);
      const ny = clamp(this.y + Math.sign(move.y), 0, rows - 1);
      if (nx === this.x && ny === this.y) return;

      this.x = nx;
      this.y = ny;
      this.moveCd = 0.16;
      this.stamina -= 2;

      if (hazards.has(`${nx},${ny}`)) {
        this.slips += 1;
        this.stamina -= 12;
        this.moveCd = 0.35;
      }

      if (this.x === this.goalX) {
        this.done = true;
        this.message =
          this.slips <= 2
            ? "Smooth portage! The canoe kisses the next lake."
            : `Made it across with ${this.slips} slips. Still counts!`;
      }
    },
    draw(ctx) {
      ctx.fillStyle = "#cfe8ff";
      ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * tw;
          const y = 20 + r * th;
          const isStart = c === 0;
          const isGoal = c === cols - 1;
          ctx.fillStyle = isStart || isGoal ? "#4cc9f0" : "#8fbc5a";
          ctx.fillRect(x + 1, y + 1, tw - 2, th - 2);
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.strokeRect(x, y, tw, th);
        }
      }
      for (const key of hazards) {
        const [c, r] = key.split(",").map(Number);
        const x = c * tw;
        const y = 20 + r * th;
        ctx.font = `${Math.min(tw, th) * 0.5}px serif`;
        ctx.textAlign = "center";
        ctx.fillText((c + r) % 2 ? "🪨" : "🟤", x + tw / 2, y + th * 0.7);
      }

      ctx.font = `${Math.min(tw, th) * 0.7}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("🛶", this.x * tw + tw / 2, 20 + this.y * th + th * 0.72);

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "14px Fredoka, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Lake A", 8, 14);
      ctx.textAlign = "right";
      ctx.fillText("Lake B", w - 8, 14);

      drawBanner(ctx, w, this);
    },
    result() {
      const won = this.x === this.goalX;
      return {
        type: "portage",
        score: won ? Math.max(20, 80 - this.slips * 10) : 10,
        won,
        energyBonus: won ? 12 : 0,
        slips: this.slips,
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
    message: "Press Enter — gather food for the trail!",
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
    items,
    pests,
    hud() {
      if (!this.started) return "🫐 Forage — press Enter";
      if (this.done) return this.message + " · Enter to continue";
      return `Bag ${this.bag}/${this.need} · Time ${Math.ceil(this.time)}s · Mosquito bites ${this.bites}`;
    },
    action() {
      const it = this.items.find((i) => i.c === this.x && i.r === this.y && !i.taken);
      if (!it) return;
      it.taken = true;
      this.bag += it.pts;
      if (this.bag >= this.need) {
        this.done = true;
        this.message = "Basket full! Respectful foraging for the win.";
      }
    },
    update(dt, move) {
      this.time -= dt;
      this.moveCd -= dt;
      this.biteCd -= dt;
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
          ctx.fillStyle = (c + r) % 2 ? "#40916c" : "#52b788";
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
      ctx.font = `${Math.min(tw, th) * 0.65}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("🧭", this.x * tw + tw / 2, 24 + this.y * th + th * 0.72);
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
  ctx.fillText(game.done ? "Press Enter" : "Press Enter to start", w / 2, y + 52);
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
