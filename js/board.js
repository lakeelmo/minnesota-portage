/**
 * Minnesota Portage — board map.
 * A branching St. Croix valley board: roll a die, move exactly that many hops,
 * then resolve the space (card / challenge). Strategy = which branch you take.
 */

export const BOARD = [
  // ── Start ──
  { id: "start", name: "Canoe Landing", kind: "start", icon: "🛶", x: 80, y: 520,
    links: ["lake-bend", "pine-spur"], blurb: "Launch your Story Bundle from the Upper St. Croix." },

  // ── Early branch ──
  { id: "lake-bend", name: "Mirror Lake Bend", kind: "path", icon: "💧", x: 180, y: 420,
    links: ["start", "glacier-shelf", "reed-cut"], blurb: "Calm water — a good place to paddle and think." },
  { id: "pine-spur", name: "Pine Ridge Spur", kind: "path", icon: "🌲", x: 180, y: 620,
    links: ["start", "sugar-trail", "fox-run"], blurb: "A dry ridge path between the lakes." },

  { id: "glacier-shelf", name: "Glacier Shelf", kind: "knowledge", icon: "🧊", x: 280, y: 340,
    links: ["lake-bend", "manoomin-inlet"], art: "assets/stop-glacial-lakes.jpg",
    blurb: "Ice once carved this basin. Knowledge space — draw a Story Card." },
  { id: "reed-cut", name: "Reed Cut", kind: "path", icon: "🌿", x: 280, y: 460,
    links: ["lake-bend", "manoomin-inlet", "sugar-trail"], blurb: "A shortcut through tall reeds." },
  { id: "sugar-trail", name: "Sugarbush Path", kind: "knowledge", icon: "🍁", x: 280, y: 560,
    links: ["pine-spur", "reed-cut", "manoomin-inlet"], art: "assets/stop-maple-sugaring.jpg",
    blurb: "Sap buckets and sweet smoke. Knowledge space." },
  { id: "fox-run", name: "Fox Run", kind: "hazard", icon: "🦊", x: 280, y: 700,
    links: ["pine-spur", "portage-foot"], blurb: "A tricky slope — hazard card!" },

  // ── Mid marsh hub ──
  { id: "manoomin-inlet", name: "Manoomin Inlet", kind: "challenge", icon: "🌾", x: 400, y: 460,
    links: ["glacier-shelf", "reed-cut", "sugar-trail", "cliff-ledge", "carry-path", "camp-cedar"],
    minigame: "rice", art: "assets/stop-manoomin.jpg",
    blurb: "Wild rice beds. Challenge: harvest respectfully." },

  { id: "camp-cedar", name: "Cedar Camp", kind: "camp", icon: "🏕️", x: 400, y: 600,
    links: ["manoomin-inlet", "portage-foot", "carry-path"], blurb: "Rest, share food, warm up." },

  { id: "cliff-ledge", name: "Pictograph Ledge", kind: "challenge", icon: "🎨", x: 520, y: 340,
    links: ["manoomin-inlet", "hunt-grove", "trade-creek"],
    minigame: "memory", art: "assets/stop-pictographs.jpg",
    blurb: "Match the cliff symbols. Look, don't touch." },
  { id: "carry-path", name: "Great Portage", kind: "challenge", icon: "🥾", x: 520, y: 520,
    links: ["manoomin-inlet", "camp-cedar", "hunt-grove", "pipe-rise"],
    minigame: "portage", art: "assets/stop-portage-carry.jpg",
    blurb: "Carry the canoe between waters." },
  { id: "portage-foot", name: "Portage Foot", kind: "path", icon: "👣", x: 400, y: 720,
    links: ["fox-run", "camp-cedar", "pipe-rise"], blurb: "Muddy boots and tired grins." },

  // ── Mid branches ──
  { id: "hunt-grove", name: "Hunt & Forage", kind: "challenge", icon: "🦌", x: 640, y: 400,
    links: ["cliff-ledge", "carry-path", "bdote-overlook", "trade-creek"],
    minigame: "forage", art: "assets/stop-hunt-forage.jpg",
    blurb: "Gather what the woods offer — carefully." },
  { id: "pipe-rise", name: "Pipestone Teaching", kind: "knowledge", icon: "🔴", x: 640, y: 620,
    links: ["carry-path", "portage-foot", "trade-creek", "dig-bench"],
    art: "assets/stop-pipestone.jpg",
    blurb: "A teaching about sacred red stone and peace." },

  { id: "trade-creek", name: "Trade Creek", kind: "path", icon: "⚓", x: 760, y: 500,
    links: ["cliff-ledge", "hunt-grove", "pipe-rise", "fur-landing", "bdote-overlook"],
    blurb: "Beads, copper, and stories cross hands." },

  { id: "bdote-overlook", name: "Bdote Overlook", kind: "knowledge", icon: "🏞️", x: 760, y: 340,
    links: ["hunt-grove", "trade-creek", "fur-landing"],
    art: "assets/stop-bdote.jpg",
    blurb: "Where great rivers meet — a place of deep meaning." },

  { id: "fur-landing", name: "Fur Trade Landing", kind: "knowledge", icon: "🦫", x: 880, y: 440,
    links: ["trade-creek", "bdote-overlook", "dig-bench", "headwater-spring"],
    art: "assets/stop-fur-trade.jpg",
    blurb: "Nations traded here long before maps said 'discovered'." },

  { id: "dig-bench", name: "Practice Dig", kind: "challenge", icon: "🔎", x: 880, y: 600,
    links: ["pipe-rise", "fur-landing", "headwater-spring"],
    minigame: "dig", art: "assets/stop-dig-site.jpg",
    blurb: "Practice archaeology — slow, careful, respectful." },

  { id: "headwater-spring", name: "Headwater Spring", kind: "path", icon: "💧", x: 1000, y: 500,
    links: ["fur-landing", "dig-bench", "rapids-gate", "council"],
    art: "assets/stop-headwaters.jpg",
    blurb: "The river begins as a clear trickle." },

  { id: "rapids-gate", name: "Rapids Gate", kind: "hazard", icon: "🌊", x: 1000, y: 360,
    links: ["headwater-spring", "council"], blurb: "White water ahead — hazard!" },

  // ── Finish ──
  { id: "council", name: "Council of Stories", kind: "council", icon: "🔥", x: 1120, y: 500,
    links: ["headwater-spring", "rapids-gate"], art: "assets/stop-finale.jpg",
    blurb: "Open the Bundle. Share what you carried." },
];

export function getSpace(id) {
  return BOARD.find((s) => s.id === id) || null;
}

export function boardIndex(id) {
  return BOARD.findIndex((s) => s.id === id);
}

/** Undirected adjacency list. */
export function neighbors(id) {
  const s = getSpace(id);
  return s ? [...(s.links || [])] : [];
}

/**
 * Spaces whose shortest path is exactly `steps` hops.
 * Returns Map<spaceId, path[]>
 */
export function destinationsAtDistance(fromId, steps) {
  const found = new Map();
  const prev = new Map([[fromId, null]]);
  const dist = new Map([[fromId, 0]]);
  const queue = [fromId];

  while (queue.length) {
    const id = queue.shift();
    const d = dist.get(id);
    if (d === steps && id !== fromId) {
      // rebuild path
      const path = [];
      let cur = id;
      while (cur) {
        path.unshift(cur);
        cur = prev.get(cur);
      }
      found.set(id, path);
      continue;
    }
    if (d >= steps) continue;
    for (const n of neighbors(id)) {
      if (dist.has(n)) continue;
      dist.set(n, d + 1);
      prev.set(n, id);
      queue.push(n);
    }
  }
  return found;
}

/** All spaces within 1..maxSteps for preview glow. */
export function destinationsUpTo(fromId, maxSteps) {
  const all = new Map();
  for (let s = 1; s <= maxSteps; s++) {
    for (const [id, path] of destinationsAtDistance(fromId, s)) {
      if (!all.has(id)) all.set(id, { steps: s, path });
    }
  }
  return all;
}

export function spaceLabel(space) {
  if (!space) return "?";
  const kindTag = {
    start: "Start",
    path: "Trail",
    knowledge: "Story Card",
    challenge: "Challenge",
    camp: "Camp",
    hazard: "Hazard",
    council: "Council",
  }[space.kind] || space.kind;
  return `${space.icon || ""} ${space.name} · ${kindTag}`;
}
