/* Light/dark toggle. The saved choice is restored by a tiny inline script in <head> to avoid a flash. */
(function () {
  const root = document.documentElement, btn = document.getElementById('themeBtn');
  const mq = matchMedia('(prefers-color-scheme:dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches);
  function sync() {
    const d = isDark();
    btn.dataset.mode = d ? 'dark' : 'light';
    btn.setAttribute('aria-label', d ? 'Switch to light theme' : 'Switch to dark theme');
  }
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('lir-theme', next); } catch (e) {}
    sync();
  });
  mq.addEventListener('change', sync);
  sync();
})();
