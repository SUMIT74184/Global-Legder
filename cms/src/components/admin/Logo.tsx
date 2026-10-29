// Login and "create first user" screens: the site's hand-drawn wordmark.
export default function Logo() {
  return (
    <div className="gl-logo">
      <span>The Global Ledger</span>
      <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 6 C 48 2, 118 9, 197 4" />
      </svg>
      <small>Admin</small>
    </div>
  )
}
