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
  pos:       Vec2
  srcPos:    Vec2
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

/* ── Drift anchors (normalized) — far apart so separation is clear ─ */
const DRIFT_ANCHORS: Vec2[] = [
  { x: 0.500, y: 0.160 }, // top-center
  { x: 0.155, y: 0.800 }, // far bottom-left
  { x: 0.845, y: 0.800 }, // far bottom-right
]

/* ── Phase durations (seconds) ───────────────────────────────────── */
const DUR: Record<Phase, number> = {
  drifting:    4.5,
  approaching: 2.4,
  merged:      3.5,
  separating:  2.2,
}
const PHASE_SEQUENCE: Phase[] = ['drifting', 'approaching', 'merged', 'separating']

/* ── Component ───────────────────────────────────────────────────── */
export function BloopiMetaballs() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blurRef   = useRef<SVGFEGaussianBlurElement>(null)
  const bubbleRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  const animRef = useRef({
    phase:           'drifting' as Phase,
    phaseProgress:   0,
    time:            0,
    /* Formation positions recomputed on resize */
    formation:       [{ x: 0.5, y: 0.35 }, { x: 0.43, y: 0.53 }, { x: 0.57, y: 0.53 }] as Vec2[],
    formationCenter: { x: 0.5, y: 0.47 } as Vec2,
    bubbles:         DRIFT_ANCHORS.map(a => ({
      pos:       { ...a },
      srcPos:    { ...a },
      targetPos: { ...a },
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

    /* ── Bubble radius ───────────────────────────────────── */
    const getR = () => {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      return Math.min(W, H) * (W < 768 ? 0.150 : 0.130)
    }

    /* ── Recompute equilateral triangle in pixel space ───── */
    const recomputeFormation = () => {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      const r = getR()
      // Triangle side: 1.42 × r → circles overlap ~29 % → clean 3-lobe merge
      const d = r * 1.42
      const h = d * Math.sqrt(3) / 2   // triangle altitude

      const cx = 0.500 * W
      const cy = 0.490 * H  // formation centroid (slightly above screen-center)

      animRef.current.formation = [
        { x:  cx         / W, y: (cy - h * 2 / 3) / H }, // top
        { x: (cx - d/2)  / W, y: (cy + h     / 3) / H }, // bottom-left
        { x: (cx + d/2)  / W, y: (cy + h     / 3) / H }, // bottom-right
      ]
      animRef.current.formationCenter = { x: cx / W, y: cy / H }
    }

    /* ── Resize handler ──────────────────────────────────── */
    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height

      // Scale stdDeviation with bubble radius for crisp merge at any size
      if (blurRef.current) {
        const sd = Math.round(getR() * 0.25)
        blurRef.current.setAttribute('stdDeviation', String(sd))
      }

      recomputeFormation()
      applyBubbleSizes()
      applyPositions()
    }

    /* ── Size bubble divs ────────────────────────────────── */
    const applyBubbleSizes = () => {
      const r  = getR()
      const px = `${r * 2}px`
      bubbleRefs.forEach(ref => {
        if (!ref.current) return
        ref.current.style.width  = px
        ref.current.style.height = px
      })
    }

    /* ── Position DOM bubbles ────────────────────────────── */
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

    /* ── Canvas: ambient glows + outer halo ──────────────── */
    const drawGlows = () => {
      const { bubbles, phase, phaseProgress } = animRef.current
      const W = canvas.width, H = canvas.height
      const r = getR()
      ctx.clearRect(0, 0, W, H)

      bubbles.forEach(({ pos }, i) => {
        const px = pos.x * W, py = pos.y * H
        const [cr, cg, cb] = GLOW_COLORS[i]
        const gr = r * 4.2
        const g  = ctx.createRadialGradient(px, py, 0, px, py, gr)
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},0.18)`)
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.08)`)
        g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath()
        ctx.arc(px, py, gr, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      const ringProgress =
        phase === 'merged'      ? 1 :
        phase === 'approaching' ? easeInOutCubic(phaseProgress) :
        phase === 'separating'  ? 1 - easeInOutCubic(Math.min(phaseProgress * 1.5, 1)) :
        0

      if (ringProgress > 0.01) {
        const { formationCenter: fc } = animRef.current
        const cx   = fc.x * W
        const cy   = fc.y * H
        const orbR = r * 2.6

        const haloG = ctx.createRadialGradient(cx, cy, orbR * 0.4, cx, cy, orbR * 2.0)
        haloG.addColorStop(0,   `rgba(184,202,227,${ringProgress * 0.22})`)
        haloG.addColorStop(0.5, `rgba(202,230,255,${ringProgress * 0.10})`)
        haloG.addColorStop(1,   'rgba(202,230,255,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, orbR * 2.0, 0, Math.PI * 2)
        ctx.fillStyle = haloG
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx, cy, orbR * 1.10, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(184,202,227,${ringProgress * 0.42})`
        ctx.lineWidth   = 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx - orbR * 0.2, cy - orbR * 0.3, orbR * 0.85, -2.4, -0.8)
        ctx.strokeStyle = `rgba(255,255,255,${ringProgress * 0.28})`
        ctx.lineWidth   = 2
        ctx.stroke()
      }
    }

    /* ── State machine ───────────────────────────────────── */
    const nextPhase = () => {
      const st  = animRef.current
      const idx = PHASE_SEQUENCE.indexOf(st.phase)
      st.phase         = PHASE_SEQUENCE[(idx + 1) % PHASE_SEQUENCE.length]
      st.phaseProgress = 0
      st.bubbles.forEach(b => { b.srcPos = { ...b.pos } })

      if (st.phase === 'approaching') {
        st.bubbles.forEach((b, i) => { b.targetPos = { ...st.formation[i] } })
      }
      if (st.phase === 'separating') {
        st.bubbles.forEach((b, i) => { b.targetPos = { ...DRIFT_ANCHORS[i] } })
      }
    }

    const updateState = (dt: number) => {
      const st    = animRef.current
      const isMob = canvas.width < 768
      st.time += dt
      st.phaseProgress = Math.min(st.phaseProgress + dt / DUR[st.phase], 1)

      switch (st.phase) {
        case 'drifting': {
          const amp = isMob ? 0.026 : 0.038
          DRIFT_ANCHORS.forEach((anchor, i) => {
            const off = i * 2.09
            const spd = 0.28 + i * 0.05
            st.bubbles[i].pos = {
              x: anchor.x + Math.sin(st.time * spd       + off) * amp,
              y: anchor.y + Math.cos(st.time * (spd+0.1) + off) * amp * 0.75,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }

        case 'approaching': {
          const et = easeInOutCubic(st.phaseProgress)
          st.bubbles.forEach((b, i) => {
            const wob = (1 - et) * 0.010
            const off = i * 2.09
            b.pos = {
              x: lerp(b.srcPos.x, st.formation[i].x, et) + Math.sin(st.time * 1.5 + off) * wob,
              y: lerp(b.srcPos.y, st.formation[i].y, et) + Math.cos(st.time * 1.3 + off) * wob,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }

        case 'merged': {
          const pulse = 0.004
          st.formation.forEach((target, i) => {
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

    /* ── Bubble transforms + icon overlay ────────────────── */
    const applyBubbleTransforms = () => {
      const { phase, phaseProgress, time } = animRef.current

      bubbleRefs.forEach((ref, i) => {
        if (!ref.current) return
        let scale = 1
        if (phase === 'merged') {
          scale = 1 + Math.sin(time * 2.0 + i) * 0.018
        } else if (phase === 'separating' && phaseProgress < 0.15) {
          scale = 1 + easeOutElastic(phaseProgress / 0.15) * 0.07
        }
        ref.current.style.transform = `scale(${scale.toFixed(4)})`
      })

    }

    /* ── RAF loop ────────────────────────────────────────── */
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

      {/* Ambient glows + outer ring */}
      <canvas ref={canvasRef} className="bm__canvas" />

      {/* Gooey SVG filter */}
      <svg className="bm__svg-defs">
        <defs>
          <filter id="bm-goo" x="-50%" y="-50%" width="200%" height="200%"
                  colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="24" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -9"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Three metaball bubbles */}
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
