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
