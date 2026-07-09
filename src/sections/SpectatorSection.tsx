import { useReveal } from '../hooks/useReveal'

export function SpectatorSection() {
  const ref = useReveal()
  return (
    <section className="sec spec" aria-labelledby="spec-title">
      <div ref={ref} className="sec__inner rv">
        <span className="spec__pill">👁 Modo espectador</span>
        <h2 id="spec-title">Mirar antes de entrar.</h2>
        <p className="lead">
          Los grupos públicos de Bloopi son como directos: te asomas a su chat,
          lees lo que pasa, sientes su rollo… y cuando te encaje, te unes.
          Y si algo te puede la curiosidad, deja una pompa de comentario flotando:
          solo alguien del grupo puede explotarla para leerla.
        </p>
        <p className="spec__quote">"Nadie sabrá que miras."</p>
      </div>
    </section>
  )
}
