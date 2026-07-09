import { useReveal } from '../hooks/useReveal'

export function LoopSection() {
  const ref = useReveal()
  return (
    <section className="sec loop-sec" aria-labelledby="loop-title">
      <div className="sec__inner">
        <div ref={ref} className="loop-grid rv">
          <div>
            <span className="sec__eyebrow">◉ Loops</span>
            <h2 id="loop-title">
              El chat vive 3 días. <em>Los Loops, para siempre.</em>
            </h2>
            <p className="lead">
              En Bloopi la conversación es efímera: a los tres días desaparece.
              Pero cuando pasa algo grande, cualquiera del grupo selecciona ese trozo
              de conversación y lo convierte en un Loop: un momento que se revive
              mensaje a mensaje, con sus voces, sus fotos y sus risas. Tal cual pasó.
            </p>
          </div>

          <div className="chat-demo" aria-hidden="true">
            <span className="day">hace 3 días</span>
            <div className="bbl bbl--in fading"><b style={{ color: '#A66CFF' }}>Marta</b>bueno qué, ¿plan finde?</div>
            <div className="bbl bbl--out fading">yo me apunto a lo que sea</div>
            <span className="day">el momento</span>
            <div className="loop-capture">
              <span className="cap-tag">◉ LOOP</span>
              <div className="bbl bbl--in"><b style={{ color: '#FF6BCB' }}>Leo</b>PARAD TODO. He conseguido las entradas 🎫🎫🎫</div>
              <div className="bbl bbl--out">QUÉ DICES</div>
              <div className="bbl bbl--in"><b style={{ color: '#5AC8FA' }}>Vega</b>estoy llorando jajajaja</div>
              <div className="bbl bbl--in"><b style={{ color: '#FF6BCB' }}>Leo</b>REPETIMOS EN AGOSTO SÍ O SÍ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
