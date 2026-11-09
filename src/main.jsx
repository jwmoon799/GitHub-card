import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    const value = username.trim();
    if (!value) return setMessage('GitHub 아이디를 입력해주세요.');
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) || value.includes('--')) {
      return setMessage('프로필 주소 대신 GitHub 아이디만 입력해주세요. 예: octocat');
    }
    setMessage(`입력 확인: ${value} · 실제 정보 조회는 다음 단계에서 연결합니다.`);
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
          <div className="input-row"><span className="at" aria-hidden="true">@</span><input id="username" value={username} onChange={event => {setUsername(event.target.value); setMessage('');}} placeholder="예: octocat" autoComplete="off" autoCapitalize="none" spellCheck="false" maxLength={80} aria-describedby="form-message" /><button type="submit">명함 만들기 <span aria-hidden="true">↗</span></button></div>
          <p className="form-message" id="form-message" role="status">{message || '현재는 화면 미리보기 단계입니다. 실제 계정 조회는 곧 연결됩니다.'}</p>
        </form>
        <div className="features"><span>로그인 없이</span><span>공개 프로필 기반</span><span>나만의 개발자 명함</span></div>
      </section>
      <section className="preview" aria-label="명함 디자인 예시">
        <div className="preview-heading"><span>THE CARD</span><span>01 / PREVIEW</span></div>
        <article className="card">
          <div className="card-top"><span className="card-logo">&lt;/&gt; DevCard</span><span className="sample">예시 데이터</span></div>
          <div className="identity"><div className="avatar" aria-hidden="true">D<span>✦</span></div><div><h2>코드 만드는 사람</h2><p>@developer</p></div></div>
          <p className="bio">작은 아이디어를 쓸모 있는 서비스로.<br />만들고, 배우고, 기록합니다.</p>
          <div className="stats"><div><strong>24</strong><span>공개 저장소</span></div><div><strong>128</strong><span>팔로워</span></div><div><strong>3</strong><span>대표 언어</span></div></div>
          <div className="language-title">저장소 대표 언어 분포</div><div className="language-bar"><i /><i /><i /></div><div className="languages"><span>TypeScript <b>50%</b></span><span>JavaScript <b>30%</b></span><span>Python <b>20%</b></span></div>
          <div className="project-title">FEATURED PROJECTS</div><div className="project"><span>⌘ &nbsp; awesome-project</span><span>☆ 42</span></div><div className="project"><span>⌘ &nbsp; little-side-project</span><span>☆ 18</span></div>
          <div className="card-bottom"><span>github.com/developer</span><span aria-hidden="true">↗</span></div>
        </article>
        <p className="preview-caption">당신의 다음 인사를 위한, 한 장.</p>
      </section>
    </main>
    <footer><span>Built with curiosity. Powered by GitHub.</span><span>DEV CARD / 2026</span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
