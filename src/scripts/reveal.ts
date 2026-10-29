// Scroll reveals. Elements with [data-reveal] get `.is-in` once they enter the viewport; CSS does the
// rest: fade + lift ("up", the default), "unfold" for notes, "stamp" for stamps. Any
// <path data-draw pathLength="1"> inside a revealed element draws itself in.
// Nothing is hidden unless JS is running (the `.js` class on <html>), so the page reads without it.

let io: IntersectionObserver | undefined;

export function initReveal() {
  io?.disconnect();
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io!.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io!.observe(el));
}
