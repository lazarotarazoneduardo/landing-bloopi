import { useEffect, useRef } from 'react'
import { Footer } from '../sections/Footer'
import '../como-se-hizo.css'

/* ─────────────────────────────────────────────────────────────
   Cómo se construyó — el «making of» del método, no del producto.
   Hermana de /cronologia: aquella cuenta QUÉ pasó y cuándo; esta
   cuenta CÓMO se trabajó para que pasara. Todas las cifras salen
   del repo de la app (git log + grep, 13-08-2026).
   ───────────────────────────────────────────────────────────── */

const CIFRAS = [
  { n: '1.660', l: 'commits' },
  { n: '200', l: 'sesiones' },
  { n: '183', l: 'actualizaciones' },
  { n: '320', l: 'migraciones' },
]

const REGLAS = [
  {
    t: 'Arquitectura',
    d: 'Doce reglas, y una por encima de todas: si mañana cambiamos de proveedor de servidores, el número de archivos que hay que tocar fuera de la capa de servicios debe ser cero.',
  },
  {
    t: 'Diseño',
    d: 'Paleta, tipografía y espaciados con nombre propio. Un color que no está en el documento no se inventa sobre la marcha: se decide antes.',
  },
  {
    t: 'iPhone y Android',
    d: 'Siete reglas para tocar cámara, gestos, teclado o permisos sin que arreglar Android rompa el iPhone que ya funcionaba. Pasó una vez. No vuelve a pasar.',
  },
  {
    t: 'Coste de red',
    d: 'Diez reglas para que la app no gaste datos de más: firmas en lote, presencia sin sondeos, caché agresiva. El coste se diseña, no se descubre en la factura.',
  },
]

const CICLO = [
  {
    t: 'Abrir la brújula',
    d: 'Leer el mapa de ruta y confirmar qué toca hoy antes de abrir un solo archivo.',
  },
  {
    t: 'Auditar antes de tocar',
    d: 'Leer el archivo entero. Más de un «arreglo» resultó ser código que ya existía y nadie estaba llamando.',
  },
  {
    t: 'Construir por capas',
    d: 'Pantalla, datos, servicio, servidor. Nunca saltarse un escalón por comodidad.',
  },
  {
    t: 'Verificar en verde',
    d: 'Comprobación de tipos y revisión automática antes de guardar nada. Sin excepciones.',
  },
  {
    t: 'Una sola publicación',
    d: 'Todos los cambios de la tanda salen juntos. Una actualización cada vez, para saber siempre qué la rompió.',
  },
  {
    t: 'Probar en teléfono real',
    d: 'iPhone y Android, a mano. «Construido» no significa «comprobado» hasta que alguien lo toca.',
  },
  {
    t: 'Cerrar y recordar',
    d: 'Marcar hecho, mover lo que queda y guardar por escrito lo que se aprendió, para no volver a aprenderlo.',
  },
]

const CICATRICES = [
  {
    t: 'Quitar una excepción de plataforma es cambiar de plataforma',
    d: 'Una mejora validada en iPhone tumbó la grabación de vídeo en Android durante un mes entero.',
  },
  {
    t: 'Antes de aplicar un arreglo, intenta tumbarlo',
    d: '¿Seguro que hace algo? ¿Seguro que no rompe nada vivo? ¿Es un arreglo, o una función nueva disfrazada?',
  },
  {
    t: 'Comprueba el alcance antes de arreglar',
    d: 'Primera pregunta, siempre: ¿quién puede ver esto? Un fallo de privacidad no es un fallo visual.',
  },
  {
    t: 'Para probar un aviso, la obra tiene que ser nuestra',
    d: 'Probé una notificación sobre la publicación de un tester real y le llegó al móvil. Ahora se prueba en contenido propio.',
  },
]

const EVIDENCIA = [
  { n: '79', q: 'servicios que encapsulan todo el acceso al exterior', r: 'nada habla con el servidor por su cuenta' },
  { n: '323', q: 'archivos marcados como aislados del proveedor', r: 'la app se puede mudar sin reescribirse' },
  { n: '24', q: 'funciones de servidor propias', r: 'el móvil nunca sube ni descarga a pelo' },
  { n: '320', q: 'cambios de base de datos versionados', r: 'cero retoques a mano en la consola' },
  { n: '175', q: 'consultas de datos con caché', r: 'ninguna pantalla pide a la red por su cuenta' },
  { n: '121', q: 'archivos con estilos derivados del tema', r: 'el modo oscuro entró sin tocar el claro' },
]

export function ComoSeHizoPage() {
  const rootRef = useRef<HTMLDivElement>(null)

  /* Revelado al entrar en pantalla — mismo patrón que /cronologia */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = root.querySelectorAll<HTMLElement>('.cs-rv')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(el => el.classList.add('on'))
      return
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('on')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="cs">
      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <a className="nav__logo" href="/" aria-label="Volver al inicio">
          <img src="/assets/logo_degradado.svg" alt="BLOOPI" />
          <span className="nav__wordmark">BLOOPI</span>
        </a>
        <a className="nav__link" href="/cronologia">Cronología</a>
        <a className="nav__cta" href="/#waitlist">Entrar en la beta</a>
      </nav>

      <header className="cs-hero">
        <span className="cs-eyebrow">El making of</span>
        <h1>
          Cómo se <em>construyó</em> Bloopi.
        </h1>
        <p className="cs-lead">
          Una red social entera —chat, vídeo, grupos, tienda, dos tiendas de
          aplicaciones— levantada en cuatro meses por una persona con Claude Code.
          Esto no va de lo que hace la app. Va del <strong>método</strong> que la hizo
          posible, y de las cifras del repositorio que lo demuestran.
        </p>
        <div className="cs-figs" role="list" aria-label="Cifras del proyecto">
          {CIFRAS.map(c => (
            <span className="cs-fig" role="listitem" key={c.l}>
              <b>{c.n}</b>
              {c.l}
            </span>
          ))}
        </div>
      </header>

      <main>
        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Cimiento</span>
          <h2>Las reglas se escribieron antes que el código.</h2>
          <p className="cs-body">
            Trabajar rápido con una inteligencia artificial no consiste en pedirle cosas
            más deprisa. Consiste en que no pueda equivocarse en lo importante. Antes de
            la primera pantalla escribí una constitución: cuatro documentos que se cargan
            al empezar cada sesión de trabajo. Si una solución los viola,{' '}
            <strong>no se implementa</strong> — se propone la correcta y se explica por qué.
          </p>
          <div className="cs-cards">
            {REGLAS.map(r => (
              <article className="cs-card" key={r.t}>
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Contexto</span>
          <h2>Una brújula y un archivo, separados a propósito.</h2>
          <p className="cs-body">
            Cuatro meses de proyecto generan tanta documentación que acaba siendo un
            pantano donde nada parece actual. La solución fue partirla en dos, con papeles
            distintos y una regla explícita sobre cuál manda.
          </p>
          <div className="cs-split">
            <article className="cs-card cs-card--wide">
              <span className="cs-tag">Manda</span>
              <h3>El mapa de ruta</h3>
              <p>
                Seis mil líneas que dicen qué está en marcha, qué se acaba de cerrar y en
                qué actualización viaja. Cada decisión de «qué hago ahora» sale de aquí, y
                se actualiza en la misma tanda en que se cierra el trabajo.
              </p>
            </article>
            <article className="cs-card cs-card--wide">
              <span className="cs-tag cs-tag--soft">Se consulta</span>
              <h3>El histórico</h3>
              <p>
                Otras seis mil líneas de relato: qué se probó, qué se descartó y por qué.
                Se lee cuando hace falta, pero no da órdenes. Distinguir una cosa de la
                otra es la mitad de la técnica.
              </p>
            </article>
          </div>
          <p className="cs-body">
            Encima de eso, cada trozo de trabajo lleva un identificador propio que viaja
            entero: aparece en el mapa de ruta, en el registro de cambios, en los
            comentarios del código y en la modificación de la base de datos. Cuatro meses
            después se puede reconstruir cualquier función de la app tirando de ese hilo.
          </p>
        </section>

        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Ejecución</span>
          <h2>El mismo ciclo, doscientas veces.</h2>
          <p className="cs-body">
            El orden importa y no varía. El último paso es el que casi todo el mundo se
            salta: cerrar por escrito. Un trabajo que no se cierra es un trabajo que la
            próxima sesión vuelve a empezar desde cero.
          </p>
          <ol className="cs-ciclo">
            {CICLO.map(p => (
              <li key={p.t}>
                <b>{p.t}</b>
                <span>{p.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Diagnóstico</span>
          <h2>Encontrar el fallo sin tener el teléfono delante.</h2>
          <p className="cs-body">
            Casi todo el desarrollo se hizo sin un dispositivo a mano para reproducir los
            fallos. La técnica es cambiar la observación por{' '}
            <strong>deducción con pruebas</strong>: lanzar peticiones al servidor de
            producción diseñadas para fallar —una petición inválida nunca escribe nada— y
            leer el código de error para saber en qué rama está el problema.
          </p>
          <div className="cs-caso">
            <span className="cs-tag">Caso real · 13 de agosto</span>
            <dl>
              <dt>El síntoma</dt>
              <dd>
                Los adhesivos comprados de uno en uno aparecían en la bandeja, pero no se
                dejaban enviar. Ni mensaje de error útil, ni teléfono a mano.
              </dd>
              <dt>La deducción</dt>
              <dd>
                El comentario de texto viajaba por la misma llamada al servidor y sí
                funcionaba. Luego el fallo estaba, por fuerza, en la rama del adhesivo.
              </dd>
              <dt>La causa</dt>
              <dd>
                Había dos formas de poseer un adhesivo —el paquete entero y la unidad
                suelta— y el control de envío solo miraba la primera. Visible, y no usable.
              </dd>
              <dt>El cierre</dt>
              <dd>
                Un único control en la base de datos que ambas formas atraviesan, publicado
                como cambio versionado. Diagnosticado y arreglado sin encender un móvil.
              </dd>
            </dl>
          </div>
        </section>

        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Continuidad</span>
          <h2>Las cicatrices se guardan por escrito.</h2>
          <p className="cs-body">
            Una inteligencia artificial empieza cada mañana sin recordar nada. Por eso hay
            170 hechos guardados en disco: cómo trabajo, qué correcciones he dado y —lo más
            valioso— los errores que costaron días, escritos con su porqué. Es la
            diferencia entre una herramienta y un oficio que se acumula.
          </p>
          <div className="cs-cards">
            {CICATRICES.map(c => (
              <article className="cs-card cs-card--quote" key={c.t}>
                <h3>«{c.t}»</h3>
                <p>{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cs-sec cs-rv">
          <span className="cs-kicker">Evidencia</span>
          <h2>Lo que compró la disciplina.</h2>
          <p className="cs-body">
            Ninguna de estas cifras es una declaración de intenciones: todas se comprueban
            con una búsqueda en el repositorio. Cada una es una regla que sobrevivió a
            cuatro meses de prisa.
          </p>
          <ul className="cs-ev">
            {EVIDENCIA.map(e => (
              <li key={e.n + e.q}>
                <b>{e.n}</b>
                <span className="cs-ev__q">{e.q}</span>
                <span className="cs-ev__r">{e.r}</span>
              </li>
            ))}
          </ul>
          <p className="cs-body">
            La última línea es la prueba más limpia. El modo oscuro entró en la aplicación
            entera y el modo claro —ya validado por los testers— no se tocó ni una vez. Eso
            solo es posible si el patrón se decidió antes y se respetó ciento veintiuna
            veces seguidas.
          </p>
        </section>
      </main>

      <section className="cs-outro">
        <h2>
          Rápido no es <em>a lo loco.</em>
        </h2>
        <p className="cs-lead cs-lead--center">
          Bloopi se hizo deprisa porque las reglas se escribieron despacio. Si quieres ver
          en qué quedó, la beta está abierta.
        </p>
        <div className="cs-outro__acts">
          <a className="cs-outro__cta" href="/#waitlist">Entrar en la beta</a>
          <a className="cs-outro__alt" href="/cronologia">Ver la cronología →</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
