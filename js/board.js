/**
 * Minnesota Portage — left-to-right valley race board.
 * Progress is roughly west → east. Branches add strategy; finish wins.
 */

export const BOARD = [
  { id: "start", name: "Canoe Landing", kind: "start", icon: "🛶", x: 70, y: 390, progress: 0,
    links: ["fog-bay", "reed-shore"], blurb: "Push off. First to the Council wins." },

  { id: "fog-bay", name: "Fog Bay", kind: "path", icon: "🌫️", x: 170, y: 300, progress: 1,
    links: ["start", "glacier-notch", "birch-point"], blurb: "Mist on the water." },
  { id: "reed-shore", name: "Reed Shore", kind: "path", icon: "🌿", x: 170, y: 480, progress: 1,
    links: ["start", "sugar-bend", "otter-cove"], blurb: "Tall reeds hide the channel." },

  { id: "glacier-notch", name: "Glacier Notch", kind: "path", icon: "🧊", x: 280, y: 220, progress: 2,
    links: ["fog-bay", "manoomin-arm"], art: "assets/stop-glacial-lakes.jpg", blurb: "Ice-carved stone." },
  { id: "birch-point", name: "Birch Point", kind: "path", icon: "🌳", x: 280, y: 360, progress: 2,
    links: ["fog-bay", "reed-shore", "manoomin-arm", "cedar-camp"], blurb: "White bark trail." },
  { id: "sugar-bend", name: "Sugar Bend", kind: "path", icon: "🍁", x: 280, y: 500, progress: 2,
    links: ["reed-shore", "cedar-camp", "fox-ledge"], art: "assets/stop-maple-sugaring.jpg", blurb: "Sweet spring air." },
  { id: "otter-cove", name: "Otter Cove", kind: "path", icon: "🦦", x: 280, y: 620, progress: 2,
    links: ["reed-shore", "fox-ledge"], blurb: "Ripples and laughter." },

  { id: "manoomin-arm", name: "Manoomin Arm", kind: "path", icon: "🌾", x: 400, y: 280, progress: 3,
    links: ["glacier-notch", "birch-point", "pictograph-wall", "carry-rise"],
    art: "assets/stop-manoomin.jpg", blurb: "Wild rice shallows." },
  { id: "cedar-camp", name: "Cedar Camp", kind: "path", icon: "🏕️", x: 400, y: 430, progress: 3,
    links: ["birch-point", "sugar-bend", "carry-rise", "hunt-cut"], blurb: "Smoke and stories." },
  { id: "fox-ledge", name: "Fox Ledge", kind: "path", icon: "🦊", x: 400, y: 580, progress: 3,
    links: ["sugar-bend", "otter-cove", "hunt-cut"], blurb: "A steep scramble." },

  { id: "pictograph-wall", name: "Pictograph Wall", kind: "path", icon: "🎨", x: 520, y: 200, progress: 4,
    links: ["manoomin-arm", "trade-ford"], art: "assets/stop-pictographs.jpg", blurb: "Look, don't touch." },
  { id: "carry-rise", name: "Great Portage", kind: "path", icon: "🥾", x: 520, y: 360, progress: 4,
    links: ["manoomin-arm", "cedar-camp", "trade-ford", "pipe-knoll"],
    art: "assets/stop-portage-carry.jpg", blurb: "Shoulder the canoe." },
  { id: "hunt-cut", name: "Hunt Cut", kind: "path", icon: "🦌", x: 520, y: 520, progress: 4,
    links: ["cedar-camp", "fox-ledge", "pipe-knoll", "fish-pool"],
    art: "assets/stop-hunt-forage.jpg", blurb: "Tracks in the moss." },

  { id: "trade-ford", name: "Trade Ford", kind: "path", icon: "⚓", x: 650, y: 260, progress: 5,
    links: ["pictograph-wall", "carry-rise", "bdote-bluff", "fur-bar"], blurb: "Goods change hands." },
  { id: "pipe-knoll", name: "Pipe Knoll", kind: "path", icon: "🔴", x: 650, y: 420, progress: 5,
    links: ["carry-rise", "hunt-cut", "fur-bar", "dig-flat"],
    art: "assets/stop-pipestone.jpg", blurb: "A teaching about red stone." },
  { id: "fish-pool", name: "Fish Pool", kind: "path", icon: "🐟", x: 650, y: 580, progress: 5,
    links: ["hunt-cut", "dig-flat"], blurb: "Clear water, quick hands." },

  { id: "bdote-bluff", name: "Bdote Bluff", kind: "path", icon: "🏞️", x: 780, y: 220, progress: 6,
    links: ["trade-ford", "rapids-gate"], art: "assets/stop-bdote.jpg", blurb: "Rivers meet below." },
  { id: "fur-bar", name: "Fur Bar", kind: "path", icon: "🦫", x: 780, y: 380, progress: 6,
    links: ["trade-ford", "pipe-knoll", "rapids-gate", "spring-head"],
    art: "assets/stop-fur-trade.jpg", blurb: "Old exchange ground." },
  { id: "dig-flat", name: "Practice Dig", kind: "path", icon: "🔎", x: 780, y: 540, progress: 6,
    links: ["pipe-knoll", "fish-pool", "spring-head"],
    art: "assets/stop-dig-site.jpg", blurb: "Careful trowel work." },

  { id: "rapids-gate", name: "Rapids Gate", kind: "path", icon: "🌊", x: 910, y: 280, progress: 7,
    links: ["bdote-bluff", "fur-bar", "eagle-perch"], blurb: "White water ahead." },
  { id: "spring-head", name: "Spring Head", kind: "path", icon: "💧", x: 910, y: 460, progress: 7,
    links: ["fur-bar", "dig-flat", "eagle-perch", "council"],
    art: "assets/stop-headwaters.jpg", blurb: "The river's quiet start." },

  { id: "eagle-perch", name: "Eagle Perch", kind: "path", icon: "🦅", x: 1030, y: 340, progress: 8,
    links: ["rapids-gate", "spring-head", "council"], blurb: "One last ridge." },

  { id: "council", name: "Council of Stories", kind: "finish", icon: "🔥", x: 1140, y: 390, progress: 9,
    links: ["spring-head", "eagle-perch"], art: "assets/stop-finale.jpg",
    blurb: "Reach here first to win the Great Portage." },
];

export const FINISH_ID = "council";
export const MINIGAME_POOL = ["rice", "memory", "dig", "portage", "forage"];

export function getSpace(id) {
  return BOARD.find((s) => s.id === id) || null;
}

export function boardIndex(id) {
  return BOARD.findIndex((s) => s.id === id);
}

export function neighbors(id) {
  const s = getSpace(id);
  return s ? [...(s.links || [])] : [];
}

/** Shortest-path destinations exactly `steps` hops away. */
export function destinationsAtDistance(fromId, steps) {
  const found = new Map();
  const prev = new Map([[fromId, null]]);
  const dist = new Map([[fromId, 0]]);
  const queue = [fromId];

  while (queue.length) {
    const id = queue.shift();
    const d = dist.get(id);
    if (d === steps && id !== fromId) {
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

/** Prefer forward (higher progress / further east). Still allow exact hop distance. */
export function forwardDestinations(fromId, steps) {
  const from = getSpace(fromId);
  const all = destinationsAtDistance(fromId, steps);
  const forward = [...all.entries()].filter(([id]) => {
    const s = getSpace(id);
    if (!s || !from) return true;
    return s.progress > from.progress || (s.progress === from.progress && s.x >= from.x);
  });
  if (forward.length) return new Map(forward);
  return all;
}

export function bestForwardMove(fromId, steps) {
  const opts = [...forwardDestinations(fromId, steps).keys()];
  if (!opts.length) return null;
  opts.sort((a, b) => {
    const sa = getSpace(a);
    const sb = getSpace(b);
    return (sb.progress - sa.progress) || (sb.x - sa.x);
  });
  return opts[0];
}
