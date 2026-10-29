// Draft preview: refreshes itself when the draft is saved (the editor autosaves every 2 seconds),
// keeping the scroll position. Works in the admin's preview pane and in its own tab: it asks the
// site when the draft last changed, and inside the admin it also listens for the editor's
// "saved" messages. The Refresh button reloads at once.
export {};

const KEY = 'gl-preview-scroll';
const bar = document.querySelector<HTMLElement>('[data-preview-bar]');
const id = bar?.dataset.id;
const statusEl = bar?.querySelector<HTMLElement>('[data-preview-status]');

const saved = Number(sessionStorage.getItem(KEY) ?? NaN);
if (Number.isFinite(saved)) {
  sessionStorage.removeItem(KEY);
  requestAnimationFrame(() => window.scrollTo(0, saved));
}

const reload = () => {
  sessionStorage.setItem(KEY, String(window.scrollY));
  if (statusEl) statusEl.textContent = bar?.dataset.updating ?? '…';
  location.reload();
};

let timer: number | undefined;
const reloadSoon = (ms: number) => {
  clearTimeout(timer);
  timer = window.setTimeout(reload, ms);
};

bar?.querySelector('[data-preview-refresh]')?.addEventListener('click', reload);

// Inside the admin's preview pane.
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || typeof e.data !== 'object' || !e.data) return;
  if (e.data.type === 'payload-document-event') reloadSoon(300);
});

// Anywhere: compare the draft's last save time every 2.5 seconds while the tab is visible.
let last: string | undefined;
async function check() {
  if (document.hidden || !id) return;
  try {
    const res = await fetch(`/api/preview/${id}/`, { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return;
    const { updatedAt } = (await res.json()) as { updatedAt: string };
    if (last && updatedAt !== last) reload();
    last = updatedAt;
  } catch {
    // offline for a moment: try again on the next tick
  }
}
check();
setInterval(check, 2500);
document.addEventListener('visibilitychange', check);
