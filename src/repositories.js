const COLORS = ['#537955', '#8b9d59', '#b79a53', '#698d93', '#9981a1', '#bd866c'];
const KNOWN_COLORS = { JavaScript: '#a88c30', TypeScript: '#397da0', Python: '#64844b', HTML: '#ba7355', CSS: '#8d75a5', Java: '#a0805b', Go: '#538d93', Rust: '#9c7155' };
export function languageColor(language) {
  let hash = 0;
  for (const char of language) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return KNOWN_COLORS[language] || COLORS[hash % COLORS.length];
}

export function summarizeRepositories(repositories) {
  const counts = new Map();
  for (const repo of repositories) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
  }
  const classifiedCount = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const languages = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count, percent: count / classifiedCount * 100, color: languageColor(name) }));
  const featured = [...repositories].sort((a, b) =>
    b.stargazers_count - a.stargazers_count ||
    (b.updated_at || '').localeCompare(a.updated_at || '') ||
    a.name.localeCompare(b.name)
  ).slice(0, 3);
  return { languages, classifiedCount, featured };
}
