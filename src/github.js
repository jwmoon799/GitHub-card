const profileCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export async function getProfile(username) {
  const key = username.toLowerCase();
  const cached = profileCache.get(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached.profile;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (response.status === 404) throw new Error('해당 GitHub 계정을 찾을 수 없어요. 아이디를 확인해주세요.');
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub 요청이 제한되었어요. 잠시 후 다시 시도해주세요.');
    }
    if (!response.ok) throw new Error('GitHub에서 정보를 가져오지 못했어요. 잠시 후 다시 시도해주세요.');
    const profile = await response.json();
    if (profile.type !== 'User') throw new Error('개인 계정의 GitHub 아이디를 입력해주세요. 조직 계정은 지원하지 않아요.');
    profileCache.set(key, { profile, savedAt: Date.now() });
    return profile;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('응답 시간이 길어지고 있어요. 잠시 후 다시 시도해주세요.');
    if (error instanceof TypeError) throw new Error('인터넷 연결을 확인한 뒤 다시 시도해주세요.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
