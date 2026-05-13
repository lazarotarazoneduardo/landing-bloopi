export function GroupSection() {
  return (
    <section className="section section--alt" aria-labelledby="group-title">
      <div className="section__inner">
        <div className="group-section">

          {/* Text */}
          <div>
            <span className="section__label">La diferencia</span>
            <h2 className="section__title" id="group-title">
              No es solo tu perfil.<br />
              <em>Es tu grupo.</em>
            </h2>
            <p className="section__body">
              La nueva generación social no se construye solo alrededor
              de individuos. También se construye con grupos, energía
              colectiva y momentos compartidos. BLOOPI lo sabe.
              Y está preparada para eso.
            </p>
          </div>

          {/* Orb render from Higgsfield */}
          <div className="group-visual" aria-hidden="true">
            <div className="group-orb" />
            <img
              className="group-icon group-icon--render"
              src="/assets/generated/bloopi-orb-render.png"
              alt=""
            />
          </div>

        </div>
      </div>
    </section>
  )
}
