/**
 * Persistent animal friends. Unlocked on the trail, they walk beside the party,
 * show up in the HUD and on the map, and give small gameplay bonuses.
 * Framed respectfully: animals are helpers and relatives on the land, not prizes.
 */

export const ANIMALS = [
  {
    id: "owl",
    name: "Hoot the Owl",
    emoji: "🦉",
    bonus: "hint",
    perk: "Grants an extra quiz hint each run.",
    blurb: "Wise night-watcher who whispers clues from the treetops.",
  },
  {
    id: "wolf-pup",
    name: "Maiingan the Wolf Pup",
    emoji: "🐺",
    bonus: "foe-dodge",
    perk: "Chance to dodge a foe's toll completely.",
    blurb: "Playful pup with a big-family loyalty and quick paws.",
  },
  {
    id: "turtle",
    name: "Miskwaadesi the Turtle",
    emoji: "🐢",
    bonus: "energy-save",
    perk: "Saves a little energy on every travel step.",
    blurb: "Steady traveler who reminds you the land itself rides on a turtle's back.",
  },
  {
    id: "chickadee",
    name: "Chirp the Chickadee",
    emoji: "🐦",
    bonus: "forage",
    perk: "Boosts food finds from forage and gifts.",
    blurb: "Tiny, brave, and always the first to find the berry patch.",
  },
  {
    id: "loon",
    name: "Maang the Loon",
    emoji: "🐧",
    bonus: "calm-water",
    perk: "Steadier canoe — fewer bumps in water games.",
    blurb: "Minnesota's lake-singer, calm on even the wildest water.",
  },
  {
    id: "beaver",
    name: "Amik the Beaver",
    emoji: "🦫",
    bonus: "heal-camp",
    perk: "Resting at camp restores a bit more health.",
    blurb: "Master builder who makes any campsite cozy and safe.",
  },
];

export function getAnimal(id) {
  return ANIMALS.find((a) => a.id === id) || null;
}

export function hasBonus(state, bonus) {
  return (state.animalFriends || []).some((id) => getAnimal(id)?.bonus === bonus);
}

export function lockedAnimals(state) {
  return ANIMALS.filter((a) => !(state.animalFriends || []).includes(a.id));
}
