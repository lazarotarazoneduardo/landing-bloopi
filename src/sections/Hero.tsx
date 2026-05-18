import { BloopiMetaballs } from '../components/BloopiMetaballs'

const FLOAT_TAGS = [
  { text: 'Early access soon',       style: { top: '18%',  left: '6%'  }, rot: '-3deg', dur: '9s',  delay: '0s'    },
  { text: 'Groups first',            style: { top: '12%',  right: '8%' }, rot: '2deg',  dur: '11s', delay: '-3s'   },
  { text: 'Built in Spain',          style: { bottom: '22%',left: '5%' }, rot: '-2deg', dur: '8s',  delay: '-5s'   },
  { text: 'Made for the world',      style: { bottom: '28%',right:'6%' }, rot: '3deg',  dur: '13s', delay: '-2s'   },
  { text: 'Tu grupo también importa',style: { top: '42%',  left: '3%'  }, rot: '-4deg', dur: '10s', delay: '-7s'   },
  { text: 'Los primeros entran antes',style:{ top: '55%',  right:'4%'  }, rot: '2deg',  dur: '12s', delay: '-4s'   },
]

export function Hero() {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" aria-label="Hero">

      {/* Background decorative blobs */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-bg__blob hero-bg__blob--1" />
        <div className="hero-bg__blob hero-bg__blob--2" />
        <div className="hero-bg__blob hero-bg__blob--3" />
        <div className="hero-bg__grid" />
      </div>

      {/* Animated orb canvas */}
      <div className="hero__canvas-wrap" aria-hidden="true">
        <BloopiMetaballs />
      </div>

      {/* Floating micro-tags */}
      <div className="float-tags" aria-hidden="true">
        {FLOAT_TAGS.map((tag, i) => (
          <span
            key={i}
            className="float-tag"
            style={{
              ...tag.style,
              '--rot':         tag.rot,
              '--drift-dur':   tag.dur,
              '--drift-delay': tag.delay,
            } as unknown as React.CSSProperties}
          >
            {tag.text}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Coming soon
        </div>

        <img
          className="hero__logo"
          src="/assets/logo_degradado.svg"
          alt="BLOOPI"
        />

        <h1 className="hero__headline">
          Made in Spain.<br />
          <em>Made for the world.</em>
        </h1>

        <p className="hero__sub">
          Nacida en España. Pensada para todo el mundo.
        </p>

        <p className="hero__claim">
          La primera red social donde no solo importas tú.
          Importa tu grupo.
        </p>

        <div className="hero__actions">
          <button className="btn-primary" onClick={scrollToWaitlist}>
            Quiero estar dentro
          </button>
          <button className="btn-secondary" onClick={scrollToWaitlist}>
            Acceso anticipado
          </button>
        </div>
      </div>

    </section>
  )
}
