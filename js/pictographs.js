/**
 * Stylized cliff pictograph tiles for the memory match game.
 * Inspired by Great Lakes / northern rock-art motifs (educational game art —
 * not copies of sacred site images).
 */

function svgData(inner, viewBox = "0 0 80 80") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="160" height="160">${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const stone = `
  <rect width="80" height="80" rx="10" fill="#3d3428"/>
  <rect x="4" y="4" width="72" height="72" rx="8" fill="#5c4a36"/>
  <rect x="8" y="8" width="64" height="64" rx="6" fill="#6e5740"/>
`;

const ochre = "#c4783a";
const ink = "#2a1f14";

export const PICTOGRAPHS = [
  {
    id: "thunderbird",
    label: "Thunderbird",
    src: svgData(`${stone}
      <g fill="${ochre}" stroke="${ink}" stroke-width="1.2">
        <path d="M40 14 L48 34 L40 30 L32 34 Z"/>
        <path d="M40 30 L40 58"/>
        <path d="M40 36 L18 28 L22 36 L40 40 Z"/>
        <path d="M40 36 L62 28 L58 36 L40 40 Z"/>
        <circle cx="40" cy="22" r="3"/>
      </g>`),
  },
  {
    id: "canoe",
    label: "Canoe",
    src: svgData(`${stone}
      <g fill="none" stroke="${ochre}" stroke-width="3.2" stroke-linecap="round">
        <path d="M14 48 C28 58, 52 58, 66 48"/>
        <path d="M14 48 C28 40, 52 40, 66 48"/>
        <path d="M40 28 L40 46"/>
        <path d="M34 32 L40 28 L46 32"/>
      </g>`),
  },
  {
    id: "fish",
    label: "Fish",
    src: svgData(`${stone}
      <g fill="${ochre}" stroke="${ink}" stroke-width="1">
        <ellipse cx="38" cy="40" rx="18" ry="10"/>
        <path d="M56 40 L70 30 L70 50 Z"/>
        <circle cx="28" cy="38" r="2.2" fill="${ink}"/>
        <path d="M38 30 L42 22 L46 30" fill="none" stroke="${ochre}" stroke-width="2"/>
      </g>`),
  },
  {
    id: "sun",
    label: "Sun",
    src: svgData(`${stone}
      <g stroke="${ochre}" stroke-width="2.5" stroke-linecap="round">
        <circle cx="40" cy="40" r="12" fill="${ochre}" stroke="${ink}" stroke-width="1"/>
        <path d="M40 14 V22 M40 58 V66 M14 40 H22 M58 40 H66"/>
        <path d="M22 22 L28 28 M52 52 L58 58 M58 22 L52 28 M22 58 L28 52"/>
      </g>`),
  },
  {
    id: "deer",
    label: "Deer",
    src: svgData(`${stone}
      <g fill="none" stroke="${ochre}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M28 54 L32 38 L50 38 L54 54"/>
        <path d="M34 38 L34 28 L30 20"/>
        <path d="M34 28 L38 18"/>
        <path d="M48 38 L52 30"/>
        <circle cx="52" cy="28" r="3" fill="${ochre}"/>
        <path d="M36 54 L36 64 M46 54 L46 64"/>
      </g>`),
  },
  {
    id: "birch",
    label: "Birch",
    src: svgData(`${stone}
      <g stroke="${ochre}" stroke-width="2.4" fill="none" stroke-linecap="round">
        <path d="M40 62 V22"/>
        <path d="M40 34 L28 24"/>
        <path d="M40 34 L52 24"/>
        <path d="M40 46 L26 38"/>
        <path d="M40 46 L54 38"/>
        <path d="M34 28 H46 M32 42 H48" stroke-width="1.6"/>
      </g>`),
  },
  {
    id: "waves",
    label: "Water",
    src: svgData(`${stone}
      <g fill="none" stroke="${ochre}" stroke-width="2.8" stroke-linecap="round">
        <path d="M14 30 C24 22, 34 38, 44 30 S64 22, 70 30"/>
        <path d="M14 44 C24 36, 34 52, 44 44 S64 36, 70 44"/>
        <path d="M14 58 C24 50, 34 66, 44 58 S64 50, 70 58"/>
      </g>`),
  },
  {
    id: "hand",
    label: "Hand",
    src: svgData(`${stone}
      <g fill="${ochre}" stroke="${ink}" stroke-width="1">
        <path d="M30 58 V36 C30 32 34 30 36 34 L38 22 C38 18 42 18 42 22 V34
                 L46 20 C46 16 50 16 50 20 V36 L54 24 C54 20 58 22 58 26 V58 Z"/>
      </g>`),
  },
];

export function pictographById(id) {
  return PICTOGRAPHS.find((p) => p.id === id) || PICTOGRAPHS[0];
}
