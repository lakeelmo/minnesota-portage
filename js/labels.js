/**
 * Topic art for story cards — uses existing valley stop photos.
 */

export const TOPIC_ART = {
  Foodways: "assets/stop-manoomin.jpg",
  Travel: "assets/stop-portage-carry.jpg",
  Land: "assets/stop-glacial-lakes.jpg",
  Care: "assets/stop-pictographs.jpg",
  Places: "assets/stop-bdote.jpg",
  People: "assets/stop-water-roads.jpg",
  Exchange: "assets/stop-fur-trade.jpg",
  History: "assets/stop-fur-trade.jpg",
  Seasons: "assets/stop-maple-sugaring.jpg",
  Stories: "assets/stop-finale.jpg",
};

export function artForTopic(topic, space) {
  if (space?.art) return space.art;
  return TOPIC_ART[topic] || "assets/map-st-croix.jpg";
}

/** Short label for board tokens — works for 2–4 players + CPU. */
export function playerLabel(player, maxLen = 9) {
  if (!player) return "Player";
  let name = String(player.name || "Player").replace(/\s*\(CPU\)\s*/gi, "").trim();
  if (player.isCpu && !/\bCPU\b/i.test(player.name || "")) {
    // keep readable on the board
  }
  if (name.length > maxLen) name = `${name.slice(0, Math.max(3, maxLen - 1))}…`;
  return name;
}
