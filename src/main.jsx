import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { getProfile, getRepositories } from './github.js';
import { summarizeRepositories } from './repositories.js';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [repoState, setRepoState] = useState({ status: 'idle', items: [], error: '' });
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    const value = username.trim();
    if (!value) return setMessage('GitHub 아이디를 입력해주세요.');
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) || value.includes('--')) {
      return setMessage('프로필 주소 대신 GitHub 아이디만 입력해주세요. 예: octocat');
    }
    setHasSearched(true);
    setProfile(null);
    setRepoState({ status: 'loading', items: [], error: '' });
    setLoading(true);
    setMessage('GitHub 공개 프로필을 불러오고 있어요.');
    try {
      const result = await getProfile(value);
      setProfile(result);
      setMessage('프로필 확인 완료! 공개 저장소를 분석하고 있어요.');
      try {
        const items = await getRepositories(result.login);
        setRepoState({ status: 'success', items, error: '' });
        setMessage(`${result.login}님의 개발자 명함을 만들었습니다.`);
      } catch (error) {
        setRepoState({ status: 'error', items: [], error: error.message });
        setMessage('프로필은 불러왔지만 저장소 분석에 실패했어요. 다시 검색하면 재시도합니다.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <div className="app">
    <header><a className="brand" href="/" aria-label="DevCard 홈"><span className="brand-icon">&lt;/&gt;</span> DevCard<span className="brand-dot">.</span></a><span className="header-note">YOUR CODE, YOUR IDENTITY</span></header>
    <main>
      <section className="intro">
        <div className="eyebrow"><span /> GITHUB DEVELOPER CARD</div>
        <h1>코드로 쌓은 나를,<br /><em>한 장의 명함으로.</em></h1>
        <p className="description">GitHub 아이디 하나면 충분해요.<br />프로젝트와 기술 스택을 담은 개발자 명함을 만들어보세요.</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor="username">GitHub 아이디</label>
          <div className="input-row"><span className="at" aria-hidden="true">@</span><input id="username" value={username} onChange={event => {setUsername(event.target.value); if (!loading) setMessage('');}} placeholder="예: octocat" autoComplete="off" autoCapitalize="none" spellCheck="false" maxLength={80} aria-describedby="form-message" /><button type="submit" disabled={loading}>{loading ? '불러오는 중…' : '명함 만들기'} <span aria-hidden="true">↗</span></button></div>
          <p className="form-message" id="form-message" role="status">{message || 'GitHub 아이디만 입력하세요. 로그인이나 토큰은 필요 없어요.'}</p>
        </form>
        <div className="features"><span>로그인 없이</span><span>공개 프로필 기반</span><span>나만의 개발자 명함</span></div>
      </section>
      <section className="preview" aria-label={profile ? "GitHub 개발자 명함" : "명함 미리보기"} aria-busy={loading}>
        <div className="preview-heading"><span>THE CARD</span><span>{profile ? '01 / YOUR PROFILE' : '01 / PREVIEW'}</span></div>
        {profile ? <ProfileCard key={profile.login} profile={profile} repoState={repoState} /> : hasSearched ? <div className="card empty-card"><span className="card-logo">&lt;/&gt; DevCard</span><h2>{loading ? '명함을 만들고 있어요' : '명함을 불러오지 못했어요'}</h2><p>{loading ? 'GitHub 공개 프로필을 확인하고 있습니다.' : '입력창 아래 안내를 확인한 뒤 다시 검색해주세요.'}</p></div> : <article className="card">
          <div className="card-top"><span className="card-logo">&lt;/&gt; DevCard</span><span className="sample">예시 데이터</span></div>
          <div className="identity"><div className="avatar" aria-hidden="true">D<span>✦</span></div><div><h2>코드 만드는 사람</h2><p>@developer</p></div></div>
          <p className="bio">작은 아이디어를 쓸모 있는 서비스로.<br />만들고, 배우고, 기록합니다.</p>
          <div className="stats"><div><strong>24</strong><span>공개 저장소</span></div><div><strong>128</strong><span>팔로워</span></div><div><strong>3</strong><span>대표 언어</span></div></div>
          <div className="language-title">저장소 대표 언어 분포</div><div className="language-bar"><i /><i /><i /></div><div className="languages"><span>TypeScript <b>50%</b></span><span>JavaScript <b>30%</b></span><span>Python <b>20%</b></span></div>
          <div className="project-title">FEATURED PROJECTS</div><div className="project"><span>⌘ &nbsp; awesome-project</span><span>☆ 42</span></div><div className="project"><span>⌘ &nbsp; little-side-project</span><span>☆ 18</span></div>
          <div className="card-bottom"><span>github.com/developer</span><span aria-hidden="true">↗</span></div>
        </article>}
        <p className="preview-caption">당신의 다음 인사를 위한, 한 장.</p>
      </section>
    </main>
    <footer><span>Built with curiosity. Powered by GitHub.</span><span>DEV CARD / 2026</span></footer>
  </div>;
}

function ProfileCard({ profile, repoState }) {
  const [imageFailed, setImageFailed] = useState(false);
  // A new profile gets its own image state, including after an earlier broken image.
  return <article className="card real-card">
    <div className="card-top"><span className="card-logo">&lt;/&gt; DevCard</span><span className="sample">GitHub 공개 프로필</span></div>
    <div className="identity">
      <div className="avatar">{!imageFailed ? <img key={profile.login} src={profile.avatar_url} alt={`${profile.login} 프로필 사진`} onError={() => setImageFailed(true)} /> : profile.login[0].toUpperCase()}</div>
      <div className="identity-text"><h2>{profile.name || profile.login}</h2><p>@{profile.login}</p></div>
    </div>
    <p className="bio">{profile.bio || '아직 등록된 소개가 없어요.'}</p>
    <div className="stats profile-stats"><div><strong>{profile.public_repos.toLocaleString('ko-KR')}</strong><span>공개 저장소</span></div><div><strong>{profile.followers.toLocaleString('ko-KR')}</strong><span>팔로워</span></div></div>
    <RepositoryDetails repoState={repoState} />
    <a className="card-bottom profile-link" href={profile.html_url} target="_blank" rel="noopener noreferrer"><span>github.com/{profile.login}</span><span aria-hidden="true">↗</span></a>
  </article>;
}

function RepositoryDetails({ repoState }) {
  if (repoState.status === 'loading') return <div className="repo-notice" role="status">공개 저장소를 분석하고 있어요…</div>;
  if (repoState.status === 'error') return <div className="repo-notice" role="status"><strong>저장소 분석을 완료하지 못했어요.</strong><p>{repoState.error}</p><p>같은 아이디로 다시 검색해주세요.</p></div>;
  const { items } = repoState;
  if (!items.length) return <div className="repo-notice"><strong>아직 공개 저장소가 없어요.</strong><p>비공개 저장소는 분석에 포함되지 않아요.</p></div>;
  const { languages, classifiedCount, featured } = summarizeRepositories(items);
  return <div className="repository-details">
    <h3 className="language-title">저장소 대표 언어 분포</h3>
    {languages.length ? <>
      <div className="language-bar" aria-hidden="true">{languages.map(language => <i key={language.name} style={{ width: `${language.percent}%`, background: language.color }} />)}</div>
      <ul className="language-list">{languages.map(language => <li key={language.name}><span className="language-name"><i style={{ background: language.color }} />{language.name}</span><span>{language.count}개 · {language.percent.toFixed(1)}%</span></li>)}</ul>
      <p className="analysis-note">언어가 있는 저장소 {classifiedCount}개 기준 · 코드 사용량과는 달라요.</p>
    </> : <p className="analysis-note no-language">아직 저장소에 대표 언어 정보가 없어요.</p>}
    <h3 className="project-title">스타가 많은 프로젝트 <span>TOP {featured.length}</span></h3>
    <div className="project-list">{featured.map(repo => <a key={repo.id} className="featured-project" href={repo.html_url} target="_blank" rel="noopener noreferrer">
      <div className="project-row"><strong>{repo.name}</strong><span className="star-count" aria-label={`스타 ${repo.stargazers_count}개`}>☆ {repo.stargazers_count.toLocaleString('ko-KR')}</span></div>
      {repo.description && <p>{repo.description}</p>}
      <div className="project-meta"><span>{repo.language || '언어 미분류'}</span>{repo.fork && <span>포크</span>}<span aria-hidden="true">↗</span></div>
    </a>)}</div>
    <p className="analysis-note analysis-scope">최근 업데이트된 공개 저장소 {items.length}개 분석 · 최대 100개 · 포크 포함</p>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
