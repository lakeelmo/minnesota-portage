import {
  createEmptySetup,
  createPlayerDraft,
  startRun,
  saveRun,
  loadRun,
  clearSave,
  getActivePlayer,
  ensureCpuRival,
} from "./state.js?v=race14";
import { CHARACTERS } from "./characters.js?v=race14";
import { PRACTICE_GAMES } from "./board.js?v=race14";
import {
  beginBoard,
  dismissIntro,
  doRoll,
  chooseMove,
  answerStoryCard,
  finishStoryCard,
  handleBoardMinigame,
  finishBoardMinigame,
  finishBoardArcade,
  useStoryHint,
  cpuAct,
} from "./boardgame.js?v=race14";
import {
  createDigGame,
  createMemoryGame,
  createRiceGame,
  digAt,
  flipMemory,
  unflipMismatches,
  tickRiceGame,
  catchRicePod,
} from "./minigames.js?v=race14";
import {
  renderTitle,
  renderPartySetup,
  renderCharacterCreator,
  renderTrail,
  renderGameOver,
  renderPracticeHub,
  renderPracticePlay,
  renderMinigameBoard,
  showToast,
  syncTrail,
  syncMinigameOnly,
} from "./ui.js?v=race14";
import { mountArcade, isArcadeType, ARCADE_META } from "./arcade.js?v=race14";

const app = document.getElementById("app");

let screen = "title";
let setup = createEmptySetup();
let draft = createPlayerDraft(0);
let run = null;
let memoryTimer = null;
let riceTimer = null;
let cpuTimer = null;
let arcadeSession = null;
let hasSave = !!loadRun();
let practiceId = null;
let practiceGame = null;

// Drop legacy saves that can revive the old trail / missing CPU
try {
  localStorage.removeItem("minnesota-portage-v7");
  localStorage.removeItem("minnesota-portage-v6");
  localStorage.removeItem("minnesota-portage-v5");
} catch (_) {}

const POWER_CYCLE = ["time-echo", "strong-arms", "speedy-feet", "animal-friend", "puzzle-master", "warm-heart"];

function clearTimers() {
  if (memoryTimer) { clearTimeout(memoryTimer); memoryTimer = null; }
  if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
  if (cpuTimer) { clearTimeout(cpuTimer); cpuTimer = null; }
}
function destroyArcade() {
  if (arcadeSession) { arcadeSession.destroy(); arcadeSession = null; }
}
function mount(node) { app.innerHTML = ""; app.appendChild(node); }
function arcadePlaying() { return Boolean(arcadeSession); }

function practiceMeta(id) {
  const catalog = PRACTICE_GAMES.find((g) => g.id === id);
  const arcade = ARCADE_META[id];
  return {
    id,
    title: catalog?.title || arcade?.title || id,
    blurb: catalog?.blurb || arcade?.blurb || "",
    controls: arcade?.controls || (id === "memory" ? "Tap two cards" : id === "rice" ? "Tap ripe 🌾" : id === "dig" ? "Tap squares" : "Tap to play"),
    kind: catalog?.kind || (isArcadeType(id) ? "arcade" : "grid"),
  };
}

function makePracticeGame(id) {
  if (id === "dig") return createDigGame({ attempts: 6 });
  if (id === "memory") return createMemoryGame({ pairs: 6 });
  if (id === "rice") return createRiceGame({ goal: 6, ticks: 40 });
  return null;
}

function applyPracticeAction(game, action) {
  if (!game) return game;
  if (action.type === "dig") return digAt(game, action.i);
  if (action.type === "memory-flip") return flipMemory(game, action.id);
  if (action.type === "memory-unflip") return unflipMismatches(game);
  if (action.type === "rice-tick") return tickRiceGame(game);
  if (action.type === "rice-catch") return catchRicePod(game, action.id);
  return game;
}

function openPractice(id) {
  destroyArcade();
  clearTimers();
  practiceId = id;
  practiceGame = isArcadeType(id) ? { type: id, arcade: true, done: false } : makePracticeGame(id);
  screen = "practice-play";
  paint({ remount: true });
}

function scheduleCpu() {
  if (cpuTimer) clearTimeout(cpuTimer);
  cpuTimer = null;
  if (!run || run.gameOver || screen !== "trail") return;
  const p = getActivePlayer(run);
  if (!p?.isCpu) return;
  if (arcadePlaying()) return;

  const enc = run.encounter;
  const g = enc?.game;
  let delay = 900;
  if (enc?.kind === "story-card" && !enc.answered && enc.cpuFocus == null) delay = 2000;
  if (enc?.kind === "story-card" && !enc.answered && enc.cpuFocus != null) delay = 1400;
  if (enc?.kind === "story-card" && enc.answered) delay = 1800;
  if (enc?.kind === "minigame" && g?.type === "memory" && (g.flipped || []).length === 2) delay = 900;
  else if (enc?.kind === "minigame" && g?.type === "memory") delay = 700;
  else if (enc?.kind === "minigame" && g?.type === "dig") delay = 650;
  else if (enc?.kind === "minigame" && g?.type === "rice") delay = 500;
  else if (enc?.kind === "minigame" && g?.done) delay = 1600;
  else if (enc?.kind === "minigame") delay = 800;
  if (run.turnPhase === "pick") delay = 900;
  if (run.turnPhase === "roll" && !run.encounter) delay = 800;

  cpuTimer = setTimeout(() => {
    cpuTimer = null;
    if (!run || getActivePlayer(run)?.id !== p.id) return;
    if (arcadePlaying()) return;
    const next = cpuAct(run);
    if (next) {
      if (next.diceFace?.type === "move") showToast(`CPU rolled ${next.diceFace.label}`);
      if (next.diceFace?.type === "minigame") showToast("CPU rolled 🎮 — watch their challenge");
      if (next.encounter?.kind === "story-card" && next.encounter.cpuFocus != null && run.encounter?.cpuFocus == null) {
        showToast("CPU is choosing an answer…");
      }
      update(next);
    } else if (run.encounter?.kind === "minigame" && run.encounter.game && !isArcadeType(run.encounter.game.type) && !run.encounter.game.done) {
      scheduleCpu();
    }
  }, delay);
}

function trailHandlers() {
  return {
    introGo: () => update(dismissIntro(run)),
    roll: () => {
      if (getActivePlayer(run)?.isCpu) return;
      const next = doRoll(run);
      if (next.diceFace?.type === "move") showToast(`Rolled ${next.diceFace.label} — tap GO`);
      if (next.diceFace?.type === "minigame") showToast("🎮 Challenge!");
      update(next);
    },
    move: (id) => {
      if (getActivePlayer(run)?.isCpu) return;
      update(chooseMove(run, id));
    },
    storyAnswer: (i) => {
      if (getActivePlayer(run)?.isCpu) return;
      update(answerStoryCard(run, i));
    },
    storyHint: () => { update(useStoryHint(run)); showToast("Hint revealed…"); },
    storyNext: () => {
      if (getActivePlayer(run)?.isCpu) return;
      update(finishStoryCard(run));
    },
    mg: (action) => {
      if (getActivePlayer(run)?.isCpu) return;
      const next = handleBoardMinigame(run, action);
      const g = next.encounter?.game;
      if (g?.type === "memory" && g.flipped?.length === 2 && !g.done) {
        const [a, b] = g.flipped.map((id) => g.cards.find((c) => c.id === id));
        if (a && b && a.pair !== b.pair) {
          update(next);
          memoryTimer = setTimeout(() => update(handleBoardMinigame(run, { type: "memory-unflip" })), 650);
          return;
        }
      }
      update(next);
    },
    minigameDone: () => update(finishBoardMinigame(run)),
    exit: () => {
      destroyArcade();
      clearTimers();
      saveRun(run);
      hasSave = true;
      screen = "title";
      showToast("Progress saved.");
      paint({ remount: true });
    },
    again: () => { destroyArcade(); clearTimers(); clearSave(); hasSave = false; screen = "party"; paint({ remount: true }); },
    home: () => { destroyArcade(); clearTimers(); clearSave(); hasSave = false; screen = "title"; paint({ remount: true }); },
  };
}

function practiceHandlers() {
  return {
    back: () => {
      destroyArcade();
      clearTimers();
      practiceId = null;
      practiceGame = null;
      screen = "practice";
      paint({ remount: true });
    },
    replay: () => {
      if (!practiceId) return;
      openPractice(practiceId);
    },
    mg: (action) => {
      if (!practiceGame || practiceGame.arcade) return;
      const next = applyPracticeAction(practiceGame, action);
      if (next?.type === "memory" && next.flipped?.length === 2 && !next.done) {
        const [a, b] = next.flipped.map((id) => next.cards.find((c) => c.id === id));
        if (a && b && a.pair !== b.pair) {
          practiceGame = next;
          paintPracticeBoard();
          memoryTimer = setTimeout(() => {
            practiceGame = applyPracticeAction(practiceGame, { type: "memory-unflip" });
            paintPracticeBoard();
          }, 650);
          return;
        }
      }
      practiceGame = next;
      if (practiceGame?.done) {
        clearTimers();
        showToast(practiceGame.won === false ? "Try again!" : "Nice work!");
        paint({ remount: true });
        return;
      }
      paintPracticeBoard();
    },
  };
}

function paintPracticeBoard() {
  const board = app.querySelector(".practice-play [data-mg]");
  if (!board || !practiceGame || practiceGame.arcade) return;
  renderMinigameBoard(board, practiceGame, practiceHandlers(), null);
  const replay = app.querySelector(".practice-play [data-action=replay]");
  if (replay) replay.disabled = !practiceGame.done;
  let footer = app.querySelector(".practice-play .practice-done");
  if (practiceGame.done && !footer) {
    paint({ remount: true });
  }
}

function paintPracticePlay() {
  const meta = practiceMeta(practiceId);
  const arcade = meta.kind === "arcade";
  destroyArcade();
  clearTimers();
  mount(renderPracticePlay({ meta, game: practiceGame, arcade }, practiceHandlers()));
  const board = app.querySelector("[data-mg]");
  if (!board) return;

  if (arcade) {
    if (practiceGame?.done) return;
    showToast("Tap to play — practice mode");
    arcadeSession = mountArcade(
      board,
      practiceId,
      { difficulty: setup.difficulty || "medium", puzzleMaster: false, weapon: "wooden-spear", strongArms: false, autoPlay: false },
      (result) => {
        destroyArcade();
        showToast(result.won ? "Challenge cleared!" : "Challenge over — try again");
        practiceGame = { type: practiceId, arcade: true, done: true, won: !!result.won };
        paint({ remount: true });
      }
    );
    return;
  }

  renderMinigameBoard(board, practiceGame, practiceHandlers(), null);
  if (practiceGame?.type === "rice" && !practiceGame.done) {
    riceTimer = setInterval(() => {
      if (!practiceGame || practiceGame.type !== "rice") {
        if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
        return;
      }
      if (practiceGame.done) {
        if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
        paint({ remount: true });
        return;
      }
      practiceGame = applyPracticeAction(practiceGame, { type: "rice-tick" });
      paintPracticeBoard();
      if (practiceGame.done) {
        if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
        showToast(practiceGame.won ? "Bundle full!" : "Harvest over");
        paint({ remount: true });
      }
    }, 700);
  }
}

function paintTrail() {
  if (!run) { screen = "title"; paint({ remount: true }); return; }

  if (run.gameOver && run.encounter?.kind !== "victory") {
    clearSave();
    hasSave = false;
    destroyArcade();
    clearTimers();
    mount(renderGameOver(run, {
      again: () => { screen = "party"; paint({ remount: true }); },
      home: () => { screen = "title"; paint({ remount: true }); },
    }));
    return;
  }

  const handlers = trailHandlers();
  const existing = app.querySelector(".board-screen");
  if (existing && syncTrail(existing, run, handlers)) {
    maybeStartArcade();
    maybeStartRiceMole();
    scheduleCpu();
    return;
  }

  clearTimers();
  destroyArcade();
  mount(renderTrail(run, handlers));
  maybeStartArcade();
  maybeStartRiceMole();
  scheduleCpu();
}

function paint() {
  if (arcadePlaying() && (screen === "trail" || screen === "practice-play")) return;

  if (screen === "title") {
    destroyArcade();
    clearTimers();
    practiceId = null;
    practiceGame = null;
    mount(renderTitle(
      () => {
        setup = createEmptySetup();
        draft = createPlayerDraft(0);
        clearSave();
        hasSave = false;
        screen = "party";
        paint({ remount: true });
      },
      () => {
        const saved = ensureCpuRival(loadRun());
        if (saved) {
          run = saved;
          saveRun(run);
          screen = "trail";
          paint({ remount: true });
          const cpu = run.players.find((p) => p.isCpu);
          showToast(cpu ? `Welcome back — racing ${cpu.name}` : "Welcome back!");
        }
      },
      hasSave,
      () => {
        screen = "practice";
        paint({ remount: true });
      }
    ));
    return;
  }

  if (screen === "practice") {
    destroyArcade();
    clearTimers();
    practiceId = null;
    practiceGame = null;
    mount(renderPracticeHub(PRACTICE_GAMES, {
      pick: (id) => openPractice(id),
      back: () => { screen = "title"; paint({ remount: true }); },
    }));
    return;
  }

  if (screen === "practice-play") {
    paintPracticePlay();
    return;
  }

  if (screen === "party") {
    destroyArcade();
    clearTimers();
    mount(renderPartySetup(setup, {
      setCount: (n) => { setup = { ...setup, playerCount: n }; paint({ remount: true }); },
      setDifficulty: (id) => { setup = { ...setup, difficulty: id }; paint({ remount: true }); },
      back: () => { screen = "title"; paint({ remount: true }); },
      next: () => {
        setup = { ...setup, players: [], draftingIndex: 0 };
        draft = createPlayerDraft(0);
        screen = "create";
        paint({ remount: true });
      },
    }));
    return;
  }

  if (screen === "create") {
    destroyArcade();
    clearTimers();
    mount(renderCharacterCreator(setup, draft, {
      setChar: (id) => {
        const ch = CHARACTERS.find((c) => c.id === id);
        draft = { ...draft, characterId: id, name: ch?.name || draft.name };
        paint({ remount: true });
      },
      setPower: (id) => { draft = { ...draft, powerId: id }; paint({ remount: true }); },
      back: () => {
        if (setup.draftingIndex === 0) { screen = "party"; paint({ remount: true }); return; }
        const newIndex = setup.draftingIndex - 1;
        const prev = setup.players[newIndex];
        setup = { ...setup, draftingIndex: newIndex, players: setup.players.slice(0, newIndex) };
        draft = prev ? { ...prev } : createPlayerDraft(newIndex);
        paint({ remount: true });
      },
      save: () => {
        const ch = CHARACTERS.find((c) => c.id === draft.characterId);
        const player = { ...draft, name: ch?.name || draft.name };
        const players = [...setup.players, player];
        if (players.length >= setup.playerCount) {
          setup = { ...setup, players };
          run = beginBoard(startRun(setup));
          saveRun(run);
          hasSave = true;
          screen = "trail";
          const cpu = run.players.find((p) => p.isCpu);
          showToast(cpu ? `${player.name} vs ${cpu.name}` : "Race on!");
          paint({ remount: true });
          return;
        }
        setup = { ...setup, players, draftingIndex: setup.draftingIndex + 1 };
        draft = createPlayerDraft(setup.draftingIndex);
        const taken = new Set(players.map((p) => p.characterId));
        const nextChar = CHARACTERS.find((c) => !taken.has(c.id)) || CHARACTERS[setup.draftingIndex % CHARACTERS.length];
        draft.characterId = nextChar.id;
        draft.name = nextChar.name;
        draft.powerId = POWER_CYCLE[setup.draftingIndex % POWER_CYCLE.length];
        paint({ remount: true });
      },
    }));
    return;
  }

  if (screen === "trail") paintTrail();
}

function maybeStartRiceMole() {
  const g = run?.encounter?.game;
  if (!g || g.type !== "rice" || g.done || riceTimer) return;
  riceTimer = setInterval(() => {
    if (!run?.encounter?.game || run.encounter.game.type !== "rice") {
      if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
      return;
    }
    if (run.encounter.game.done) {
      if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
      update(run);
      return;
    }
    const next = handleBoardMinigame(run, { type: "rice-tick" });
    run = next;
    const root = app.querySelector(".board-screen");
    if (root) syncMinigameOnly(root, run, trailHandlers());
    else update(next);
    if (getActivePlayer(run)?.isCpu) scheduleCpu();
  }, 700);
}

function maybeStartArcade() {
  const g = run?.encounter?.game;
  if (!g || !isArcadeType(g.type)) return;
  const board = app.querySelector("[data-mg]");
  if (!board || arcadeSession) return;

  const cpu = !!getActivePlayer(run)?.isCpu;
  if (!cpu) showToast("Use on-screen buttons — tap the game to start");
  else showToast("CPU is playing this challenge — watch closely");

  arcadeSession = mountArcade(
    board,
    g.type,
    {
      difficulty: run.difficulty,
      puzzleMaster: run.puzzleMaster,
      weapon: run.equippedWeapon,
      strongArms: run.strongArms,
      autoPlay: cpu,
    },
    (result) => {
      destroyArcade();
      showToast(result.won ? (cpu ? "CPU cleared the challenge!" : "Challenge cleared!") : (cpu ? "CPU slipped the challenge" : "Challenge over"));
      update(finishBoardArcade(run, result));
    }
  );
}

function update(next) {
  run = next;
  if (run.gameOver && run.won) { clearSave(); hasSave = false; }
  else if (!run.gameOver) { saveRun(run); hasSave = true; }
  paint();
}

paint({ remount: true });
