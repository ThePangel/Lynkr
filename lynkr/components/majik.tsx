'use client'

import { useEffect, useRef, useState } from 'react'

import KonamiCode from 'konami-code-js'

export default function KonamiVideo() {
  const [active, setActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    new KonamiCode(() => {
      
      setActive(true)
      videoRef.current?.play()
    })

    
  }, [])

  return active ? (
    <video
      ref={videoRef}
      src="/easter-egg.mp4"
      autoPlay
      onEnded={() => setActive(false)}
      className="fixed bottom-0 right-0 w-screen rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.6)] z-[9999]"

    />
  ) : null
}
