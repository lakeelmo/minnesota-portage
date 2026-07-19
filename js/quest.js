/**
 * Minnesota Portage — the quest.
 *
 * Your mission: carry a birchbark Story Bundle along the water roads,
 * gather Story Stones of living knowledge at each stop, and bring them
 * to the Council of Stories. A portage is when you carry a canoe over land
 * between waters — and here, you also carry stories.
 */

export const QUEST = {
  title: "The Great Portage",
  itemName: "Story Bundle",
  itemEmoji: "📜",
  stoneName: "Story Stone",
  stoneEmoji: "🪨",
  goalStops: "Council of Stories",
  short:
    "Carry the Story Bundle across Minnesota’s water roads. Gather Story Stones of living knowledge. Arrive ready to share.",
  briefing: (playerName, companionName) =>
    `${playerName}, the Council of Stories has trusted your crew with a birchbark Story Bundle.
A portage means carrying a canoe between lakes — and tonight you’ll carry stories the same way.
At each stop, listen, learn, and earn a Story Stone. Keep your party healthy. Reach the Council with care.
${companionName ? `${companionName} will walk beside you.` : "You walk for the next listeners."}`,
};

export function questProgress(state) {
  const total = (state.stops || []).filter((s) => s.type !== "finale").length;
  const stones = state.storyStones || 0;
  const cur = Math.max(0, state.stopIndex);
  return { stones, total, cur, pct: total ? Math.round((stones / total) * 100) : 0 };
}
