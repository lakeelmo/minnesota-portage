/**
 * Trail companions — an AI/NPC sidekick who walks beside the party.
 * Even a solo explorer gets one auto-assigned. Companions have a name, a doodle
 * look (reusing the hero SVG system), a short personality, reaction lines, and
 * can help with quizzes: a limited number of "big helps" per run (removes two
 * wrong answers) plus one free narrative tip per quiz.
 */

export const COMPANIONS = [
  {
    id: "birdie",
    name: "Birdie",
    characterId: "ziigwan",
    clothingId: "maple-scarf",
    personality: "cheerful and chatty",
    blurb: "A sunny sidekick who hums travel songs and never runs out of encouragement.",
    icon: "🌼",
  },
  {
    id: "moss",
    name: "Moss",
    characterId: "waase",
    clothingId: "rain-cape",
    personality: "calm and thoughtful",
    blurb: "Quiet, watchful, and great at spotting the right path — and the right answer.",
    icon: "🍃",
  },
  {
    id: "scout",
    name: "Scout",
    characterId: "wiyaka",
    clothingId: "dig-boots",
    personality: "bold and curious",
    blurb: "First to try, first to laugh, and always ready to dig into a mystery.",
    icon: "🧭",
  },
  {
    id: "pip",
    name: "Pip",
    characterId: "rivercloud",
    clothingId: "star-cloak",
    personality: "dreamy and kind",
    blurb: "Tells stories about the stars and cheers the loudest at the finish.",
    icon: "⭐",
  },
  {
    id: "nova",
    name: "Nova",
    characterId: "cetan",
    clothingId: "fur-hat",
    personality: "brave and warm",
    blurb: "Loves cold mornings and warm campfires. Keeps everyone's spirits up.",
    icon: "❄️",
  },
];

const HELPS_PER_RUN = 3;

export function getCompanion(id) {
  return COMPANIONS.find((c) => c.id === id) || COMPANIONS[0];
}

export function pickCompanion(usedCharacterIds = []) {
  const free = COMPANIONS.filter((c) => !usedCharacterIds.includes(c.characterId));
  const pool = free.length ? free : COMPANIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Build the companion object stored on the run state. */
export function makeCompanionState(id) {
  const c = getCompanion(id);
  return {
    id: c.id,
    name: c.name,
    characterId: c.characterId,
    clothingId: c.clothingId,
    personality: c.personality,
    icon: c.icon,
    helpsLeft: HELPS_PER_RUN,
    tipUsedThisQuiz: false,
  };
}

/** Cheer / reaction lines, flavored by the companion's personality. */
export function companionLine(companion, moment, playerName = "friend") {
  if (!companion) return "";
  const name = companion.name;
  const banks = {
    start: [
      `${name}: Boozhoo, ${playerName}! Let's carry this Story Bundle together.`,
      `${name}: Stick with me, ${playerName} — sharp eyes, strong arms, good stories.`,
    ],
    travel: [
      `${name} points down the portage path and grins.`,
      `${name} hums a walking song to keep the pace.`,
      `${name}: Almost there, ${playerName}. Keep those noodle legs moving!`,
    ],
    correct: [
      `${name} throws both arms up: "Yes! I knew you had it, ${playerName}!"`,
      `${name} does a tiny victory hop.`,
    ],
    wrong: [
      `${name}: No worries — every portage has a few wrong turns.`,
      `${name} gives ${playerName} a reassuring pat.`,
    ],
    foe: [
      `${name} steps up beside you: "We can handle this together."`,
      `${name} whispers: "Stay brave, ${playerName}."`,
    ],
    sick: [
      `${name} looks worried: "You're not feeling well — let's rest or find medicine."`,
      `${name} tucks a blanket around the party.`,
    ],
    win: [
      `${name} cheers so loud a loon answers from the lake!`,
      `${name}: We did it, ${playerName}! Best portage crew ever.`,
    ],
  };
  const bank = banks[moment] || banks.travel;
  return bank[Math.floor(Math.random() * bank.length)];
}

/** Free narrative tip once per quiz. */
export function companionTip(companion, stop) {
  if (!companion || !stop) return "";
  const hint = stop.hint || "Think about what you learned in the trail fact.";
  return `${companion.name} leans in: "Psst… ${hint}"`;
}
