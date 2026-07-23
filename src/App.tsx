import { useEffect }            from 'react'
import { NavBar }               from './components/NavBar'
import { SoapBubbleBackground } from './components/SoapBubbleBackground'
import { Hero }                 from './sections/Hero'
import { Manifesto }            from './sections/Manifesto'
import { LoopSection }          from './sections/LoopSection'
import { BlopSection }          from './sections/BlopSection'
import { VoteSection }          from './sections/VoteSection'
import { SpectatorSection }     from './sections/SpectatorSection'
import { WaitlistSection }      from './sections/WaitlistSection'
import { Footer }               from './sections/Footer'

export default function App() {
  // Al llegar desde /cronologia con /#waitlist, el ancla aún no existe
  // cuando el navegador intenta saltar; lo resolvemos tras el montaje.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <SoapBubbleBackground />
      <NavBar />
      <main>
        <Hero />
        <Manifesto />
        <LoopSection />
        <BlopSection />
        <VoteSection />
        <SpectatorSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  )
}
