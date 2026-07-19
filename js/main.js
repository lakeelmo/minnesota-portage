import {
  createEmptySetup,
  createPlayerDraft,
  startRun,
  saveRun,
  loadRun,
  clearSave,
  equipClothing,
  equipWeapon,
} from "./state.js";
import {
  beginTrail,
  advanceFromIntro,
  resolveHelper,
  resolveFoe,
  resolveFoeMath,
  answerTrivia,
  continueAfterTrivia,
  answerQuiz,
  useQuizHint,
  useCompanionHelp,
  useCompanionTip,
  continueAfterQuiz,
  handleMinigameAction,
  finishMinigame,
  finishArcade,
  completeFinale,
  restAtCamp,
  tryEat,
  mapTravel,
} from "./game.js";
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
let bagOpen = false;

const CHAR_CYCLE = ["makoons", "wiyaka", "waase", "cetan", "ziigwan", "tasina", "migizi", "rivercloud"];
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
        if (saved) { run = saved; screen = "trail"; paint(); showToast("Welcome back to the portage!"); }
      },
      !!loadRun()
    ));
    return;
  }

  if (screen === "party") {
    mount(renderPartySetup(setup, {
      setCount: (n) => { setup = { ...setup, playerCount: n }; paint(); },
      setDifficulty: (id) => { setup = { ...setup, difficulty: id }; paint(); },
      setCompanion: (on) => { setup = { ...setup, companionOn: on }; },
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
      setChar: (id) => { draft = { ...draft, characterId: id }; paint(); },
      setPower: (id) => { draft = { ...draft, powerId: id }; paint(); },
      setName: (name) => { draft = { ...draft, name }; },
      setPersonality: (personality) => { draft = { ...draft, personality }; },
      back: () => {
        if (setup.draftingIndex === 0) { screen = "party"; paint(); return; }
        const newIndex = setup.draftingIndex - 1;
        const prev = setup.players[newIndex];
        setup = { ...setup, draftingIndex: newIndex, players: setup.players.slice(0, newIndex) };
        draft = prev ? { ...prev } : createPlayerDraft(newIndex);
        paint();
      },
      save: () => {
        const nameField = document.getElementById("pname");
        const persField = document.getElementById("ppers");
        if (nameField) draft = { ...draft, name: nameField.value };
        if (persField) draft = { ...draft, personality: persField.value };
        const name = (draft.name || "").trim() || `Explorer ${setup.draftingIndex + 1}`;
        const player = { ...draft, name };
        const players = [...setup.players, player];
        if (players.length >= setup.playerCount) {
          setup = { ...setup, players };
          run = beginTrail(startRun(setup));
          saveRun(run);
          screen = "trail";
          showToast(run.companion ? `Welcome, ${name}! ${run.companion.name} joins you.` : `Welcome, ${name}!`);
          paint();
          return;
        }
        setup = { ...setup, players, draftingIndex: setup.draftingIndex + 1 };
        draft = createPlayerDraft(setup.draftingIndex);
        draft.characterId = CHAR_CYCLE[setup.draftingIndex % CHAR_CYCLE.length];
        draft.powerId = POWER_CYCLE[setup.draftingIndex % POWER_CYCLE.length];
        paint();
      },
    }));
    return;
  }

  if (screen === "trail") {
    if (!run) { screen = "title"; paint(); return; }

    if (run.gameOver && run.encounter?.kind !== "victory") {
      clearSave();
      destroyArcade();
      mount(renderGameOver(run, {
        again: () => { screen = "party"; paint(); },
        home: () => { screen = "title"; paint(); },
      }));
      return;
    }

    mount(renderTrail(run, {
      introGo: () => update(advanceFromIntro(run)),
      helperOk: () => update(resolveHelper(run)),
      foe: (choice) => update(resolveFoe(run, choice)),
      foeMath: (i) => update(resolveFoeMath(run, i)),
      trivia: (i) => update(answerTrivia(run, i)),
      triviaNext: () => update(continueAfterTrivia(run)),
      quiz: (i) => update(answerQuiz(run, i)),
      hint: () => { update(useQuizHint(run)); showToast("Time Echo whispers a hint…"); },
      companionHelp: () => { update(useCompanionHelp(run)); showToast(`${run.companion?.name || "Companion"} helps out!`); },
      companionTip: () => update(useCompanionTip(run)),
      quizNext: () => update(continueAfterQuiz(run)),
      mg: (action) => {
        const next = handleMinigameAction(run, action);
        const g = next.encounter?.game;
        if (g?.type === "memory" && g.flipped?.length === 2 && !g.done) {
          const [a, b] = g.flipped.map((id) => g.cards.find((c) => c.id === id));
          if (a && b && a.pair !== b.pair) {
            update(next);
            memoryTimer = setTimeout(() => update(handleMinigameAction(run, { type: "memory-unflip" })), 650);
            return;
          }
        }
        update(next);
      },
      minigameDone: () => update(finishMinigame(run)),
      finale: () => update(completeFinale(run)),
      rest: () => {
        if (arcadePlaying()) return;
        update(restAtCamp(run));
        showToast("You made camp and rested.");
      },
      eat: (i) => {
        if (arcadePlaying()) return;
        update(tryEat(run, i));
        showToast("Used an item.");
      },
      equip: (id) => {
        if (arcadePlaying()) return;
        const p = run.players[run.activePlayer];
        update(equipClothing(run, p.id, id));
        showToast("Looking sharp!");
      },
      equipWeapon: (id) => {
        if (arcadePlaying()) return;
        update(equipWeapon(run, id));
        showToast("Weapon equipped.");
      },
      mapTravel: (i) => {
        if (arcadePlaying() || bagOpen) return;
        const stop = run.stops[i];
        const next = mapTravel(run, i);
        if (next !== run && stop) {
          const herd = (next.migrators || []).find((m) => m.at === stop.id);
          const pred = (next.predators || []).find((p) => p.at === stop.id);
          if (herd) showToast(`${herd.emoji} Followed the ${herd.name}!`);
          else if (pred) showToast(`${pred.emoji} ${pred.name} is on you!`);
          else showToast(`Paddling to ${stop.name}…`);
        }
        update(next);
      },
      openBag: () => { if (arcadePlaying()) return; bagOpen = true; paint(); },
      closeBag: () => { bagOpen = false; paint(); },
      exit: () => {
        destroyArcade();
        bagOpen = false;
        saveRun(run);
        screen = "title";
        showToast("Progress saved.");
        paint();
      },
      again: () => { destroyArcade(); bagOpen = false; clearSave(); screen = "party"; paint(); },
      home: () => { destroyArcade(); bagOpen = false; clearSave(); screen = "title"; paint(); },
    }, { bagOpen }));

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
    update(handleMinigameAction(run, { type: "rice-tick" }));
  }, 700);
}

function maybeStartArcade() {
  const g = run?.encounter?.game;
  if (!g || !isArcadeType(g.type)) return;
  const board = app.querySelector("[data-mg]");
  if (!board || arcadeSession) return;

  showToast("Arrow keys move · Space action · Enter start");
  arcadeSession = mountArcade(
    board,
    g.type,
    { difficulty: run.difficulty, puzzleMaster: run.puzzleMaster, weapon: run.equippedWeapon, strongArms: run.strongArms, calmWater: (run.animalFriends || []).some((id) => id === "loon") },
    (result) => {
      destroyArcade();
      showToast(result.won ? "Nice run!" : "Trail onward…");
      update(finishArcade(run, result));
    }
  );
}

function update(next) {
  run = next;
  if (run.gameOver && run.won) clearSave();
  else if (!run.gameOver) saveRun(run);
  paint();
}

paint();

// Dev helper: ?arcade=hunt|portage|forage|trap|rapids
{
  const arcadeParam = new URLSearchParams(location.search).get("arcade");
  if (arcadeParam && isArcadeType(arcadeParam)) {
    setup = {
      playerCount: 1, difficulty: "medium", companionOn: true, companionId: null,
      players: [{ id: "p1", name: "Tester", personality: "brave", characterId: "makoons", powerId: "puzzle-master", clothingId: "none" }],
      draftingIndex: 0,
    };
    run = startRun(setup);
    run.stopIndex = run.stops.findIndex((s) => s.minigame === arcadeParam);
    if (run.stopIndex < 0) run.stopIndex = 0;
    const stop = run.stops[run.stopIndex];
    run = { ...run, encounter: { kind: "minigame", stop, title: stop.name, game: { type: arcadeParam, arcade: true, done: false, message: "Arcade test mode" } } };
    screen = "trail";
    paint();
    showToast(`Arcade test: ${arcadeParam}`);
  }
}
