import { useEffect, useRef } from 'react'

/**
 * Background canvas: drifting nodes with links drawn between near neighbours,
 * so the hero reads as a live network mesh rather than generic confetti.
 * Sits behind content and never intercepts clicks.
 */
const ParticleField = ({ density = 0.00009, className = '' }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let particles = []
    let frameId = null
    let width = 0
    let height = 0

    const build = () => {
      const parent = canvas.parentElement
      width = parent.offsetWidth
      height = parent.offsetHeight

      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.min(110, Math.max(28, Math.floor(width * height * density)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.9,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // links first, so the dots sit on top of them
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < 130) {
            ctx.strokeStyle = `rgba(253, 230, 138, ${(1 - dist / 130) * 0.28})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = 'rgba(253, 230, 138, 0.75)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        if (!reduceMotion) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      }

      frameId = requestAnimationFrame(draw)
    }

    build()
    draw()

    const onResize = () => {
      build()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}

export default ParticleField
