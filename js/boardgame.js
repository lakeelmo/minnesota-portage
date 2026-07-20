/**
 * Minnesota Portage — race rules.
 * Die: 1 / 2 / 3 / 🎮 minigame → move (if number) → quiz to stay → next player.
 * Solo games get a CPU rival. First to Finish (after a correct quiz) wins.
 */

import {
  BOARD,
  getSpace,
  forwardDestinations,
  bestForwardMove,
  FINISH_ID,
  MINIGAME_POOL,
} from "./board.js?v=race8";
import { drawStoryCard } from "./quizdeck.js?v=race8";
import { DIFFICULTIES, pickRandom, shuffle } from "./data.js?v=race8";
import {
  createDigGame,
  digAt,
  createMemoryGame,
  flipMemory,
  unflipMismatches,
  createRiceGame,
  tickRiceGame,
  catchRicePod,
} from "./minigames.js?v=race8";
import { ARCADE_META, isArcadeType } from "./arcade.js?v=race8";
import { addScore, applyDamage, clamp, getActivePlayer } from "./state.js?v=race8";
import { QUEST } from "./quest.js?v=race8";

export const DIE_FACES = [
  { type: "move", value: 1, label: "1" },
  { type: "move", value: 2, label: "2" },
  { type: "move", value: 3, label: "3" },
  { type: "minigame", value: "minigame", label: "🎮" },
];

/** Weighted roll: ~20% each for 1/2/3, ~40% challenge so kids see minigames often. */
export function rollDie() {
  const bag = [
    DIE_FACES[0],
    DIE_FACES[1],
    DIE_FACES[2],
    DIE_FACES[3],
    DIE_FACES[3],
  ];
  return pickRandom(bag);
}

export function playerPosition(state, playerIndex = state.activePlayer) {
  return state.players[playerIndex]?.position || "start";
}

export function legalMoves(state) {
  if (state.turnPhase !== "pick" || state.diceFace?.type !== "move") return [];
  const here = playerPosition(state);
  const steps = state.diceFace.value;
  return [...forwardDestinations(here, steps).keys()];
}

export function beginBoard(state) {
  const players = state.players.map((p) => ({
    ...p,
    position: "start",
  }));
  return {
    ...state,
    players,
    phase: "board",
    diceFace: null,
    dice: null,
    turnPhase: "roll",
    legal: [],
    usedQuizIds: [],
    lastPosition: null,
    encounter: {
      kind: "intro",
      title: QUEST.title,
      text: QUEST.briefing(players[0]?.name || "Traveler"),
    },
    log: [...(state.log || []), "Race to the Council. Roll when ready."],
  };
}

export function dismissIntro(state) {
  return { ...state, encounter: null, turnPhase: "roll" };
}

export function doRoll(state) {
  if (state.turnPhase !== "roll" || state.encounter) return state;
  const face = rollDie();
  if (face.type === "minigame") {
    return {
      ...challengeEncounter(
        {
          ...state,
          diceFace: face,
          dice: face.label,
          legal: [],
          turnPhase: "resolve",
          log: [...state.log, `${getActivePlayer(state)?.name} rolled 🎮 Challenge!`],
        },
        { id: "dice-challenge", name: "Trail Challenge", icon: "🎮", blurb: "Win to keep your edge." },
        true
      ),
    };
  }

  const here = playerPosition(state);
  const legal = [...forwardDestinations(here, face.value).keys()];
  const fallback = legal.length ? legal : (getSpace(here)?.links || []).filter((id) => {
    const s = getSpace(id);
    const cur = getSpace(here);
    return s && cur && s.progress >= cur.progress;
  });

  return {
    ...state,
    diceFace: face,
    dice: face.value,
    legal: fallback,
    turnPhase: "pick",
    log: [...state.log, `${getActivePlayer(state)?.name} rolled ${face.value}. Tap a glowing space.`],
  };
}

export function chooseMove(state, spaceId) {
  if (state.turnPhase !== "pick") return state;
  if (!(state.legal || []).includes(spaceId)) return state;
  const space = getSpace(spaceId);
  if (!space) return state;

  const idx = state.activePlayer;
  const prev = state.players[idx].position;
  const players = state.players.map((p, i) =>
    i === idx ? { ...p, position: spaceId } : p
  );

  let next = {
    ...state,
    players,
    lastPosition: prev,
    turnPhase: "resolve",
    legal: [],
    log: [...state.log, `Moved to ${space.name}. Answer to stay!`],
  };
  return quizToStay(next, space);
}

/** Every landing requires a correct Story Card to remain. */
function quizToStay(state, space) {
  const { card, usedIds, reshuffled } = drawStoryCard(state.usedQuizIds || []);
  const atFinish = space.id === FINISH_ID || space.kind === "finish";
  return {
    ...state,
    usedQuizIds: usedIds,
    encounter: {
      kind: "story-card",
      space,
      card,
      answered: false,
      stayOrBounce: true,
      winOnCorrect: atFinish,
      title: atFinish ? "🔥 Finish line question!" : `📜 Stay on ${space.name}?`,
      reshuffled,
    },
    log: [
      ...state.log,
      reshuffled ? "Question deck reshuffled." : `Question for ${space.name}.`,
    ],
  };
}

function challengeEncounter(state, space, fromDice = false) {
  const type = pickRandom(MINIGAME_POOL);
  let game;
  if (type === "dig") {
    game = createDigGame({ attempts: state.difficulty === "hard" ? 4 : 6 });
  } else if (type === "memory") {
    game = createMemoryGame({ pairs: state.puzzleMaster ? 3 : 4 });
  } else if (type === "rice") {
    game = createRiceGame({ goal: state.puzzleMaster ? 5 : 7, ticks: 42 });
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
      fromDice,
      title: `${space.icon || "🎮"} ${space.name}`,
      blurb: ARCADE_META[type]?.blurb || space.blurb || "Use arrows and clicks.",
      controls: ARCADE_META[type]?.controls
        || (type === "rice" ? "Click ripe 🌾 pods · leave 🌱 alone"
          : type === "memory" ? "Click cards to match pairs"
            : type === "dig" ? "Click squares to dig"
              : "Arrow keys + click / Space"),
      game,
    },
  };
}

export function answerStoryCard(state, choiceIndex) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "story-card" || enc.answered) return state;
  const correct = choiceIndex === enc.card.answer;
  const diff = DIFFICULTIES[state.difficulty];
  const active = getActivePlayer(state);

  let next = {
    ...state,
    questionsTotal: (state.questionsTotal || 0) + 1,
    questionsCorrect: (state.questionsCorrect || 0) + (correct ? 1 : 0),
    encounter: {
      ...enc,
      answered: true,
      picked: choiceIndex,
      correct,
      cpuReveal: !!active?.isCpu,
    },
  };

  if (correct) {
    next = addScore(next, enc.winOnCorrect ? 40 : 18, "Correct");
    next = {
      ...next,
      learned: [...(next.learned || []), enc.card.teach],
      log: [...next.log, `✓ ${active?.name} stays on ${enc.space?.name}.`],
    };
    if (enc.winOnCorrect) {
      return {
        ...next,
        won: true,
        gameOver: true,
        winnerId: active?.id,
        encounter: {
          kind: "victory",
          title: `${active?.name} wins the Portage!`,
          text: `${active?.name} reached the Council and answered true. Great challenge!`,
        },
        log: [...next.log, `${active?.name} wins!`],
      };
    }
  } else {
    next = applyDamage(next, Math.round(diff.quizWrongDamage * 0.5), 3, "Wrong — sent back!");
    // Bounce to previous space
    if (enc.stayOrBounce && next.lastPosition) {
      const idx = next.activePlayer;
      const players = next.players.map((p, i) =>
        i === idx ? { ...p, position: next.lastPosition } : p
      );
      next = {
        ...next,
        players,
        log: [...next.log, `✗ ${active?.name} could not stay — back to ${getSpace(next.lastPosition)?.name || "trail"}.`],
      };
    } else {
      next = {
        ...next,
        learned: [...(next.learned || []), enc.card.teach],
        log: [...next.log, `✗ Missed — remember the teaching.`],
      };
    }
    next = {
      ...next,
      learned: [...(next.learned || []), enc.card.teach],
    };
  }
  return next;
}

export function finishStoryCard(state) {
  if (state.encounter?.kind !== "story-card") return state;
  if (state.gameOver) return state;
  return endTurn({ ...state, encounter: null, encountersDone: (state.encountersDone || 0) + 1 });
}

export function useStoryHint(state) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "story-card" || enc.answered || state.hintsLeft <= 0) return state;
  if (getActivePlayer(state)?.isCpu) return state;
  return {
    ...state,
    hintsLeft: state.hintsLeft - 1,
    encounter: { ...enc, hintShown: true },
  };
}

function minigameWon(game) {
  if (!game) return false;
  if (game.won) return true;
  if (game.type === "dig") return (game.found?.length || 0) >= 3;
  if (game.type === "memory") return !!game.done && (game.cards || []).every((c) => c.matched);
  return !!game.won;
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

export function finishBoardMinigame(state) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  const won = minigameWon(enc.game);
  let next = {
    ...state,
    encounter: null,
    encountersDone: (state.encountersDone || 0) + 1,
    diceFace: null,
    dice: null,
  };
  if (won) {
    next = addScore(next, 22, "Challenge won");
    next = { ...next, log: [...next.log, "🎮 Challenge cleared!"] };
  } else {
    next = applyDamage(next, 3, 6, "Challenge slipped by.");
    next = { ...next, log: [...next.log, "Challenge over — trail continues."] };
  }
  return endTurn(next);
}

export function finishBoardArcade(state, result) {
  const enc = state.encounter;
  if (!enc || enc.kind !== "minigame") return state;
  let next = {
    ...state,
    encounter: null,
    encountersDone: (state.encountersDone || 0) + 1,
    diceFace: null,
    dice: null,
  };
  if (result?.won) {
    next = addScore(next, 24, "Arcade win");
    next = { ...next, log: [...next.log, "🎮 Challenge cleared!"] };
  } else {
    next = applyDamage(next, 4, 8, "Tough challenge.");
  }
  return endTurn(next);
}

function endTurn(state, note) {
  let next = {
    ...state,
    diceFace: null,
    dice: null,
    legal: [],
    turnPhase: "roll",
    lastPosition: null,
  };
  if (note) next = { ...next, log: [...next.log, note] };

  const n = next.players.length;
  next = { ...next, activePlayer: (next.activePlayer + 1) % n };
  const p = getActivePlayer(next);
  next = {
    ...next,
    log: [...next.log, `${p?.name || "Next"}'s turn.`],
    energy: clamp(next.energy - 1, 0, next.maxEnergy),
  };
  return next;
}

/** CPU: roll, pick best forward space, or play through quiz/minigame with a chosen answer. */
export function cpuAct(state) {
  const p = getActivePlayer(state);
  if (!p?.isCpu || state.gameOver) return null;

  if (state.encounter?.kind === "intro") {
    return dismissIntro(state);
  }

  if (state.encounter?.kind === "story-card" && !state.encounter.answered) {
    // CPU answers correctly most of the time on beginner, less on hard
    const skill = state.difficulty === "hard" ? 0.55 : state.difficulty === "beginner" ? 0.9 : 0.75;
    const enc = state.encounter;
    let pick = enc.card.answer;
    if (Math.random() > skill) {
      const wrong = enc.card.choices.map((_, i) => i).filter((i) => i !== enc.card.answer);
      pick = pickRandom(wrong);
    }
    return answerStoryCard(state, pick);
  }

  if (state.encounter?.kind === "story-card" && state.encounter.answered) {
    return finishStoryCard(state);
  }

  if (state.encounter?.kind === "minigame") {
    // Auto-clear CPU minigames (still shown briefly in UI)
    const game = { ...state.encounter.game, done: true, won: Math.random() > 0.35 };
    return finishBoardMinigame({ ...state, encounter: { ...state.encounter, game } });
  }

  if (state.turnPhase === "roll") {
    return doRoll(state);
  }

  if (state.turnPhase === "pick") {
    const steps = state.diceFace?.value || 1;
    const here = playerPosition(state);
    const best = bestForwardMove(here, steps) || (state.legal || [])[0];
    if (!best) return endTurn(state, "No move — turn skipped.");
    return chooseMove(state, best);
  }

  return null;
}

export function boardProgress(state) {
  const pos = playerPosition(state);
  const s = getSpace(pos);
  return { progress: s?.progress || 0, max: 9, at: pos };
}

export { BOARD, getSpace, FINISH_ID, shuffle };
