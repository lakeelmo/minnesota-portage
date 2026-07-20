import {
  DIFFICULTIES,
  getItem,
  getWeapon,
  getAilment,
  pickRandom,
} from "./data.js";
import { CLOTHING, getClothing, CHARACTERS } from "./characters.js";
import { getAnimal } from "./animals.js";
import { BOARD } from "./board.js";

const SAVE_KEY = "minnesota-portage-v6";

export function createEmptySetup() {
  return {
    playerCount: 1,
    difficulty: "medium",
    players: [],
    draftingIndex: 0,
  };
}

/** Draft uses the character's real name — no free-typing. */
export function createPlayerDraft(index) {
  const char = CHARACTERS[index % CHARACTERS.length];
  return {
    id: `p${index + 1}`,
    name: char.name,
    characterId: char.id,
    powerId: "time-echo",
    clothingId: "none",
  };
}

export function startRun(setup) {
  const diff = DIFFICULTIES[setup.difficulty] || DIFFICULTIES.medium;
  const players = setup.players.map((p) => {
    const ch = CHARACTERS.find((c) => c.id === p.characterId);
    return {
      ...p,
      name: ch?.name || p.name || "Traveler",
    };
  });

  return {
    phase: "board",
    mode: "boardgame",
    setup,
    players,
    difficulty: setup.difficulty,
    health: diff.health,
    energy: diff.energy,
    maxHealth: diff.health,
    maxEnergy: diff.energy,
    rations: diff.rations,
    maxRations: diff.maxRations,
    inventory: [
      { ...getItem("donut") },
      { ...getItem("wild-rice-cakes") },
      { ...getItem("cedar-tea") },
    ],
    weaponsOwned: ["wooden-spear"],
    equippedWeapon: "wooden-spear",
    clothingOwned: ["none", "voyager-hat"],
    ailments: [],
    animalFriends: [],
    companion: null,
    storyStones: 0,
    questTitle: "The St. Croix Great Portage",
    board: BOARD,
    position: "start",
    dice: null,
    turnPhase: "roll",
    legal: [],
    usedQuizIds: [],
    activePlayer: 0,
    score: 0,
    learned: [],
    artifacts: [],
    hintsLeft: players.filter((p) => p.powerId === "time-echo").length,
    strongArms: players.some((p) => p.powerId === "strong-arms"),
    speedyFeet: players.some((p) => p.powerId === "speedy-feet"),
    animalFriendPower: players.some((p) => p.powerId === "animal-friend"),
    puzzleMaster: players.some((p) => p.powerId === "puzzle-master"),
    warmHeart: players.some((p) => p.powerId === "warm-heart"),
    encountersDone: 0,
    enemiesFaced: 0,
    questionsCorrect: 0,
    questionsTotal: 0,
    restsUsed: 0,
    log: ["The board is ready. Roll the die to travel the valley."],
    encounter: null,
    gameOver: false,
    won: false,
  };
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function addItem(state, id) {
  const item = getItem(id);
  if (!item) return state;
  return { ...state, inventory: [...state.inventory, { ...item }] };
}
export const addFood = addItem;

export function removeInventoryAt(state, index) {
  const inventory = state.inventory.filter((_, i) => i !== index);
  return { ...state, inventory };
}

export function unlockClothing(state, id) {
  if (!id || (state.clothingOwned || []).includes(id)) return state;
  return {
    ...state,
    clothingOwned: [...(state.clothingOwned || []), id],
    log: [...state.log, `Found clothing: ${getClothing(id)?.emoji || ""} ${getClothing(id)?.name || id}`],
  };
}

export function equipClothing(state, playerId, clothingId) {
  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, clothingId } : p
  );
  return { ...state, players };
}

export function addWeapon(state, id) {
  if (!id || (state.weaponsOwned || []).includes(id)) return state;
  const w = getWeapon(id);
  return {
    ...state,
    weaponsOwned: [...state.weaponsOwned, id],
    equippedWeapon: state.equippedWeapon || id,
    log: [...state.log, `Found a weapon: ${w?.emoji || ""} ${w?.name || id}`],
  };
}

export function equipWeapon(state, id) {
  if (!state.weaponsOwned.includes(id)) return state;
  return { ...state, equippedWeapon: id };
}

export function applyAilment(state, id, reason) {
  const a = getAilment(id);
  if (!a) return state;
  if (state.ailments.some((x) => x.id === id)) return state;
  if (id === "the-chills" && state.warmHeart && Math.random() < 0.6) {
    return { ...state, log: [...state.log, `Warm Heart shrugged off the chill!`] };
  }
  return {
    ...state,
    ailments: [...state.ailments, { id: a.id, name: a.name, emoji: a.emoji }],
    log: [...state.log, reason || `Caught ${a.emoji} ${a.name}!`],
  };
}

export function cureAilment(state, id, reason) {
  if (!state.ailments.some((x) => x.id === id)) return state;
  const a = getAilment(id);
  return {
    ...state,
    ailments: state.ailments.filter((x) => x.id !== id),
    log: [...state.log, reason || `${a?.emoji || ""} ${a?.name || "Ailment"} cured!`],
  };
}

export function addAnimalFriend(state, id) {
  if (!id || (state.animalFriends || []).includes(id)) return state;
  const a = getAnimal(id);
  let next = {
    ...state,
    animalFriends: [...(state.animalFriends || []), id],
    log: [...state.log, `${a?.emoji || ""} ${a?.name || id} joined your trail family! (${a?.perk || ""})`],
  };
  if (a?.bonus === "hint") next = { ...next, hintsLeft: next.hintsLeft + 1 };
  return next;
}

export function applyDamage(state, healthLoss = 0, energyLoss = 0, reason = "") {
  const health = clamp(state.health - healthLoss, 0, state.maxHealth);
  const energy = clamp(state.energy - energyLoss, 0, state.maxEnergy);
  const gameOver = health <= 0;
  return {
    ...state,
    health,
    energy,
    gameOver,
    won: false,
    log: reason ? [...state.log, reason] : state.log,
  };
}

export function addScore(state, points, note) {
  return {
    ...state,
    score: state.score + points,
    log: note ? [...state.log, note] : state.log,
  };
}

export function nextPlayer(state) {
  const activePlayer = (state.activePlayer + 1) % state.players.length;
  return { ...state, activePlayer };
}

export function saveRun(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || state.mode !== "boardgame") return null;
    if (!state.position) state.position = "start";
    if (!state.usedQuizIds) state.usedQuizIds = [];
    if (!state.turnPhase) state.turnPhase = "roll";
    return state;
  } catch (_) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    // Also clear legacy key so Continue doesn't revive the old map mode.
    localStorage.removeItem("minnesota-portage-v5");
  } catch (_) {}
}

export function getActivePlayer(state) {
  return state.players[state.activePlayer] || state.players[0];
}

export { pickRandom, CLOTHING };
