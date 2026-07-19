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
    "Paddle up to two hops at a time along the St. Croix. Follow migrating animals, dodge predators, and gather Story Stones of living Dakota and Ojibwe knowledge.",
  briefing: (playerName, companionName) =>
    `${playerName}, the Council of Stories has trusted your crew with a birchbark Story Bundle.
Each turn you can paddle up to <strong>2 hops</strong> — predators move 2 hops too, so plan your route!
Follow 🦌 herds for snacks. Dodge 🐺 on the map. A long paddle can skip a stop to escape trouble.
At each stop, listen, learn, and earn a Story Stone. Reach the Council with your Bundle full.
${companionName ? `${companionName} will paddle beside you.` : "You travel for the next listeners."}`,
};

export function questProgress(state) {
  const total = (state.stops || []).filter((s) => s.type !== "finale").length;
  const stones = state.storyStones || 0;
  const cur = Math.max(0, state.stopIndex);
  return { stones, total, cur, pct: total ? Math.round((stones / total) * 100) : 0 };
}
