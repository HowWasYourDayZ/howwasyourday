'use client'
import { useEffect, useState } from 'react'

// Home page, phones only: once the hero has scrolled away, keep one clear way to start.
export default function HomeStickyCta({ price, mins }: { price: string; mins: number }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('hero-answers')
    if (!hero || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`hw-sticky${show ? ' on' : ''}`} aria-hidden={!show}>
      <div>
        <b>{mins} minutes · {price}</b>
        <span>A real person, by text or voice</span>
      </div>
      <a href={`/talk?mins=${mins}&src=home_sticky`} tabIndex={show ? 0 : -1}>Start talking</a>
    </div>
  )
}
