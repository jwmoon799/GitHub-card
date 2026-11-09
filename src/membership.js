// Calendar-year counting: the joining year is year 1, consistently in Korea time.
const yearFormatter = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Seoul', year: 'numeric' });
export function getMembership(createdAt, now = new Date()) {
  if (!createdAt) return null;
  const joined = new Date(createdAt);
  if (!Number.isFinite(joined.getTime()) || !Number.isFinite(now.getTime()) || joined > now) return null;
  const joinYear = Number(yearFormatter.format(joined));
  const currentYear = Number(yearFormatter.format(now));
  return { joinYear, yearNumber: currentYear - joinYear + 1 };
}
