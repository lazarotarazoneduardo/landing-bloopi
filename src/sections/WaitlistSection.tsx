import { useState } from 'react'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function WaitlistSection() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Introduce un email válido.')
      return
    }
    // Persist in localStorage (no backend yet)
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('bloopi_waitlist') ?? '[]')
      if (!existing.includes(email)) {
        existing.push(email)
        localStorage.setItem('bloopi_waitlist', JSON.stringify(existing))
      }
    } catch {
      // ignore storage errors
    }
    setSubmitted(true)
    setError('')
  }

  return (
    <section
      id="waitlist"
      className="section section--alt waitlist"
      aria-labelledby="waitlist-title"
    >
      <div className="section__inner">

        <span className="section__label">Acceso anticipado</span>

        <h2 className="section__title" id="waitlist-title">
          Los primeros<br />
          <em>entran antes.</em>
        </h2>

        <p className="section__body">
          Estamos preparando los primeros accesos. Si quieres estar dentro
          desde el principio, deja tu señal.
        </p>

        {submitted ? (
          <div className="waitlist__success" role="alert">
            <div className="waitlist__success-icon" aria-hidden="true">✦</div>
            <p className="waitlist__success-text">
              Ya estás en la lista. Te avisaremos antes del lanzamiento.
            </p>
          </div>
        ) : (
          <>
            <form
              className="waitlist__form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Formulario de acceso anticipado"
            >
              <input
                className="waitlist__input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                aria-label="Tu email"
                autoComplete="email"
                required
              />
              <button className="waitlist__submit" type="submit">
                Quiero acceso anticipado
              </button>
            </form>
            {error && (
              <p style={{ marginTop: 10, fontSize: 13, color: '#8681A0' }} role="alert">
                {error}
              </p>
            )}
            <p className="waitlist__micro">
              Sin spam. Solo el aviso cuando BLOOPI abra sus primeras puertas.
            </p>
          </>
        )}

      </div>
    </section>
  )
}
