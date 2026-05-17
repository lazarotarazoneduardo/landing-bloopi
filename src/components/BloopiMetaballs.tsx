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
interface BubbleState { pos: Vec2; srcPos: Vec2; targetPos: Vec2 }

/* ── Palette ─────────────────────────────────────────────────────── */
const BUBBLE_GRADIENTS = [
  'radial-gradient(circle at 35% 30%, #ffffff, #CAE6FF 40%, #97AACA 75%, #8681A0)',
  'radial-gradient(circle at 35% 30%, #ffffff, #FFD7FB 40%, #8681A0 75%, #97AACA)',
  'radial-gradient(circle at 35% 30%, #ffffff, #FFDDBD 40%, #B8CAE3 75%, #97AACA)',
]
const GLOW_COLORS = [[202,230,255],[255,215,251],[255,221,189]] as const

/* ── Drift anchors ───────────────────────────────────────────────── */
const DRIFT_ANCHORS: Vec2[] = [
  { x: 0.500, y: 0.160 },
  { x: 0.155, y: 0.800 },
  { x: 0.845, y: 0.800 },
]

/* ── Phase durations ─────────────────────────────────────────────── */
const DUR: Record<Phase, number> = {
  drifting: 4.5, approaching: 2.8, merged: 3.5, separating: 2.4,
}
const PHASE_SEQUENCE: Phase[] = ['drifting','approaching','merged','separating']

/* ──────────────────────────────────────────────────────────────────
   BLOOPI isotipe path — from logo_degradado.svg inner path.
   Outer subpath: 3-lobe perimeter. Inner subpath: Y-channel boundary.
   fillRule="evenodd" → outer filled, Y-channel transparent.
─────────────────────────────────────────────────────────────────── */
const BLOOPI_ISO_PATH =
  'M138.163 58.5059V58.5068C147.917 58.7472 156.682 61.5002 164.405 67.3203L165.149 ' +
  '67.8936C174.116 74.9595 179.657 83.937 181.529 95.1689C182.063 98.3733 182.044 ' +
  '101.663 181.801 105.069C181.098 114.715 184.8 122.399 192.023 128.232L192.733 ' +
  '128.791C195.592 130.984 198.987 132.441 201.693 133.821V133.822C215.532 140.923 ' +
  '224.311 151.773 227.302 167.019V167.021C229.216 176.733 227.694 186.15 223.328 ' +
  '195.102C216.975 208.127 206.894 216.583 192.963 220.321L192.297 220.495C180.588 ' +
  '223.481 169.603 221.385 159.083 215.321H159.082C157.571 214.451 156.118 213.451 ' +
  '154.578 212.384C153.065 211.335 151.459 210.215 149.766 209.215C145.535 206.714 ' +
  '141.202 205.447 136.813 205.56C132.424 205.672 128.165 207.161 124.073 209.874C' +
  '120.542 212.215 117.324 214.508 113.832 216.468H113.831L113.829 216.469C108.69 ' +
  '219.36 103.162 221.003 97.3184 221.549L96.1455 221.644C84.2729 222.45 73.706 ' +
  '218.979 64.5371 211.482L64.5361 211.481C54.472 203.26 48.7892 192.701 47.6924 ' +
  '179.846L47.6006 178.594C46.6897 163.77 52.0081 151.446 62.8926 141.373L62.8936 ' +
  '141.372C66.8453 137.711 71.5133 134.893 76.5439 132.561L77.5557 132.1C86.8267 ' +
  '127.951 92.1323 120.675 93.9521 110.937L93.9531 110.931C94.4855 108.042 94.2181 ' +
  '105.043 94.1543 102.709V102.706L94.1357 101.6C94.1182 96.0825 95.1677 90.809 ' +
  '97.375 85.7607C103.388 72.0251 113.671 63.4719 128.18 59.6982C129.619 59.3264 ' +
  '131.009 59.0338 132.405 58.8711L132.406 58.8721C134.421 58.6438 136.296 58.4622 ' +
  '138.163 58.5059Z ' +
  'M105.089 125.262C103.902 125.153 102.83 125.489 101.932 126.068L101.754 126.188C' +
  '98.3923 128.531 97.6421 133.065 99.9951 136.384L99.9961 136.385C101.687 138.767 ' +
  '103.996 140.272 105.977 141.488L105.981 141.491C109.895 143.883 113.601 145.917 ' +
  '117.224 148.368L117.228 148.371C126.362 154.53 130.991 162.808 130.825 173.819C' +
  '130.763 177.803 130.843 181.323 130.506 184.893L130.495 185.01V186.838C130.514 ' +
  '188.206 130.822 189.541 131.557 190.703C132.356 191.967 133.538 192.829 134.926 ' +
  '193.316C136.302 193.8 137.77 193.879 139.193 193.434C140.608 192.99 141.803 ' +
  '192.084 142.748 190.886L142.749 190.885C144.223 189.014 144.686 186.932 144.734 ' +
  '184.938V184.926C144.827 180.129 144.734 175.658 144.952 171.036V171.028C145.274 ' +
  '163.763 148.04 157.669 153.129 152.479C157.473 148.051 162.944 145.263 168.9 ' +
  '142.425L168.903 142.423C170.032 141.883 171.012 141.502 172.314 140.918C173.518 ' +
  '140.378 174.811 139.74 176.047 138.877L176.046 138.876C178.836 136.929 180.106 ' +
  '133.094 178.567 130.01L178.409 129.714C176.651 126.614 172.621 125.944 169.623 ' +
  '127.148H169.621C168.324 127.671 167.136 128.34 166.058 129.005L165.017 129.662C' +
  '159.663 133.091 154.492 136.308 148.787 138.423C144.022 140.186 139.424 141.251 ' +
  '134.755 140.63L134.751 140.629C127.426 139.664 120.858 136.676 114.903 132.122V' +
  '132.121L114.089 131.485C113.278 130.84 112.474 130.166 111.652 129.47C110.57 ' +
  '128.553 109.444 127.585 108.291 126.659L108.288 126.657L107.94 126.393C107.111 ' +
  '125.798 106.157 125.359 105.089 125.262Z'

/* ── Component ───────────────────────────────────────────────────── */
export function BloopiMetaballs() {
  const wrapRef    = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const gooRef     = useRef<HTMLDivElement>(null)
  const isoRef     = useRef<HTMLDivElement>(null)
  const blurRef    = useRef<SVGFEGaussianBlurElement>(null)
  const bubbleRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  const animRef = useRef({
    phase:           'drifting' as Phase,
    phaseProgress:   0,
    time:            0,
    formation:       [{ x:0.5,y:0.46},{ x:0.48,y:0.50},{ x:0.52,y:0.50}] as Vec2[],
    formationCenter: { x:0.5, y:0.47 } as Vec2,
    bubbles:         DRIFT_ANCHORS.map(a => ({
      pos: {...a}, srcPos: {...a}, targetPos: {...a},
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

    const getR = () => {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      return Math.min(W, H) * (W < 768 ? 0.150 : 0.128)
    }

    const recomputeFormation = () => {
      const { width: W, height: H } = wrap.getBoundingClientRect()
      const r = getR()
      const d = r * 0.8
      const h = d * Math.sqrt(3) / 2
      const cx = 0.500 * W
      const cy = 0.490 * H
      animRef.current.formation = [
        { x:  cx         / W, y: (cy - h * 2/3) / H },
        { x: (cx - d/2)  / W, y: (cy + h / 3)   / H },
        { x: (cx + d/2)  / W, y: (cy + h / 3)   / H },
      ]
      animRef.current.formationCenter = { x: cx / W, y: cy / H }
    }

    /* ── Size & center the isotipe overlay ───────────────── */
    const applyIsoGeometry = () => {
      const iso = isoRef.current
      if (!iso) return
      const W = canvas.width, H = canvas.height
      const { formationCenter: fc } = animRef.current
      // viewBox is 184 wide × 168 tall; scale to ~32% of screen height
      const isoH = H * 0.32
      const isoW = isoH * (184 / 168)
      iso.style.width  = `${isoW}px`
      iso.style.height = `${isoH}px`
      iso.style.left   = `${fc.x * W - isoW / 2}px`
      iso.style.top    = `${fc.y * H - isoH / 2}px`
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      if (blurRef.current)
        blurRef.current.setAttribute('stdDeviation', String(Math.round(getR() * 0.30)))
      recomputeFormation()
      applyBubbleSizes()
      applyIsoGeometry()
      applyPositions()
    }

    const applyBubbleSizes = () => {
      const px = `${getR() * 2}px`
      bubbleRefs.forEach(ref => {
        if (!ref.current) return
        ref.current.style.width  = px
        ref.current.style.height = px
      })
    }

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

    const drawGlows = () => {
      const { bubbles, phase, phaseProgress } = animRef.current
      const W = canvas.width, H = canvas.height
      const r = getR()
      ctx.clearRect(0, 0, W, H)
      bubbles.forEach(({ pos }, i) => {
        const px = pos.x * W, py = pos.y * H
        const [cr, cg, cb] = GLOW_COLORS[i]
        const gr = r * 4.0
        const g  = ctx.createRadialGradient(px, py, 0, px, py, gr)
        g.addColorStop(0,   `rgba(${cr},${cg},${cb},0.18)`)
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.08)`)
        g.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath(); ctx.arc(px, py, gr, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
      })
      const ring =
        phase === 'merged'      ? 1 :
        phase === 'approaching' ? easeInOutCubic(phaseProgress) :
        phase === 'separating'  ? 1 - easeInOutCubic(Math.min(phaseProgress * 1.5, 1)) : 0
      if (ring > 0.01) {
        const { formationCenter: fc } = animRef.current
        const cx = fc.x * W, cy = fc.y * H
        const or = r * 2.2
        const hg = ctx.createRadialGradient(cx, cy, or * 0.4, cx, cy, or * 2.0)
        hg.addColorStop(0,   `rgba(184,202,227,${ring * 0.22})`)
        hg.addColorStop(0.5, `rgba(202,230,255,${ring * 0.10})`)
        hg.addColorStop(1,   'rgba(202,230,255,0)')
        ctx.beginPath(); ctx.arc(cx, cy, or * 2.0, 0, Math.PI * 2)
        ctx.fillStyle = hg; ctx.fill()
        ctx.beginPath(); ctx.arc(cx, cy, or * 1.05, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(184,202,227,${ring * 0.35})`
        ctx.lineWidth = 1.5; ctx.stroke()
      }
    }

    const nextPhase = () => {
      const st  = animRef.current
      const idx = PHASE_SEQUENCE.indexOf(st.phase)
      st.phase         = PHASE_SEQUENCE[(idx + 1) % PHASE_SEQUENCE.length]
      st.phaseProgress = 0
      st.bubbles.forEach(b => { b.srcPos = { ...b.pos } })
      if (st.phase === 'approaching')
        st.bubbles.forEach((b, i) => { b.targetPos = { ...st.formation[i] } })
      if (st.phase === 'separating')
        st.bubbles.forEach((b, i) => { b.targetPos = { ...DRIFT_ANCHORS[i] } })
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
            const off = i * 2.09, spd = 0.28 + i * 0.05
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
            const wob = (1 - et) * 0.008, off = i * 2.09
            b.pos = {
              x: lerp(b.srcPos.x, st.formation[i].x, et) + Math.sin(st.time * 1.5 + off) * wob,
              y: lerp(b.srcPos.y, st.formation[i].y, et) + Math.cos(st.time * 1.3 + off) * wob,
            }
          })
          if (st.phaseProgress >= 1) nextPhase()
          break
        }
        case 'merged': {
          st.formation.forEach((target, i) => {
            const off = i * 2.09
            st.bubbles[i].pos = {
              x: target.x + Math.sin(st.time * 0.9 + off) * 0.002,
              y: target.y + Math.cos(st.time * 0.7 + off) * 0.002,
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

    /* ── Crossfade: goo blob → isotipe shape ─────────────── */
    const applyBubbleTransforms = () => {
      const { phase, phaseProgress, time } = animRef.current

      bubbleRefs.forEach((ref, i) => {
        if (!ref.current) return
        let scale = 1
        if (phase === 'merged')
          scale = 1 + Math.sin(time * 1.8 + i * 1.2) * 0.018
        else if (phase === 'separating' && phaseProgress < 0.15)
          scale = 1 + easeOutElastic(phaseProgress / 0.15) * 0.06
        ref.current.style.transform = `scale(${scale.toFixed(4)})`
      })

      let gooOp = 1
      let isoOp = 0

      if (phase === 'merged') {
        // Blob fuses first (~0.5s), then the isotipe shape fades in revealing the Y-channel
        const t = easeInOutCubic(Math.min(phaseProgress * 3.5, 1))
        isoOp = t
        gooOp = 1 - t
      } else if (phase === 'separating') {
        // Quick snap back to goo at the start of separation
        const t = easeInOutCubic(Math.max(1 - phaseProgress * 10, 0))
        isoOp = t
        gooOp = 1 - t
      }

      if (gooRef.current) gooRef.current.style.opacity = gooOp.toFixed(3)
      if (isoRef.current) isoRef.current.style.opacity = isoOp.toFixed(3)
    }

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

    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrapRef} className="bm" aria-hidden="true">

      <canvas ref={canvasRef} className="bm__canvas" />

      <svg className="bm__svg-defs">
        <defs>
          <filter id="bm-goo" x="-50%" y="-50%" width="200%" height="200%"
                  colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="24" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -10" />
          </filter>
        </defs>
      </svg>

      {/* Goo bubbles — visible during drifting + approaching, fade out when merged */}
      <div ref={gooRef} className="bm__goo">
        {BUBBLE_GRADIENTS.map((grad, i) => (
          <div key={i} ref={bubbleRefs[i]} className="bm__bubble" style={{ background: grad }} />
        ))}
      </div>

      {/* Isotipe — exact 3-lobe shape + Y-channel cutout, fades in at merged */}
      <div ref={isoRef} className="bm__iso">
        <svg viewBox="45 56 184 168" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient flows top→bottom matching the 3 bubble color families */}
            <linearGradient id="bm-iso-grad" x1="138" y1="56" x2="138" y2="224"
                            gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#CAE6FF" />
              <stop offset="38%"  stopColor="#FFD7FB" />
              <stop offset="100%" stopColor="#FFDDBD" />
            </linearGradient>
          </defs>
          {/* evenodd: outer 3-lobe perimeter filled, inner Y-channel transparent */}
          <path fillRule="evenodd" fill="url(#bm-iso-grad)" d={BLOOPI_ISO_PATH} />
        </svg>
      </div>

    </div>
  )
}
