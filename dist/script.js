const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const themeButton = $('.theme-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let desiredTheme = root.dataset.theme || 'light';
let themeTransition = null;
function applyTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  themeButton.setAttribute('aria-pressed', String(dark));
  $('meta[name="theme-color"]').content = dark ? '#17181d' : '#ffffff';
  try { localStorage.setItem('annelo-theme', theme); } catch {}
}
applyTheme(desiredTheme);
async function changeTheme() {
  if (themeTransition) return;
  while (root.dataset.theme !== desiredTheme) {
    const target = desiredTheme;
    if (document.startViewTransition && !reducedMotion.matches) {
      const transition = document.startViewTransition(() => applyTheme(target));
      themeTransition = transition;
      try { await transition.finished; } catch { applyTheme(target); }
      themeTransition = null;
    } else applyTheme(target);
  }
}
themeButton.addEventListener('click', () => {
  desiredTheme = desiredTheme === 'dark' ? 'light' : 'dark';
  changeTheme();
});
const chapters = $$('[data-chapter]');
function updateChapter() {
  const threshold = innerHeight * .4;
  let current = chapters[0];
  for (const section of chapters) if (section.getBoundingClientRect().top <= threshold) current = section;
  $$('.chapter-nav a').forEach(a => {
    const active = a.hash === `#${current.id}`;
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
  $$('.nav a').forEach(a => {
    const active = current.id === 'hello' ? a.hash === '#hello' : current.id === 'contact' ? a.hash === '#contact' : a.hash === '#web';
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
  });
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { updateChapter(); ticking = false; }); } }, { passive: true });
addEventListener('resize', updateChapter);
updateChapter();
// Progressive enhancement: the content is visible with scripts disabled.
if ('IntersectionObserver' in window) {
  if (!reducedMotion.matches) root.classList.add('js-motion');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
  $$('.capability:not(#automation), .process-section, .contact-section').forEach(section => {
    section.classList.add('reveal');
    revealObserver.observe(section);
  });
  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
  }, { threshold: .25 });
  $$('.illustration, .workbench').forEach(art => artObserver.observe(art));
}
$$('.mini-tabs button').forEach(button => button.addEventListener('click', () => {
  $$('.mini-tabs button').forEach(b => {
    b.classList.toggle('selected', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  $$('.demo-view').forEach(view => {
    view.hidden = view.id !== button.dataset.view;
    view.classList.remove('entering');
    if (!view.hidden) { void view.offsetWidth; view.classList.add('entering'); }
  });
}));
$('.sticker-blue').addEventListener('click', () => {
  const active = $('.workbench').classList.toggle('is-on');
  $('.bench-feedback').textContent = active ? 'Контакт есть ✓' : '↳';
  $('.sticker-blue').setAttribute('aria-pressed', String(active));
});
let copyTimer;
$('.copy-email').addEventListener('click', async () => {
  clearTimeout(copyTimer);
  try {
    await navigator.clipboard.writeText('annelo@bk.ru');
    $('.copy-status').textContent = 'Адрес скопирован ✓';
  } catch {
    $('.copy-status').textContent = 'annelo@bk.ru — выделите и скопируйте';
  }
  copyTimer = setTimeout(() => { $('.copy-status').textContent = ''; }, 5000);
});
