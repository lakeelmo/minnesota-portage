/**
 * Minnesota Portage explorers — fictional young people of the St. Croix valley,
 * rooted in real Dakota and Ojibwe places and lifeways. They are NOT sacred
 * figures or caricatures — just kids from the valley, drawn as warm
 * children's-book doodles when a painted portrait isn't available.
 *
 * Each character keeps doodle color fields (skin/hair/shirt/… ) for the SVG
 * fallback, plus `nation`, `homePlace`, and `seasonalSkill`. Painted portraits
 * are preferred and loaded from `assets/char-{id}.jpg` when present.
 */

export const CHARACTERS = [
  {
    id: "makoons", name: "Makoons", nation: "Ojibwe", homePlace: "Upper St. Croix lakes",
    blurb: "A cheerful kid whose name means “little bear.” First to the sugarbush every spring.",
    seasonalSkill: "Spring sugaring — knows exactly when the sap will run.",
    skin: "#b57a45", hair: "#1c130c", shirt: "#2f6b8f", pants: "#3d7ea6",
    accent: "#e8b86d", shoe: "#3a2a1c", bodyStyle: "casual", hairStyle: "short", face: "happy",
    portrait: "assets/char-makoons.jpg",
  },
  {
    id: "waase", name: "Waase", nation: "Ojibwe", homePlace: "Namekagon River",
    blurb: "Named from a word for “bright light.” Careful and calm out on the ricing canoe.",
    seasonalSkill: "Fall ricing — a gentle, patient manoomin harvester.",
    skin: "#8a5a32", hair: "#0f0d0a", shirt: "#2f7a6b", pants: "#1d4f5f",
    accent: "#d4a017", shoe: "#5c3310", bodyStyle: "tunic", hairStyle: "braids", face: "smile",
    portrait: "assets/char-waase.jpg",
  },
  {
    id: "ziigwan", name: "Ziigwan", nation: "Ojibwe", homePlace: "Yellow Lake, St. Croix country",
    blurb: "Named for the spring thaw. Always reading the clouds, the ice, and the wind.",
    seasonalSkill: "Weather-wise — feels a storm or a thaw coming.",
    skin: "#f3c79a", hair: "#2a2118", shirt: "#c4a574", pants: "#8b7355",
    accent: "#2f6f8f", shoe: "#5c4033", bodyStyle: "tunic", hairStyle: "bob", face: "smile",
    portrait: "assets/char-ziigwan.jpg",
  },
  {
    id: "migizi", name: "Migizi", nation: "Ojibwe", homePlace: "Falls of the St. Croix",
    blurb: "Named for the eagle. Knows the canoe routes and portages by heart.",
    seasonalSkill: "Water roads — a strong paddler and portage carrier.",
    skin: "#6e4528", hair: "#141414", shirt: "#c46a2f", pants: "#2f6f8f",
    accent: "#f4f7f5", shoe: "#7a4e12", bodyStyle: "jacket", hairStyle: "longStraight", face: "determined",
    portrait: "assets/char-migizi.jpg",
  },
  {
    id: "wiyaka", name: "Wíyaka", nation: "Dakota", homePlace: "St. Croix–Mississippi confluence",
    blurb: "A curious kid whose name means “feather.” Loves finding plants and berries.",
    seasonalSkill: "Foraging — spots edible plants and berry patches fast.",
    skin: "#d9a078", hair: "#1a140f", shirt: "#c4a574", pants: "#8b7355",
    accent: "#a84b3a", shoe: "#5c3310", bodyStyle: "tunic", hairStyle: "puff", face: "happy",
    portrait: "assets/char-wiyaka.jpg",
  },
  {
    id: "cetan", name: "Čhetáŋ", nation: "Dakota", homePlace: "Kaphóža villages, lower St. Croix",
    blurb: "Named for the hawk. Sharp-eyed, quiet, and steady on the winter trail.",
    seasonalSkill: "Tracking — follows animal signs through the snow.",
    skin: "#e8b989", hair: "#0f172a", shirt: "#2c3539", pants: "#1f2933",
    accent: "#c45c4a", shoe: "#111111", bodyStyle: "suit", hairStyle: "neat", face: "determined",
    portrait: "assets/char-cetan.jpg",
  },
  {
    id: "tasina", name: "Tašína", nation: "Dakota", homePlace: "St. Croix prairie edge",
    blurb: "A warm, artful kid whose name relates to a robe or blanket. Loves quillwork and trade beads.",
    seasonalSkill: "Trade & craft — knows the value of every bead and fur.",
    skin: "#9a6435", hair: "#1c1917", shirt: "#e8d5b7", pants: "#c4a574",
    accent: "#a84b3a", shoe: "#5c3310", bodyStyle: "tunic", hairStyle: "longWavy", face: "smile",
    portrait: "assets/char-tasina.jpg",
  },
  {
    id: "rivercloud", name: "River Cloud", nation: "Dakota", homePlace: "St. Croix river bluffs",
    blurb: "A dreamy storyteller (English name, Dakota family) who maps the water roads in songs.",
    seasonalSkill: "Storytelling — remembers every route and every tale.",
    skin: "#f0c9a0", hair: "#141414", shirt: "#c4a574", pants: "#8b7355",
    accent: "#2f6f8f", shoe: "#5c3310", bodyStyle: "tunic", hairStyle: "longStraight", face: "sing",
    portrait: "assets/char-rivercloud.jpg",
  },
];

export const SUPERPOWERS = [
  { id: "time-echo", name: "Time Echo", icon: "⏳", desc: "Hear the past — one free hint on history questions." },
  { id: "strong-arms", name: "Strong Arms", icon: "💪", desc: "Extra digs and stronger weapon throws." },
  { id: "speedy-feet", name: "Speedy Feet", icon: "👟", desc: "Portages cost less energy." },
  { id: "animal-friend", name: "Animal Friend", icon: "🦉", desc: "Animal friends appear more often." },
  { id: "puzzle-master", name: "Puzzle Master", icon: "🧩", desc: "Puzzles and arcade games start easier." },
  { id: "warm-heart", name: "Warm Heart", icon: "🔥", desc: "Shrug off the chills faster." },
];

export const CLOTHING = [
  { id: "none", name: "Everyday clothes", emoji: "👕", svg: () => "" },
  {
    id: "voyager-hat", name: "Voyageur sash hat", emoji: "🎩", warm: true,
    svg: (c) => `
      <ellipse cx="48" cy="24" rx="28" ry="9" fill="#8b1e1e" stroke="#1a1a1a" stroke-width="2.2"/>
      <path d="M32 24 Q48 4 64 24 Z" fill="${c.accent}" stroke="#1a1a1a" stroke-width="2.2"/>
      <circle cx="48" cy="10" r="4.5" fill="#e8b86d" stroke="#1a1a1a" stroke-width="1.6"/>`,
  },
  {
    id: "maple-scarf", name: "Maple leaf scarf", emoji: "🧣", warm: true,
    svg: () => `
      <path d="M30 72 Q48 88 66 72 L68 84 Q48 98 28 84 Z" fill="#c46a2f" stroke="#1a1a1a" stroke-width="2.2"/>
      <path d="M42 84 L42 102 L48 96 L54 102 L54 84" fill="#e07a3a" stroke="#1a1a1a" stroke-width="1.8"/>`,
  },
  {
    id: "dig-boots", name: "Archaeology boots", emoji: "🥾",
    svg: () => `
      <ellipse cx="36" cy="204" rx="12" ry="7" fill="#6b4226" stroke="#1a1a1a" stroke-width="2.2"/>
      <ellipse cx="60" cy="204" rx="12" ry="7" fill="#6b4226" stroke="#1a1a1a" stroke-width="2.2"/>
      <rect x="27" y="190" width="18" height="12" rx="3" fill="#8b5a2b" stroke="#1a1a1a" stroke-width="2"/>
      <rect x="51" y="190" width="18" height="12" rx="3" fill="#8b5a2b" stroke="#1a1a1a" stroke-width="2"/>`,
  },
  {
    id: "lake-vest", name: "Lake Superior vest", emoji: "🦺",
    svg: () => `
      <path d="M33 76 L33 114 L48 108 L63 114 L63 76 L54 82 L48 88 L42 82 Z" fill="#2f6f8f" stroke="#1a1a1a" stroke-width="2.2"/>
      <circle cx="40" cy="96" r="2.6" fill="#e8b86d"/><circle cx="40" cy="105" r="2.6" fill="#e8b86d"/>`,
  },
  {
    id: "fur-hat", name: "Warm fur hat", emoji: "🧢", warm: true,
    svg: () => `
      <path d="M28 32 Q30 12 48 10 Q66 12 68 32 Z" fill="#6b4226" stroke="#1a1a1a" stroke-width="2.2"/>
      <ellipse cx="48" cy="32" rx="22" ry="8" fill="#a97142" stroke="#1a1a1a" stroke-width="2.2"/>
      <circle cx="48" cy="10" r="5" fill="#e9d8c3" stroke="#1a1a1a" stroke-width="1.8"/>`,
  },
  {
    id: "rain-cape", name: "Birch-oil rain cape", emoji: "🧥", warm: true,
    svg: () => `
      <path d="M28 72 Q48 62 68 72 L76 152 Q48 164 20 152 Z" fill="#1f4d3a" fill-opacity="0.92" stroke="#1a1a1a" stroke-width="2.2"/>
      <path d="M48 66 L48 152" stroke="#14532d" stroke-width="2"/>`,
  },
  {
    id: "snowshoes", name: "Snowshoes", emoji: "🎿",
    svg: () => `
      <ellipse cx="34" cy="208" rx="16" ry="8" fill="#e8efe9" stroke="#1a1a1a" stroke-width="2.2"/>
      <ellipse cx="62" cy="208" rx="16" ry="8" fill="#e8efe9" stroke="#1a1a1a" stroke-width="2.2"/>
      <path d="M22 208 H46 M50 208 H74 M34 200 V216 M62 200 V216" stroke="#8a5a2b" stroke-width="1.5"/>`,
  },
  {
    id: "ricing-hat", name: "Ricing sun hat", emoji: "👒",
    svg: () => `
      <ellipse cx="48" cy="28" rx="32" ry="9" fill="#d9a441" stroke="#1a1a1a" stroke-width="2.2"/>
      <path d="M34 28 Q48 6 62 28 Z" fill="#e3b95a" stroke="#1a1a1a" stroke-width="2.2"/>`,
  },
  {
    id: "star-cloak", name: "Star-story cloak", emoji: "✨", warm: true,
    svg: () => `
      <path d="M28 72 Q48 58 68 72 L78 162 Q48 174 18 162 Z" fill="#2a3358" fill-opacity="0.94" stroke="#1a1a1a" stroke-width="2.2"/>
      <circle cx="38" cy="100" r="2.2" fill="#e8b86d"/><circle cx="58" cy="120" r="2" fill="#f4f7f5"/>
      <circle cx="44" cy="140" r="1.8" fill="#e8b86d"/>`,
  },
];

const INK = "#1a1a1a";

function face(expr = "smile") {
  const eyes = `
    <ellipse cx="39" cy="52" rx="4.2" ry="4.6" fill="#fff"/>
    <ellipse cx="57" cy="52" rx="4.2" ry="4.6" fill="#fff"/>
    <circle cx="39.5" cy="52.5" r="2.3" fill="#1a1a1a"/>
    <circle cx="57.5" cy="52.5" r="2.3" fill="#1a1a1a"/>
    <circle cx="40.6" cy="51.4" r="0.8" fill="#fff"/>
    <circle cx="58.6" cy="51.4" r="0.8" fill="#fff"/>`;
  const blush = `<ellipse cx="32" cy="60" rx="4" ry="2.4" fill="#f0a090" opacity="0.45"/><ellipse cx="64" cy="60" rx="4" ry="2.4" fill="#f0a090" opacity="0.45"/>`;
  switch (expr) {
    case "sing":
      return `${eyes}${blush}<ellipse cx="48" cy="66" rx="5" ry="6.5" fill="#1a1a1a"/>`;
    case "squint":
      return `<path d="M33 52 Q39 47 45 52" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M51 52 Q57 47 63 52" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
        ${blush}<path d="M41 65 Q48 71 55 65" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>`;
    case "happy":
      return `${eyes}${blush}<path d="M39 64 Q48 74 57 64" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="33" cy="48" r="2.2" fill="#8d5524" opacity="0.35"/><circle cx="36" cy="45" r="1.6" fill="#8d5524" opacity="0.35"/>`;
    case "surprise":
      return `${eyes}${blush}<ellipse cx="48" cy="66" rx="3.5" ry="4.5" fill="#1a1a1a"/>`;
    case "determined":
      return `<path d="M33 46 L45 50" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M63 46 L51 50" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        ${eyes}${blush}<path d="M41 66 H55" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    default:
      return `${eyes}${blush}<path d="M40 65 Q48 72 56 65" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
}

function hairSvg(c) {
  const H = c.hair;
  const sw = `stroke="${INK}" stroke-width="2.2"`;
  switch (c.hairStyle) {
    case "longWavy":
      return `<path d="M24 40 Q18 70 26 110 Q32 80 34 55 Z" fill="${H}" ${sw}/>
        <path d="M72 40 Q78 70 70 110 Q64 80 62 55 Z" fill="${H}" ${sw}/>
        <ellipse cx="48" cy="34" rx="27" ry="22" fill="${H}" ${sw}/>
        <path d="M28 30 Q48 18 68 30" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="3"/>`;
    case "longStraight":
      return `<path d="M24 38 Q16 78 28 118 Q34 80 36 50 Z" fill="${H}" ${sw}/>
        <path d="M72 38 Q80 78 68 118 Q62 80 60 50 Z" fill="${H}" ${sw}/>
        <ellipse cx="48" cy="34" rx="27" ry="22" fill="${H}" ${sw}/>`;
    case "cap":
      return `<ellipse cx="48" cy="34" rx="25" ry="19" fill="${H}" ${sw}/>
        <ellipse cx="54" cy="20" rx="24" ry="11" fill="${c.accent}" ${sw}/>
        <rect x="44" y="16" width="16" height="7" rx="2" fill="#e8efe9" ${sw}/>`;
    case "neat":
      return `<ellipse cx="48" cy="32" rx="23" ry="17" fill="${H}" ${sw}/>
        <path d="M30 34 Q48 28 66 34" fill="none" stroke="#fff" stroke-opacity="0.15" stroke-width="2"/>`;
    case "puff":
      return `<circle cx="32" cy="30" r="11" fill="${H}" ${sw}/><circle cx="48" cy="22" r="13" fill="${H}" ${sw}/>
        <circle cx="64" cy="30" r="11" fill="${H}" ${sw}/><ellipse cx="48" cy="36" rx="23" ry="15" fill="${H}" ${sw}/>`;
    case "bob":
      return `<path d="M24 40 Q24 14 48 14 Q72 14 72 40 L70 52 Q60 38 48 38 Q36 38 26 52 Z" fill="${H}" ${sw}/>`;
    case "braids":
      return `<ellipse cx="48" cy="34" rx="25" ry="19" fill="${H}" ${sw}/>
        <path d="M26 40 Q18 70 28 105" fill="none" stroke="${H}" stroke-width="10" stroke-linecap="round"/>
        <path d="M70 40 Q78 70 68 105" fill="none" stroke="${H}" stroke-width="10" stroke-linecap="round"/>
        <path d="M26 40 Q18 70 28 105" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M70 40 Q78 70 68 105" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="29" cy="108" r="4.5" fill="${c.accent}" ${sw}/><circle cx="67" cy="108" r="4.5" fill="${c.accent}" ${sw}/>`;
    default:
      return `<ellipse cx="48" cy="34" rx="25" ry="19" fill="${H}" ${sw}/>
        <path d="M28 38 Q24 55 30 62" fill="none" stroke="${H}" stroke-width="9" stroke-linecap="round"/>
        <path d="M68 38 Q72 55 66 62" fill="none" stroke="${H}" stroke-width="9" stroke-linecap="round"/>`;
  }
}

function head(c) {
  return `
    <ellipse cx="48" cy="54" rx="20" ry="22" fill="${c.skin}" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="42" cy="48" rx="7" ry="5" fill="#fff" opacity="0.18"/>
    ${hairSvg(c)}
    ${face(c.face)}`;
}

function thickLimb(d, skin, width = 11) {
  return `
    <path d="${d}" fill="none" stroke="${INK}" stroke-width="${width + 3.2}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${skin}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function arm(skin, wave = false) {
  if (wave) {
    return `
      ${thickLimb("M60 88 Q78 70 84 48", skin)}
      <circle cx="84" cy="46" r="7.2" fill="${skin}" stroke="${INK}" stroke-width="2.1"/>`;
  }
  return `
    ${thickLimb("M36 90 Q20 110 22 138", skin)}
    <circle cx="22" cy="140" r="7.2" fill="${skin}" stroke="${INK}" stroke-width="2.1"/>
    ${thickLimb("M60 90 Q76 110 74 138", skin)}
    <circle cx="74" cy="140" r="7.2" fill="${skin}" stroke="${INK}" stroke-width="2.1"/>`;
}

function legs(c, topY) {
  return `
    ${thickLimb(`M40 ${topY} Q36 170 34 198`, c.skin, 12)}
    ${thickLimb(`M56 ${topY} Q60 170 62 198`, c.skin, 12)}
    <ellipse cx="34" cy="204" rx="11" ry="6" fill="${c.shoe}" stroke="${INK}" stroke-width="2.1"/>
    <ellipse cx="62" cy="204" rx="11" ry="6" fill="${c.shoe}" stroke="${INK}" stroke-width="2.1"/>`;
}

function bodySvg(c) {
  const S = c.skin;
  switch (c.bodyStyle) {
    case "skirt":
      return `${head(c)}
        <path d="M34 86 H62 L72 138 H24 Z" fill="${c.pants}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="34" y="80" width="28" height="20" rx="6" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <circle cx="48" cy="88" r="3" fill="${c.accent}"/>
        ${arm(S)}${legs(c, 136)}`;
    case "dress":
      return `${head(c)}
        <path d="M32 84 H64 L76 132 H20 Z" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <circle cx="40" cy="102" r="3.2" fill="${c.pants}"/><circle cx="54" cy="114" r="3.2" fill="${c.pants}"/>
        <circle cx="48" cy="96" r="3.2" fill="${c.pants}"/>
        ${arm(S)}${legs(c, 130)}`;
    case "suit":
      return `${head(c)}
        <path d="M33 84 H63 L68 118 H28 Z" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="44" y="86" width="8" height="30" fill="#f4f7f5" stroke="${INK}" stroke-width="1.6"/>
        <path d="M48 86 L48 112" stroke="${c.accent}" stroke-width="4.5" stroke-linecap="round"/>
        ${arm(S)}${legs(c, 116)}`;
    case "jacket":
      return `${head(c)}
        <rect x="33" y="84" width="30" height="38" rx="6" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <path d="M28 82 L48 98 L68 82 L74 126 L22 126 Z" fill="${c.accent}" stroke="${INK}" stroke-width="2.3" fill-opacity="0.9"/>
        ${arm(S, true)}${legs(c, 124)}`;
    case "overalls":
      return `${head(c)}
        <rect x="33" y="84" width="30" height="16" rx="5" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <path d="M30 98 H66 L68 136 H28 Z" fill="${c.pants}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="37" y="78" width="7" height="24" fill="${c.pants}" stroke="${INK}" stroke-width="2"/>
        <rect x="52" y="78" width="7" height="24" fill="${c.pants}" stroke="${INK}" stroke-width="2"/>
        <rect x="41" y="108" width="14" height="11" rx="3" fill="${c.accent}" stroke="${INK}" stroke-width="1.6"/>
        ${arm(S)}${legs(c, 134)}`;
    case "hoodie":
      return `${head(c)}
        <rect x="30" y="84" width="36" height="44" rx="10" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <path d="M32 84 Q48 72 64 84 L58 94 Q48 86 38 94 Z" fill="${c.accent}" stroke="${INK}" stroke-width="2"/>
        <path d="M44 112 H52" stroke="${INK}" stroke-width="2"/>
        ${arm(S)}${legs(c, 126)}`;
    case "tunic":
      return `${head(c)}
        <path d="M32 84 H64 L66 128 H30 Z" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="38" y="112" width="20" height="7" rx="2" fill="${c.accent}" stroke="${INK}" stroke-width="1.6"/>
        <path d="M40 84 Q48 96 56 84" fill="none" stroke="${c.accent}" stroke-width="2.5"/>
        ${arm(S)}${legs(c, 126)}`;
    case "puffer":
      return `${head(c)}
        <rect x="30" y="84" width="36" height="46" rx="12" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <path d="M32 96 H64 M32 108 H64 M32 120 H64" stroke="${INK}" stroke-width="1.5" opacity="0.35"/>
        ${arm(S)}${legs(c, 128)}`;
    case "poncho":
      return `${head(c)}
        <path d="M28 86 L48 76 L68 86 L76 128 L20 128 Z" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <path d="M28 108 H68" stroke="${c.accent}" stroke-width="3.5"/>
        <path d="M28 116 H68" stroke="${c.pants}" stroke-width="3.5"/>
        <path d="M22 128 l7 8 m7 -8 l7 8 m7 -8 l7 8 m7 -8 l7 8" stroke="${c.accent}" stroke-width="2.3" stroke-linecap="round"/>
        ${arm(S)}${legs(c, 126)}`;
    default:
      return `${head(c)}
        <rect x="33" y="84" width="30" height="42" rx="8" fill="${c.shirt}" stroke="${INK}" stroke-width="2.3"/>
        <circle cx="48" cy="94" r="3.5" fill="${c.accent}" stroke="${INK}" stroke-width="1.4"/>
        ${thickLimb("M36 90 Q16 78 14 52", S)}
        <circle cx="14" cy="50" r="7.2" fill="${S}" stroke="${INK}" stroke-width="2.1"/>
        ${thickLimb("M60 88 Q78 70 84 48", S)}
        <circle cx="84" cy="46" r="7.2" fill="${S}" stroke="${INK}" stroke-width="2.1"/>
        <path d="M34 124 H62 L64 198 H32 Z" fill="${c.pants}" stroke="${INK}" stroke-width="2" opacity="0.55"/>
        ${legs(c, 124)}`;
  }
}

export function renderDoodle(characterId, { size = 72, className = "", expr, clothingId = "none", animalEmoji = "" } = {}) {
  const base = CHARACTERS.find((x) => x.id === characterId) || CHARACTERS[0];
  const c = expr ? { ...base, face: expr } : base;
  const h = Math.round(size * 2.2);
  const cloth = CLOTHING.find((x) => x.id === clothingId);
  const overlay = cloth && cloth.id !== "none" ? cloth.svg(c) : "";
  const pet = animalEmoji
    ? `<text x="78" y="198" font-size="24" text-anchor="middle">${animalEmoji}</text>`
    : "";
  return `
    <div class="doodle ${className}" style="width:${size}px;height:${h}px" title="${base.name}" data-char="${base.id}">
      <svg viewBox="0 0 96 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${bodySvg(c)}
        ${overlay}
        ${pet}
      </svg>
    </div>
  `;
}

/** Painted portrait when available (title / picker); falls back to doodle. */
export function renderPortrait(characterId, { size = 120, className = "" } = {}) {
  const c = getCharacter(characterId);
  if (c.portrait) {
    return `<img class="char-portrait ${className}" src="${c.portrait}" alt="${c.name}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:cover;object-position:center 18%;border-radius:18px" />`;
  }
  return renderDoodle(characterId, { size: Math.round(size * 0.55), className });
}

export function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
export function getPower(id) {
  return SUPERPOWERS.find((p) => p.id === id) || SUPERPOWERS[0];
}
export function getClothing(id) {
  return CLOTHING.find((c) => c.id === id) || CLOTHING[0];
}
