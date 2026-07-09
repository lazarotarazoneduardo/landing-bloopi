import { useEffect, useState } from 'react'
import { useReveal } from '../hooks/useReveal'

interface Sticker {
  style: React.CSSProperties & { '--rot'?: string }
  candy?: boolean
  name: string
  color?: string
  text: string
}

interface Slide {
  src: string
  alt: string
  stickers: Sticker[]
}

const SLIDES: Slide[] = [
  {
    src: '/assets/v2/blop-rooftop-720.jpg',
    alt: '',
    stickers: [
      { style: { top: '14%', left: '7%', '--rot': '-3deg' }, name: 'Marta', color: '#A66CFF', text: 'la mejor tarde de nuestra vida y lo sabéis' },
      { style: { top: '56%', right: '7%', '--rot': '2deg' }, candy: true, name: 'Leo', text: 'aquí se viene llorado de casa 😂' },
    ],
  },
  {
    src: '/assets/v2/blop-pizza-720.jpg',
    alt: '',
    stickers: [
      { style: { top: '12%', right: '8%', '--rot': '2deg' }, name: 'Vega', color: '#5AC8FA', text: '¿quién ha pedido CINCO pizzas?' },
      { style: { top: '52%', left: '7%', '--rot': '-2deg' }, candy: true, name: 'Pau', text: 'os quiero mucho pesados 🫧' },
    ],
  },
]

const SLIDE_MS = 4000

export function BlopSection() {
  const ref = useReveal()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setActive(a => (a + 1) % SLIDES.length), SLIDE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="sec" aria-labelledby="blop-title">
      <div className="sec__inner">
        <div ref={ref} className="blop-grid rv">

          <div className="phone" aria-hidden="true">
            <div className="phone__screen">
              <div className="phone__top">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i < active ? 'done' : ''} ${i === active ? 'active' : ''}`}
                  >
                    <i />
                  </span>
                ))}
              </div>
              <span className="phone__blop-tag">BLOP</span>

              {SLIDES.map((slide, i) => (
                <div key={i} className={`slide ${i === active ? 'on' : ''}`}>
                  <img src={slide.src} alt={slide.alt} loading="lazy" width="720" height="960" />
                  {slide.stickers.map((s, j) => (
                    <span
                      key={j}
                      className={`sticker ${s.candy ? 'sticker--candy' : ''}`}
                      style={s.style}
                    >
                      <b style={s.color ? { color: s.color } : undefined}>{s.name}</b>
                      {s.text}
                    </span>
                  ))}
                </div>
              ))}

              <div className="phone__foot">
                <div className="grp"><i>🫧</i> Los Bloopers</div>
                <div className="cap">El mejor finde de la historia 🫧 <span className="cap-more">… más</span></div>
                <div className="meta">💬 6 mensajes rescatados · 📸 2 recuerdos</div>
              </div>
            </div>
          </div>

          <div>
            <span className="sec__eyebrow">✦ Blops</span>
            <h2 id="blop-title">
              Las fotos, con la conversación <em>encima.</em>
            </h2>
            <p className="lead">
              Un Blop es el álbum del grupo hecho de verdad: las fotos y vídeos del chat
              con los mensajes reales colocados encima, cada uno con la voz y el color
              de quien lo dijo. Los mensajes rescatados viven ahí para siempre.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
