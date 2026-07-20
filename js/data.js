/** Minnesota Trail content: biomes, trail stops, quizzes, NPCs, items, systems. */

/* ─────────────────────────── DIFFICULTY ───────────────────────────
 * Retuned upward for ages 8–9. Medium is the recommended "real" challenge;
 * Beginner is the gentle path, Hard is a genuine survival test.
 */
export const DIFFICULTIES = {
  beginner: {
    id: "beginner",
    label: "Beginner",
    tag: "Easygoing stroll",
    health: 100, energy: 100, maxRations: 100, rations: 80,
    energyTravel: 7, enemyChance: 0.2, quizWrongDamage: 10, foeDamage: 11,
    digAttempts: 6, memoryPairs: 4,
    hungerDrain: 8, sickChance: 0.08, foodFailBoost: 0,
  },
  medium: {
    id: "medium",
    label: "Medium",
    tag: "Recommended challenge",
    recommended: true,
    health: 88, energy: 80, maxRations: 100, rations: 60,
    energyTravel: 11, enemyChance: 0.34, quizWrongDamage: 15, foeDamage: 16,
    digAttempts: 5, memoryPairs: 5,
    hungerDrain: 13, sickChance: 0.2, foodFailBoost: 0.12,
  },
  hard: {
    id: "hard",
    label: "Hard",
    tag: "Wild trail survival",
    health: 74, energy: 68, maxRations: 90, rations: 45,
    energyTravel: 15, enemyChance: 0.46, quizWrongDamage: 21, foeDamage: 23,
    digAttempts: 4, memoryPairs: 6,
    hungerDrain: 17, sickChance: 0.32, foodFailBoost: 0.22,
  },
};

export const WHIMSICAL_STARTS = [
  { id: "singing-canoes", name: "Lake of Singing Canoes", biome: "lake",
    blurb: "You wake on the shore of the Upper St. Croix lakes. Birchbark canoes hum old travel songs; one drifts to your feet. The water roads of the St. Croix valley are calling — with your Story Bundle on your back." },
  { id: "syrup-forest", name: "Sugarbush at First Thaw", biome: "sugarbush",
    blurb: "Maples drip sweet sap and the whole sugarbush smells like spring. A friendly voice points down the valley toward the Falls of the St. Croix. Grab a snack — the Great Portage begins here!" },
  { id: "giggle-marsh", name: "Manoomin Marsh Morning", biome: "marsh",
    blurb: "Tall wild-rice plants sway in the wind along a St. Croix backwater. Manoomin was — and is — precious food. Your canoe waits, the Story Bundle rides behind you. Onward!" },
  { id: "namekagon-bend", name: "Bend of the Namekagon", biome: "river",
    blurb: "Morning fog lifts off the Namekagon, the St. Croix's clear sister river. A heron lifts off downstream, showing the way. Time to carry stories along the water roads." },
  { id: "riverbluff-dawn", name: "St. Croix Bluffs at Dawn", biome: "cliffs",
    blurb: "You stand on a river bluff as sunrise paints the valley gold. Far below, the St. Croix braids toward the Council of Stories. A path zigzags down toward the gathering places." },
];

/* ─────────────────────────── ITEMS ─────────────────────────── */

export const FOODS = [
  { id: "maple-candy", name: "Maple candy", emoji: "🍬", type: "food", energy: 16, health: 0, food: 10 },
  { id: "wild-rice-cakes", name: "Wild rice cakes", emoji: "🍘", type: "food", energy: 12, health: 6, food: 20 },
  { id: "blueberry", name: "Fresh blueberries", emoji: "🫐", type: "food", energy: 8, health: 5, food: 12 },
  { id: "fish-stew", name: "Lake fish stew", emoji: "🥣", type: "food", energy: 8, health: 14, food: 26 },
  { id: "pemmican", name: "Pemmican bite", emoji: "🥩", type: "food", energy: 18, health: 8, food: 30 },
  { id: "donut", name: "Portal donut", emoji: "🍩", type: "food", energy: 22, health: 4, food: 14 },
  { id: "venison", name: "Roast venison", emoji: "🍖", type: "food", energy: 16, health: 10, food: 30 },
  { id: "hazelnuts", name: "Wild hazelnuts", emoji: "🌰", type: "food", energy: 10, health: 4, food: 14 },
  { id: "maple-sugar", name: "Maple sugar cake", emoji: "🍯", type: "food", energy: 20, health: 2, food: 16 },
];

export const MEDICINE = [
  { id: "cedar-tea", name: "Cedar tea", emoji: "🍵", type: "medicine", cures: "the-chills", health: 6 },
  { id: "herb-poultice", name: "Herb poultice", emoji: "🌿", type: "medicine", cures: "any", health: 12 },
  { id: "bee-balm", name: "Bee balm salve", emoji: "🐝", type: "medicine", cures: "mosquito-fever", health: 8 },
  { id: "ginger-root", name: "Wild ginger root", emoji: "🫚", type: "medicine", cures: "tummy-ache", health: 8 },
];

export const WEAPONS = [
  { id: "wooden-spear", name: "Wooden spear", emoji: "🗡️", power: 2, scare: 0.7, desc: "Great in the forest hunt; can scare off foes." },
  { id: "sling", name: "Throwing sling", emoji: "🪃", power: 1, scare: 0.55, desc: "Light and quick — extra shots when hunting." },
  { id: "snowshoe-staff", name: "Snowshoe staff", emoji: "🩼", power: 1, scare: 0.6, desc: "Steadies you on snow and shoos away trouble." },
  { id: "fishing-spear", name: "Fishing spear", emoji: "🔱", power: 2, scare: 0.5, desc: "Perfect for water and marsh food." },
  { id: "practice-bow", name: "Practice bow", emoji: "🏹", power: 3, scare: 0.8, desc: "Strong reach — best hunts and best scares." },
];

export function getItem(id) {
  return [...FOODS, ...MEDICINE].find((i) => i.id === id) || null;
}
export function getWeapon(id) {
  return WEAPONS.find((w) => w.id === id) || null;
}

/* ─────────────────────────── SICKNESS ─────────────────────────── */

export const AILMENTS = [
  { id: "mosquito-fever", name: "Mosquito Fever", emoji: "🤒", drainHealth: 3, drainEnergy: 1,
    curedBy: ["medicine", "rest"], note: "Buzzing bites left you feverish. Rest or medicine will help." },
  { id: "the-chills", name: "The Chills", emoji: "🥶", drainHealth: 1, drainEnergy: 3,
    curedBy: ["warm-outfit", "rest", "medicine"], note: "Brrr! A warm outfit, rest, or cedar tea will warm you up." },
  { id: "tummy-ache", name: "Tummy Ache", emoji: "🤢", drainHealth: 2, drainEnergy: 1,
    curedBy: ["food", "rest", "medicine"], note: "Something didn't sit right. Good food or ginger root helps." },
  { id: "tired-legs", name: "Tired Legs", emoji: "🦵", drainHealth: 0, drainEnergy: 4,
    curedBy: ["rest", "food"], note: "Your legs are worn out. Rest at camp or eat something hearty." },
];

export function getAilment(id) {
  return AILMENTS.find((a) => a.id === id) || null;
}

/* ─────────────────────────── NPCs ─────────────────────────── */

export const HELPERS = [
  { name: "Awan", line: "Boozhoo! I'm Awan. Stick close to the lakes — water roads kept people connected for thousands of years.", gift: "maple-candy" },
  { name: "Makoons", line: "I'm Makoons. Listen before you dig. Archaeology means learning carefully — never harming sacred places.", gift: "blueberry" },
  { name: "Elsie", line: "Name's Elsie. My grandma mapped wild rice beds. Take these cakes — you'll need energy for the trail!", gift: "wild-rice-cakes" },
  { name: "Theo", line: "I'm Theo the trail kid! The Mississippi starts as a tiny stream at Lake Itasca. Here, take some ginger root.", gift: "ginger-root" },
  { name: "Nokomis", line: "Call me Nokomis — grandmother. Sip this cedar tea if the north wind gives you a chill.", gift: "cedar-tea" },
  { name: "Bly", line: "I'm Bly, a trader's kid. Furs, beads, copper — everything traveled these routes. Have a spear for the hunt!", gift: "pemmican", weaponGift: "wooden-spear" },
];

export const FOES = [
  { name: "Grumpy Glacier Ghost", line: "BRRR! I carved these lakes and I want a toll! Hand over energy or shiver!", effect: "energy", ailment: "the-chills" },
  { name: "Mosquito Swarm Orchestra", line: "Bzzzz— we're the unofficial state bird (not really) and we LOVE ankles!", effect: "health", ailment: "mosquito-fever" },
  { name: "Portal Pothole", line: "Surprise sinkhole! (Don't worry — it's pretend.) Your feet get stuck in sticky glaze.", effect: "both", ailment: "tired-legs" },
  { name: "Riddle Bandit", line: "No name for you until you solve my mean math trap… or pay the tax!", effect: "energy", ailment: null },
  { name: "Blizzard Bogle", line: "Whoooo! I'm made of wind and snow. Warm up or lose your pep!", effect: "energy", ailment: "the-chills" },
];

/* ───── Party mood + personality flavor for personal storytelling ───── */

export const PARTY_FEELINGS = [
  "Your party feels a bright spark of wonder.",
  "Your party feels tired legs but proud hearts.",
  "Your party feels the cool lake breeze and grins.",
  "Your party feels braver than when the trail began.",
  "Your party feels hungry — but curious about what's ahead.",
  "Your party feels the weight of stories all around you.",
];

export const PERSONALITY_FLAVORS = [
  { match: ["brave", "bold", "fearless"], line: (n) => `${n} squares up, chin high — nothing on this trail is too scary.` },
  { match: ["silly", "funny", "goofy"], line: (n) => `${n} cracks a joke that echoes off the pines.` },
  { match: ["curious", "smart", "clever"], line: (n) => `${n} stops to study every mark and ripple on the way.` },
  { match: ["kind", "gentle", "sweet"], line: (n) => `${n} checks that everyone is okay before moving on.` },
  { match: ["shy", "quiet", "calm"], line: (n) => `${n} listens quietly and notices things others miss.` },
];

/* ─────────────────────────── EXTRA QUIZ BANK ───────────────────────────
 * Used for optional campfire trivia and finale story-stones (bonus points).
 */
export const QUIZ_BANK = [
  { q: "Manoomin is the Ojibwe word for which food?", choices: ["Wild rice", "Corn", "Pumpkin", "Salmon"], a: 0, hint: "It grows in shallow lakes and means 'good berry'." },
  { q: "What were birchbark canoes prized for?", choices: ["Being light and strong", "Being made of gold", "Flying", "Never getting wet inside"], a: 0, hint: "Think about carrying them over portages." },
  { q: "A 'portage' is when you…", choices: ["Carry a canoe over land", "Sleep in a canoe", "Race canoes", "Paint a canoe"], a: 0, hint: "It links two waters that don't connect." },
  { q: "Which season was maple sugaring done in Minnesota?", choices: ["Early spring", "Deep winter", "Late summer", "Never"], a: 0, hint: "Sap runs when days warm and nights still freeze." },
  { q: "Lake Superior is special because it is…", choices: ["The largest of the Great Lakes", "Made of syrup", "In the ocean", "Always frozen"], a: 0, hint: "It's the biggest freshwater lake by area." },
  { q: "What should you do at a real pictograph site?", choices: ["Look, don't touch", "Trace it with markers", "Chip off a piece", "Repaint it"], a: 0, hint: "Skin oils damage ancient paint." },
];

/* ─────────────────────────── TRAIL STOPS (map graph) ───────────────────────────
 * A branching map along the St. Croix valley water roads. Each stop has map
 * coords (x,y in a 0–1000 SVG viewBox) and `links` to adjacent stop ids.
 * `links` are FORWARD-ONLY (directed downstream), so the party always makes
 * progress and can't wander back into a skipped branch.
 * The path forms four "branch pairs": at each, the player picks ONE route and
 * skips the other — a way to steer around foe tokens. Every route ends at the
 * Council of Stories.
 */
export const TRAIL_STOPS = [
  {
    id: "water-roads", name: "The Water Roads", biome: "lake", type: "quiz", icon: "🛶",
    art: "assets/stop-water-roads.jpg", x: 500, y: 930, links: ["glacial-lakes", "maple-sugaring"],
    story: "Your journey begins on the Upper St. Croix lakes. Long before highways, people traveled by canoe on the rivers and lakes of this valley. These water roads linked families, trade, and stories.",
    beat: "The water is calm and mirror-bright; the whole valley seems to welcome you.",
    learn: "The St. Croix valley is the homeland of Dakota and Ojibwe (Anishinaabe) peoples. Birchbark canoes were light, strong, and perfect for these waters.",
    question: "What did people often use to travel the St. Croix's lakes and rivers long ago?",
    choices: ["Birchbark canoes", "Steam trains", "Snowmobiles", "Hot-air balloons"], answer: 0,
    hint: "Think of light boats made from tree bark.",
  },
  {
    id: "glacial-lakes", name: "How the Lakes Were Born", biome: "ice", type: "quiz", icon: "🧊",
    art: "assets/stop-glacial-lakes.jpg", x: 300, y: 812, links: ["manoomin"],
    story: "The Upper St. Croix and its neighbor lakes were scooped out by glaciers. Tens of thousands of years ago, giant sheets of ice crawled across the land, then melted into these basins.",
    beat: "A chill rolls off the water; you imagine walls of ice taller than the pines.",
    learn: "Minnesota's many lakes were shaped by glaciers during the last Ice Age. The St. Croix valley itself was carved by ancient meltwater rivers.",
    question: "What shaped most of the St. Croix valley's lakes?",
    choices: ["Melting glaciers (moving ice)", "Meteor showers", "Volcanoes", "Giant beavers"], answer: 0,
    hint: "Think of huge sheets of slow-moving ice from the Ice Age.",
  },
  {
    id: "maple-sugaring", name: "The Sugarbush", biome: "sugarbush", type: "quiz", icon: "🍁",
    art: "assets/stop-maple-sugaring.jpg", x: 700, y: 812, links: ["manoomin"],
    story: "When spring days warm but nights still freeze, sap rises in the maples. Valley families gathered at the sugarbush to tap trees and boil sap into sweet sugar.",
    beat: "The air smells like warm syrup. Everyone's mouth waters at once.",
    learn: "Maple sugaring is a spring tradition for Dakota and Ojibwe communities — still practiced today. It opened the year's cycle of foods.",
    question: "In what season did families gather at the sugarbush to make maple sugar?",
    choices: ["Early spring", "Middle of winter", "Late fall", "Only in summer"], answer: 0,
    hint: "Sap runs when warm days follow freezing nights.",
  },
  {
    id: "manoomin", name: "Manoomin Marsh", biome: "marsh", type: "minigame", minigame: "rice", icon: "🌾",
    art: "assets/stop-manoomin.jpg", x: 500, y: 700, links: ["portage-carry", "pictographs"],
    story: "In a St. Croix backwater, wild rice sways over the shallows. Manoomin means 'good berry' — a sacred food for Ojibwe communities. It is harvested gently with knockers and canoes so the plants reseed.",
    beat: "The marsh whispers. Take only ripe grains; leave the rest to grow.",
    learn: "Manoomin grows in shallow lakes and slow rivers. Respectful harvest means living with the land, not taking everything at once.",
  },
  {
    id: "portage-carry", name: "The Great Portage", biome: "forest", type: "minigame", minigame: "portage", icon: "🥾",
    art: "assets/stop-portage-carry.jpg", x: 285, y: 585, links: ["hunt-forage"],
    story: "Two waters don't quite connect — time to carry the canoe! The portage path winds between rocks and sticky mud. Don't drop the canoe!",
    beat: "The canoe is heavy, but teamwork makes it lighter.",
    learn: "Portages linked the valley's water highways. Strength, teamwork, and planning mattered as much as paddling — this is where 'portage' gets its name.",
  },
  {
    id: "pictographs", name: "Cliff Pictographs", biome: "cliffs", type: "minigame", minigame: "memory", icon: "🎨",
    art: "assets/stop-pictographs.jpg", x: 715, y: 585, links: ["hunt-forage"],
    story: "On a shaded rock face, painted symbols — pictographs — share stories, maps, and meanings. Match the patterns to 'read' the cliff wall.",
    beat: "The old paintings seem to glow when you look closely.",
    learn: "Rock art sites are treasures. In real life we look with our eyes, not our hands — oils from fingers can damage ancient paint. Look, don't touch.",
  },
  {
    id: "hunt-forage", name: "Woodland Hunt & Forage", biome: "forest", type: "minigame", minigame: "forage", icon: "🦌",
    art: "assets/stop-hunt-forage.jpg", x: 500, y: 470, links: ["pipestone", "bdote"],
    story: "Berries, hazelnuts, deer, and stream fish wait in the valley woods. Explore carefully and take only what your party needs — and watch for buzzing pests!",
    beat: "So many gifts hiding in the green — if you move with care.",
    learn: "Hunting, fishing, and gathering fed families through the year. Careful harvest meant food for today and animals and plants for tomorrow.",
    weaponReward: "practice-bow",
  },
  {
    id: "pipestone", name: "Pipestone Teachings", biome: "pipestone", type: "quiz", icon: "🔴",
    art: "assets/stop-pipestone.jpg", x: 300, y: 355, links: ["fur-trade"],
    story: "An elder shares a teaching about Pipestone, far southwest of the valley. There, people quarried soft red stone to carve sacred pipes, and many nations traveled to quarry in peace.",
    beat: "You hold the story carefully, the way you'd hold something precious.",
    learn: "Pipestone National Monument protects quarries still used by Native people today. Even though it's far from the St. Croix, its stone traveled trade routes across the region.",
    question: "The soft red stone from Pipestone is treated as…",
    choices: ["Special and deeply respected", "A toy to trade for fun", "Ordinary gravel", "Something to sell online"], answer: 0,
    hint: "Think of something used in ceremonies and gatherings.",
  },
  {
    id: "bdote", name: "Where the Rivers Meet", biome: "river", type: "quiz", icon: "🏞️",
    art: "assets/stop-bdote.jpg", x: 700, y: 355, links: ["fur-trade"],
    story: "Downstream, the St. Croix joins the Mississippi, and further on the Minnesota River meets it too. The Dakota call that great meeting place Bdote — a place of deep meaning.",
    beat: "Rivers braid together below you. History layers here like river mud.",
    learn: "Bdote is sacred to the Dakota, long before any fort was built nearby. Honest history remembers who was here first and what places mean to them.",
    question: "The meeting of the rivers, called Bdote, is…",
    choices: ["A place of deep meaning to the Dakota", "An empty parking lot", "A brand-new lake", "A made-up place"], answer: 0,
    hint: "It mattered long before newcomers arrived.",
  },
  {
    id: "fur-trade", name: "Fur Trade Exchange", biome: "superior", type: "quiz", icon: "⚓",
    art: "assets/stop-fur-trade.jpg", x: 500, y: 245, links: ["dig-site", "headwaters"],
    story: "At a valley trading spot, furs, copper, beads, and metal tools change hands. Native nations had traded across this land for centuries before French and other traders arrived.",
    beat: "Bundles of fur and shining trade goods pass carefully between hands.",
    learn: "The fur trade linked many peoples. Native communities were skilled traders and partners — this was an exchange between nations, not an empty land waiting to be 'found.'",
    question: "By the fur-trade era, Native nations were…",
    choices: ["Skilled traders with long trade networks", "New to the area", "Uninterested in trade", "Living alone"], answer: 0,
    hint: "People had traded copper, shells, and more for a very long time.",
  },
  {
    id: "dig-site", name: "Practice Dig Site", biome: "mounds", type: "minigame", minigame: "dig", icon: "🔎",
    art: "assets/stop-dig-site.jpg", x: 330, y: 150, links: ["finale"],
    story: "With an archaeologist guiding you (and magic trail rules), you excavate a practice square. Grid by grid, you search for learning artifacts — beads, pottery bits, and tools.",
    beat: "Trowels ready! Careful, slow, and curious wins the day.",
    learn: "Real archaeology uses permission, science, and respect — and never touches sacred mounds. Context, where something is found, can matter as much as the object itself.",
  },
  {
    id: "headwaters", name: "St. Croix Headwaters", biome: "forest", type: "quiz", icon: "💧",
    art: "assets/stop-headwaters.jpg", x: 670, y: 150, links: ["finale"],
    story: "You climb to the very source of the St. Croix, near Upper St. Croix Lake — a quiet spot where the great river begins as a small, clear trickle.",
    beat: "You step across the little stream that grows into the whole river you traveled.",
    learn: "The St. Croix River begins in northwest Wisconsin and northeast Minnesota, then flows south to join the Mississippi. Protecting the headwaters keeps the whole river healthy.",
    question: "Where does a river like the St. Croix begin?",
    choices: ["At its headwaters (its source)", "At the ocean", "In the middle", "Nowhere — rivers have no start"], answer: 0,
    hint: "The 'head' of the river is where it starts as a small stream.",
  },
  {
    id: "finale", name: "Council of Stories", biome: "city", type: "finale", icon: "🔥",
    art: "assets/stop-finale.jpg", x: 500, y: 72, links: [],
    story: "You reach a glowing circle of story-stones above the St. Croix. Elders ask you to open the Story Bundle and share what you carried. The Great Portage isn't only places — it's people, water, foodways, and care for the past.",
    beat: "Firelight dances on every face. You made it, together.",
    learn: "Dakota and Ojibwe cultures are living cultures — not only “history.” Learning with respect keeps the portage alive for the next travelers.",
  },
];

/* Branch pairs: at each, a run visits ONE node and skips the other.
 * Foe tokens are placed on some branch nodes so an alternate route stays open. */
export const BRANCH_PAIRS = [
  ["glacial-lakes", "maple-sugaring"],
  ["portage-carry", "pictographs"],
  ["pipestone", "bdote"],
  ["dig-site", "headwaters"],
];

export function getStop(id) {
  return TRAIL_STOPS.find((s) => s.id === id) || null;
}

export function stopIndexById(id) {
  return TRAIL_STOPS.findIndex((s) => s.id === id);
}

/** Place foes on some branch nodes (never more than one per pair, so the
 * other branch is always foe-free and the player can route around trouble). */
export function assignFoeNodes(difficultyId, playerCount) {
  const chance = enemyCountForPlayers(playerCount, difficultyId);
  const foes = [];
  for (const [a, b] of BRANCH_PAIRS) {
    if (Math.random() < chance) foes.push(Math.random() < 0.5 ? a : b);
  }
  return foes;
}

export function enemyCountForPlayers(playerCount, difficultyId) {
  const base = DIFFICULTIES[difficultyId]?.enemyChance ?? 0.25;
  return Math.min(0.78, base + (playerCount - 1) * 0.05);
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle multiple-choice options; returns { choices, answer } with a fresh correct index. */
export function shuffleChoices(choices, correctIndex) {
  const indexed = choices.map((text, i) => ({ text, correct: i === correctIndex }));
  const mixed = shuffle(indexed);
  return {
    choices: mixed.map((c) => c.text),
    answer: mixed.findIndex((c) => c.correct),
  };
}

/** Undirected neighbors for wildlife chase (player travel stays forward-only). */
export function undirectedNeighbors(stopId) {
  const stop = getStop(stopId);
  const out = stop?.links || [];
  const inbound = TRAIL_STOPS.filter((s) => (s.links || []).includes(stopId)).map((s) => s.id);
  return [...new Set([...out, ...inbound])];
}

/** How many hops predators chase per turn (beginner is gentler). */
export function predatorChaseRange(difficultyId) {
  return difficultyId === "beginner" ? 1 : 2;
}

/** Place mobile predators ahead on the valley map (kid chase tokens). */
export function spawnPredators(difficultyId) {
  const hard = difficultyId === "hard";
  const medium = difficultyId === "medium";
  const count = hard ? 2 : medium ? 2 : 1;
  // Beginner dens stay mid/late so the first paddles aren't an ambush.
  const dens = hard
    ? shuffle(["glacial-lakes", "maple-sugaring", "manoomin", "portage-carry", "pictographs"])
    : medium
      ? shuffle(["portage-carry", "pictographs", "hunt-forage", "pipestone", "bdote"])
      : shuffle(["pipestone", "bdote", "fur-trade", "dig-site", "headwaters"]);
  const kinds = [
    { emoji: "🐺", name: "Hungry Wolf" },
    { emoji: "🐻", name: "Curious Bear" },
    { emoji: "😼", name: "Bobcat" },
  ];
  return dens.slice(0, count).map((at, i) => ({
    id: `pred-${i}`,
    at,
    emoji: kinds[i % kinds.length].emoji,
    name: kinds[i % kinds.length].name,
  }));
}

/** Migratory animals to follow for food and friends. */
export function spawnMigrators() {
  return [
    {
      id: "mig-deer",
      emoji: "🦌",
      name: "Deer herd",
      at: "maple-sugaring",
      route: ["maple-sugaring", "manoomin", "pictographs", "hunt-forage", "bdote", "fur-trade", "headwaters"],
      gift: "venison",
    },
    {
      id: "mig-geese",
      emoji: "🪿",
      name: "Migrating geese",
      at: "glacial-lakes",
      route: ["glacial-lakes", "manoomin", "portage-carry", "hunt-forage", "pipestone", "fur-trade", "dig-site"],
      gift: "hazelnuts",
    },
  ];
}

export function personalityFlavor(name, personality) {
  if (!personality) return "";
  const p = personality.toLowerCase();
  const match = PERSONALITY_FLAVORS.find((f) => f.match.some((w) => p.includes(w)));
  return match ? match.line(name) : "";
}
