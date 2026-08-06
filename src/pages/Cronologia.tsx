import { useEffect, useRef, useState } from 'react'
import { Footer } from '../sections/Footer'
import '../cronologia.css'

/* ─── Datos: la historia real del repo (git log + roadmap, 06-08-2026) ─── */

interface Hito {
  fecha: string
  titulo: string
  texto: string
  hoy?: boolean
}

interface Era {
  id: string
  mes: string
  nombre: string
  hitos: Hito[]
}

const ERAS: Era[] = [
  {
    id: 'esqueleto',
    mes: 'Abril ’26',
    nombre: 'El esqueleto',
    hitos: [
      {
        fecha: '16 abr',
        titulo: 'Nace Bloopi',
        texto:
          'Primer commit. Un repo vacío y una idea clara: la red social que empieza en tu grupo. Los primeros días levantan los cimientos — cuentas, perfiles y seguridad.',
      },
    ],
  },
  {
    id: 'vida',
    mes: 'Mayo ’26',
    nombre: 'La app cobra vida',
    hitos: [
      {
        fecha: '6 may',
        titulo: 'El primer chat en tiempo real',
        texto:
          'En un solo día Bloopi pasa de esqueleto a red social viva: chat en tiempo real, modo espectador desde el minuto uno y el vídeo circular en burbuja.',
      },
      {
        fecha: '7 may',
        titulo: 'Los Loops llegan al Home',
        texto:
          'El chat vive 3 días y desaparece. Un Loop rescata un momento antes de que muera — para siempre. Ese día también estrenamos icono y splash candy.',
      },
      {
        fecha: '12 may',
        titulo: 'La primera votación',
        texto:
          'Nace la gobernanza democrática: el grupo vota su fondo, sus cambios, todo. En Bloopi no manda nadie — mandan todos.',
      },
      {
        fecha: '19 may',
        titulo: 'Push y reacciones efímeras',
        texto:
          'Notificaciones push, centro de notificaciones y reacciones emoji que viven y mueren con el chat.',
      },
      {
        fecha: '22 may',
        titulo: 'La Pompa 🫧',
        texto:
          'Las reacciones del espectador se convierten en una pompa de jabón flotante, con destellos. Nace el símbolo de la marca.',
      },
    ],
  },
  {
    id: 'calma',
    mes: 'Junio ’26',
    nombre: 'La calma',
    hitos: [
      {
        fecha: 'jun',
        titulo: 'Auditorías y cimientos',
        texto:
          'El mes tranquilo: 23 commits, auditorías profundas y deuda técnica pagada. La calma antes de los 653 commits de julio.',
      },
    ],
  },
  {
    id: 'sprint',
    mes: 'Julio ’26',
    nombre: 'El gran sprint',
    hitos: [
      {
        fecha: '3 jul',
        titulo: 'Rediseño con alma',
        texto:
          'Ola masiva de rediseño: chats con alma, audio con waveform arrastrable y el Loop exportado a vídeo para compartirlo fuera de la app.',
      },
      {
        fecha: '6 jul',
        titulo: 'Blops y Salas',
        texto:
          'El día grande. Nacen los Blops — las fotos del chat con la conversación encima, en formato reel — y las Salas: encuentros efímeros que pueden cristalizar en un grupo de verdad.',
      },
      {
        fecha: '8 jul',
        titulo: 'Primeros testers reales',
        texto:
          'Bloopi llega a TestFlight y arranca el ciclo de feedback con testers de carne y hueso.',
      },
    ],
  },
  {
    id: 'identidad',
    mes: 'Julio ’26',
    nombre: 'Identidad propia',
    hitos: [
      {
        fecha: '14 jul',
        titulo: 'El Estudio de stickers',
        texto:
          'Tienda, colección y un estudio de creador completo: recorta cualquier foto, conviértela en sticker con capas y texto, y compártela en el feed de artistas.',
      },
      {
        fecha: '16 jul',
        titulo: 'La urna de cristal',
        texto:
          'Las votaciones se rediseñan como una urna de cristal líquido: voto inline, votantes visibles, transparencia real.',
      },
      {
        fecha: '17 jul',
        titulo: 'La Capitanía 🛡️',
        texto:
          'Muere la coronita de admin. Nace un liderazgo democrático con rastro: quien capitanea, responde ante el grupo.',
      },
      {
        fecha: '18 jul',
        titulo: 'El Zumbido 🐝',
        texto:
          'El capitán dispara un Zumbido y todo el grupo captura su Momento a la vez. Las historias del grupo son sus Momentos.',
      },
    ],
  },
  {
    id: 'beta',
    mes: 'Julio ’26',
    nombre: 'La beta se abre',
    hitos: [
      {
        fecha: '21 jul',
        titulo: 'Camino a las tiendas',
        texto:
          'Build 1.0.3 a TestFlight, push de iOS por fin resuelto y el primer Android firmado rumbo a Google Play.',
      },
      {
        fecha: '22 jul',
        titulo: 'Beta abierta 🫧',
        texto:
          'Luz verde tras el QA en dispositivo: el build 26 sale al grupo Beta Bloopi con link público. Los primeros 50 entran. Se estrena El Soplo, el onboarding con pompas guía.',
      },
      {
        fecha: '23 jul',
        titulo: 'También en Android',
        texto:
          'Bloopi sube a Google Play en prueba interna: la beta deja de ser solo de iPhone. Cuatro mejoras publicadas en directo durante el QA del mismo día.',
      },
    ],
  },
  {
    id: 'pulido',
    mes: 'Julio ’26',
    nombre: 'El pulido',
    hitos: [
      {
        fecha: '24 jul',
        titulo: 'Auditoría a fondo',
        texto:
          'Una revisión completa de la app: 154 hallazgos anotados y clasificados. Ese mismo día, ocho zonas del chat que iban a golpe de refresco pasan a tiempo real.',
      },
      {
        fecha: '25 jul',
        titulo: 'Votar deja de ser un formulario',
        texto:
          'Todas las decisiones duran una hora y se ven como un tira y afloja de cristal. Y quien gana la propuesta de capitán, capitanea de verdad.',
      },
      {
        fecha: '28 jul',
        titulo: 'El tutorial que se juega',
        texto:
          'Muere el onboarding clásico. Ahora la app se enseña desde dentro: un chat de práctica, una votación real y un Loop que publicas tú.',
      },
      {
        fecha: '29 jul',
        titulo: 'Build 1.0.4 en las dos tiendas',
        texto:
          'El teclado del chat se reescribe entero y sale a App Store y Google Play el mismo día. El menú de long-press ya se siente como el de WhatsApp.',
      },
      {
        fecha: '31 jul',
        titulo: 'TikTok dentro, Bloopi fuera',
        texto:
          'Los enlaces de TikTok se ven sin salir del chat, y Bloopi aparece en el menú de compartir del móvil. El estudio de Blops estrena recorte de vídeo y sonido.',
      },
    ],
  },
  {
    id: 'economia',
    mes: 'Agosto ’26',
    nombre: 'La economía de burbujas',
    hitos: [
      {
        fecha: '3 ago',
        titulo: 'Un Loop se comparte como vídeo',
        texto:
          'Compositor propio: un Loop sale en vídeo a Instagram, TikTok o WhatsApp. Las notificaciones de grupo se agrupan en una sola conversación, y el buzón de Actividad se ordena por sectores.',
      },
      {
        fecha: '4 ago',
        titulo: 'Nacen las burbujas 🫧',
        texto:
          'La moneda de Bloopi. Se ganan acabando el tutorial o invitando a alguien, y se gastan en skins para tu burbuja de chat. La Tienda vende, la Colección viste.',
      },
      {
        fecha: '5 ago',
        titulo: 'El arranque se cuenta solo',
        texto:
          'Tres pompas componen el logo y explotan: la app entra por su propia marca. Ese mismo día el chat aprende a olvidar de verdad — nada más de tres días.',
      },
      {
        fecha: '6 ago',
        titulo: 'Hoy',
        texto:
          'La beta sigue abierta mientras se prepara la infraestructura para crecer. Lo último: el arranque en cristal líquido, dibujado entero por vectores.',
        hoy: true,
      },
    ],
  },
]

/* Commits por día, sacados del git log (16-04 → 06-08). Un día ausente = 0. */
const DAILY: Record<string, number> = {
  '2026-04-16': 1, '2026-04-21': 3, '2026-04-23': 3, '2026-04-24': 2, '2026-04-27': 1,
  '2026-05-06': 19, '2026-05-07': 39, '2026-05-12': 44, '2026-05-13': 3, '2026-05-19': 7,
  '2026-05-20': 28, '2026-05-21': 36, '2026-05-22': 43, '2026-05-23': 1, '2026-05-29': 4,
  '2026-05-30': 3, '2026-05-31': 2, '2026-06-02': 4, '2026-06-29': 18, '2026-06-30': 1,
  '2026-07-02': 24, '2026-07-03': 52, '2026-07-05': 7, '2026-07-06': 43, '2026-07-07': 44,
  '2026-07-08': 23, '2026-07-09': 6, '2026-07-10': 7, '2026-07-13': 43, '2026-07-14': 45,
  '2026-07-15': 43, '2026-07-16': 48, '2026-07-17': 53, '2026-07-18': 23, '2026-07-19': 12,
  '2026-07-20': 79, '2026-07-21': 57, '2026-07-22': 27, '2026-07-23': 18, '2026-07-24': 52,
  '2026-07-25': 23, '2026-07-27': 58, '2026-07-28': 51, '2026-07-29': 49, '2026-07-30': 65,
  '2026-07-31': 68, '2026-08-02': 19, '2026-08-03': 43, '2026-08-04': 58, '2026-08-05': 31,
  '2026-08-06': 24,
}
const HEAT_START = '2026-04-16'
const HEAT_END = '2026-08-06'
const PEAK_DAY = '2026-07-20'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function nivel(c: number): number {
  if (c === 0) return 0
  if (c < 10) return 1
  if (c < 30) return 2
  if (c < 50) return 3
  if (c < 79) return 4
  return 5
}

/* ─── Heatmap del grind: un cuadrado = un día ─── */

function Heatmap() {
  const cells: { key: string; label: string; lvl: number; peak: boolean }[] = []
  const d = new Date(`${HEAT_START}T12:00:00`)
  const end = new Date(`${HEAT_END}T12:00:00`)

  // Huecos hasta el lunes de la primera semana (flujo por columnas, 7 filas)
  const lead = (d.getDay() + 6) % 7
  for (let i = 0; i < lead; i++) cells.push({ key: `pad-${i}`, label: '', lvl: -1, peak: false })

  while (d <= end) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const c = DAILY[key] ?? 0
    cells.push({
      key,
      label: `${d.getDate()} ${MESES[d.getMonth()]} · ${c === 0 ? 'sin commits' : `${c} commit${c === 1 ? '' : 's'}`}`,
      lvl: nivel(c),
      peak: key === PEAK_DAY,
    })
    d.setDate(d.getDate() + 1)
  }

  return (
    <div className="cr-heat">
      <div
        className="cr-heat__grid"
        role="img"
        aria-label="Mapa de commits por día, del 16 de abril al 6 de agosto de 2026. El día más intenso: 20 de julio, 79 commits."
      >
        {cells.map((c, i) =>
          c.lvl < 0 ? (
            <span key={c.key} className="cr-heat__cell cr-heat__cell--pad" />
          ) : (
            <span
              key={c.key}
              className={`cr-heat__cell h${c.lvl} ${c.peak ? 'cr-heat__cell--peak' : ''}`}
              style={{ animationDelay: `${i * 6}ms` }}
              title={c.label}
            />
          ),
        )}
      </div>
      <div className="cr-heat__foot">
        <span className="cr-heat__edge">16 abr</span>
        <span className="cr-heat__caption">
          Cada cuadrado es un día. Cuanto más oscuro, más horas de trabajo.
        </span>
        <span className="cr-heat__edge">hoy</span>
      </div>
    </div>
  )
}

/* ─── Contador que sube al entrar en pantalla ─── */

function Num({ to }: { to: number }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = String(to)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return
        io.disconnect()
        const t0 = performance.now()
        const dur = 1100
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur)
          const ease = 1 - Math.pow(1 - p, 3)
          el.textContent = String(Math.round(to * ease))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [to])

  return <b ref={ref}>0</b>
}

/* ─── Escenas del teléfono: qué ERA la app en cada era ─── */

const SPRINT_SHOTS = [
  {
    src: '/assets/v2/blop-rooftop-720.jpg',
    name: 'Marta',
    color: '#A66CFF',
    text: 'la mejor tarde de nuestra vida',
  },
  {
    src: '/assets/v2/blop-pizza-720.jpg',
    name: 'Vega',
    color: '#5AC8FA',
    text: '¿quién ha pedido CINCO pizzas?',
  },
]

function EscenaSprint({ on }: { on: boolean }) {
  const [shot, setShot] = useState(0)

  useEffect(() => {
    if (!on) return
    setShot(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setShot(s => (s + 1) % SPRINT_SHOTS.length), 2600)
    return () => clearInterval(id)
  }, [on])

  return (
    <div className={`cr-scene cr-scene--photo ${on ? 'on' : ''}`} aria-hidden="true">
      {SPRINT_SHOTS.map((s, i) => (
        <div key={s.src} className={`cr-shot ${i === shot ? 'on' : ''}`}>
          <img src={s.src} alt="" loading="lazy" />
          <span className="bbl bbl--in cr-shot__msg">
            <b style={{ color: s.color }}>{s.name}</b>
            {s.text}
          </span>
        </div>
      ))}
      <span className="cr-scene__loop-tag sc" style={{ transitionDelay: '0.35s' }}>BLOP ✦</span>
    </div>
  )
}

function Escena({ era, on }: { era: string; on: boolean }) {
  const cls = (extra = '') => `cr-scene ${extra} ${on ? 'on' : ''}`
  const d = (s: number) => ({ transitionDelay: `${s}s` })

  switch (era) {
    case 'esqueleto':
      return (
        <div className={cls('cr-scene--dark')} aria-hidden="true">
          <span className="sc cr-term" style={d(0)}>git init bloopi</span>
          <span className="sc cr-term cr-term--ok" style={d(0.25)}>✓ auth · perfiles · rls</span>
          <span className="sc cr-term cr-term--ok" style={d(0.5)}>✓ 301 migraciones por venir</span>
          <span className="cr-scene__cursor sc" style={d(0.7)} />
        </div>
      )
    case 'vida':
      return (
        <div className={cls()} aria-hidden="true">
          <span className="day sc" style={d(0)}>El chat vive 3 días</span>
          <span className="bbl bbl--in sc" style={d(0.15)}>
            <b style={{ color: '#A66CFF' }}>Marta</b>¿esto ya funciona? 😳
          </span>
          <span className="cr-scene__vnote sc" style={d(0.35)}>
            <img src="/assets/cronologia/vnote-selfie.jpg" alt="" loading="lazy" />
            <i />
          </span>
          <span className="bbl bbl--in sc" style={d(0.55)}>
            <b style={{ color: '#5AC8FA' }}>Leo</b>madre mía QUE VIVE
          </span>
          <span className="bbl bbl--out sc" style={d(0.75)}>bienvenidos a Bloopi 🫧</span>
        </div>
      )
    case 'calma':
      return (
        <div className={cls('cr-scene--photo cr-scene--calma')} aria-hidden="true">
          <img src="/assets/cronologia/junio-zen.jpg" alt="" loading="lazy" />
          <span className="day sc" style={d(0.15)}>Junio · la calma</span>
          <span className="bbl bbl--in sc" style={d(0.4)}>
            <b style={{ color: '#A66CFF' }}>Edu</b>este mes, silencio y lija fina 🧹
          </span>
        </div>
      )
    case 'sprint':
      return <EscenaSprint on={on} />
    case 'identidad':
      return (
        <div className={cls()} aria-hidden="true">
          <span className="cr-scene__sticker sc" style={d(0.5)}>🛡️🐝</span>
          <div className="cr-scene__vote sc" style={d(0.1)}>
            <div className="q">¿Cambiamos la foto del grupo?</div>
            <span className="track"><span className="fill fill--a" /></span>
            <span className="track"><span className="fill fill--soft fill--b" /></span>
          </div>
        </div>
      )
    case 'beta':
      return (
        <div className={cls('cr-scene--photo cr-scene--beta')} aria-hidden="true">
          <img src="/assets/cronologia/beta-fiesta.jpg" alt="" loading="lazy" />
          <div className="cr-scene__push sc sc--drop" style={d(0.15)}>
            <b>
              <img src="/assets/v2/favicon-32.png" alt="" />
              BLOOPI · ahora
            </b>
            La beta está abierta 🫧 Los primeros 50 ya están dentro.
          </div>
          <span className="cr-scene__testers sc" style={d(0.55)}>50/50 plazas ocupadas</span>
        </div>
      )
    case 'pulido':
      return (
        <div className={cls()} aria-hidden="true">
          <span className="cr-scene__sticker sc" style={d(0.1)}>⌨️</span>
          <div className="cr-scene__stores sc" style={d(0.35)}>
            <span> App Store</span>
            <span>▶ Google Play</span>
          </div>
          <span className="day sc" style={d(0.6)}>1.0.4 · el mismo día en las dos</span>
        </div>
      )
    case 'economia':
      return (
        <div className={cls()} aria-hidden="true">
          <span className="cr-scene__wallet sc" style={d(0.1)}>
            🫧 <b>300</b>
          </span>
          <div className="cr-scene__skins sc" style={d(0.35)}>
            <i className="sk sk--oro" />
            <i className="sk sk--aurora" />
            <i className="sk sk--cosmos" />
          </div>
          <span className="bbl bbl--out sc" style={d(0.6)}>tu burbuja, a tu gusto 🫧</span>
        </div>
      )
    default:
      return null
  }
}

/* ─── Página ─── */

export function CronologiaPage() {
  const [activeEra, setActiveEra] = useState(0)
  const [shownEra, setShownEra] = useState(0)
  const [switching, setSwitching] = useState(false)

  const flowRef = useRef<HTMLDivElement>(null)
  const railFillRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Cronología — BLOOPI'
  }, [])

  /* Fecha grande: crossfade al cambiar de era */
  useEffect(() => {
    if (activeEra === shownEra) return
    setSwitching(true)
    const id = window.setTimeout(() => {
      setShownEra(activeEra)
      setSwitching(false)
    }, 220)
    return () => clearTimeout(id)
  }, [activeEra, shownEra])

  /* Línea que se dibuja + barra de progreso (rAF sobre scroll) */
  useEffect(() => {
    const flow = flowRef.current
    const fill = railFillRef.current
    const bar = progressRef.current
    if (!flow || !fill || !bar) return

    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0
      bar.style.transform = `scaleX(${p})`

      const r = flow.getBoundingClientRect()
      const line = Math.min(1, Math.max(0, (doc.clientHeight * 0.55 - r.top) / r.height))
      fill.style.transform = `scaleY(${line})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* Hitos: se encienden al entrar (una vez) · Eras: sección que cruza el centro */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const items = root.querySelectorAll<HTMLElement>('.cr-item')
    if (reduced) {
      items.forEach(el => el.classList.add('on'))
      return
    }

    const ioItems = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('on')
            ioItems.unobserve(e.target)
          }
        }
      },
      { threshold: 0.3 },
    )
    items.forEach(el => ioItems.observe(el))

    const ioEras = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveEra(Number((e.target as HTMLElement).dataset.era))
          }
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    )
    root.querySelectorAll<HTMLElement>('[data-era]').forEach(el => ioEras.observe(el))

    return () => {
      ioItems.disconnect()
      ioEras.disconnect()
    }
  }, [])

  const era = ERAS[shownEra]

  return (
    <div ref={rootRef}>
      <div className="cr-progress" aria-hidden="true"><i ref={progressRef} /></div>

      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <a className="nav__logo" href="/" aria-label="Volver al inicio">
          <img src="/assets/logo_degradado.svg" alt="BLOOPI" />
          <span className="nav__wordmark">BLOOPI</span>
        </a>
        <a className="nav__link" href="/">Inicio</a>
        <a className="nav__cta" href="/#waitlist">Entrar en la beta</a>
      </nav>

      <header className="cr-hero">
        <h1>
          La historia de <em>Bloopi.</em>
        </h1>
        <div className="cr-stats" role="list" aria-label="Cifras del proyecto">
          <span className="cr-stat" role="listitem"><Num to={113} /> días</span>
          <span className="cr-stat" role="listitem"><Num to={1457} /> commits</span>
          <span className="cr-stat" role="listitem"><Num to={169} /> de madrugada</span>
          <span className="cr-stat" role="listitem"><Num to={79} /> el día pico</span>
        </div>
        <Heatmap />
        <span className="cr-scroll-hint" aria-hidden="true">Sigue bajando ↓</span>
      </header>

      <div className="cr-body">
        <aside className="cr-side" aria-hidden="true">
          <div className={`cr-date ${switching ? 'switching' : ''}`}>
            <span className="cr-date__month">{era.mes}</span>
            <span className="cr-date__era">{era.nombre}</span>
          </div>

          <div className="phone">
            <div className="phone__screen">
              <div className="phone__top">
                {ERAS.map((_, i) => (
                  <span key={i} className={`dot ${i <= shownEra ? 'done' : ''}`}>
                    <i />
                  </span>
                ))}
              </div>
              {ERAS.map((e, i) => (
                <Escena key={e.id} era={e.id} on={i === shownEra} />
              ))}
            </div>
          </div>
        </aside>

        <div className="cr-flow" ref={flowRef}>
          <div className="cr-rail" aria-hidden="true"><i ref={railFillRef} /></div>

          {ERAS.map((e, i) => (
            <section key={e.id} data-era={i} aria-label={`${e.mes} — ${e.nombre}`}>
              <h2 className="cr-era">{e.nombre}</h2>
              {e.hitos.map(h => (
                <article key={h.titulo} className={`cr-item ${h.hoy ? 'cr-item--today' : ''}`}>
                  <span className="cr-item__dot" aria-hidden="true" />
                  <div className={`cr-card ${h.hoy ? 'cr-card--today' : ''}`}>
                    <span className="cr-card__date">{h.fecha} ’26</span>
                    <h3>{h.titulo}</h3>
                    <p>{h.texto}</p>
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>

      <section className="cr-outro">
        <h2>
          Y esto <em>acaba de empezar.</em>
        </h2>
        <p className="lead lead--center">
          La beta está abierta. Si quieres probar Bloopi, entra.
        </p>
        <a className="cr-outro__cta" href="/#waitlist">Entrar en la beta</a>
      </section>

      <Footer />
    </div>
  )
}
