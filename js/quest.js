/**
 * Minnesota Portage — race quest copy.
 */

export const QUEST = {
  title: "The St. Croix Great Portage",
  itemName: "Story Bundle",
  itemEmoji: "📜",
  goalStops: "Council of Stories",
  short:
    "Race left-to-right across the St. Croix valley. Roll 1, 2, 3 — or 🎮 for a trail challenge. Answer true to stay. First to the Council wins.",
  briefing: (playerName) =>
    `${playerName}, race the water roads to the <strong>Council of Stories</strong>.
<br><br>
<strong>Die faces:</strong> <span class="die-chip">1</span> <span class="die-chip">2</span> <span class="die-chip">3</span> spaces — or <span class="die-chip">🎮</span> a fullscreen trail challenge (~2 in 5 rolls).
<br><br>
Land on a glowing space, then <strong>answer a question to stay</strong>. Miss and you bounce back.
<br><br>
Solo explorers race a <strong>blue CPU rival</strong> (you’ll see their questions too). First to the finish wins.`,
};
