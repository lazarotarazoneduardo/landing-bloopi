import { useRef, useEffect } from 'react'

/* ── Easing ──────────────────────────────────────────────────────── */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const easeOutElastic = (t: number) => {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/* ── Types ───────────────────────────────────────────────────────── */
interface Vec2 { x: number; y: number }

type Phase = 'drifting' | 'approaching' | 'merged' | 'separating'

interface BubbleState {
  pos: Vec2
  srcPos: Vec2
  targetPos: Vec2
}

/* ── Palette ─────────────────────────────────────────────────────── */
const BUBBLE_GRADIENTS = [
  'radial-gradient(circle at 32% 28%, #ffffff, #CAE6FF 38%, #97AACA 80%, #8681A0)',
  'radial-gradient(circle at 32% 28%, #ffffff, #FFD7FB 38%, #8681A0 80%, #97AACA)',
  'radial-gradient(circle at 32% 28%, #ffffff, #FFDDBD 38%, #B8CAE3 80%, #97AACA)',
]

const GLOW_COLORS = [
  [202, 230, 255],
  [255, 215, 251],
  [255, 221, 189],
] as const

/* ── BLOOPI formation positions (normalized 0-1) ─────────────────── */
// Isosceles triangle matching the BLOOPI isotipe proportions
// Three lobes: top, bottom-left, bottom-right
// Centered at (0.50, 0.52) to sit nicely in the hero
const BLOOPI_POS: Vec2[] = [
  { x: 0.500, y: 0.368 }, // top
  { x: 0.382, y: 0.610 }, // bottom-left
  { x: 0.618, y: 0.610 }, // bottom-right
]

/* ── Phase durations (seconds) ───────────────────────────────────── */
const DUR: Record<Phase, number> = {
  drifting:    4.0,
  approaching: 2.4,
  merged:      2.8,
  separating:  2.2,
}

const PHASE_SEQUENCE: Phase[] = ['drifting', 'approaching', 'merged', 'separating']

/* ── Drift anchors — where each bubble floats when separated ─────── */
const DRIFT_ANCHORS: Vec2[] = [
  { x: 0.500, y: 0.195 }, // top-center
  { x: 0.170, y: 0.760 }, // far bottom-left
  { x: 0.830, y: 0.760 }, // far bottom-right
]

/* ── Component ───────────────────────────────────────────────────── */
export function BloopiMetaballs() {
  const wrapRef     = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const bubbleRefs  = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  const animRef = useRef({
    phase: 'drifting' as Phase,
    phaseProgress: 0,
    time: 0,
    bubbles: DRIFT_ANCHORS.map(a => ({
      pos:      { ...a },
      srcPos:   { ...a },
      targetPos:{ ...a },
    })) as BubbleState[],
  })

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d')!
    let running = true
    let lastNow = performance.now()
    let raf = 0

    /* ── Sizing ──────────────────────────────────────────────── */
    const getR = () => {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      const isMobile = W < 768
      // Bubble radius — large enough to merge beautifully at BLOOPI positions
      return Math.min(W, H) * (isMobile ? 0.115 : 0.096)
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      applyBubbleSizes()
      applyPositions()
    }

    const applyBubbleSizes = () => {
      const r = getR()
      bubbleRefs.forEach(ref => {
        if (!ref.current) return
        const d = `${r * 2}px`
        ref.current.style.width  = d
        ref.current.style.height = d
      })
    }

    /* ── Position DOM bubbles ────────────────────────────────── */
    const applyPositions = () => {
      const W = canvas.width, H = canvas.height
      const r = getR()
      animRef.current.bubbles.forEach(({ pos }, i) => {
        const el = bubbleRefs[i].current
        if (!el) return
        el.style.left = `${pos.x * W - r}px`
        el.style.top  = `${pos.y * H - r}px`
      })
    }

    /* ── Draw canvas glows ───────────────────────────────────── */
    const drawGlows = () => {
      const { bubbles, phase, phaseProgress } = animRef.current
      const W = canvas.width, H = canvas.height
      const r = getR()
      ctx.clearRect(0, 0, W, H)

      // Per-bubble ambient glow (behind goo layer)
      bubbles.forEach(({ pos }, i) => {
        const px = pos.x * W, py = pos.y * H
        const [cr, cg, cb] = GLOW_COLORS[i]
        const gr = r * 4.5
        const g = ctx.createRadialGradient(px, py, 0, px, py, gr)
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},0.16)`)
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.08)`)
        g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath()
        ctx.arc(px, py, gr, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      // BLOOPI outer ring — fades in during approaching + merged
      const ringProgress =
        phase === 'merged'      ? 1 :
        phase === 'approaching' ? easeInOutCubic(phaseProgress) :
        phase === 'separating'  ? 1 - easeInOutCubic(Math.min(phaseProgress * 1.3, 1)) :
        0

      if (ringProgress > 0.01) {
        const cx = 0.500 * W
        const cy = 0.490 * H
        const orbR = r * 3.05

        // Soft glow halo around the whole formation
        const haloG = ctx.createRadialGradient(cx, cy, orbR * 0.5, cx, cy, orbR * 2.2)
        haloG.addColorStop(0,   `rgba(184,202,227,${ringProgress * 0.22})`)
        haloG.addColorStop(0.45,`rgba(202,230,255,${ringProgress * 0.12})`)
        haloG.addColorStop(1,   'rgba(202,230,255,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, orbR * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = haloG
        ctx.fill()

        // Thin glass ring stroke
        ctx.beginPath()
        ctx.arc(cx, cy, orbR * 1.08, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(184,202,227,${ringProgress * 0.45})`
        ctx.lineWidth   = 1.5
        ctx.stroke()

        // Inner specular arc (top-left, like a glass highlight)
        ctx.beginPath()
        ctx.arc(cx - orbR * 0.2, cy - orbR * 0.3, orbR * 0.9, -2.4, -0.8)
        ctx.strokeStyle = `rgba(255,255,255,${ringProgress * 0.30})`
        ctx.lineWidth   = 2
        ctx.stroke()
      }
    }

    /* ── State machine ───────────────────────────────────────── */
    const nextPhase = () => {
      const st = animRef.current
      const idx = PHASE_SEQUENCE.indexOf(st.phase)
      st.phase = PHASE_SEQUENCE[(idx + 1) % PHASE_SEQUENCE.length]
      st.phaseProgress = 0
      st.bubbles.forEach(b => { b.srcPos = { ...b.pos } })

      // Set new targets based on incoming phase
      if (st.phase === 'approaching') {
        st.bubbles.forEach((b, i) => { b.targetPos = { ...BLOOPI_POS[i] } })
      }
      if (st.phase === 'separating') {
        st.bubbles.forEach((b, i) => { b.targetPos = { ...DRIFT_ANCHORS[i] } })
      }
    }

    const updateState = (dt: number) => {
      const st    = animRef.current
      const isMob = canvas.width < 768
      st.time += dt

      // Advance phase progress
      const prevProg = st.phaseProgress
      st.phaseProgress = Math.min(prevProg + dt / DUR[st.phase], 1)

      switch (st.phase) {
        case 'drifting': {
          // Organic sinusoidal drift around anchors
          const amp = isMob ? 0.032 : 0.048
          DRIFT_ANCHORS.forEach((anchor, i) => {
            const off = i * 2.09
            const spd = 0.30 + i * 0.05
            st.bubbles[i].pos = {
              x: anchor.x + Math.sin(st.time * spd       + off) * amp,
              y: anchor.y + Math.cos(st.time * (spd+0.1) + off) * amp * 0.8,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }

        case 'approaching': {
          const et = easeInOutCubic(st.phaseProgress)
          st.bubbles.forEach((b, i) => {
            // Add a small organic wobble while approaching
            const wob = (1 - et) * 0.015
            const off = i * 2.09
            b.pos = {
              x: lerp(b.srcPos.x, BLOOPI_POS[i].x, et) + Math.sin(st.time * 1.5 + off) * wob,
              y: lerp(b.srcPos.y, BLOOPI_POS[i].y, et) + Math.cos(st.time * 1.3 + off) * wob,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }

        case 'merged': {
          // Gentle organic pulse while in BLOOPI shape
          const pulse = 0.006
          BLOOPI_POS.forEach((target, i) => {
            const off = i * 2.09
            st.bubbles[i].pos = {
              x: target.x + Math.sin(st.time * 1.1 + off) * pulse,
              y: target.y + Math.cos(st.time * 0.9 + off) * pulse * 0.8,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }

        case 'separating': {
          const et = easeOutElastic(Math.min(st.phaseProgress * 1.1, 1))
          st.bubbles.forEach((b, i) => {
            b.pos = {
              x: lerp(b.srcPos.x, DRIFT_ANCHORS[i].x, et),
              y: lerp(b.srcPos.y, DRIFT_ANCHORS[i].y, et),
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }
      }
    }

    /* ── Scale bubbles during merged/separating ──────────────── */
    const applyBubbleTransforms = () => {
      const { phase, phaseProgress } = animRef.current
      bubbleRefs.forEach((ref, i) => {
        if (!ref.current) return
        let scale = 1
        let opacity = 1

        if (phase === 'merged') {
          // Subtle breathe
          scale = 1 + Math.sin(animRef.current.time * 2.0 + i) * 0.025
        } else if (phase === 'separating' && phaseProgress < 0.15) {
          // Quick elastic pop on separation start
          scale = 1 + easeOutElastic(phaseProgress / 0.15) * 0.08
        }

        ref.current.style.transform = `scale(${scale.toFixed(4)})`
        ref.current.style.opacity   = `${opacity}`
      })
    }

    /* ── RAF loop ────────────────────────────────────────────── */
    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min((now - lastNow) / 1000, 0.05)
      lastNow  = now

      if (!reduced) {
        updateState(dt)
        applyPositions()
        applyBubbleTransforms()
        drawGlows()
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrapRef} className="bm" aria-hidden="true">

      {/* Canvas — ambient glows & outer ring (z-index below goo) */}
      <canvas ref={canvasRef} className="bm__canvas" />

      {/* SVG gooey filter definition */}
      <svg className="bm__svg-defs">
        <defs>
          <filter id="bm-goo" x="-50%" y="-50%" width="200%" height="200%"
                  colorInterpolationFilters="sRGB">
            {/* Blur spreads alpha so nearby circles merge */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            {/* High contrast threshold creates sharp merged edges */}
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -9"
              result="goo" />
            {/* Composite original colors over the gooey alpha mask */}
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Gooey container — filter applied here */}
      <div className="bm__goo">
        {BUBBLE_GRADIENTS.map((grad, i) => (
          <div
            key={i}
            ref={bubbleRefs[i]}
            className="bm__bubble"
            style={{ background: grad }}
          />
        ))}
      </div>

    </div>
  )
}
