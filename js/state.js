import {
  DIFFICULTIES,
  WHIMSICAL_STARTS,
  FOODS,
  MEDICINE,
  getItem,
  getWeapon,
  getAilment,
  pickRandom,
  TRAIL_STOPS,
} from "./data.js";
import { CLOTHING, getClothing } from "./characters.js";
import { makeCompanionState, pickCompanion } from "./companions.js";
import { getAnimal } from "./animals.js";

const SAVE_KEY = "minnesota-portage-v3";

export function createEmptySetup() {
  return {
    playerCount: 1,
    difficulty: "medium",
    players: [],
    draftingIndex: 0,
    companionOn: true,
    companionId: null,
  };
}

export function createPlayerDraft(index) {
  return {
    id: `p${index + 1}`,
    name: "",
    personality: "",
    characterId: "waver",
    powerId: "time-echo",
    clothingId: "none",
  };
}

export function startRun(setup) {
  const diff = DIFFICULTIES[setup.difficulty] || DIFFICULTIES.medium;
  const start = pickRandom(WHIMSICAL_STARTS);
  const usedChars = setup.players.map((p) => p.characterId);
  const companion =
    setup.companionOn
      ? makeCompanionState(setup.companionId || pickCompanion(usedChars).id)
      : null;

  return {
    phase: "trail",
    setup,
    players: setup.players.map((p) => ({ ...p })),
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
    companion,
    storyStones: 0,
    questTitle: "The Great Portage",
    stopIndex: -1, // -1 = whimsical start / quest briefing
    start,
    stops: TRAIL_STOPS,
    activePlayer: 0,
    score: 0,
    learned: [],
    artifacts: [],
    hintsLeft: setup.players.filter((p) => p.powerId === "time-echo").length,
    strongArms: setup.players.some((p) => p.powerId === "strong-arms"),
    speedyFeet: setup.players.some((p) => p.powerId === "speedy-feet"),
    animalFriendPower: setup.players.some((p) => p.powerId === "animal-friend"),
    puzzleMaster: setup.players.some((p) => p.powerId === "puzzle-master"),
    warmHeart: setup.players.some((p) => p.powerId === "warm-heart"),
    encountersDone: 0,
    enemiesFaced: 0,
    questionsCorrect: 0,
    questionsTotal: 0,
    restsUsed: 0,
    log: [`Arrived at ${start.name}!`],
    encounter: null,
    gameOver: false,
    won: false,
  };
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* ─────────────── Items ─────────────── */

export function addItem(state, id) {
  const item = getItem(id);
  if (!item) return state;
  return { ...state, inventory: [...state.inventory, { ...item }] };
}
export const addFood = addItem;

export function unlockClothing(state, clothingId) {
  if (state.clothingOwned.includes(clothingId)) return state;
  const cloth = getClothing(clothingId);
  return {
    ...state,
    clothingOwned: [...state.clothingOwned, clothingId],
    log: [...state.log, `Unlocked outfit: ${cloth?.emoji || ""} ${cloth?.name || clothingId}`],
  };
}

export function equipClothing(state, playerId, clothingId) {
  if (!state.clothingOwned.includes(clothingId)) return state;
  let next = {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, clothingId } : p
    ),
  };
  // Warm outfits chase away the Chills.
  const cloth = getClothing(clothingId);
  if (cloth?.warm && next.ailments.some((a) => a.id === "the-chills")) {
    next = cureAilment(next, "the-chills", `${cloth.emoji} warmed you up — the Chills are gone!`);
  }
  return next;
}

/* ─────────────── Weapons ─────────────── */

export function addWeapon(state, id) {
  if (!id || state.weaponsOwned.includes(id)) return state;
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

/* ─────────────── Sickness ─────────────── */

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

/* ─────────────── Animal friends ─────────────── */

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

/* ─────────────── Travel / damage ─────────────── */

export function travelCost(state) {
  const diff = DIFFICULTIES[state.difficulty];
  let cost = diff.energyTravel;
  if (state.speedyFeet) cost = Math.max(3, Math.floor(cost * 0.65));
  if ((state.animalFriends || []).some((id) => getAnimal(id)?.bonus === "energy-save")) {
    cost = Math.max(2, cost - 2);
  }
  if (state.energy < 30) cost += 3;
  else if (state.energy > 70) cost = Math.max(2, cost - 2);
  return cost;
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

/* ─────────────── Save / load ─────────────── */

export function saveRun(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (_) {}
}

export function getActivePlayer(state) {
  return state.players[state.activePlayer] || state.players[0];
}
