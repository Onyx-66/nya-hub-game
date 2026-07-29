const TAKEN_NAMES_KEY = "nya-taken-names";

export function getTakenPseudonyms(): Set<string> {
  try {
    const raw = localStorage.getItem(TAKEN_NAMES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function isPseudonymAvailable(name: string): boolean {
  return !getTakenPseudonyms().has(name.toLowerCase().trim());
}

export function reservePseudonym(name: string): void {
  const taken = getTakenPseudonyms();
  taken.add(name.toLowerCase().trim());
  localStorage.setItem(TAKEN_NAMES_KEY, JSON.stringify([...taken]));
}

export function releasePseudonym(name: string): void {
  const taken = getTakenPseudonyms();
  taken.delete(name.toLowerCase().trim());
  localStorage.setItem(TAKEN_NAMES_KEY, JSON.stringify([...taken]));
}

const GUEST_ADJECTIVES = [
  "Sleepy", "Lazy", "Swift", "Lucky", "Shadow",
  "Pixel", "Turbo", "Mystic", "Cosmo", "Neon",
  "Fuzzy", "Curious", "Brave", "Silly", "Cosmic",
];

const GUEST_NOUNS = [
  "Cat", "Whiskers", "Paws", "Pounce", "Striker",
  "Hunter", "Leaper", "Scout", "Dash", "Spark",
  "Noodle", "Biscuit", "Mittens", "Shadow", "Storm",
];

export function generateGuestPseudonym(): string {
  const adj = GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  let num = Math.floor(Math.random() * 100);
  let name = `${adj}${noun}${num}`;
  while (!isPseudonymAvailable(name)) {
    num += 1;
    name = `${adj}${noun}${num}`;
  }
  return name;
}