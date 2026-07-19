/**
 * Pronunciation helpers for Native words used in Minnesota Portage.
 * Uses the browser Speech Synthesis API (no audio files required).
 * Phonetic spellings are shown so kids can read along.
 */

export const WORDS = {
  manoomin: {
    display: "manoomin",
    say: "muh NOO min",
    ipaHint: "muh-NOO-min",
    meaning: "Ojibwe word often translated as “good berry” — wild rice",
  },
  boozhoo: {
    display: "Boozhoo",
    say: "BOO zhoo",
    ipaHint: "BOO-zhoo",
    meaning: "An Ojibwe greeting — like “hello”",
  },
  anishinaabe: {
    display: "Anishinaabe",
    say: "ah nish ih NAH bay",
    ipaHint: "ah-nish-ih-NAH-bay",
    meaning: "The people — includes Ojibwe / Chippewa communities",
  },
  ojibwe: {
    display: "Ojibwe",
    say: "oh JIB way",
    ipaHint: "oh-JIB-way",
    meaning: "An Anishinaabe nation of the Great Lakes",
  },
  dakota: {
    display: "Dakota",
    say: "dah KOH tah",
    ipaHint: "dah-KOH-tah",
    meaning: "A nation whose homelands include Minnesota",
  },
  nokomis: {
    display: "Nokomis",
    say: "no KOH miss",
    ipaHint: "no-KOH-miss",
    meaning: "Ojibwe for grandmother",
  },
  bdote: {
    display: "Bdote",
    say: "b DOH tay",
    ipaHint: "b'doh-TAY",
    meaning: "Dakota name for the meeting of the Minnesota & Mississippi rivers",
  },
  "gichi-gami": {
    display: "Gichi-gami",
    say: "GIH chee GAH mee",
    ipaHint: "GIH-chee-GAH-mee",
    meaning: "Ojibwe name for Lake Superior — “great sea”",
  },
  itasca: {
    display: "Itasca",
    say: "eye TASS kuh",
    ipaHint: "eye-TASS-kah",
    meaning: "Headwaters lake of the Mississippi River",
  },
  awan: {
    display: "Awan",
    say: "AH wahn",
    ipaHint: "AH-wahn",
    meaning: "A helper’s name on your portage",
  },
  makoons: {
    display: "Makoons",
    say: "muh KOONS",
    ipaHint: "muh-KOONS",
    meaning: "Ojibwe for little bear — a helper’s name",
  },
  portage: {
    display: "portage",
    say: "POR tij",
    ipaHint: "POR-tij",
    meaning: "Carrying a canoe over land between two waters",
  },
};

let unlocked = false;

export function unlockAudio() {
  unlocked = true;
  // Warm up voices on first user gesture
  try {
    window.speechSynthesis?.getVoices();
  } catch (_) {}
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getWord(id) {
  return WORDS[id] || null;
}

/** Speak a word id from WORDS. Safe to call from click handlers. */
export function speakWord(id) {
  const w = WORDS[id];
  if (!w || !canSpeak()) return false;
  unlockAudio();
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w.say);
    u.rate = 0.85;
    u.pitch = 1.05;
    u.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en(-|_)US/i.test(v.lang) && /female|samantha|karen|moira|zira/i.test(v.name)) ||
      voices.find((v) => /en(-|_)US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
    return true;
  } catch (_) {
    return false;
  }
}

/** Inline “hear it” chip HTML for a word id. */
export function sayButton(id, { label } = {}) {
  const w = WORDS[id];
  if (!w) return label || id;
  const text = label || w.display;
  return `<button type="button" class="say-word" data-say="${id}" title="Hear: ${w.ipaHint} — ${w.meaning}">
    <span class="say-word-text">${text}</span>
    <span class="say-word-phonetic">${w.ipaHint}</span>
    <span class="say-word-icon" aria-hidden="true">🔊</span>
  </button>`;
}

/** Replace known words in plain text with say-buttons (case-insensitive whole words). */
export function linkNativeWords(htmlOrText) {
  let out = htmlOrText;
  const order = Object.keys(WORDS).sort((a, b) => b.length - a.length);
  for (const id of order) {
    const w = WORDS[id];
    const re = new RegExp(`\\b(${escapeReg(w.display)})\\b`, "gi");
    out = out.replace(re, (match) => sayButton(id, { label: match }));
  }
  return out;
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function bindSayButtons(root) {
  if (!root) return;
  root.querySelectorAll("[data-say]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      speakWord(btn.dataset.say);
    });
  });
}
