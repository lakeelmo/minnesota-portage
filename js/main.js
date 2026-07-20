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

function paint() {
  if (arcadePlaying()) return;
  clearTimers();

  if (screen === "title") {
    destroyArcade();
    mount(renderTitle(
      () => {
        setup = createEmptySetup();
        draft = createPlayerDraft(0);
        clearSave();
        screen = "party";
        paint();
      },
      () => {
        const saved = loadRun();
        if (saved) { run = saved; screen = "trail"; paint(); showToast("Welcome back to the board!"); }
      },
      !!loadRun()
    ));
    return;
  }

  if (screen === "party") {
    mount(renderPartySetup(setup, {
      setCount: (n) => { setup = { ...setup, playerCount: n }; paint(); },
      setDifficulty: (id) => { setup = { ...setup, difficulty: id }; paint(); },
      back: () => { screen = "title"; paint(); },
      next: () => {
        setup = { ...setup, players: [], draftingIndex: 0 };
        draft = createPlayerDraft(0);
        screen = "create";
        paint();
      },
    }));
    return;
  }

  if (screen === "create") {
    mount(renderCharacterCreator(setup, draft, {
      setChar: (id) => {
        const ch = CHARACTERS.find((c) => c.id === id);
        draft = { ...draft, characterId: id, name: ch?.name || draft.name };
        paint();
      },
      setPower: (id) => { draft = { ...draft, powerId: id }; paint(); },
      back: () => {
        if (setup.draftingIndex === 0) { screen = "party"; paint(); return; }
        const newIndex = setup.draftingIndex - 1;
        const prev = setup.players[newIndex];
        setup = { ...setup, draftingIndex: newIndex, players: setup.players.slice(0, newIndex) };
        draft = prev ? { ...prev } : createPlayerDraft(newIndex);
        paint();
      },
      save: () => {
        const ch = CHARACTERS.find((c) => c.id === draft.characterId);
        const player = { ...draft, name: ch?.name || draft.name };
        const players = [...setup.players, player];
        if (players.length >= setup.playerCount) {
          setup = { ...setup, players };
          run = beginBoard(startRun(setup));
          saveRun(run);
          screen = "trail";
          showToast(`${player.name} leads the first turn.`);
          paint();
          return;
        }
        setup = { ...setup, players, draftingIndex: setup.draftingIndex + 1 };
        draft = createPlayerDraft(setup.draftingIndex);
        // Prefer an unused character
        const taken = new Set(players.map((p) => p.characterId));
        const nextChar = CHARACTERS.find((c) => !taken.has(c.id)) || CHARACTERS[setup.draftingIndex % CHARACTERS.length];
        draft.characterId = nextChar.id;
        draft.name = nextChar.name;
        draft.powerId = POWER_CYCLE[setup.draftingIndex % POWER_CYCLE.length];
        paint();
      },
    }));
    return;
  }

  if (screen === "trail") {
    if (!run) { screen = "title"; paint(); return; }

    if (run.gameOver && run.encounter?.kind !== "victory" && run.encounter?.kind !== "defeat") {
      clearSave();
      destroyArcade();
      mount(renderGameOver(run, {
        again: () => { screen = "party"; paint(); },
        home: () => { screen = "title"; paint(); },
      }));
      return;
    }

    mount(renderTrail(run, {
      introGo: () => update(dismissIntro(run)),
      roll: () => {
        const next = doRoll(run);
        if (next.dice) showToast(`Rolled ${next.dice}!`);
        update(next);
      },
      move: (id) => {
        update(chooseMove(run, id));
      },
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
        saveRun(run);
        screen = "title";
        showToast("Progress saved.");
        paint();
      },
      again: () => { destroyArcade(); clearSave(); screen = "party"; paint(); },
      home: () => { destroyArcade(); clearSave(); screen = "title"; paint(); },
    }));

    maybeStartArcade();
    maybeStartRiceMole();
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
      paint();
      return;
    }
    update(handleBoardMinigame(run, { type: "rice-tick" }));
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
    if (run.won) clearSave();
  } else if (!run.gameOver) saveRun(run);
  paint();
}

paint();
