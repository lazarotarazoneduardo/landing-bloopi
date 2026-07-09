import { LiveChatPompa } from '../components/LiveChatPompa'
import { WaitlistForm }  from '../components/WaitlistForm'

export function Hero() {
  return (
    <header className="hero" aria-label="Presentación">
      <div className="hero__content">
        <span className="hero__eyebrow">
          <i aria-hidden="true" /> Beta cerrada en marcha · quedan plazas
        </span>

        <h1>
          Lo mejor de tu grupo no debería <em>morir en el chat.</em>
        </h1>

        <p className="hero__sub">
          Bloopi es la red social donde el protagonista es tu grupo: el chat vive 3 días,
          y lo que merece quedarse se rescata como Loops y Blops que tu gente revive en el feed.
        </p>

        <WaitlistForm cta="Quiero entrar antes" />
        <p className="hero__micro">Sin spam. Los primeros de la lista entran a la beta.</p>
      </div>

      <LiveChatPompa />
    </header>
  )
}
