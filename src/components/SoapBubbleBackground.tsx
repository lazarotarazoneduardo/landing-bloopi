import { useRef, useEffect } from 'react'

interface Bubble {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  ci: number
  phase: number
}

interface Explosion {
  x: number
  y: number
  r: number
  ci: number
  progress: number
  particles: Array<{ angle: number; dist: number; size: number }>
}

// BLOOPI candy palette: sky, pink, peach, ice
const COLORS = [
  { r: 202, g: 230, b: 255 },
  { r: 255, g: 215, b: 251 },
  { r: 255, g: 221, b: 189 },
  { r: 205, g: 222, b: 255 },
] as const

// Real product vocabulary — revealed one by one when popping bubbles
const MESSAGES = [
  '¿Qué es un Loop?',
  'Lo que merezca vivir, hacedlo Loop',
  'El chat vive 3 días',
  'El grupo lo vota 🗳',
  'Mirar antes de entrar 👁',
  'Nadie sabrá que miras',
  'Manda una pompa al grupo',
  'Los jueves pasa algo en Bloopi',
  'Blop: fotos con conversación encima',
  'Loops que viven',
  'Grupos de verdad',
  'Democracia de verdad',
  'Bloop bloop bloop 🫧',
  'Ready to Bloop?',
  'Hecha en España',
  'Made for the world 🌍',
  'La beta ya está en marcha',
  'Los primeros entran antes',
]

const EXPLODE_DURATION = 0.38
const TAG_LIFETIME_MS  = 3200

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeBubbles(W: number, H: number, count: number): Bubble[] {
  return Array.from({ length: count }, () => {
    const r     = 16 + Math.random() * 36
    const speed = 18 + Math.random() * 32
    const angle = Math.random() * Math.PI * 2
    return {
      x:     r + Math.random() * (W - 2 * r),
      y:     r + Math.random() * (H - 2 * r),
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      r,
      ci:    Math.floor(Math.random() * COLORS.length),
      phase: Math.random() * Math.PI * 2,
    }
  })
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble, t: number) {
  const { x, y, r, ci, phase } = b
  const col = COLORS[ci]

  const s  = Math.sin(t * 0.25 + phase)
  const cr = Math.round(Math.min(255, col.r + s * 20))
  const cg = Math.round(Math.min(255, col.g + s * 14))
  const cb = Math.round(Math.min(255, col.b + s * 18))

  const fill = ctx.createRadialGradient(
    x - r * 0.22, y - r * 0.25, r * 0.05,
    x, y, r,
  )
  fill.addColorStop(0,    'rgba(255,255,255,0.28)')
  fill.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.10)`)
  fill.addColorStop(0.75, `rgba(${cr},${cg},${cb},0.22)`)
  fill.addColorStop(1,    `rgba(${cr},${cg},${cb},0.08)`)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, r - 0.8, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.75)`
  ctx.lineWidth = 2
  ctx.stroke()

  const hx    = x - r * 0.24
  const hy    = y - r * 0.26
  const hRad  = r * 0.30
  const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hRad)
  hGrad.addColorStop(0,    'rgba(255,255,255,1.00)')
  hGrad.addColorStop(0.40, 'rgba(255,255,255,0.55)')
  hGrad.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.beginPath()
  ctx.ellipse(hx, hy, hRad * 1.2, hRad * 0.70, -0.52, 0, Math.PI * 2)
  ctx.fillStyle = hGrad
  ctx.fill()
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: Explosion) {
  const { x, y, r, ci, progress, particles } = exp
  const col   = COLORS[ci]
  const ease  = easeOut(progress)
  const alpha = 1 - ease

  const ringR = r * (1 + ease * 0.55)
  ctx.beginPath()
  ctx.arc(x, y, ringR, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha * 0.80})`
  ctx.lineWidth = 2 * (1 - ease * 0.7)
  ctx.stroke()

  for (const p of particles) {
    const dist  = r * 0.4 + p.dist * r * ease
    const px    = x + Math.cos(p.angle) * dist
    const py    = y + Math.sin(p.angle) * dist
    const pr    = p.size * (1 - ease * 0.6)
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pr)
    pGrad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${alpha * 0.90})`)
    pGrad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`)
    ctx.beginPath()
    ctx.arc(px, py, pr, 0, Math.PI * 2)
    ctx.fillStyle = pGrad
    ctx.fill()
  }
}

export function SoapBubbleBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const msgPool    = useRef<string[]>([])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const canvas = canvasRef.current
    if (!canvas) return

    msgPool.current = shuffle(MESSAGES)

    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    let bubbles: Bubble[]       = []
    let explosions: Explosion[] = []
    let rafId   = 0
    let running = true
    let lastNow = performance.now()

    const updateCounter = (n: number) => {
      if (counterRef.current) counterRef.current.textContent = String(n)
    }

    const spawnedTags: HTMLElement[] = []
    const tagTimeouts: number[] = []

    const spawnTag = (x: number, y: number) => {
      if (msgPool.current.length === 0) return
      const text = msgPool.current.shift()!
      const rot  = `${(Math.random() * 8 - 4).toFixed(1)}deg`

      const el = document.createElement('span')
      el.className   = 'float-tag float-tag--popped'
      el.textContent = text
      el.style.cssText = [
        'position:fixed',
        `left:${x}px`,
        `top:${y}px`,
        `transform:translate(-50%,-50%) rotate(${rot}) scale(${reduced ? 1 : 0.5})`,
        `opacity:${reduced ? 1 : 0}`,
        'z-index:202',
        'pointer-events:none',
      ].join(';')

      document.body.appendChild(el)
      spawnedTags.push(el)

      if (!reduced) {
        tagTimeouts.push(window.setTimeout(() => {
          el.style.transition = 'opacity 0.28s ease, transform 0.34s cubic-bezier(0.34,1.56,0.64,1)'
          el.style.opacity    = '1'
          el.style.transform  = `translate(-50%,-50%) rotate(${rot}) scale(1)`
        }, 16))
      }
      // Fade the pill out after a few seconds so tags never pile up on screen
      tagTimeouts.push(window.setTimeout(() => {
        el.style.transition = 'opacity 0.6s ease'
        el.style.opacity    = '0'
        tagTimeouts.push(window.setTimeout(() => el.remove(), 650))
      }, TAG_LIFETIME_MS))
    }

    // Only regenerate bubbles when the breakpoint changes, not on every
    // browser-chrome resize (mobile address bar show/hide).
    let lastCount = -1

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width  = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = W < 768 ? 16 : 18

      if (count !== lastCount) {
        bubbles    = makeBubbles(W, H, count)
        explosions = []
        updateCounter(bubbles.length)
        lastCount  = count
      } else {
        for (const b of bubbles) {
          b.x = Math.min(Math.max(b.x, b.r), W - b.r)
          b.y = Math.min(Math.max(b.y, b.r), H - b.r)
        }
      }

      if (reduced) {
        ctx.clearRect(0, 0, W, H)
        for (const b of bubbles) drawBubble(ctx, b, 0)
      }
    }

    const tryPop = (clientX: number, clientY: number, isTouch: boolean) => {
      if (reduced) return
      const extra = isTouch ? 10 : 0
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b    = bubbles[i]
        const hitR = b.r + extra
        const dx   = clientX - b.x
        const dy   = clientY - b.y
        if (dx * dx + dy * dy <= hitR * hitR) {
          const N = 9
          const particles = Array.from({ length: N }, (_, j) => ({
            angle: (j / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
            dist:  0.9 + Math.random() * 0.7,
            size:  2.5 + Math.random() * 3,
          }))
          explosions.push({ x: b.x, y: b.y, r: b.r, ci: b.ci, progress: 0, particles })
          bubbles.splice(i, 1)
          updateCounter(bubbles.length)
          spawnTag(clientX, clientY)
          break
        }
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      tryPop(e.clientX, e.clientY, e.pointerType === 'touch')
    }

    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min((now - lastNow) / 1000, 0.05)
      lastNow = now

      for (const b of bubbles) {
        b.x += b.vx * dt
        b.y += b.vy * dt
        if (b.x - b.r < 0)  { b.x = b.r;     b.vx =  Math.abs(b.vx) }
        if (b.x + b.r > W)  { b.x = W - b.r; b.vx = -Math.abs(b.vx) }
        if (b.y - b.r < 0)  { b.y = b.r;     b.vy =  Math.abs(b.vy) }
        if (b.y + b.r > H)  { b.y = H - b.r; b.vy = -Math.abs(b.vy) }
      }

      for (const exp of explosions) exp.progress += dt / EXPLODE_DURATION
      explosions = explosions.filter(exp => exp.progress < 1)

      ctx.clearRect(0, 0, W, H)
      const t = now / 1000
      for (const b   of bubbles)    drawBubble(ctx, b, t)
      for (const exp of explosions) drawExplosion(ctx, exp)

      rafId = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    if (!reduced) rafId = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onPointerDown)
      tagTimeouts.forEach(clearTimeout)
      spawnedTags.forEach(el => el.remove())
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="soap-bubbles"
        aria-hidden="true"
      />
      <div className="bubble-counter" aria-hidden="true">
        <span className="bubble-counter__icon">🫧</span>
        <span ref={counterRef} className="bubble-counter__num">0</span>
        <span className="bubble-counter__label">pompas</span>
      </div>
    </>
  )
}
