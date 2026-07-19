import {
  DIFFICULTIES,
  HELPERS,
  FOES,
  QUIZ_BANK,
  AILMENTS,
  getAilment,
  getWeapon,
  pickRandom,
  shuffle,
} from "./data.js";
import { CLOTHING, getClothing } from "./characters.js";
import {
  travelCost,
  applyDamage,
  addScore,
  addItem,
  unlockClothing,
  addWeapon,
  addAnimalFriend,
  applyAilment,
  cureAilment,
  nextPlayer,
  getActivePlayer,
  clamp,
} from "./state.js";
import { companionLine, companionTip } from "./companions.js";
import { ANIMALS, getAnimal, hasBonus, lockedAnimals } from "./animals.js";
import {
  createDigGame,
  digAt,
  createMemoryGame,
  flipMemory,
  unflipMismatches,
  createRiceGame,
  catchRicePod,
} from "./minigames.js";
import { ARCADE_META, isArcadeType } from "./arcade.js";
import { QUEST } from "./quest.js";

/* ─────────────── Intro ─────────────── */

export function beginTrail(state) {
  const active = getActivePlayer(state);
  const companionName = state.companion?.name;
  return {
    ...state,
    encounter: {
      kind: "intro",
      title: QUEST.title || "The St. Croix Great Portage",
      text: state.start.blurb,
      quest: true,
      playerName: active?.name || "Explorer",
      companionName,
    },
  };
}

export function advanceFromIntro(state) {
  return arriveAtStop({ ...state, stopIndex: 0, encounter: null });
}

/* ─────────────── Arrival + random encounters ─────────────── */

export function arriveAtStop(state) {
  if (state.stopIndex < 0 || state.stopIndex >= state.stops.length) return finishVictory(state);

  const stop = state.stops[state.stopIndex];
  let next = { ...state, encounter: null, log: [...state.log, `Reached: ${stop.name}`] };

  // A foe stationed on this map node blocks the way first (existing foe system).
  if (stop.type !== "finale" && (state.foeNodes || []).includes(stop.id)) {
    return makeFoeEncounter(next);
  }

  // Optional roadside helper / campfire trivia (never on the finale).
  const helperBoost = state.animalFriendPower ? 0.12 : 0;
  const roll = Math.random();
  if (stop.type !== "finale" && roll < 0.22 + helperBoost) return makeHelperEncounter(next);
  if (stop.type !== "finale" && roll < 0.34 + helperBoost) return makeTriviaEncounter(next);

  return makeStopEncounter(next);
}

function makeHelperEncounter(state) {
  const helper = pickRandom(HELPERS);
  return {
    ...state,
    encounter: { kind: "helper", helper, title: `${helper.name} appears!`, text: helper.line },
  };
}

function makeFoeEncounter(state) {
  const foe = pickRandom(FOES);
  return {
    ...state,
    enemiesFaced: state.enemiesFaced + 1,
    encounter: { kind: "foe", foe, title: `${foe.name} blocks the path!`, text: foe.line },
  };
}

function makeTriviaEncounter(state) {
  return {
    ...state,
    encounter: { kind: "trivia", title: "Campfire Trivia!", trivia: pickRandom(QUIZ_BANK), answered: false },
  };
}

/* ─────────────── Helper resolution ─────────────── */

export function resolveHelper(state) {
  const helper = state.encounter.helper;
  let next = addItem(state, helper.gift);
  next = addScore(next, 10, `${helper.name} helped the party.`);
  if (helper.weaponGift) next = addWeapon(next, helper.weaponGift);
  if (Math.random() < 0.4) {
    const locked = CLOTHING.filter((c) => !next.clothingOwned.includes(c.id));
    if (locked.length) next = unlockClothing(next, pickRandom(locked).id);
  }
  next = maybeUnlockAnimal(next, 0.25);
  next = { ...next, encounter: null };
  return maybeRetriggerStop(next);
}

/* ─────────────── Foe resolution (pay / scare / math) ─────────────── */

export function resolveFoe(state, choice) {
  const diff = DIFFICULTIES[state.difficulty];
  const foe = state.encounter.foe;
  let next = { ...state, encounter: null };

  if (choice === "brave") {
    return {
      ...next,
      encounter: { kind: "foe-math", foe, title: "Quick trail math!", ...makeMathChallenge(state) },
    };
  }

  if (choice === "scare") {
    const w = getWeapon(state.equippedWeapon);
    let chance = w ? w.scare : 0.25;
    if (hasBonus(state, "foe-dodge")) chance += 0.15;
    if (state.strongArms) chance += 0.1;
    if (Math.random() < chance) {
      next = addScore(next, 15, `${getActivePlayer(next).name} waved the ${w?.emoji || "gear"} ${w?.name || "weapon"} — the ${foe.name} scampered off!`);
      return maybeRetriggerStop(next);
    }
    next = applyDamage(next, Math.floor(diff.foeDamage / 2), 4, `The scare didn't work — the ${foe.name} got a little jab in.`);
    if (next.gameOver) return next;
    return maybeRetriggerStop(next);
  }

  // Pay toll — animal friend can dodge entirely
  if (hasBonus(state, "foe-dodge") && Math.random() < 0.35) {
    next = addScore(next, 5, `${getAnimal(state.animalFriends.find((id) => getAnimal(id)?.bonus === "foe-dodge"))?.emoji || "🐺"} darted in — you dodged the toll!`);
    return maybeRetriggerStop(next);
  }

  if (foe.effect === "health") {
    next = applyDamage(next, diff.foeDamage, 0, `The ${foe.name} nipped your health.`);
  } else if (foe.effect === "energy") {
    next = applyDamage(next, 0, diff.foeDamage, `The ${foe.name} drained your energy.`);
  } else {
    next = applyDamage(next, Math.floor(diff.foeDamage / 2), Math.floor(diff.foeDamage / 2), `The ${foe.name} slowed everyone down.`);
  }
  if (foe.ailment && Math.random() < 0.4) next = applyAilment(next, foe.ailment);
  if (next.gameOver) return next;
  return maybeRetriggerStop(next);
}

function makeMathChallenge(state) {
  const hard = state.difficulty === "hard";
  const a = hard ? 6 + Math.floor(Math.random() * 8) : 2 + Math.floor(Math.random() * 6);
  const b = hard ? 3 + Math.floor(Math.random() * 7) : 2 + Math.floor(Math.random() * 5);
  const op = Math.random() > 0.4 ? "+" : "×";
  const answer = op === "+" ? a + b : a * b;
  const wrongs = shuffle([answer + 1, answer - 1, answer + 2, answer + (op === "×" ? a : 3)])
    .filter((n) => n !== answer && n > 0);
  const choices = shuffle([answer, ...wrongs.slice(0, 3)]);
  return { question: `What is ${a} ${op} ${b}?`, choices: choices.map(String), answer: choices.indexOf(answer) };
}

export function resolveFoeMath(state, choiceIndex) {
  const diff = DIFFICULTIES[state.difficulty];
  const enc = state.encounter;
  let next = { ...state, encounter: null };

  if (choiceIndex === enc.answer) {
    next = addScore(next, 20, "Math dodge success! The foe flees.");
    next = { ...next, energy: clamp(next.energy + 5, 0, next.maxEnergy) };
  } else {
    next = applyDamage(next, diff.foeDamage, Math.floor(diff.foeDamage / 2), "Wrong answer — the foe gets a hit in!");
  }
  if (next.gameOver) return next;
  return maybeRetriggerStop(next);
}

/* ─────────────── Campfire trivia ─────────────── */

export function answerTrivia(state, i) {
  const t = state.encounter.trivia;
  const correct = i === t.a;
  let next = { ...state, encounter: { ...state.encounter, answered: true, picked: i, correct } };
  if (correct) next = addScore(next, 20, "Campfire trivia — correct!");
  else next = { ...next, log: [...next.log, "Campfire trivia — not quite, but you learned something!"] };
  return next;
}

export function continueAfterTrivia(state) {
  return makeStopEncounter({ ...state, encounter: null });
}

/* ─────────────── Stop encounters ─────────────── */

function makeStopEncounter(state) {
  const stop = state.stops[state.stopIndex];
  if (!stop) return finishVictory(state);

  // Reaching the stop's own content means any foe guarding it has been dealt with.
  if (stop && (state.foeNodes || []).includes(stop.id)) {
    state = { ...state, foeNodes: state.foeNodes.filter((id) => id !== stop.id) };
  }

  if (stop.type === "quiz") {
    // fresh quiz — reset companion free tip
    const companion = state.companion ? { ...state.companion, tipUsedThisQuiz: false } : null;
    return {
      ...state,
      companion,
      encounter: { kind: "quiz", stop, title: stop.name, answered: false, hintUsed: false, eliminated: [], tip: "" },
    };
  }
  if (stop.type === "minigame") return startMinigame(state, stop);
  if (stop.type === "finale") return { ...state, encounter: { kind: "finale", stop, title: stop.name } };
  return finishVictory(state);
}

// After a random encounter resolves, show the actual stop content.
function maybeRetriggerStop(state) {
  if (state.gameOver) return state;
  return makeStopEncounter(state);
}

function startMinigame(state, stop) {
  const diff = DIFFICULTIES[state.difficulty];
  let game;
  if (isArcadeType(stop.minigame)) {
    const meta = ARCADE_META[stop.minigame];
    game = { type: stop.minigame, arcade: true, done: false, message: `${meta.blurb} Use the keys below!` };
  } else if (stop.minigame === "dig") {
    const attempts = diff.digAttempts + (state.strongArms ? 2 : 0);
    game = createDigGame({ attempts, artifactCount: state.puzzleMaster ? 3 : 4 });
  } else if (stop.minigame === "memory") {
    const pairs = Math.max(3, diff.memoryPairs - (state.puzzleMaster ? 1 : 0));
    game = createMemoryGame({ pairs });
  } else {
    game = createRiceGame({ goal: state.puzzleMaster ? 5 : 6 });
  }
  return { ...state, encounter: { kind: "minigame", stop, title: stop.name, game } };
}

/* ─────────────── Quiz + companion help ─────────────── */

export function answerQuiz(state, choiceIndex) {
  const enc = state.encounter;
  const stop = enc.stop;
  const diff = DIFFICULTIES[state.difficulty];
  const correct = choiceIndex === stop.answer;
  const playerName = getActivePlayer(state).name;
  let next = {
    ...state,
    questionsTotal: state.questionsTotal + 1,
    encounter: {
      ...enc,
      answered: true,
      picked: choiceIndex,
      correct,
      companionReact: companionLine(state.companion, correct ? "correct" : "wrong", playerName),
    },
  };

  if (correct) {
    next = {
      ...next,
      questionsCorrect: next.questionsCorrect + 1,
      learned: next.learned.includes(stop.learn) ? next.learned : [...next.learned, stop.learn],
    };
    next = addScore(next, 30, "Correct!");
    next = { ...next, energy: clamp(next.energy + 8, 0, next.maxEnergy) };
  } else {
    next = applyDamage(next, diff.quizWrongDamage, 4, "Not quite — take a breath and learn.");
    if (!next.learned.includes(stop.learn)) next = { ...next, learned: [...next.learned, stop.learn] };
  }
  return next;
}

export function useQuizHint(state) {
  if (state.hintsLeft <= 0 || state.encounter.hintUsed) return state;
  return { ...state, hintsLeft: state.hintsLeft - 1, encounter: { ...state.encounter, hintUsed: true } };
}

export function useCompanionHelp(state) {
  const c = state.companion;
  const enc = state.encounter;
  if (!c || c.helpsLeft <= 0 || enc.kind !== "quiz" || enc.answered) return state;
  const stop = enc.stop;
  const wrongIdx = stop.choices.map((_, i) => i).filter((i) => i !== stop.answer && !(enc.eliminated || []).includes(i));
  const elim = shuffle(wrongIdx).slice(0, 2);
  return {
    ...state,
    companion: { ...c, helpsLeft: c.helpsLeft - 1 },
    encounter: { ...enc, eliminated: [...(enc.eliminated || []), ...elim], helpNote: `${c.name} crosses out two wrong answers!` },
  };
}

export function useCompanionTip(state) {
  const c = state.companion;
  const enc = state.encounter;
  if (!c || c.tipUsedThisQuiz || enc.kind !== "quiz" || enc.answered) return state;
  return {
    ...state,
    companion: { ...c, tipUsedThisQuiz: true },
    encounter: { ...enc, tip: companionTip(c, enc.stop) },
  };
}

function earnStoryStone(state, reason = "You earned a Story Stone!") {
  if (state._stoneThisStop) return state;
  return {
    ...state,
    storyStones: (state.storyStones || 0) + 1,
    _stoneThisStop: true,
    log: [...state.log, `🪨 ${reason}`],
    score: state.score + 12,
  };
}

export function continueAfterQuiz(state) {
  let next = earnStoryStone(state, "A Story Stone joins your Bundle!");
  return completeStop({ ...next, encountersDone: next.encountersDone + 1 });
}

/* ─────────────── Minigames ─────────────── */

export function handleMinigameAction(state, action) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  let game = enc.game;
  if (action.type === "dig") game = digAt(game, action.index);
  else if (action.type === "memory-flip") game = flipMemory(game, action.cardId);
  else if (action.type === "memory-unflip") game = unflipMismatches(game);
  else if (action.type === "rice-catch") game = catchRicePod(game, action.podId);
  return { ...state, encounter: { ...enc, game } };
}

export function finishMinigame(state) {
  const game = state.encounter.game;
  const stop = state.encounter.stop;
  let next = {
    ...state,
    encounter: null,
    encountersDone: state.encountersDone + 1,
    learned: state.learned.includes(stop.learn) ? state.learned : [...state.learned, stop.learn],
  };

  if (game.type === "dig") {
    const points = game.found.reduce((s, a) => s + a.points, 0);
    next = addScore(next, points + (game.found.length ? 15 : 0), `Dig finds: ${game.found.length}`);
    next = { ...next, artifacts: [...next.artifacts, ...game.found], energy: clamp(next.energy + game.found.length * 4, 0, next.maxEnergy) };
    if (game.found.length >= 2) next = unlockClothing(next, "dig-boots");
  } else if (game.type === "memory") {
    const bonus = Math.max(10, 60 - game.moves * 3);
    next = addScore(next, bonus, `Memory solved in ${game.moves} moves`);
    next = unlockClothing(next, "maple-scarf");
  } else if (game.type === "rice") {
    const points = game.caught * 5 + (game.won ? 20 : 0);
    next = addScore(next, points, `Gathered ${game.caught} manoomin pods`);
    if (game.caught > 0) next = addItem(next, "wild-rice-cakes");
    if (game.won) next = unlockClothing(next, "ricing-hat");
  }
  next = maybeUnlockAnimal(next, 0.3);
  next = earnStoryStone(next, "A Story Stone joins your Bundle!");
  return completeStop(next);
}

/** Apply results from an Oregon Trail–style arcade minigame. */
export function finishArcade(state, result) {
  const stop = state.encounter.stop;
  let next = {
    ...state,
    encounter: null,
    encountersDone: state.encountersDone + 1,
    learned: state.learned.includes(stop.learn) ? state.learned : [...state.learned, stop.learn],
  };

  next = addScore(next, Math.max(0, result.score || 0), `${ARCADE_META[result.type]?.title || "Minigame"} finished`);
  if (result.food) next = addItem(next, result.food);
  else if (!result.won) next = { ...next, log: [...next.log, "No food this time — the portage can be lean. Check your snacks!"] };
  if (result.energyBonus) next = { ...next, energy: clamp(next.energy + result.energyBonus, 0, next.maxEnergy) };

  // Weapon rewards on a winning run
  if (result.won && stop.weaponReward) next = addWeapon(next, stop.weaponReward);
  if (result.won && result.type === "portage") next = unlockClothing(next, "voyager-hat");
  if (result.won && result.type === "rapids") next = unlockClothing(next, "lake-vest");
  if (result.won && result.type === "trap") next = unlockClothing(next, "fur-hat");
  if (result.won && result.type === "hunt") next = unlockClothing(next, "rain-cape");

  next = maybeUnlockAnimal(next, 0.3);
  next = earnStoryStone(next, "A Story Stone joins your Bundle!");
  return completeStop(next);
}

function maybeUnlockAnimal(state, baseChance) {
  const locked = lockedAnimals(state);
  if (!locked.length) return state;
  const chance = baseChance + (state.animalFriendPower ? 0.2 : 0);
  if (Math.random() < chance) return addAnimalFriend(state, pickRandom(locked).id);
  return state;
}

/* ─────────────── Map graph travel ─────────────── */

/** Can the party paddle from the current node to `targetIndex` right now? */
export function canTravelTo(state, targetIndex) {
  if (!state || state.gameOver || state.encounter) return false; // no travel with a modal open
  const cur = state.stops[state.stopIndex];
  const target = state.stops[targetIndex];
  if (!cur || !target || targetIndex === state.stopIndex) return false;
  if ((state.visited || []).includes(target.id)) return false;
  return (cur.links || []).includes(target.id);
}

/** Reachable (adjacent + unvisited) node indices from the current node. */
export function reachableStops(state) {
  const cur = state.stops[state.stopIndex];
  if (!cur) return [];
  return (cur.links || [])
    .map((id) => state.stops.findIndex((s) => s.id === id))
    .filter((i) => i >= 0 && !(state.visited || []).includes(state.stops[i].id));
}

/** Travel/hunger/sickness costs applied while paddling between nodes. */
function applyTravelCosts(state) {
  const diff = DIFFICULTIES[state.difficulty];
  const cost = travelCost(state);
  let next = applyDamage(state, 0, cost, `Paddled onward (−${cost} energy).`);

  // Hunger drains rations; empty rations hurt.
  const rations = clamp(next.rations - diff.hungerDrain, 0, next.maxRations);
  next = { ...next, rations };
  if (rations <= 0) {
    next = applyDamage(next, 8, 0, "Empty stomachs! Health dips — find food soon.");
    if (Math.random() < 0.5 + diff.foodFailBoost) next = applyAilment(next, "tummy-ache", "Hunger brought on a tummy ache.");
  }

  // Active ailments sap strength while traveling.
  for (const ail of next.ailments) {
    const a = getAilment(ail.id);
    if (a && (a.drainHealth || a.drainEnergy)) {
      next = applyDamage(next, a.drainHealth, a.drainEnergy, `${a.emoji} ${a.name} saps a little strength.`);
      if (next.gameOver) return next;
    }
  }

  // Chance to catch something new on the trail.
  if (!next.gameOver && Math.random() < diff.sickChance) {
    const pool = AILMENTS.filter((a) => !next.ailments.some((x) => x.id === a.id));
    if (pool.length) next = applyAilment(next, pickRandom(pool).id);
  }

  if (next.energy <= 0 && next.health > 0) next = applyDamage(next, 8, 0, "Exhausted… health dips. Eat or rest at camp!");
  return next;
}

/** Player tapped an adjacent node on the map. Pay travel costs and arrive. */
export function mapTravel(state, targetIndex) {
  if (!canTravelTo(state, targetIndex)) return state;
  let next = applyTravelCosts(state);
  if (next.gameOver) return next;
  next = nextPlayer(next);
  next = { ...next, stopIndex: targetIndex, _stoneThisStop: false };
  return arriveAtStop(next);
}

/** Finished a stop's content — mark it visited and return to the map (no auto-advance). */
function completeStop(state) {
  const stop = state.stops[state.stopIndex];
  const visited = stop && !(state.visited || []).includes(stop.id)
    ? [...(state.visited || []), stop.id]
    : state.visited || [];
  return { ...state, encounter: null, visited, _stoneThisStop: false };
}

/* ─────────────── Camp: rest + medicine ─────────────── */

export function restAtCamp(state) {
  if (state.gameOver) return state;
  const heal = hasBonus(state, "heal-camp") ? 12 : 6;
  let next = {
    ...state,
    energy: clamp(state.energy + 30, 0, state.maxEnergy),
    health: clamp(state.health + heal, 0, state.maxHealth),
    rations: clamp(state.rations - 6, 0, state.maxRations),
    restsUsed: (state.restsUsed || 0) + 1,
    log: [...state.log, `${getActivePlayer(state).name} made camp — energy and spirits restored.`],
  };
  next = cureAilment(next, "tired-legs", "A good rest cured Tired Legs.");
  // A rest has a chance to shake off one more ailment.
  if (next.ailments.length && Math.random() < 0.6) {
    next = cureAilment(next, pickRandom(next.ailments).id, "Rest and warmth chased away an ailment.");
  }
  return next;
}

export function useMedicine(state, index) {
  const item = state.inventory[index];
  if (!item || item.type !== "medicine") return state;
  let next = { ...state, inventory: state.inventory.filter((_, i) => i !== index) };
  let targetId = null;
  if (next.ailments.length) {
    if (item.cures !== "any" && next.ailments.some((a) => a.id === item.cures)) targetId = item.cures;
    else targetId = next.ailments[0].id;
  }
  if (targetId) next = cureAilment(next, targetId);
  next = {
    ...next,
    health: clamp(next.health + (item.health || 0), 0, next.maxHealth),
    log: [...next.log, `${getActivePlayer(next).name} used ${item.emoji} ${item.name}.`],
  };
  return next;
}

export function tryEat(state, index) {
  const item = state.inventory[index];
  if (!item) return state;
  if (item.type === "medicine") return useMedicine(state, index);
  const inventory = state.inventory.filter((_, i) => i !== index);
  let next = {
    ...state,
    inventory,
    energy: clamp(state.energy + (item.energy || 0), 0, state.maxEnergy),
    health: clamp(state.health + (item.health || 0), 0, state.maxHealth),
    rations: clamp(state.rations + (item.food || 0), 0, state.maxRations),
    log: [...state.log, `${getActivePlayer(state).name} ate ${item.emoji} ${item.name}`],
  };
  if ((item.food || 0) >= 20) {
    if (next.ailments.some((a) => a.id === "tummy-ache")) next = cureAilment(next, "tummy-ache", "A good meal settled the tummy ache!");
    else if (next.ailments.some((a) => a.id === "tired-legs")) next = cureAilment(next, "tired-legs", "Food gave tired legs new pep!");
  }
  return next;
}

/* ─────────────── Finale + victory tiers ─────────────── */

export function completeFinale(state) {
  let next = addScore(state, 50 + (state.storyStones || 0) * 8, "Opened the Story Bundle at the Council!");
  next = { ...next, encounter: null };
  return finishVictory(next);
}

function computeBadges(state, accuracy) {
  const badges = [];
  if (accuracy >= 100 && state.questionsTotal >= 3) badges.push({ emoji: "🎯", label: "Perfect Quizzer" });
  else if (accuracy >= 80) badges.push({ emoji: "📚", label: "Sharp Historian" });
  if ((state.storyStones || 0) >= 10) badges.push({ emoji: "🪨", label: "Story Carrier" });
  if (state.artifacts.length >= 3) badges.push({ emoji: "🏺", label: "Careful Digging" });
  if ((state.animalFriends?.length || 0) >= 2) badges.push({ emoji: "🐾", label: "Animal Friend" });
  if (state.health / state.maxHealth >= 0.7) badges.push({ emoji: "💚", label: "Strong Finish" });
  if ((state.weaponsOwned?.length || 0) >= 4) badges.push({ emoji: "🗡️", label: "Trail Provider" });
  if ((state.clothingOwned?.length || 0) >= 6) badges.push({ emoji: "🧣", label: "Portage Style" });
  if (!badges.length) badges.push({ emoji: "🛶", label: "Portage Finisher" });
  return badges;
}

function finishVictory(state) {
  const accuracy = state.questionsTotal > 0 ? Math.round((state.questionsCorrect / state.questionsTotal) * 100) : 100;
  const bonus = accuracy * 2 + state.artifacts.length * 10 + state.players.length * 5 + (state.animalFriends?.length || 0) * 15 + (state.storyStones || 0) * 5;
  const score = state.score + bonus;
  const healthPct = state.maxHealth ? state.health / state.maxHealth : 0;
  const party = accuracy >= 70 && score >= 320 && healthPct > 0.25;
  return {
    ...state,
    score,
    won: true,
    gameOver: true,
    encounter: {
      kind: "victory",
      title: party ? "Portage Party!" : "Portage Complete!",
      accuracy,
      party,
      badges: computeBadges({ ...state, score }, accuracy),
    },
  };
}
