import { useReveal } from '../hooks/useReveal'

export function Manifesto() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className="manif rv" aria-label="Manifiesto">
      <p>
        La próxima red social no empieza en un perfil. <em>Empieza en un grupo.</em>
      </p>
    </section>
  )
}
