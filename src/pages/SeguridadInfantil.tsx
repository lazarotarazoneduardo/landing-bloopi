import { useEffect } from 'react'
import { Footer } from '../sections/Footer'
import '../legal.css'

/* Estándares de seguridad infantil (EASI/CSAE).
   Requisito de Google Play para apps de categoría Social: la página debe
   estar publicada, ser pública en todo el mundo, no editable y no ser PDF.
   Fuente del texto: docs/legal/estandares-seguridad-infantil.md del repo
   de la app — los dos deben cambiar juntos. */

const CONTACTO = 'lazarotarazoneduardo@gmail.com'

export function SeguridadInfantilPage() {
  useEffect(() => {
    document.title = 'Estándares de seguridad infantil · Bloopi'
  }, [])

  return (
    <div className="lg-page">
      <nav className="nav" role="navigation" aria-label="Navegación principal">
        <a className="nav__logo" href="/" aria-label="Volver al inicio">
          <img src="/assets/logo_degradado.svg" alt="BLOOPI" />
          <span className="nav__wordmark">BLOOPI</span>
        </a>
        <a className="nav__link" href="/">Inicio</a>
        <a className="nav__cta" href="/#waitlist">Entrar en la beta</a>
      </nav>

      <header className="lg-hero">
        <h1>Estándares de <em>seguridad infantil.</em></h1>
        <span className="lg-updated">Última actualización: 6 de agosto de 2026</span>
        <p className="lg-lead">
          Estas son las normas y los procedimientos de Bloopi contra la
          explotación y el abuso sexual infantil (EASI/CSAE). Los escribimos
          con el mismo criterio que el resto de nuestros textos legales:
          contamos lo que hacemos de verdad. Si un control no existe, lo
          decimos.
        </p>
      </header>

      <main className="lg-body">
        <h2>1. Tolerancia cero</h2>
        <p>Están terminantemente prohibidos en Bloopi:</p>
        <ul>
          <li>
            Cualquier material de abuso sexual infantil —imágenes, vídeos,
            audios, dibujos o texto—, tanto real como generado o alterado por
            medios artificiales.
          </li>
          <li>
            La sexualización de menores en cualquier forma, incluida la que se
            presente como humor, ficción o «arte».
          </li>
          <li>
            El contacto con menores con fines sexuales (<em>grooming</em>), la
            solicitud de imágenes íntimas y la extorsión sexual.
          </li>
          <li>Facilitar, promocionar, buscar o enlazar cualquiera de lo anterior.</li>
        </ul>
        <p>
          Quien haga esto <strong>pierde la cuenta de forma inmediata y
          permanente</strong>, sin preaviso. No hay primera advertencia.
        </p>

        <h2>2. Edad mínima</h2>
        <p>
          Bloopi es para personas de <strong>16 años o más</strong> y no está
          dirigido a menores de esa edad.
        </p>
        <p>
          Al registrarte pedimos tu fecha de nacimiento y{' '}
          <strong>rechazamos el registro si es inferior a 16 años</strong>. Es
          una declaración tuya: <strong>no hacemos verificación documental ni
          estimación de edad</strong>, y lo decimos abiertamente porque
          prometer un control que no ejecutamos no protegería a nadie.
        </p>
        <p>
          Si detectamos —o alguien nos avisa— de una cuenta por debajo de esa
          edad, la suspendemos y eliminamos sus datos. Madres, padres y tutores
          pueden escribirnos y actuamos de inmediato.
        </p>

        <h2>3. Cómo denunciar</h2>
        <p>
          <strong>Desde la propia aplicación.</strong> Bloopi tiene denuncia
          integrada, con «Contenido sexual» entre los motivos disponibles, en:
        </p>
        <ul>
          <li>los mensajes de un chat de grupo,</li>
          <li>los mensajes directos,</li>
          <li>el perfil de cualquier persona usuaria.</li>
        </ul>
        <p>
          La denuncia llega directamente a nosotros. Quien la envía no queda
          expuesto ante la persona denunciada.
        </p>

        <div className="lg-callout">
          <p>
            <strong>Por correo, en cualquier momento e incluso sin cuenta:</strong>
            <br />
            <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>
          </p>
        </div>

        <div className="lg-callout lg-callout--urgent">
          <p>
            Si crees que un menor está en <strong>peligro inmediato</strong>,
            avisa antes a las autoridades: <strong>112</strong> en España, o el{' '}
            <strong>116 111</strong> de ayuda a la infancia.
          </p>
        </div>

        <h2>4. Qué hacemos cuando recibimos un aviso</h2>
        <ol className="lg-steps">
          <li>
            <strong>Revisamos con prioridad absoluta.</strong> Los avisos de
            seguridad infantil se atienden por delante de cualquier otro, con
            el objetivo de resolverlos en menos de 24 horas.
          </li>
          <li>
            <strong>Retiramos el contenido</strong> y suspendemos la cuenta
            implicada mientras dura la revisión.
          </li>
          <li>
            <strong>Cerramos la cuenta de forma permanente</strong> si el aviso
            se confirma, y bloqueamos la reapertura.
          </li>
          <li>
            <strong>Conservamos las pruebas</strong> y los datos asociados el
            tiempo necesario para ponerlos a disposición de las autoridades,
            aunque el contenido ya no sea visible en la aplicación.
          </li>
          <li>
            <strong>Informamos a las autoridades competentes</strong>: Policía
            Nacional o Guardia Civil en España, y el organismo que corresponda
            cuando los hechos afecten a otro país.
          </li>
        </ol>
        <p>
          Nuestra detección es <strong>reactiva y con revisión humana</strong>:
          actuamos sobre denuncias y sobre lo que detectamos nosotros.{' '}
          <strong>No aplicamos escaneo automatizado ni cotejo de huellas
          digitales de contenido conocido.</strong> Lo hacemos constar para no
          atribuirnos capacidades que no tenemos.
        </p>

        <h2>5. Medidas de prevención que sí están en el producto</h2>
        <ul>
          <li><strong>Denuncia y bloqueo</strong> de cualquier persona usuaria, desde su perfil.</li>
          <li>
            <strong>Grupos cerrados</strong>: se entra por invitación, no hay
            descubrimiento abierto de conversaciones privadas.
          </li>
          <li>
            <strong>Salas privadas</strong>: no son seguibles, no exponen perfil
            y no admiten contenido publicado.
          </li>
          <li><strong>Expulsión por votación del grupo</strong>, sin depender de nosotros.</li>
          <li>
            <strong>Mensajes efímeros</strong>: las conversaciones de grupo se
            borran a los 3 días.
          </li>
          <li>
            <strong>Eliminación de cuenta</strong> en cualquier momento desde
            Ajustes, sin intermediarios.
          </li>
        </ul>

        <h2>6. Persona de contacto</h2>
        <div className="lg-callout">
          <p>
            <strong>Eduardo Lázaro Tarazón</strong> — responsable de Bloopi y
            punto de contacto designado para asuntos de seguridad infantil y
            cumplimiento EASI/CSAE.
          </p>
          <p><a href={`mailto:${CONTACTO}`}>{CONTACTO}</a></p>
          <p>
            Respondemos a autoridades, plataformas y organizaciones de
            protección de la infancia por esta vía.
          </p>
        </div>

        <h2>7. Marco legal</h2>
        <p>
          Cumplimos la legislación aplicable en materia de protección de la
          infancia, en particular el Código Penal español en sus artículos
          sobre abuso y pornografía infantil, la Ley Orgánica de Protección
          Integral a la Infancia y la Adolescencia frente a la Violencia
          (LOPIVI), el Reglamento de Servicios Digitales (DSA) y el RGPD.
        </p>
      </main>

      <Footer />
    </div>
  )
}
