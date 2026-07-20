/**
 * Minnesota Portage — the quest (board-game edition).
 */

export const QUEST = {
  title: "The St. Croix Great Portage",
  itemName: "Story Bundle",
  itemEmoji: "📜",
  stoneName: "Story Stone",
  stoneEmoji: "🪨",
  goalStops: "Council of Stories",
  short:
    "A turn-based board game of the St. Croix valley: roll the die, choose your path, draw Story Cards, and finish challenges to fill your Bundle.",
  briefing: (playerName) =>
    `${playerName}, the Council of Stories has trusted you with a birchbark Story Bundle.
<br><br>
<strong>Each turn:</strong> roll the die, then move exactly that many spaces along the board.
Branches mean strategy — pick the path that fits your stones and stamina.
<br><br>
<strong>Spaces:</strong> Story Cards (trivia, never the same card twice), Challenges (minigames), Camps, and Hazards.
Earn Story Stones, then reach the <strong>Council of Stories</strong> with a full Bundle.`,
};
