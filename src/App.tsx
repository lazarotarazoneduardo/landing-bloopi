import { NavBar }                from './components/NavBar'
import { SoapBubbleBackground } from './components/SoapBubbleBackground'
import { Hero }                 from './sections/Hero'
import { HypeSection }          from './sections/HypeSection'
import { GroupSection }         from './sections/GroupSection'
import { GlobalSection }        from './sections/GlobalSection'
import { WaitlistSection }      from './sections/WaitlistSection'
import { Footer }               from './sections/Footer'

export default function App() {
  return (
    <>
      <SoapBubbleBackground />
      <NavBar />
      <main>
        <Hero />
        <HypeSection />
        <GroupSection />
        <GlobalSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  )
}
