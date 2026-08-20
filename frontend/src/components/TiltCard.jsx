import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Card that tilts in 3D toward the cursor. The glare layer tracks the pointer
 * too, so the surface reads as lit rather than just rotated. Pointer tracking
 * is skipped entirely for reduced motion and for coarse (touch) pointers,
 * where there is no hover to respond to.
 */
const TiltCard = ({ children, className = '', max = 9, glare = true, ...rest }) => {
  const wrapRef = useRef(null)
  const cardRef = useRef(null)
  const glareRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const card = cardRef.current
    if (!wrap || !card) return

    const skip =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(hover: none)').matches
    if (skip) return

    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const lift = gsap.quickTo(card, 'z', { duration: 0.6, ease: 'power3.out' })

    const glareX = glareRef.current
      ? gsap.quickTo(glareRef.current, 'xPercent', { duration: 0.6, ease: 'power3.out' })
      : null
    const glareY = glareRef.current
      ? gsap.quickTo(glareRef.current, 'yPercent', { duration: 0.6, ease: 'power3.out' })
      : null

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5

      rotY(px * max * 2)
      rotX(-py * max * 2)

      if (glareX && glareY) {
        glareX(px * 60)
        glareY(py * 60)
      }
    }

    const onEnter = () => {
      lift(40)
      if (glareRef.current) gsap.to(glareRef.current, { opacity: 1, duration: 0.4 })
    }

    const onLeave = () => {
      rotX(0)
      rotY(0)
      lift(0)
      if (glareRef.current) gsap.to(glareRef.current, { opacity: 0, duration: 0.5 })
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointerleave', onLeave)

    return () => {
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [max])

  return (
    <div ref={wrapRef} style={{ perspective: 1000 }} {...rest}>
      <div
        ref={cardRef}
        className={`relative h-full ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(253, 230, 138, 0.16), rgba(253, 230, 138,0) 60%)',
            }}
          />
        )}
        {children}
      </div>
    </div>
  )
}

export default TiltCard
