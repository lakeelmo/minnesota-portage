import {
  createEmptySetup,
  createPlayerDraft,
  startRun,
  saveRun,
  loadRun,
  clearSave,
} from "./state.js";
import { CHARACTERS } from "./characters.js";
import {
  beginBoard,
  dismissIntro,
  doRoll,
  chooseMove,
  answerStoryCard,
  finishStoryCard,
  finishCampOrEvent,
  resolveHazard,
  resolveHazardMath,
  handleBoardMinigame,
  finishBoardMinigame,
  finishBoardArcade,
  completeBoardFinale,
  useStoryHint,
} from "./boardgame.js";
import {
  renderTitle,
  renderPartySetup,
  renderCharacterCreator,
  renderTrail,
  renderGameOver,
  showToast,
  syncTrail,
  syncMinigameOnly,
} from "./ui.js";
import { mountArcade, isArcadeType } from "./arcade.js";

const app = document.getElementById("app");

let screen = "title";
let setup = createEmptySetup();
let draft = createPlayerDraft(0);
let run = null;
let memoryTimer = null;
let riceTimer = null;
let arcadeSession = null;
let hasSave = !!loadRun();

const POWER_CYCLE = ["time-echo", "strong-arms", "speedy-feet", "animal-friend", "puzzle-master", "warm-heart"];

function clearTimers() {
  if (memoryTimer) { clearTimeout(memoryTimer); memoryTimer = null; }
  if (riceTimer) { clearInterval(riceTimer); riceTimer = null; }
}
function destroyArcade() {
  if (arcadeSession) { arcadeSession.destroy(); arcadeSession = null; }
}
function mount(node) { app.innerHTML = ""; app.appendChild(node); }
function arcadePlaying() { return Boolean(arcadeSession); }

function trailHandlers() {
  return {
    introGo: () => update(dismissIntro(run)),
    roll: () => {
      const next = doRoll(run);
      if (next.dice) showToast(`Rolled ${next.dice} — tap a GO space`);
      update(next);
    },
    move: (id) => update(chooseMove(run, id)),
    storyAnswer: (i) => update(answerStoryCard(run, i)),
    storyHint: () => { update(useStoryHint(run)); showToast("Hint revealed…"); },
    storyNext: () => update(finishStoryCard(run)),
    ack: () => update(finishCampOrEvent(run)),
    hazard: (choice) => update(resolveHazard(run, choice)),
    hazardMath: (i) => update(resolveHazardMath(run, i)),
    mg: (action) => {
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
    finale: () => update(completeBoardFinale(run)),
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

function paintTrail() {
  if (!run) { screen = "title"; paint({ remount: true }); return; }

  if (run.gameOver && run.encounter?.kind !== "victory" && run.encounter?.kind !== "defeat") {
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
    return;
  }

  clearTimers();
  destroyArcade();
  mount(renderTrail(run, handlers));
  maybeStartArcade();
  maybeStartRiceMole();
}

function paint(opts = {}) {
  if (arcadePlaying() && screen === "trail" && !opts.remount) return;

  if (screen === "title") {
    destroyArcade();
    clearTimers();
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
        const saved = loadRun();
        if (saved) {
          run = saved;
          screen = "trail";
          paint({ remount: true });
          showToast("Welcome back to the board!");
        }
      },
      hasSave
    ));
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
          showToast(`${player.name} leads the first turn.`);
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

  if (screen === "trail") {
    paintTrail();
  }
}

function maybeStartRiceMole() {
  const g = run?.encounter?.game;
  if (!g || g.type !== "rice" || g.done || riceTimer) return;
  riceTimer = setInterval(() => {
    if (!run?.encounter?.game || run.encounter.game.type !== "rice") {
      clearTimers();
      return;
    }
    if (run.encounter.game.done) {
      clearTimers();
      update(run); // show Continue without soft tick
      return;
    }
    const next = handleBoardMinigame(run, { type: "rice-tick" });
    run = next;
    // Soft path: do not remount the whole board every tick
    const root = app.querySelector(".board-screen");
    if (root) syncMinigameOnly(root, run, trailHandlers());
    else update(next);
  }, 700);
}

function maybeStartArcade() {
  const g = run?.encounter?.game;
  if (!g || !isArcadeType(g.type)) return;
  const board = app.querySelector("[data-mg]");
  if (!board || arcadeSession) return;

  showToast("Arrow keys · Space · Enter to start");
  arcadeSession = mountArcade(
    board,
    g.type,
    { difficulty: run.difficulty, puzzleMaster: run.puzzleMaster, weapon: run.equippedWeapon, strongArms: run.strongArms },
    (result) => {
      destroyArcade();
      showToast(result.won ? "Challenge cleared!" : "Trail onward…");
      update(finishBoardArcade(run, result));
    }
  );
}

function update(next) {
  run = next;
  if (run.gameOver && (run.won || run.encounter?.kind === "defeat")) {
    if (run.won) { clearSave(); hasSave = false; }
  } else if (!run.gameOver) {
    saveRun(run);
    hasSave = true;
  }
  paint();
}

paint({ remount: true });
