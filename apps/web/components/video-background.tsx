'use client'
import { useEffect, useRef } from 'react'

export function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    // Force muted via DOM property (not just React prop) for Mobile Safari
    video.muted = true
    video.play().catch(() => {
      // Autoplay blocked — retry on first user touch
      const tryPlay = () => {
        video.play().catch(() => {})
        document.removeEventListener('touchstart', tryPlay)
      }
      document.addEventListener('touchstart', tryPlay, { once: true })
    })
  }, [])

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover lg:hidden"
      src="/pb-prono-video.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  )
}
