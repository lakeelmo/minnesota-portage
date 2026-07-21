import {
  DIFFICULTIES,
  getItem,
  getWeapon,
  getAilment,
  pickRandom,
} from "./data.js?v=race14";
import { CLOTHING, getClothing, CHARACTERS } from "./characters.js?v=race14";
import { getAnimal } from "./animals.js?v=race14";
import { BOARD } from "./board.js?v=race14";

const SAVE_KEY = "minnesota-portage-v8";

export function createEmptySetup() {
  return {
    playerCount: 1,
    difficulty: "medium",
    players: [],
    draftingIndex: 0,
  };
}

export function createPlayerDraft(index) {
  const char = CHARACTERS[index % CHARACTERS.length];
  return {
    id: `p${index + 1}`,
    name: char.name,
    characterId: char.id,
    powerId: "time-echo",
    clothingId: "none",
    isCpu: false,
    position: "start",
  };
}

function makeCpuPlayer(humanCharacterIds) {
  const taken = new Set(humanCharacterIds);
  const ch = CHARACTERS.find((c) => !taken.has(c.id)) || CHARACTERS[1];
  return {
    id: "cpu",
    name: `${ch.name} (CPU)`,
    characterId: ch.id,
    powerId: "puzzle-master",
    clothingId: "none",
    isCpu: true,
    position: "start",
  };
}

export function startRun(setup) {
  const diff = DIFFICULTIES[setup.difficulty] || DIFFICULTIES.medium;
  let players = setup.players.map((p) => {
    const ch = CHARACTERS.find((c) => c.id === p.characterId);
    return {
      ...p,
      name: ch?.name || p.name || "Traveler",
      isCpu: false,
      position: "start",
    };
  });

  // Solo → add computer rival
  if (players.length === 1) {
    players = [...players, makeCpuPlayer(players.map((p) => p.characterId))];
  }

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
    questTitle: "The St. Croix Great Portage",
    board: BOARD,
    diceFace: null,
    dice: null,
    turnPhase: "roll",
    legal: [],
    usedQuizIds: [],
    lastPosition: null,
    activePlayer: 0,
    score: 0,
    learned: [],
    artifacts: [],
    hintsLeft: players.filter((p) => !p.isCpu && p.powerId === "time-echo").length,
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
    log: ["Race the valley — first to the Council wins."],
    encounter: null,
    gameOver: false,
    won: false,
    winnerId: null,
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

export function removeInventoryAt(state, index) {
  return { ...state, inventory: state.inventory.filter((_, i) => i !== index) };
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
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, clothingId } : p)),
  };
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
  if (!a || state.ailments.some((x) => x.id === id)) return state;
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
  return {
    ...state,
    animalFriends: [...(state.animalFriends || []), id],
    log: [...state.log, `${a?.emoji || ""} ${a?.name || id} joined!`],
  };
}

export function applyDamage(state, healthLoss = 0, energyLoss = 0, reason = "") {
  const health = clamp(state.health - healthLoss, 0, state.maxHealth);
  const energy = clamp(state.energy - energyLoss, 0, state.maxEnergy);
  return {
    ...state,
    health,
    energy,
    gameOver: health <= 0,
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
  return { ...state, activePlayer: (state.activePlayer + 1) % state.players.length };
}

export function ensureCpuRival(state) {
  if (!state?.players?.length) return state;
  const humans = state.players.filter((p) => !p.isCpu);
  const hasCpu = state.players.some((p) => p.isCpu);
  if (humans.length === 1 && !hasCpu) {
    return {
      ...state,
      mode: "boardgame",
      players: [...state.players, makeCpuPlayer(humans.map((p) => p.characterId))],
    };
  }
  return { ...state, mode: state.mode || "boardgame" };
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
    if (!state || (state.mode && state.mode !== "boardgame")) return null;
    if (!state.players?.[0]) return null;
    state.players = state.players.map((p) => ({ ...p, position: p.position || "start" }));
    return ensureCpuRival(state);
  } catch (_) {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem("minnesota-portage-v7");
    localStorage.removeItem("minnesota-portage-v6");
    localStorage.removeItem("minnesota-portage-v5");
  } catch (_) {}
}

export function getActivePlayer(state) {
  return state.players[state.activePlayer] || state.players[0];
}

export { pickRandom, CLOTHING };
