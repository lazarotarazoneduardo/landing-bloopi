export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__brand">
        <img src="/assets/logo_degradado.svg" alt="BLOOPI" />
        <span className="footer__copy">BLOOPI © 2026</span>
      </div>
      <span className="footer__tagline">
        Built in Spain &nbsp;·&nbsp; Made for the world
      </span>
      <a
        className="footer__instagram"
        href="https://www.instagram.com/edu10lazaro/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram de edu10lazaro"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
        @edu10lazaro
      </a>
    </footer>
  )
}
