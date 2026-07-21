import { shuffle } from "./data.js?v=race13";
import { PICTOGRAPHS } from "./pictographs.js?v=race13";

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

/** Pictograph memory match — cliff symbols (not emoji). */
export function createMemoryGame({ pairs = 6 } = {}) {
  const count = Math.max(4, Math.min(pairs, PICTOGRAPHS.length));
  const chosen = shuffle([...PICTOGRAPHS]).slice(0, count);
  const cards = shuffle(
    chosen.flatMap((p, idx) => [
      {
        id: `${p.id}-a`,
        pair: idx,
        symbol: p.label,
        art: p.src,
        label: p.label,
        flipped: false,
        matched: false,
      },
      {
        id: `${p.id}-b`,
        pair: idx,
        symbol: p.label,
        art: p.src,
        label: p.label,
        flipped: false,
        matched: false,
      },
    ])
  );
  return {
    type: "memory",
    cards,
    flipped: [],
    moves: 0,
    pairs: count,
    done: false,
    message: `Match ${count} pictograph pairs on the cliff wall!`,
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

/**
 * Manoomin whack-a-mole: pods flash ripe then fade.
 * Tap golden ripe heads — leave green ones to reseed!
 */
export function createRiceGame({ goal = 8, ticks = 45 } = {}) {
  const pods = Array.from({ length: 9 }, (_, i) => ({
    id: `pod-${i}`,
    phase: "empty", // empty | ripe | green
    ttl: 0,
  }));
  return {
    type: "rice",
    pods,
    caught: 0,
    misses: 0,
    goal,
    ticksLeft: ticks,
    tick: 0,
    done: false,
    won: false,
    message: "Tap golden 🌾 while they're ripe — they vanish fast!",
  };
}

export function tickRiceGame(game) {
  if (game.done) return game;
  let pods = game.pods.map((p) => ({ ...p }));
  const ticksLeft = game.ticksLeft - 1;
  const tick = (game.tick || 0) + 1;

  // Age active pods
  pods = pods.map((p) => {
    if (p.phase === "empty") return p;
    const ttl = p.ttl - 1;
    if (ttl <= 0) return { ...p, phase: "empty", ttl: 0 };
    return { ...p, ttl };
  });

  // Spawn: every other tick, maybe pop a ripe (or decoy green) pod
  if (tick % 2 === 0) {
    const empties = pods.map((p, i) => (p.phase === "empty" ? i : -1)).filter((i) => i >= 0);
    if (empties.length) {
      const idx = empties[Math.floor(Math.random() * empties.length)];
      const ripe = Math.random() > 0.28;
      pods[idx] = {
        ...pods[idx],
        phase: ripe ? "ripe" : "green",
        ttl: ripe ? 3 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2),
      };
    }
  }

  // Occasionally spawn a second ripe for challenge
  if (tick % 5 === 0) {
    const empties = pods.map((p, i) => (p.phase === "empty" ? i : -1)).filter((i) => i >= 0);
    if (empties.length && Math.random() > 0.4) {
      const idx = empties[Math.floor(Math.random() * empties.length)];
      pods[idx] = { ...pods[idx], phase: "ripe", ttl: 3 };
    }
  }

  const won = game.caught >= game.goal;
  const done = won || ticksLeft <= 0;

  return {
    ...game,
    pods,
    tick,
    ticksLeft: Math.max(0, ticksLeft),
    won,
    done,
    message: done
      ? won
        ? "Bundle full! Respectful harvest — you left plants to reseed."
        : `Time's up — you gathered ${game.caught} ripe pods.`
      : `Ripe ${game.caught}/${game.goal} · ${ticksLeft}s left`,
  };
}

export function catchRicePod(game, podId) {
  if (game.done) return game;
  const pods = game.pods.map((p) => ({ ...p }));
  const pod = pods.find((p) => p.id === podId);
  if (!pod || pod.phase === "empty") return game;

  let caught = game.caught;
  let misses = game.misses;
  let message = game.message;

  if (pod.phase === "ripe") {
    caught += 1;
    message = `Nice knock! ${caught}/${game.goal}`;
  } else {
    misses += 1;
    message = "Too green — leave those to grow!";
  }

  pod.phase = "empty";
  pod.ttl = 0;

  const won = caught >= game.goal;
  const done = won || game.ticksLeft <= 0;

  return {
    ...game,
    pods,
    caught,
    misses,
    won,
    done,
    message: done
      ? won
        ? "Bundle full! Respectful harvest complete."
        : `Harvest done — you gathered ${caught} ripe pods.`
      : message,
  };
}
