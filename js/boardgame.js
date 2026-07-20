/**
 * Minnesota Portage — turn-based board game rules.
 * Roll → pick a glowing space exactly N hops away → resolve card/challenge → next player.
 */

import { BOARD, getSpace, destinationsAtDistance, boardIndex } from "./board.js";
import { drawStoryCard } from "./quizdeck.js";
import { DIFFICULTIES, pickRandom, FOES, shuffle } from "./data.js";
import {
  createDigGame,
  digAt,
  createMemoryGame,
  flipMemory,
  unflipMismatches,
  createRiceGame,
  tickRiceGame,
  catchRicePod,
} from "./minigames.js";
import { ARCADE_META, isArcadeType } from "./arcade.js";
import { addScore, applyDamage, clamp, nextPlayer, getActivePlayer, addItem } from "./state.js";
import { QUEST } from "./quest.js";

export function rollDie(difficulty) {
  // Beginner: 1–4 (gentler board). Medium/Hard: 1–6.
  const faces = difficulty === "beginner" ? 4 : 6;
  return 1 + Math.floor(Math.random() * faces);
}

export function legalMoves(state) {
  const here = state.position;
  const roll = state.dice || 0;
  if (!here || !roll) return [];
  return [...destinationsAtDistance(here, roll).keys()];
}

export function beginBoard(state) {
  return {
    ...state,
    phase: "board",
    position: "start",
    dice: null,
    turnPhase: "roll", // roll | pick | resolve
    legal: [],
    usedQuizIds: [],
    storyStones: 0,
    encounter: {
      kind: "intro",
      title: QUEST.title,
      text: QUEST.briefing(getActivePlayer(state)?.name || "Traveler", state.companion?.name),
    },
    log: [...(state.log || []), "The board is set. Roll when ready."],
  };
}

export function dismissIntro(state) {
  return { ...state, encounter: null, turnPhase: "roll" };
}

export function doRoll(state) {
  if (state.turnPhase !== "roll" || state.encounter) return state;
  const dice = rollDie(state.difficulty);
  const legal = [...destinationsAtDistance(state.position, dice).keys()];
  // If somehow boxed in (rare), allow any neighbor as a free step.
  const fallback = legal.length ? legal : (getSpace(state.position)?.links || []);
  return {
    ...state,
    dice,
    legal: fallback,
    turnPhase: "pick",
    log: [...state.log, `Rolled a ${dice}. Choose a glowing space.`],
  };
}

export function chooseMove(state, spaceId) {
  if (state.turnPhase !== "pick") return state;
  if (!(state.legal || []).includes(spaceId)) return state;
  const space = getSpace(spaceId);
  if (!space) return state;

  let next = {
    ...state,
    position: spaceId,
    turnPhase: "resolve",
    legal: [],
    log: [...state.log, `Moved to ${space.name}.`],
  };
  return resolveLanding(next, space);
}

function resolveLanding(state, space) {
  if (space.kind === "start") return endTurn(state, "Back at the landing.");
  if (space.kind === "camp") return campEncounter(state, space);
  if (space.kind === "hazard") return hazardEncounter(state, space);
  if (space.kind === "challenge") return challengeEncounter(state, space);
  if (space.kind === "knowledge") return storyEncounter(state, space, true);
  if (space.kind === "path") {
    // Trail spaces: mostly Story Cards, sometimes a light event.
    if (Math.random() < 0.7) return storyEncounter(state, space, false);
    return pathEvent(state, space);
  }
  if (space.kind === "council") return councilEncounter(state, space);
  return endTurn(state);
}

function storyEncounter(state, space, stoneOnCorrect) {
  const { card, usedIds, reshuffled } = drawStoryCard(state.usedQuizIds || []);
  return {
    ...state,
    usedQuizIds: usedIds,
    encounter: {
      kind: "story-card",
      space,
      card,
      stoneOnCorrect,
      answered: false,
      title: `📜 Story Card · ${card.topic}`,
      reshuffled,
    },
    log: [
      ...state.log,
      reshuffled ? "Story deck reshuffled." : `Drew a Story Card (${card.topic}).`,
    ],
  };
}

function challengeEncounter(state, space) {
  const type = space.minigame || "dig";
  let game;
  if (type === "dig") {
    game = createDigGame({ attempts: state.difficulty === "hard" ? 4 : state.difficulty === "beginner" ? 6 : 5 });
  } else if (type === "memory") {
    const pairs = state.puzzleMaster ? 3 : state.difficulty === "hard" ? 6 : 4;
    game = createMemoryGame({ pairs });
  } else if (type === "rice") {
    game = createRiceGame({ goal: state.puzzleMaster ? 5 : 7, ticks: state.puzzleMaster ? 48 : 40 });
  } else if (isArcadeType(type)) {
    game = { type, arcade: true, done: false, message: ARCADE_META[type]?.blurb || "Challenge!" };
  } else {
    game = createDigGame({ attempts: 5 });
  }
  return {
    ...state,
    encounter: {
      kind: "minigame",
      space,
      stop: spaceToStop(space),
      title: `${space.icon || ""} ${space.name}`,
      game,
    },
  };
}

function spaceToStop(space) {
  return {
    id: space.id,
    name: space.name,
    icon: space.icon,
    art: space.art,
    beat: space.blurb,
    learn: space.blurb,
    minigame: space.minigame,
    type: space.kind === "challenge" ? "minigame" : space.kind,
  };
}

function campEncounter(state, space) {
  const health = clamp(state.health + 12, 0, state.maxHealth);
  const energy = clamp(state.energy + 18, 0, state.maxEnergy);
  return {
    ...state,
    health,
    energy,
    encounter: {
      kind: "camp",
      space,
      title: `🏕️ ${space.name}`,
      text: "You rest under cedar. Health and energy recover. Ready for the next roll?",
    },
    log: [...state.log, "Camp rest — feeling better."],
  };
}

function hazardEncounter(state, space) {
  const foe = pickRandom(FOES);
  return {
    ...state,
    enemiesFaced: (state.enemiesFaced || 0) + 1,
    encounter: {
      kind: "hazard",
      space,
      foe,
      title: `⚠️ Hazard · ${space.name}`,
      text: foe.line,
    },
  };
}

function pathEvent(state, space) {
  const events = [
    { text: "A friendly traveler shares maple candy.", gift: "maple-candy", score: 8 },
    { text: "You spot blueberries beside the trail.", gift: "blueberry", score: 6 },
    { text: "Calm water — you paddle with ease (+energy).", energy: 10, score: 5 },
    { text: "A heron shows the channel. +score!", score: 12 },
  ];
  const ev = pickRandom(events);
  let next = { ...state, log: [...state.log, ev.text] };
  if (ev.gift) next = addItem(next, ev.gift);
  if (ev.energy) next = { ...next, energy: clamp(next.energy + ev.energy, 0, next.maxEnergy) };
  if (ev.score) next = addScore(next, ev.score, "Trail event");
  return {
    ...next,
    encounter: {
      kind: "event",
      space,
      title: `${space.icon || "👣"} ${space.name}`,
      text: ev.text,
    },
  };
}

function councilEncounter(state, space) {
  const need = state.difficulty === "beginner" ? 4 : state.difficulty === "hard" ? 7 : 5;
  const stones = state.storyStones || 0;
  if (stones < need) {
    return {
      ...state,
      encounter: {
        kind: "council-gate",
        space,
        title: "🔥 Council of Stories",
        text: `The elders welcome you — but the Bundle still feels light. Gather at least ${need} Story Stones (you have ${stones}), then return.`,
        need,
      },
    };
  }
  return {
    ...state,
    encounter: {
      kind: "finale",
      space,
      stop: spaceToStop(space),
      title: "🔥 Council of Stories",
      text: `You arrive with ${stones} Story Stones. Open the Bundle and share what you carried.`,
    },
  };
}

export function answerStoryCard(state, choiceIndex) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "story-card" || enc.answered) return state;
  const correct = choiceIndex === enc.card.answer;
  const diff = DIFFICULTIES[state.difficulty];
  let next = {
    ...state,
    questionsTotal: (state.questionsTotal || 0) + 1,
    questionsCorrect: (state.questionsCorrect || 0) + (correct ? 1 : 0),
    encounter: { ...enc, answered: true, picked: choiceIndex, correct },
  };
  if (correct) {
    next = addScore(next, enc.stoneOnCorrect ? 25 : 15, "Story Card correct");
    if (enc.stoneOnCorrect) {
      next = {
        ...next,
        storyStones: (next.storyStones || 0) + 1,
        learned: [...(next.learned || []), enc.card.teach],
        log: [...next.log, "🪨 A Story Stone joins your Bundle!"],
      };
    } else {
      next = {
        ...next,
        learned: [...(next.learned || []), enc.card.teach],
        log: [...next.log, "Correct — knowledge carried."],
      };
    }
  } else {
    next = applyDamage(next, diff.quizWrongDamage, 4, "The Story Card stumps you — try to remember the teaching.");
    next = {
      ...next,
      learned: [...(next.learned || []), enc.card.teach],
      log: [...next.log, "Missed — but the teaching stays with you."],
    };
  }
  return next;
}

export function finishStoryCard(state) {
  if (state.encounter?.kind !== "story-card") return state;
  return endTurn({ ...state, encounter: null, encountersDone: (state.encountersDone || 0) + 1 });
}

export function finishCampOrEvent(state) {
  const k = state.encounter?.kind;
  if (k !== "camp" && k !== "event" && k !== "council-gate") return state;
  return endTurn({ ...state, encounter: null });
}

export function resolveHazard(state, choice) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "hazard") return state;
  const diff = DIFFICULTIES[state.difficulty];
  let next = state;
  if (choice === "brave") {
    // Mini math challenge
    const a = 2 + Math.floor(Math.random() * 8);
    const b = 2 + Math.floor(Math.random() * 8);
    const answer = a + b;
    const choices = shuffle([answer, answer + 1, answer - 1, answer + 2].map(String));
    return {
      ...next,
      encounter: {
        kind: "hazard-math",
        space: enc.space,
        title: "Quick math to slip past!",
        question: `What is ${a} + ${b}?`,
        choices,
        answer: choices.indexOf(String(answer)),
      },
    };
  }
  if (choice === "scare") {
    next = addScore(next, 10, "Scared off the hazard");
    next = { ...next, log: [...next.log, "You stand tall — the hazard backs away."] };
    return endTurn({ ...next, encounter: null });
  }
  // pay toll
  next = applyDamage(next, 0, Math.round(diff.foeDamage * 0.7), "You pay an energy toll and move on.");
  return endTurn({ ...next, encounter: null });
}

export function resolveHazardMath(state, choiceIndex) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "hazard-math") return state;
  const diff = DIFFICULTIES[state.difficulty];
  let next = state;
  if (choiceIndex === enc.answer) {
    next = addScore(next, 14, "Hazard math win");
    next = { ...next, log: [...next.log, "Math clears the path!"] };
  } else {
    next = applyDamage(next, diff.foeDamage, 6, "The hazard nips you — ouch.");
  }
  return endTurn({ ...next, encounter: null });
}

export function handleBoardMinigame(state, action) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  let game = enc.game;
  if (action.type === "dig") game = digAt(game, action.i);
  else if (action.type === "memory-flip") game = flipMemory(game, action.id);
  else if (action.type === "memory-unflip") game = unflipMismatches(game);
  else if (action.type === "rice-tick") game = tickRiceGame(game);
  else if (action.type === "rice-catch") game = catchRicePod(game, action.id);
  else return state;
  return { ...state, encounter: { ...enc, game } };
}

function minigameWon(game) {
  if (!game) return false;
  if (game.won) return true;
  if (game.type === "dig") return (game.found?.length || 0) >= 3;
  if (game.type === "memory") return !!game.done && (game.cards || []).every((c) => c.matched);
  if (game.type === "rice") return !!game.won;
  return false;
}

export function finishBoardMinigame(state) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  const won = minigameWon(enc.game);
  let next = {
    ...state,
    encounter: null,
    encountersDone: (state.encountersDone || 0) + 1,
  };
  if (won) {
    next = addScore(next, 20, "Challenge won");
    next = {
      ...next,
      storyStones: (next.storyStones || 0) + 1,
      log: [...next.log, "🪨 Challenge complete — Story Stone earned!"],
    };
  } else {
    next = addScore(next, 6, "Challenge attempted");
    next = { ...next, log: [...next.log, "Challenge done — the trail continues."] };
  }
  return endTurn(next);
}

export function useStoryHint(state) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "story-card" || enc.answered || state.hintsLeft <= 0) return state;
  return {
    ...state,
    hintsLeft: state.hintsLeft - 1,
    encounter: { ...enc, hintShown: true },
  };
}

export function finishBoardArcade(state, result) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  let next = {
    ...state,
    encounter: null,
    encountersDone: (state.encountersDone || 0) + 1,
  };
  if (result?.won) {
    next = addScore(next, 22, "Arcade challenge");
    next = {
      ...next,
      storyStones: (next.storyStones || 0) + 1,
      log: [...next.log, "🪨 Portage challenge won — Story Stone!"],
    };
  } else {
    next = applyDamage(next, 4, 8, "Tough challenge — catch your breath.");
  }
  return endTurn(next);
}

export function completeBoardFinale(state) {
  return {
    ...state,
    won: true,
    gameOver: true,
    encounter: {
      kind: "victory",
      title: "Council complete!",
      text: `You carried ${state.storyStones || 0} Story Stones to the Council. The Bundle is open — well traveled.`,
    },
    log: [...state.log, "Victory at the Council of Stories!"],
  };
}

function endTurn(state, note) {
  let next = { ...state, dice: null, legal: [], turnPhase: "roll" };
  if (note) next = { ...next, log: [...next.log, note] };
  if ((next.players || []).length > 1) {
    next = nextPlayer(next);
    const p = getActivePlayer(next);
    next = { ...next, log: [...next.log, `${p?.name || "Next"}'s turn — roll the die.`] };
  }
  // Soft hunger drain each turn
  const diff = DIFFICULTIES[next.difficulty];
  next = {
    ...next,
    rations: clamp((next.rations || 0) - Math.round(diff.hungerDrain * 0.35), 0, next.maxRations),
    energy: clamp(next.energy - 2, 0, next.maxEnergy),
  };
  if (next.health <= 0) {
    return { ...next, gameOver: true, won: false, encounter: { kind: "defeat", title: "Trail too hard", text: "Rest and try again — every portage teaches." } };
  }
  return next;
}

export function boardProgress(state) {
  const idx = Math.max(0, boardIndex(state.position));
  const pct = Math.round((idx / Math.max(1, BOARD.length - 1)) * 100);
  return { idx, total: BOARD.length, pct, stones: state.storyStones || 0 };
}
