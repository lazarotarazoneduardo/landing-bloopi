import { useEffect, useRef } from 'react'

interface Msg {
  dir: 'in' | 'out'
  name?: string
  color?: string
  text: string
}

const MSGS: Msg[] = [
  { dir: 'in',  name: 'Marta', color: '#A66CFF', text: 'jajaja no puedo con vosotros' },
  { dir: 'out',                                  text: '¿quedamos el jueves? 👀' },
  { dir: 'in',  name: 'Leo',   color: '#FF6BCB', text: 'los jueves pasa algo en Bloopi 🫧' },
  { dir: 'in',  name: 'Vega',  color: '#5AC8FA', text: 'esto lo hacemos Loop YA' },
  { dir: 'out',                                  text: 'lo que merezca vivir, hacedlo Loop ◉' },
  { dir: 'in',  name: 'Pau',   color: '#F4A4CB', text: 'VOTACIÓN: ¿pizza o sushi? 🗳' },
]

const TYPING_MS  = 900
const INTERVAL_MS = 2600
const MAX_VISIBLE = 4

/** Animated group chat living inside the hero bubble. */
export function LiveChatPompa() {
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chat = chatRef.current
    if (!chat) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderMsg = (el: HTMLDivElement, m: Msg) => {
      el.replaceChildren()
      if (m.name) {
        const b = document.createElement('b')
        b.style.color = m.color ?? 'inherit'
        b.textContent = m.name
        el.appendChild(b)
      }
      el.appendChild(document.createTextNode(m.text))
    }

    if (reduced) {
      for (const m of MSGS.slice(0, 3)) {
        const el = document.createElement('div')
        el.className = `pompa-bbl pompa-bbl--${m.dir} on`
        renderMsg(el, m)
        chat.appendChild(el)
      }
      return
    }

    let i = 0
    const timeouts: number[] = []

    const pushMsg = () => {
      const m = MSGS[i % MSGS.length]
      i++
      const el = document.createElement('div')
      el.className = `pompa-bbl pompa-bbl--${m.dir} pompa-bbl--typing`
      for (let d = 0; d < 3; d++) el.appendChild(document.createElement('i'))
      chat.appendChild(el)
      requestAnimationFrame(() => el.classList.add('on'))
      timeouts.push(window.setTimeout(() => {
        el.classList.remove('pompa-bbl--typing')
        renderMsg(el, m)
        while (chat.children.length > MAX_VISIBLE) chat.removeChild(chat.firstChild!)
      }, TYPING_MS))
    }

    pushMsg()
    const interval = window.setInterval(pushMsg, INTERVAL_MS)
    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
      chat.replaceChildren()
    }
  }, [])

  return (
    <div className="pompa" aria-hidden="true">
      <img
        className="pompa__img"
        src="/assets/v2/pompa-1200.jpg"
        srcSet="/assets/v2/pompa-720.jpg 720w, /assets/v2/pompa-1200.jpg 1200w"
        sizes="(max-width: 900px) 340px, 520px"
        width="1200"
        height="675"
        alt=""
        fetchPriority="high"
      />
      <span className="pompa__tag">EN DIRECTO</span>
      <div ref={chatRef} className="pompa__chat" />
    </div>
  )
}
