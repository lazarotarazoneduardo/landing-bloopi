import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { WaitlistForm } from '../components/WaitlistForm'

const PILLARS = [
  { icon: '◉',  title: 'Loops que viven',      body: 'Los mejores momentos de tus chats se convierten en Loops que tu gente revive en el feed.' },
  { icon: '🫧', title: 'Grupos de verdad',      body: 'Chat con fotos, vídeo, notas circulares, historias y sesiones. Todo en tu círculo.' },
  { icon: '🗳', title: 'Democracia de verdad',  body: 'En Bloopi el grupo lo vota todo. Hasta quién entra o sale.' },
]

export function WaitlistSection() {
  const ref = useReveal()
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <section id="waitlist" className="sec final" aria-labelledby="waitlist-title">
      <div ref={ref} className="sec__inner rv">
        <span className="sec__eyebrow">Hecha en España · pensada para el mundo</span>
        <h2 id="waitlist-title">Los primeros <em>entran antes.</em></h2>
        <p className="lead lead--center">
          La beta ya está en marcha con grupos reales. Deja tu email y te avisamos
          cuando se abra tu hueco.
        </p>

        <div className="pillars">
          {PILLARS.map(p => (
            <div className="pillar" key={p.title}>
              <span className="ico" aria-hidden="true">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>

        <div className="final__form" onClickCapture={e => {
          const target = e.target as HTMLElement
          if (target.tagName === 'A' && target.getAttribute('href') === '#privacidad') {
            e.preventDefault()
            setShowPrivacy(true)
          }
        }}>
          <WaitlistForm cta="Quiero acceso anticipado" />
        </div>
        <p className="hero__micro">Sin spam. Solo el aviso cuando Bloopi abra tus puertas.</p>
      </div>

      {showPrivacy && (
        <div className="privacy-overlay" role="dialog" aria-modal="true" aria-label="Cómo tratamos tus datos">
          <div className="privacy-modal">
            <h3>Cómo tratamos tus datos</h3>
            <p>
              Tu email lo guarda el equipo de Bloopi con un único fin: avisarte del
              acceso anticipado y del lanzamiento. No lo compartimos con nadie, no
              hay listas de marketing de terceros y no te perfilamos.
            </p>
            <p>
              Puedes pedir que lo borremos en cualquier momento escribiendo a{' '}
              <a href="mailto:hola@bloopi.app">hola@bloopi.app</a> y desaparecerá de
              la lista. Sin preguntas.
            </p>
            <button className="privacy-close" onClick={() => setShowPrivacy(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
