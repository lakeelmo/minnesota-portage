import { shuffle } from "./data.js";

/** Archaeology dig: find artifacts in a 4x4 grid. */
export function createDigGame({ attempts = 5, artifactCount = 4 } = {}) {
  const cells = Array.from({ length: 16 }, (_, i) => ({
    i,
    artifact: null,
    revealed: false,
  }));
  const artifacts = shuffle([
    { id: "bead", emoji: "🔵", name: "Trade bead", points: 15 },
    { id: "sherd", emoji: "🏺", name: "Pottery sherd", points: 20 },
    { id: "point", emoji: "🗡️", name: "Stone point", points: 25 },
    { id: "copper", emoji: "🧡", name: "Copper fragment", points: 30 },
    { id: "seed", emoji: "🌾", name: "Charred seed", points: 15 },
    { id: "bone-awl", emoji: "🦴", name: "Bone tool", points: 20 },
  ]).slice(0, artifactCount);

  const spots = shuffle([...cells.keys()]).slice(0, artifactCount);
  spots.forEach((idx, n) => {
    cells[idx].artifact = artifacts[n];
  });

  return {
    type: "dig",
    cells,
    attemptsLeft: attempts,
    found: [],
    done: false,
    message: `You have ${attempts} careful digs. Find the practice artifacts!`,
  };
}

export function digAt(game, index) {
  if (game.done || game.attemptsLeft <= 0) return game;
  const cells = game.cells.map((c) => ({ ...c }));
  const cell = cells[index];
  if (!cell || cell.revealed) return game;

  cell.revealed = true;
  let found = [...game.found];
  let message = "Only soil this time. Keep mapping the grid!";
  if (cell.artifact) {
    found.push(cell.artifact);
    message = `Found ${cell.artifact.emoji} ${cell.artifact.name}!`;
  }

  const attemptsLeft = game.attemptsLeft - 1;
  const allFound = found.length >= cells.filter((c) => c.artifact).length;
  const done = allFound || attemptsLeft <= 0;

  return {
    ...game,
    cells,
    found,
    attemptsLeft,
    done,
    message: done
      ? allFound
        ? "Amazing dig! You recorded every practice find."
        : `Dig complete. You found ${found.length} artifact(s).`
      : message,
  };
}

/** Pictograph memory match. */
export function createMemoryGame({ pairs = 4 } = {}) {
  const symbols = ["🦅", "🐟", "🌕", "canoe", "🌲", "⚡", "🐻", "🌊"].slice(0, pairs);
  const display = {
    canoe: "🛶",
  };
  const cards = shuffle(
    symbols.flatMap((s, idx) => [
      { id: `${idx}-a`, pair: idx, symbol: display[s] || s, flipped: false, matched: false },
      { id: `${idx}-b`, pair: idx, symbol: display[s] || s, flipped: false, matched: false },
    ])
  );
  return {
    type: "memory",
    cards,
    flipped: [],
    moves: 0,
    done: false,
    message: "Match the pictograph pairs!",
  };
}

export function flipMemory(game, cardId) {
  if (game.done) return game;
  const cards = game.cards.map((c) => ({ ...c }));
  const card = cards.find((c) => c.id === cardId);
  if (!card || card.flipped || card.matched) return game;

  let flipped = [...game.flipped];
  if (flipped.length >= 2) return game;

  card.flipped = true;
  flipped.push(cardId);
  let moves = game.moves;
  let message = game.message;
  let done = false;

  if (flipped.length === 2) {
    moves += 1;
    const [a, b] = flipped.map((id) => cards.find((c) => c.id === id));
    if (a.pair === b.pair) {
      a.matched = true;
      b.matched = true;
      flipped = [];
      message = "Match! The cliff symbols glow.";
    } else {
      message = "Not a match — remember and try again.";
    }
  }

  done = cards.every((c) => c.matched);
  if (done) message = "Pictographs solved! The path opens.";

  return { ...game, cards, flipped, moves, done, message };
}

export function unflipMismatches(game) {
  if (game.flipped.length !== 2) return game;
  const cards = game.cards.map((c) => ({ ...c }));
  const [a, b] = game.flipped.map((id) => cards.find((c) => c.id === id));
  if (a && b && !a.matched) {
    a.flipped = false;
    b.flipped = false;
  }
  return { ...game, cards, flipped: [], message: "Try another pair." };
}

/** Wild rice gather: tap ripe pods before they fade. */
export function createRiceGame({ goal = 8 } = {}) {
  const pods = Array.from({ length: 12 }, (_, i) => ({
    id: `pod-${i}`,
    ripe: Math.random() > 0.35,
    caught: false,
  }));
  return {
    type: "rice",
    pods,
    caught: 0,
    goal,
    done: false,
    won: false,
    message: "Tap the golden ripe manoomin pods. Leave some for next season!",
  };
}

export function catchRicePod(game, podId) {
  if (game.done) return game;
  const pods = game.pods.map((p) => ({ ...p }));
  const pod = pods.find((p) => p.id === podId);
  if (!pod || pod.caught) return game;

  pod.caught = true;
  let caught = game.caught;
  let message = game.message;

  if (pod.ripe) {
    caught += 1;
    message = `Gathered carefully! ${caught}/${game.goal}`;
  } else {
    message = "That one wasn’t ready — leave green pods to grow.";
  }

  const tapped = pods.filter((p) => p.caught).length;
  const won = caught >= game.goal;
  const done = won || tapped >= pods.length;

  return {
    ...game,
    pods,
    caught,
    won,
    done,
    message: done
      ? won
        ? "Bundle full! Respectful harvest complete."
        : `Harvest done — you gathered ${caught} ripe pods.`
      : message,
  };
}
