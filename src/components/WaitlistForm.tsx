import { useState } from 'react'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Waitlist signup. Posts to a Formspree-compatible endpoint when
 * VITE_WAITLIST_ENDPOINT is set; otherwise stores locally so the
 * flow keeps working during development.
 */
export function WaitlistForm({ cta }: { cta: string }) {
  const [email, setEmail]         = useState('')
  const [consent, setConsent]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Introduce un email válido.')
      return
    }
    if (!consent) {
      setError('Marca la casilla de consentimiento para apuntarte.')
      return
    }
    setError('')
    const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined

    if (endpoint) {
      setSending(true)
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, source: 'landing-bloopi' }),
        })
        if (!res.ok) throw new Error(String(res.status))
        setSubmitted(true)
      } catch {
        setError('No se pudo enviar. Inténtalo de nuevo en un momento.')
      } finally {
        setSending(false)
      }
      return
    }

    // Development fallback: no endpoint configured yet
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('bloopi_waitlist') ?? '[]')
      if (!existing.includes(email)) {
        existing.push(email)
        localStorage.setItem('bloopi_waitlist', JSON.stringify(existing))
      }
    } catch { /* ignore storage errors */ }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="wl-success" role="alert">
        <div className="wl-success__icon" aria-hidden="true">🫧</div>
        <p>Ya estás en la lista. Te avisaremos cuando se abra tu hueco en la beta.</p>
      </div>
    )
  }

  return (
    <div className="wl">
      <form className="wl-form" onSubmit={handleSubmit} noValidate aria-label="Apuntarse a la lista de espera">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          aria-label="Tu email"
          autoComplete="email"
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Enviando…' : cta}
        </button>
      </form>
      <label className="wl-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => { setConsent(e.target.checked); setError('') }}
        />
        <span>
          Acepto que Bloopi guarde mi email solo para avisarme del lanzamiento.{' '}
          <a href="#privacidad">Cómo tratamos tus datos</a>.
        </span>
      </label>
      {error && <p className="wl-error" role="alert">{error}</p>}
    </div>
  )
}
