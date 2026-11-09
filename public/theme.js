// Apply the theme before the page paints; only a reload advances the sequence.
(() => {
  const themes = [
    { name: 'green', background: '#101813' },
    { name: 'blue', background: '#101925' },
    { name: 'red', background: '#241316' },
    { name: 'yellow', background: '#201d10' },
    { name: 'white', background: '#f4f5f7' },
  ];
  let index = 0;
  try {
    const saved = sessionStorage.getItem('devcard-theme-index');
    if (saved !== null && /^[0-4]$/.test(saved)) {
      index = Number(saved);
      if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
        index = (index + 1) % themes.length;
      }
    }
    sessionStorage.setItem('devcard-theme-index', String(index));
  } catch {
    // Browsers that block storage can still display and use the app.
  }
  document.documentElement.dataset.theme = themes[index].name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[index].background);
})();
