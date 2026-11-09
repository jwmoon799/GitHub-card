import React, { useState } from 'react';
import { summarizeRepositories } from './repositories.js';
import { getMembership } from './membership.js';

const formatCount = value => value >= 1000000
  ? new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  : value.toLocaleString('ko-KR');

export function ProfileCard({ profile, repoState }) {
  const [imageFailed, setImageFailed] = useState(false);
  // A new profile gets its own image state, including after an earlier broken image.
  return <article className="card real-card">
    <div className="card-top"><span className="card-logo">&lt;/&gt; DevCard</span><span className="sample">GitHub 공개 프로필</span></div>
    <div className="identity">
      <div className="avatar">{!imageFailed ? <img key={profile.login} src={profile.avatar_url} alt={`${profile.login} 프로필 사진`} onError={() => setImageFailed(true)} /> : profile.login[0].toUpperCase()}</div>
      <div className="identity-text"><h2>{profile.name || profile.login}</h2><p>@{profile.login}</p></div>
      <MembershipBadge createdAt={profile.created_at} />
    </div>
    <p className="bio">{profile.bio || '아직 등록된 소개가 없어요.'}</p>
    <div className="stats profile-stats"><div><strong title={profile.public_repos.toLocaleString('ko-KR')}>{formatCount(profile.public_repos)}</strong><span>공개 저장소</span></div><div><strong title={profile.followers.toLocaleString('ko-KR')}>{formatCount(profile.followers)}</strong><span>팔로워</span></div></div>
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
      <div className="project-row"><strong title={repo.name}>{repo.name}</strong><span className="star-count" aria-label={`스타 ${repo.stargazers_count}개`}>☆ {formatCount(repo.stargazers_count)}</span></div>
      {repo.description && <p title={repo.description}>{repo.description}</p>}
      <div className="project-meta"><span>{repo.language || '언어 미분류'}</span>{repo.fork && <span>포크</span>}<span aria-hidden="true">↗</span></div>
    </a>)}</div>
    <p className="analysis-note analysis-scope">최근 업데이트된 공개 저장소 {items.length}개 분석 · 최대 100개 · 포크 포함</p>
  </div>;
}


export function MembershipBadge({ createdAt }) {
  const membership = getMembership(createdAt);
  if (!membership) return null;
  return <div className="membership" aria-label={`GitHub 가입 연도 기준 ${membership.yearNumber}년차 개발자, ${membership.joinYear}년 가입`}>
    <strong>{membership.yearNumber}년차 개발자</strong>
    <span>GitHub 가입 기준</span>
    <small>{membership.joinYear}년 가입</small>
  </div>;
}
