import { useEffect, useRef } from 'react'

/**
 * Adds the `on` class when the element enters the viewport (once).
 * Elements start hidden via the `.rv` CSS class.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.22) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.classList.add('on')
      return
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('on')
            io.disconnect()
          }
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return ref
}
