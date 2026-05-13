const CARDS = [
  { accent: 'Acceso anticipado',   body: 'Los primeros tendrán acceso antes del lanzamiento público.' },
  { accent: 'Groups first',        body: 'Una nueva forma de estar juntos online. Tu grupo en el centro.' },
  { accent: 'Built in Spain',      body: 'Nacida aquí. Con ambición global desde el primer día.' },
  { accent: 'Premium & moderno',   body: 'Diseñada para quienes no se conforman con lo de siempre.' },
]

export function HypeSection() {
  return (
    <section className="section hype" aria-labelledby="hype-title">
      <div className="section__inner">

        <span className="section__label">Pre-lanzamiento</span>

        <h2 className="section__title" id="hype-title">
          No es otra red social más.
        </h2>

        <p className="section__body">
          BLOOPI está tomando forma. Una nueva experiencia social nacida
          para poner a los grupos en el centro. Todavía no está abierta.
          Pero cuando lo esté, querrás haber estado desde el principio.
        </p>

        <div className="hype__cards">
          {CARDS.map((card, i) => (
            <div className="hype__card" key={i}>
              <span className="hype__card-accent">{card.accent}</span>
              {card.body}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
