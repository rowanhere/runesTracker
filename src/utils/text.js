export function normalizeText(input) {
  return (input ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function bigrams(s) {
  const arr = [];
  for (let i = 0; i < s.length - 1; i++) {
    arr.push(s.slice(i, i + 2));
  }
  return arr;
}

export function diceCoefficient(a, b) {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);
  if (!s1 && !s2) return 1;
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const b1 = bigrams(s1);
  const b2 = bigrams(s2);
  if (!b1.length || !b2.length) return 0;
  const map = new Map();
  for (const bg of b1) map.set(bg, (map.get(bg) || 0) + 1);
  let intersection = 0;
  for (const bg of b2) {
    const cnt = map.get(bg) || 0;
    if (cnt > 0) {
      intersection++;
      map.set(bg, cnt - 1);
    }
  }
  return (2 * intersection) / (b1.length + b2.length);
}

export function bestFuzzyMatches(query, candidates, { topK = 10 } = {}) {
  const q = normalizeText(query);
  const scored = candidates.map((value) => {
    const norm = normalizeText(value);
    const score = diceCoefficient(q, norm);
    return { value, norm, score };
  }).sort((a, b) => b.score - a.score || a.value.localeCompare(b.value));
  return scored.slice(0, topK);
}
