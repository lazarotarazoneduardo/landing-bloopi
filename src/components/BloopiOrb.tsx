import { useRef, useEffect, useCallback } from 'react'

/* ── Colour utilities ─────────────────────────────────────── */
type RGB = readonly [number, number, number]

// Brand iridescent palette
const IRID_COLORS: RGB[] = [
  [202, 230, 255], // #CAE6FF sky blue
  [184, 202, 227], // #B8CAE3 steel light
  [205, 222, 255], // #CDDEFF ice
  [255, 215, 251], // #FFD7FB lavender pink
  [151, 170, 202], // #97AACA steel mid
  [255, 221, 189], // #FFDDBD peach
  [202, 230, 255], // loop back
]

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function iridColor(t: number): RGB {
  const n   = IRID_COLORS.length - 1
  const s   = ((t % 1) + 1) % 1
  const idx = s * n
  const i   = Math.min(Math.floor(idx), n - 1)
  return lerpRGB(IRID_COLORS[i], IRID_COLORS[i + 1], idx - i)
}

function rgba(c: RGB, a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/* ── Data types ───────────────────────────────────────────── */
type ChargeState = 'idle' | 'charging' | 'peak' | 'releasing'

interface Orb {
  x: number; y: number
  vx: number; vy: number
  r: number
  squashX: number; squashY: number
  pulse: number
  chargeLevel: number
  chargeState: ChargeState
  chargeTimer: number        // seconds in current state
  nextChargeIn: number       // seconds until next charge starts
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number; colorIdx: number
}

interface Ring {
  x: number; y: number
  r: number; targetR: number
  life: number; maxLife: number
}

/* ── Component ────────────────────────────────────────────── */
export function BloopiOrb() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const frameRef     = useRef<number>(0)
  const orbRef       = useRef<Orb | null>(null)
  const particles    = useRef<Particle[]>([])
  const rings        = useRef<Ring[]>([])
  const timeRef      = useRef<number>(0)
  const logoRef      = useRef<HTMLImageElement | null>(null)
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Preload logo SVG
  useEffect(() => {
    const img = new Image()
    img.src = '/assets/bloopi_trasnparente.svg'
    logoRef.current = img
  }, [])

  const initOrb = useCallback((w: number, h: number): Orb => {
    const isMobile = w < 768
    const r        = Math.min(w, h) * (isMobile ? 0.30 : 0.27)
    const spd      = isMobile ? 38 : 62  // px/s
    const angle    = Math.random() * Math.PI * 2
    return {
      x: w * (0.35 + Math.random() * 0.3),
      y: h * (0.3  + Math.random() * 0.4),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r,
      squashX: 1, squashY: 1,
      pulse: 0,
      chargeLevel: 0,
      chargeState: 'idle',
      chargeTimer: 0,
      nextChargeIn: 10 + Math.random() * 8,
    }
  }, [])

  const spawnParticle = useCallback((orb: Orb): Particle => {
    const angle = Math.random() * Math.PI * 2
    const dist  = orb.r * (0.90 + Math.random() * 0.25)
    const spd   = 8 + Math.random() * 18
    return {
      x: orb.x + Math.cos(angle) * dist,
      y: orb.y + Math.sin(angle) * dist,
      vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 6,
      vy: Math.sin(angle) * spd + (Math.random() - 0.5) * 6,
      life: 0, maxLife: 1.8 + Math.random() * 2.0,
      size: 1.2 + Math.random() * 2.0,
      colorIdx: Math.random(),
    }
  }, [])

  const spawnRing = useCallback((x: number, y: number, orb: Orb): Ring => ({
    x, y,
    r: orb.r * 0.35,
    targetR: orb.r * (2.0 + Math.random() * 0.7),
    life: 0, maxLife: 1.4,
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement!
    const ctx    = canvas.getContext('2d')!
    let running  = true
    let lastNow  = performance.now()
    let isMobile = window.innerWidth < 768

    const resize = () => {
      isMobile = window.innerWidth < 768
      const rect  = parent.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      if (!orbRef.current) {
        orbRef.current = initOrb(canvas.width, canvas.height)
        for (let i = 0; i < 22; i++)
          particles.current.push(spawnParticle(orbRef.current))
      }
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    /* ── Physics update ───────────────────────────────────── */
    const update = (dt: number, orb: Orb) => {
      timeRef.current += dt
      const t    = timeRef.current
      const spdM = isMobile ? 0.55 : 1.0

      // Organic drift (sinusoidal micro-force)
      orb.vx += Math.sin(t * 0.29 + 1.1) * 1.8 * spdM * dt
      orb.vy += Math.cos(t * 0.23 + 0.8) * 1.8 * spdM * dt

      // Clamp to target speed band
      const spd = Math.hypot(orb.vx, orb.vy)
      const targetSpd = (55 + orb.chargeLevel * 20) * spdM
      if (spd > targetSpd * 1.4) {
        const k = (targetSpd * 1.4) / spd
        orb.vx *= k; orb.vy *= k
      }
      if (spd > 0 && spd < targetSpd * 0.35) {
        const k = (targetSpd * 0.35) / spd
        orb.vx *= k; orb.vy *= k
      }

      // Move
      orb.x += orb.vx * dt
      orb.y += orb.vy * dt

      const { r } = orb
      const W = canvas.width, H = canvas.height

      // Bounce X
      if (orb.x - r < 0) {
        orb.x = r; orb.vx = Math.abs(orb.vx)
        orb.squashX = 0.70; orb.squashY = 1.32
        rings.current.push(spawnRing(0, orb.y, orb))
        rings.current.push(spawnRing(0, orb.y, orb))
      } else if (orb.x + r > W) {
        orb.x = W - r; orb.vx = -Math.abs(orb.vx)
        orb.squashX = 0.70; orb.squashY = 1.32
        rings.current.push(spawnRing(W, orb.y, orb))
        rings.current.push(spawnRing(W, orb.y, orb))
      }
      // Bounce Y
      if (orb.y - r < 0) {
        orb.y = r; orb.vy = Math.abs(orb.vy)
        orb.squashX = 1.32; orb.squashY = 0.70
        rings.current.push(spawnRing(orb.x, 0, orb))
        rings.current.push(spawnRing(orb.x, 0, orb))
      } else if (orb.y + r > H) {
        orb.y = H - r; orb.vy = -Math.abs(orb.vy)
        orb.squashX = 1.32; orb.squashY = 0.70
        rings.current.push(spawnRing(orb.x, H, orb))
        rings.current.push(spawnRing(orb.x, H, orb))
      }

      // Squash recovery
      const rec = 1 - Math.pow(0.92, dt * 60)
      orb.squashX = lerp(orb.squashX, 1, rec)
      orb.squashY = lerp(orb.squashY, 1, rec)

      // Pulse phase
      orb.pulse += (2.2 + orb.chargeLevel * 1.8) * dt

      // ── Charge state machine ─────────────────────────────
      if (!reducedMotion.current) {
        switch (orb.chargeState) {
          case 'idle':
            orb.chargeLevel = lerp(orb.chargeLevel, 0, 1 - Math.pow(0.85, dt * 60))
            orb.chargeTimer += dt
            if (orb.chargeTimer >= orb.nextChargeIn) {
              orb.chargeState  = 'charging'
              orb.chargeTimer  = 0
            }
            break

          case 'charging':
            orb.chargeTimer += dt
            orb.chargeLevel  = Math.min(orb.chargeTimer / 4.5, 1)
            // Occasional pressure ring during charge
            if (Math.random() < (0.02 + orb.chargeLevel * 0.06) * dt * 60)
              rings.current.push(spawnRing(orb.x, orb.y, orb))
            if (orb.chargeTimer >= 4.5) {
              orb.chargeState = 'peak'
              orb.chargeTimer = 0
            }
            break

          case 'peak':
            orb.chargeLevel = 1
            orb.chargeTimer += dt
            if (Math.random() < 0.10 * dt * 60)
              rings.current.push(spawnRing(orb.x, orb.y, orb))
            if (orb.chargeTimer >= 1.8) {
              orb.chargeState = 'releasing'
              orb.chargeTimer = 0
            }
            break

          case 'releasing':
            orb.chargeTimer += dt
            orb.chargeLevel  = Math.max(1 - orb.chargeTimer / 1.2, 0)
            if (orb.chargeTimer >= 1.2) {
              orb.chargeState  = 'idle'
              orb.chargeTimer  = 0
              orb.nextChargeIn = 11 + Math.random() * 10
            }
            break
        }
      }
    }

    /* ── Particles update ─────────────────────────────────── */
    const updateParticles = (dt: number, orb: Orb) => {
      const target = 18 + Math.floor(orb.chargeLevel * 12)
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i]
        p.x  += p.vx * dt
        p.y  += p.vy * dt
        p.vx *= Math.pow(0.975, dt * 60)
        p.vy *= Math.pow(0.975, dt * 60)
        p.life += dt
        if (p.life >= p.maxLife) particles.current.splice(i, 1)
      }
      while (particles.current.length < target)
        particles.current.push(spawnParticle(orb))
    }

    /* ── Rings update ─────────────────────────────────────── */
    const updateRings = (dt: number) => {
      for (let i = rings.current.length - 1; i >= 0; i--) {
        const rg = rings.current[i]
        rg.r    = lerp(rg.r, rg.targetR, 1 - Math.pow(0.94, dt * 60))
        rg.life += dt
        if (rg.life >= rg.maxLife) rings.current.splice(i, 1)
      }
      if (rings.current.length > 14)
        rings.current.splice(0, rings.current.length - 14)
    }

    /* ── Draw ─────────────────────────────────────────────── */
    const draw = (orb: Orb) => {
      const W = canvas.width, H = canvas.height
      const t = timeRef.current
      const { x, y, r, squashX, squashY, pulse, chargeLevel } = orb

      ctx.clearRect(0, 0, W, H)

      // ── Rings ──────────────────────────────────────────────
      for (const rg of rings.current) {
        const lt  = rg.life / rg.maxLife
        const alp = Math.sin(lt * Math.PI) * 0.28
        const c   = iridColor((t * 0.08 + lt * 0.4) % 1)
        ctx.beginPath()
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2)
        ctx.strokeStyle = rgba(c, alp)
        ctx.lineWidth   = Math.max(0.5, 2.5 * (1 - lt))
        ctx.stroke()
      }

      // ── Particles ──────────────────────────────────────────
      for (const p of particles.current) {
        const lt  = p.life / p.maxLife
        const alp = Math.sin(lt * Math.PI) * 0.72
        const c   = iridColor((p.colorIdx + t * 0.06) % 1)

        // Soft glow halo around particle
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        grd.addColorStop(0, rgba(c, alp * 0.55))
        grd.addColorStop(1, rgba(c, 0))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = rgba(c, alp)
        ctx.fill()
      }

      // ── Outer ambient glow (squash-aware ellipse) ──────────
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(squashX, squashY)
      const glowR  = r * (3.0 + chargeLevel * 1.4)
      const glowA  = 0.05 + chargeLevel * 0.10
      const glowC  = iridColor((t * 0.18) % 1)
      const glowG  = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, glowR)
      glowG.addColorStop(0,   rgba(glowC, glowA * 3.5))
      glowG.addColorStop(0.3, rgba([184, 202, 227], glowA * 2))
      glowG.addColorStop(0.7, rgba([202, 230, 255], glowA))
      glowG.addColorStop(1,   rgba([202, 230, 255], 0))
      ctx.beginPath()
      ctx.arc(0, 0, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glowG
      ctx.fill()
      ctx.restore()

      // ── Orb body (squash transform + clipped) ─────────────
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(squashX, squashY)

      // Clip to circle
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.clip()

      const iridT  = (t * 0.13) % 1
      const iridT2 = (iridT + 0.38) % 1
      const c1 = iridColor(iridT)
      const c2 = iridColor(iridT2)

      // Main body gradient (off-center for 3D look)
      const bodyG = ctx.createRadialGradient(-r * 0.22, -r * 0.28, 0, 0, 0, r)
      bodyG.addColorStop(0,    'rgba(255,255,255,0.97)')
      bodyG.addColorStop(0.18, rgba(c1, 0.92))
      bodyG.addColorStop(0.48, rgba(c2, 0.82))
      bodyG.addColorStop(0.76, rgba([134, 129, 160], 0.78))
      bodyG.addColorStop(1,    rgba([184, 202, 227], 0.92))
      ctx.fillStyle = bodyG
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Iridescent overlay (slow rotation)
      const iridT3 = (t * 0.07 + 0.6) % 1
      const c3     = iridColor(iridT3)
      const iridG  = ctx.createRadialGradient(r * 0.2, r * 0.18, 0, r * 0.05, r * 0.05, r * 1.1)
      iridG.addColorStop(0,   rgba(c3, 0.18 + chargeLevel * 0.12))
      iridG.addColorStop(0.5, rgba(c3, 0.08))
      iridG.addColorStop(1,   rgba(c3, 0))
      ctx.fillStyle = iridG
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Inner pulse (energy breathing)
      const pulseI  = (Math.sin(pulse) * 0.5 + 0.5)
      const pulseA  = pulseI * (0.05 + chargeLevel * 0.18)
      const pulseC  = iridColor((iridT + 0.5) % 1)
      const pulseG  = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.72)
      pulseG.addColorStop(0,   rgba(pulseC, pulseA * 4))
      pulseG.addColorStop(0.5, rgba(pulseC, pulseA))
      pulseG.addColorStop(1,   rgba(pulseC, 0))
      ctx.fillStyle = pulseG
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Charge inner corona — builds up before "release"
      if (chargeLevel > 0.1) {
        const coronaA = chargeLevel * 0.28
        const coronaC = iridColor((iridT + 0.25) % 1)
        const coronaG = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r * 0.95)
        coronaG.addColorStop(0,   rgba(coronaC, 0))
        coronaG.addColorStop(0.6, rgba(coronaC, coronaA * 0.5))
        coronaG.addColorStop(1,   rgba(coronaC, coronaA))
        ctx.fillStyle = coronaG
        ctx.fillRect(-r, -r, r * 2, r * 2)
      }

      // Glass rim (white edge glow like a glass sphere)
      const rimG = ctx.createRadialGradient(0, 0, r * 0.82, 0, 0, r)
      rimG.addColorStop(0,   'rgba(255,255,255,0)')
      rimG.addColorStop(0.65,'rgba(255,255,255,0.04)')
      rimG.addColorStop(1,   'rgba(255,255,255,0.38)')
      ctx.fillStyle = rimG
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Primary specular (upper-left bright spot)
      const specG = ctx.createRadialGradient(
        -r * 0.30, -r * 0.34, 0,
        -r * 0.12, -r * 0.16, r * 0.56,
      )
      specG.addColorStop(0,   'rgba(255,255,255,0.90)')
      specG.addColorStop(0.30,'rgba(255,255,255,0.38)')
      specG.addColorStop(0.65,'rgba(255,255,255,0.08)')
      specG.addColorStop(1,   'rgba(255,255,255,0)')
      ctx.fillStyle = specG
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Secondary specular (lower-right, transmission)
      const spec2G = ctx.createRadialGradient(
        r * 0.34, r * 0.36, 0,
        r * 0.22, r * 0.24, r * 0.30,
      )
      spec2G.addColorStop(0, 'rgba(255,255,255,0.22)')
      spec2G.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = spec2G
      ctx.fillRect(-r, -r, r * 2, r * 2)

      // Logo watermark inside orb
      const logo = logoRef.current
      if (logo && logo.complete && logo.naturalWidth > 0) {
        ctx.globalAlpha = 0.07 + chargeLevel * 0.06
        const lSize = r * 0.50
        ctx.drawImage(logo, -lSize / 2, -lSize / 2, lSize, lSize)
        ctx.globalAlpha = 1
      }

      ctx.restore()
    }

    /* ── RAF loop ─────────────────────────────────────────── */
    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min((now - lastNow) / 1000, 0.05)
      lastNow  = now

      const orb = orbRef.current
      if (orb) {
        if (!reducedMotion.current) {
          update(dt, orb)
          updateParticles(dt, orb)
          updateRings(dt)
        }
        draw(orb)
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
    }
  }, [initOrb, spawnParticle, spawnRing])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
