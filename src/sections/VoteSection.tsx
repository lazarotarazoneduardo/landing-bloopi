import { useEffect, useState } from 'react'
import { useReveal } from '../hooks/useReveal'

export function VoteSection() {
  const ref = useReveal()
  const [secs, setSecs] = useState(47)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setSecs(s => (s > 0 ? s - 1 : 59)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="sec vote-sec" aria-labelledby="vote-title">
      <div className="sec__inner">
        <div ref={ref} className="vote-grid rv">

          <div>
            <span className="sec__eyebrow">🗳 Democracia de verdad</span>
            <h2 id="vote-title">
              La foto, el fondo, hasta quién entra o sale: <em>el grupo lo vota.</em>
            </h2>
            <p className="lead">
              En Bloopi no hay admin dictador. Las decisiones del grupo — desde el
              wallpaper del chat hasta expulsar a alguien o nombrar admin — se abren
              a votación con cuenta atrás. Gana el grupo, no el que creó el chat.
            </p>
          </div>

          <div className="vote-card" aria-hidden="true">
            <div className="vote-card__bar" />
            <div className="vote-card__body">
              <span className="vote-card__kind">Votación abierta</span>
              <p className="vote-card__q">¿Nueva foto de grupo la del rooftop? 📸</p>
              <div className="vote-row">
                <span className="lbl"><span>Sí, clarísimo</span><b>72%</b></span>
                <span className="track"><span className="fill" style={{ '--w': '72%' } as React.CSSProperties} /></span>
              </div>
              <div className="vote-row">
                <span className="lbl"><span>Me niego, salgo fatal</span><b>28%</b></span>
                <span className="track"><span className="fill fill--soft" style={{ '--w': '28%' } as React.CSSProperties} /></span>
              </div>
            </div>
            <div className="vote-card__foot">
              <span>8 de 11 han votado</span>
              <b>0:{String(secs).padStart(2, '0')}</b>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
