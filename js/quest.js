/**
 * Minnesota Portage — the quest.
 *
 * Your mission: carry a birchbark Story Bundle along the water roads,
 * gather Story Stones of living knowledge at each stop, and bring them
 * to the Council of Stories. A portage is when you carry a canoe over land
 * between waters — and here, you also carry stories.
 */

export const QUEST = {
  title: "The St. Croix Great Portage",
  itemName: "Story Bundle",
  itemEmoji: "📜",
  stoneName: "Story Stone",
  stoneEmoji: "🪨",
  goalStops: "Council of Stories",
  short:
    "Paddle and portage the St. Croix valley's water roads. Choose your path, dodge trouble, and gather Story Stones of living Dakota and Ojibwe knowledge on the way to the Council of Stories.",
  briefing: (playerName, companionName) =>
    `${playerName}, the Council of Stories has trusted your crew with a birchbark Story Bundle.
A portage means carrying a canoe between waters — and along the St. Croix you'll carry stories the same way.
Tap a glowing stop on the map to travel. Some paths have trouble on them, so choose your route with care.
At each stop, listen, learn, and earn a Story Stone. Keep your party healthy and reach the Council.
${companionName ? `${companionName} will paddle beside you.` : "You travel for the next listeners."}`,
};

export function questProgress(state) {
  const total = (state.stops || []).filter((s) => s.type !== "finale").length;
  const stones = state.storyStones || 0;
  const cur = Math.max(0, state.stopIndex);
  return { stones, total, cur, pct: total ? Math.round((stones / total) * 100) : 0 };
}
