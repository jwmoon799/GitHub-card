export function getAverageStars(repositories) {
  if (!repositories.length) return null;
  return repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repositories.length;
}

export function formatAverageStars(value) {
  const rounded = Math.round(value * 10) / 10;
  return new Intl.NumberFormat('en-US', {
    notation: rounded >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(rounded).toLowerCase();
}
