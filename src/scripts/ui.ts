// Small interactive bits: theme toggle, YouTube click-to-load, table-of-contents highlight,
// signed-in header link, saved state of Save buttons.

function setTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // storage blocked: the toggle still works for this page view
  }
}

function initThemeToggle() {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () =>
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'),
    );
  });
}

// Nothing loads from YouTube until the reader clicks play.
function initYouTube() {
  document.querySelectorAll<HTMLElement>('[data-yt]').forEach((box) => {
    box.querySelector('button')?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1`;
      iframe.title = box.dataset.ytTitle ?? 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      box.querySelector('.yt-frame')!.replaceChildren(iframe);
    });
  });
}

let tocIo: IntersectionObserver | undefined;

function initToc() {
  tocIo?.disconnect();
  const links = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]').forEach((a) => {
    links.set(decodeURIComponent(a.hash.slice(1)), a);
  });
  if (!links.size) return;
  tocIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        links.get(e.target.id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '0px 0px -70% 0px' },
  );
  links.forEach((_, id) => {
    const h = document.getElementById(id);
    if (h) tocIo!.observe(h);
  });
}

// `gl_session` is a non-secret flag cookie set at login (the real token is HTTP-only).
const signedIn = () => document.cookie.split('; ').some((c) => c === 'gl_session=1');

function initAuthLink() {
  if (!signedIn()) return;
  document.querySelectorAll<HTMLAnchorElement>('[data-auth-link]').forEach((a) => {
    a.href = '/account/';
    a.textContent = a.dataset.accountLabel ?? 'Account';
    if (location.pathname.startsWith('/account/')) a.setAttribute('aria-current', 'page');
  });
}

async function initSaveButtons() {
  const forms = document.querySelectorAll<HTMLFormElement>('[data-save-form]');
  if (!forms.length || !signedIn()) return;
  try {
    const res = await fetch('/api/account/save/', { credentials: 'same-origin' });
    const { saved } = (await res.json()) as { saved: number[] };
    forms.forEach((form) => {
      const id = Number(new FormData(form).get('id'));
      const isSaved = saved.includes(id);
      form.querySelector('[data-save-button]')?.setAttribute('aria-pressed', String(isSaved));
      const label = form.querySelector<HTMLElement>('[data-save-label]');
      if (label) label.textContent = (isSaved ? label.dataset.saved : label.dataset.save) ?? label.textContent;
    });
  } catch {
    // offline or server down: buttons keep working as plain forms
  }
}

export function initUi() {
  initThemeToggle();
  initYouTube();
  initToc();
  initAuthLink();
  initSaveButtons();
}
