import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Every animation on the landing page, driven by GSAP and scoped to one root
 * element. Elements opt in with a data-anim attribute, so the JSX stays
 * readable and nothing here depends on class names that Tailwind might change.
 *
 * Reduced motion is honoured by skipping the whole timeline and simply
 * revealing everything, rather than playing a faster version of it.
 */
export const useLandingAnimations = (rootRef) => {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set('[data-anim]', { autoAlpha: 1, clearProps: 'transform' })
        return
      }

      /* ---------- hero, on load ---------- */

      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })

      hero
        .from(
          '[data-anim="title-char"]',
          {
            autoAlpha: 0,
            rotationX: -95,
            y: 50,
            transformOrigin: '50% 100% -30px',
            stagger: 0.05,
            duration: 1,
            ease: 'back.out(1.7)',
          },
        )
        .from(
          '[data-anim="hero-line"]',
          {
            autoAlpha: 0,
            y: 28,
            stagger: 0.13,
            duration: 0.75,
          },
          '-=0.55',
        )
        .from('[data-anim="chevron"]', { autoAlpha: 0, duration: 0.6 }, '-=0.2')

      // hero drifts back and dims as the page scrolls past it
      gsap.to('[data-anim="hero-content"]', {
        y: -110,
        scale: 0.94,
        autoAlpha: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-anim="hero"]',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })

      /* ---------- shared scroll reveal ---------- */

      // pre-hide, then play on enter, so nothing flashes before its trigger
      const reveal = (selector, from, stagger = 0.1) => {
        const targets = gsap.utils.toArray(selector)
        if (!targets.length) return

        gsap.set(targets, { autoAlpha: 0, ...from })

        ScrollTrigger.batch(targets, {
          start: 'top 88%',
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              z: 0,
              scale: 1,
              rotationX: 0,
              rotationY: 0,
              stagger,
              duration: 0.9,
              ease: 'power3.out',
              overwrite: true,
            }),
        })
      }

      // section headings hinge up out of the page
      reveal('[data-anim="heading"]', {
        y: 44,
        rotationX: -40,
        transformPerspective: 800,
        transformOrigin: 'top center',
      }, 0.08)

      // capability cards swing in from their left edge
      reveal('[data-anim="cap-card"]', {
        y: 60,
        rotationY: -28,
        z: -140,
        transformPerspective: 1000,
        transformOrigin: 'left center',
      }, 0.12)

      // step cards drop and untwist
      reveal('[data-anim="step-card"]', {
        y: 70,
        rotationY: 24,
        rotationX: 12,
        transformPerspective: 1000,
      }, 0.11)

      reveal('[data-anim="chart-panel"]', {
        y: 70,
        rotationX: 22,
        transformPerspective: 1200,
        transformOrigin: 'top center',
      })

      reveal('[data-anim="window-card"]', { y: 40, scale: 0.9 }, 0.12)
      reveal('[data-anim="legend-item"]', { scale: 0.5, y: 14 }, 0.1)
      reveal('[data-anim="signal-row"]', { x: -55 }, 0.09)
      reveal('[data-anim="cta"]', {
        y: 50,
        scale: 0.92,
        rotationX: 18,
        transformPerspective: 900,
      }, 0.12)

      /* ---------- continuous ambience ---------- */

      // the two CTA buttons breathe, so the page never looks frozen
      gsap.to('[data-anim="cta-glow"]', {
        boxShadow: '0 0 55px rgba(253, 230, 138,0.75)',
        repeat: -1,
        yoyo: true,
        duration: 1.9,
        ease: 'sine.inOut',
      })

      // step numerals drift on a slow parallax as you scroll the section
      gsap.to('[data-anim="step-numeral"]', {
        y: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-anim="steps-grid"]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // the signals table tilts very slightly as it passes through the viewport
      gsap.fromTo(
        '[data-anim="signals-table"]',
        { rotationX: 7, transformPerspective: 1400, transformOrigin: 'center top' },
        {
          rotationX: -3,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-anim="signals-table"]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      )

      /* ---------- keep trigger positions honest ---------- */

      // fonts and the hero canvas can settle after the first measure. without
      // a re-measure, a trigger can hold stale coordinates and leave a
      // pre-hidden element stranded at opacity 0.
      const refresh = () => ScrollTrigger.refresh()

      if (document.readyState === 'complete') {
        refresh()
      } else {
        window.addEventListener('load', refresh)
      }

      return () => window.removeEventListener('load', refresh)
    }, root)

    return () => ctx.revert()
  }, [rootRef])
}

export default useLandingAnimations
