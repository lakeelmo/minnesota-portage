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
  { id: "donut-field", name: "The Field of Floating Donuts", biome: "donuts",
    blurb: "You tumble into a meadow of floating donuts — not a real Minnesota place! A sticky maple glaze trail points toward the water roads. Your Story Bundle is safe. The Great Portage begins here." },
  { id: "singing-canoes", name: "Lake of Singing Canoes", biome: "lake",
    blurb: "Birchbark canoes hum old travel songs. One winks and drifts to shore. Time to follow the water roads of Minnesota’s first peoples — with your Story Bundle on your back." },
  { id: "syrup-forest", name: "Upside-Down Maple Syrup Forest", biome: "sugarbush",
    blurb: "Trees drip golden syrup upward. A raccoon in a tiny sash points at trail marks used for centuries. Grab a snack — your portage toward real history starts now!" },
  { id: "giggle-marsh", name: "Wild Rice Giggle Marsh", biome: "marsh",
    blurb: "Tall rice plants whisper jokes in the wind. Manoomin was — and is — precious food. Your boots squish. The Story Bundle waits. Onward!" },
  { id: "thunder-pillows", name: "Thunderbird Pillow Cliffs", biome: "cliffs",
    blurb: "Clouds shaped like thunderbirds snooze on red rock. Stories of sky beings echo. A path zigzags toward gathering places — and the Council that waits for your stones." },
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

/* ─────────────────────────── TRAIL STOPS ─────────────────────────── */

export const TRAIL_STOPS = [
  {
    id: "water-roads", name: "The Water Roads", biome: "lake", type: "quiz", icon: "🛶",
    story: "Long before highways, people traveled Minnesota by canoe on rivers and lakes. These water roads linked families, trade, and stories across vast distances.",
    beat: "The water is calm and mirror-bright; it feels like the whole trail is welcoming you.",
    learn: "Dakota and Ojibwe (Anishinaabe) peoples have lived in this region for many generations. Birchbark canoes were light, strong, and perfect for Minnesota's waters.",
    question: "What did people often use to travel Minnesota's lakes and rivers long ago?",
    choices: ["Birchbark canoes", "Steam trains", "Snowmobiles", "Hot-air balloons"], answer: 0,
    hint: "Think of light boats made from tree bark.",
  },
  {
    id: "glacial-lakes", name: "How the Lakes Were Born", biome: "ice", type: "quiz", icon: "🧊",
    story: "Tens of thousands of years ago, giant sheets of ice — glaciers — crawled across the land. As they melted, they scooped out thousands of basins that filled with water.",
    beat: "A chill rolls off the ancient ice. Your party huddles close, imagining walls of ice taller than trees.",
    learn: "Minnesota's 10,000+ lakes were shaped by glaciers during the last Ice Age. The land you walk on was carved and smoothed by moving ice.",
    question: "What shaped most of Minnesota's thousands of lakes?",
    choices: ["Melting glaciers (moving ice)", "Meteor showers", "Volcanoes", "Giant beavers"], answer: 0,
    hint: "Think of huge sheets of slow-moving ice from the Ice Age.",
  },
  {
    id: "maple-sugaring", name: "The Sugarbush", biome: "sugarbush", type: "quiz", icon: "🍁",
    story: "When spring days warm but nights still freeze, sap rises in the maple trees. Families gathered at the sugarbush to tap trees and boil sap into sweet sugar.",
    beat: "The air smells like warm syrup. Everyone's mouth waters at once.",
    learn: "Maple sugaring is a seasonal tradition for Dakota and Ojibwe communities — still practiced today. It marked the start of the new year's cycle of foods.",
    question: "In what season did families gather at the sugarbush to make maple sugar?",
    choices: ["Early spring", "Middle of winter", "Late fall", "Only in summer"], answer: 0,
    hint: "Sap runs when warm days follow freezing nights.",
    weaponReward: null,
  },
  {
    id: "forest-hunt", name: "Forest Hunt", biome: "forest", type: "minigame", minigame: "hunt", icon: "🦌",
    story: "Your party needs food for the trail. In the clearing ahead, animals move quickly. Take only what you need — and thank the land.",
    beat: "Stomachs rumble. This hunt matters.",
    learn: "Hunting and fishing were vital skills. Careful harvest meant food for today and animals for tomorrow.",
    weaponReward: "practice-bow",
  },
  {
    id: "seasonal-life", name: "The Seasonal Round", biome: "prairie", type: "quiz", icon: "🔄",
    story: "People moved with the seasons: sugaring in spring, fishing and gardening in summer, ricing in fall, hunting and story-telling in winter. Each season had its work and its gifts.",
    beat: "You picture a whole year of trails, all connected like beads on a string.",
    learn: "This yearly pattern is called the 'seasonal round.' Dakota and Ojibwe life followed the land's calendar, not a factory clock.",
    question: "The 'seasonal round' means people…",
    choices: ["Moved and worked with the seasons", "Stayed in one spot all year", "Only worked in summer", "Ignored the weather"], answer: 0,
    hint: "Different foods and jobs came with spring, summer, fall, and winter.",
  },
  {
    id: "manoomin", name: "Manoomin Marsh", biome: "marsh", type: "minigame", minigame: "rice", icon: "🌾",
    story: "Manoomin means 'good berry' or wild rice — a sacred food for Ojibwe communities. Harvesting is done carefully with knockers and canoes so the plants reseed.",
    beat: "The marsh whispers. Take only ripe grains; leave the rest to grow.",
    learn: "Wild rice grows in shallow lakes and rivers. Respectful harvest is part of living with the land, not taking everything at once.",
  },
  {
    id: "river-rapids", name: "River Rapids Run", biome: "river", type: "minigame", minigame: "rapids", icon: "🌊",
    story: "White water churns between two lakes. Steer your birchbark canoe through the rocks — one wrong bump and you'll be swimming!",
    beat: "Spray hits your faces. Everyone grips the gunwales.",
    learn: "Minnesota's water roads weren't always calm. Skillful paddling and reading the current kept travelers safe.",
    weaponReward: "fishing-spear",
  },
  {
    id: "portage-carry", name: "The Great Portage", biome: "forest", type: "minigame", minigame: "portage", icon: "🥾",
    story: "The lakes don't connect here — time to carry the canoe! A portage path winds between rocks and sticky mud. Don't drop the canoe!",
    beat: "The canoe is heavy, but teamwork makes it lighter.",
    learn: "Portages linked Minnesota's water highways. Strength, teamwork, and planning mattered as much as paddling.",
  },
  {
    id: "pictograph-puzzle", name: "Cliff Pictograph Puzzle", biome: "cliffs", type: "minigame", minigame: "memory", icon: "🎨",
    story: "Painted symbols on rock (pictographs) can share stories, maps, and meanings. Matching patterns helps you 'read' the cliff wall.",
    beat: "The old paintings seem to glow when you look closely.",
    learn: "Rock art sites are treasures. In real life we look with our eyes, not our hands — oils from fingers can damage ancient paint.",
  },
  {
    id: "thunderbird", name: "Thunderbird Cliffs", biome: "cliffs", type: "quiz", icon: "⚡",
    story: "Storm clouds gather over the red rock. Many nations tell stories of the Thunderbird — a powerful sky being whose wings make thunder and whose eyes flash lightning.",
    beat: "Distant thunder rolls. Your party feels small under a very big sky.",
    learn: "Thunderbird stories are cultural stories that belong to the peoples who tell them. We enjoy and respect them without pretending they are ours.",
    question: "Thunderbird stories are best understood as…",
    choices: ["Cultural stories that belong to the peoples who tell them", "Just weather reports", "Something to copy and sell", "Made up last year"], answer: 0,
    hint: "They are meaningful traditions — we listen with respect.",
  },
  {
    id: "forage-woods", name: "Woodland Forage", biome: "forest", type: "minigame", minigame: "forage", icon: "🫐",
    story: "Berries, maple signs, and stream fish wait in the woods. Explore with your feet — and watch out for the unofficial state bird (mosquitoes)!",
    beat: "So many snacks hiding in the green — if you can beat the bugs.",
    learn: "Gathering plants and fishing filled out meals alongside hunted game. Knowing the land was a map you carried in your mind.",
    weaponReward: "sling",
  },
  {
    id: "trapline", name: "Winter Trapline", biome: "winter", type: "minigame", minigame: "trap", icon: "🪤",
    story: "Animal paths cross the snowy brush. Set snares, wait, and check them — a patient skill practiced for generations.",
    beat: "Snow crunches underfoot. Breath puffs like little clouds.",
    learn: "Trapping provided food and warm furs. Traplines were tended carefully so nothing was wasted.",
    weaponReward: "snowshoe-staff",
  },
  {
    id: "pipestone", name: "Pipestone Prairie", biome: "pipestone", type: "quiz", icon: "🔴",
    story: "At Pipestone (in southwestern Minnesota), people quarried soft red stone called catlinite to carve sacred pipes. Many nations traveled here to quarry in peace.",
    beat: "The red stone glows warm in the sun. This place feels important.",
    learn: "Pipestone National Monument protects quarries still used by Native people today. The stone is special and the site is deeply respected.",
    question: "What is the soft red stone from Pipestone often used to carve?",
    choices: ["Sacred pipes", "Skyscrapers", "Robot parts", "Pizza ovens"], answer: 0,
    hint: "Think of something used in ceremonies and gatherings.",
  },
  {
    id: "fur-trade", name: "Big Lake Trading Post", biome: "superior", type: "quiz", icon: "⚓",
    story: "Along the shore of Gichi-gami (Lake Superior), Native nations had traded goods for centuries. Later, French and other traders arrived and traded metal tools, cloth, and beads for furs.",
    beat: "The great lake stretches to the horizon like an ocean.",
    learn: "The fur trade linked many peoples. Native communities were skilled traders and partners — this was an exchange, not an empty land waiting to be found.",
    question: "By the fur-trade era, Native nations were…",
    choices: ["Skilled traders with long trade networks", "New to the area", "Uninterested in trade", "Living alone"], answer: 0,
    hint: "People had traded copper, shells, and more for a very long time.",
  },
  {
    id: "fort-snelling", name: "Where the Rivers Meet", biome: "river", type: "quiz", icon: "🏛️",
    story: "Where the Minnesota and Mississippi Rivers meet is a place called Bdote by the Dakota — a place of deep meaning long before a fort was ever built there.",
    beat: "Two rivers braid together below you. History layers here like river mud.",
    learn: "Bdote is sacred to the Dakota. Later, Fort Snelling was built at this spot. Honest history remembers who was here first and what places mean to them.",
    question: "The meeting of the two rivers, called Bdote, is…",
    choices: ["A place of deep meaning to the Dakota", "An empty parking lot", "A brand-new lake", "A made-up place"], answer: 0,
    hint: "It mattered long before any fort was built.",
  },
  {
    id: "mound-care", name: "Earthwork Guardians", biome: "mounds", type: "quiz", icon: "⛰️",
    story: "Ancient earthworks and mounds across the region hold history and meaning. Archaeologists study the past carefully — and sacred places deserve protection, not treasure-digging.",
    beat: "Grassy mounds rise like sleeping giants. You lower your voices.",
    learn: "Real archaeology uses permission, science, and respect. Looting destroys knowledge forever. Your 'dig' ahead is a pretend learning dig on a practice plot!",
    question: "If you find an old object at a real historic site, what's the best first step?",
    choices: ["Leave it and tell a ranger or expert", "Pocket it as a souvenir", "Sell it online", "Bury it deeper"], answer: 0,
    hint: "Experts and caretakers help protect history.",
  },
  {
    id: "dig-site", name: "Practice Dig Site", biome: "mounds", type: "minigame", minigame: "dig", icon: "🔎",
    story: "Under teacher supervision (and magic trail rules), you excavate a practice square. Grid by grid, you search for learning artifacts — beads, pottery bits, and tools.",
    beat: "Trowels ready! Careful, slow, and curious wins the day.",
    learn: "Archaeologists dig in layers and record everything. Context — where something was found — can matter as much as the object itself.",
  },
  {
    id: "itasca", name: "Headwaters of the Mississippi", biome: "forest", type: "quiz", icon: "💧",
    story: "At Lake Itasca, the mighty Mississippi begins as a stream you can step across. From here, water travels all the way to the Gulf of Mexico.",
    beat: "You hop the tiny stream that becomes a giant river. Everyone cheers.",
    learn: "'Itasca' was coined from Latin bits of 'veritas' and 'caput' — truth + head — for 'true head' of the river.",
    question: "Where does the Mississippi River begin in Minnesota?",
    choices: ["Lake Itasca", "Lake Superior", "The Grand Canyon", "The Moon"], answer: 0,
    hint: "It's a lake whose name hints at the 'true head' of the river.",
  },
  {
    id: "finale", name: "Council of Stories", biome: "city", type: "finale", icon: "🔥",
    story: "You reach a glowing circle of story-stones. Elders (and a very polite raccoon) ask you to open the Story Bundle and share what you carried. Minnesota’s portage isn’t only places — it’s people, water, foodways, and care for the past.",
    beat: "Firelight dances on every face. You made it, together.",
    learn: "Dakota and Ojibwe cultures are living cultures — not only “history.” Learning with respect keeps the portage alive for the next explorers.",
  },
];

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

export function personalityFlavor(name, personality) {
  if (!personality) return "";
  const p = personality.toLowerCase();
  const match = PERSONALITY_FLAVORS.find((f) => f.match.some((w) => p.includes(w)));
  return match ? match.line(name) : "";
}
