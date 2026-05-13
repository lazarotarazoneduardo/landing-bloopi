export function NavBar() {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="nav" role="navigation" aria-label="Navegación principal">
      <div className="nav__logo">
        <img src="/assets/logo_degradado.svg" alt="BLOOPI" />
        <span className="nav__wordmark">BLOOPI</span>
      </div>
      <button className="nav__cta" onClick={scrollToWaitlist}>
        Quiero estar dentro
      </button>
    </nav>
  )
}
