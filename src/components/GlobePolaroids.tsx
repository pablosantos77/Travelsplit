import React, { useEffect, useRef, useState, useCallback } from "react"
import createGlobe from "cobe"

const MARKERS = [
  { location: [40.42,    -3.70], size: 0.06 }, // Madrid
  { location: [48.86,     2.35], size: 0.06 }, // Paris
  { location: [51.51,    -0.13], size: 0.06 }, // London
  { location: [40.71,   -74.01], size: 0.06 }, // NYC
  { location: [35.68,   139.65], size: 0.06 }, // Tokyo
  { location: [-33.87,  151.21], size: 0.06 }, // Sydney
  { location: [37.78,  -122.44], size: 0.06 }, // SF
] as { location: [number, number]; size: number }[]

interface GlobePolaroidsProps {
  speed?: number
}

export function GlobePolaroids({ speed = 0.004 }: GlobePolaroidsProps) {
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const phiRef          = useRef(0)
  const phiOffsetRef    = useRef(0)
  const thetaOffsetRef  = useRef(0)
  const dragStartRef    = useRef<{ x: number; y: number } | null>(null)
  const dragDeltaRef    = useRef({ phi: 0, theta: 0 })
  const isPausedRef     = useRef(false)

  const [size, setSize] = useState(() => {
    if (typeof window === "undefined") return 300
    return Math.min(window.innerWidth - 48, 360)
  })

  useEffect(() => {
    const onResize = () => setSize(Math.min(window.innerWidth - 48, 360))
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    isPausedRef.current  = true
    e.currentTarget.style.cursor = "grabbing"
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      dragDeltaRef.current = {
        phi:   (e.clientX - dragStartRef.current.x) / 150,
        theta: (e.clientY - dragStartRef.current.y) / 400,
      }
    }
    const onUp = () => {
      if (dragStartRef.current) {
        phiOffsetRef.current   += dragDeltaRef.current.phi
        thetaOffsetRef.current += dragDeltaRef.current.theta
        dragDeltaRef.current   = { phi: 0, theta: 0 }
        dragStartRef.current   = null
      }
      isPausedRef.current = false
      if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerup",   onUp,   { passive: true })
    window.addEventListener("pointercancel", onUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup",   onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size <= 0) return

    let raf = 0
    let active = true

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width:  size * 2,
      height: size * 2,
      phi:    0,
      theta:  0.3,
      dark:   0,
      diffuse:       1.2,
      mapSamples:    16000,
      mapBrightness: 6,
      baseColor:   [0.95, 0.95, 1.0],
      markerColor: [0.0,  0.3,  0.8],
      glowColor:   [0.9,  0.95, 1.0],
      markers: MARKERS,
    })

    const tick = () => {
      if (!active) return
      if (!isPausedRef.current) phiRef.current += speed
      globe.update({
        phi:   phiRef.current + phiOffsetRef.current + dragDeltaRef.current.phi,
        theta: 0.3 + thetaOffsetRef.current + dragDeltaRef.current.theta,
      })
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      active = false
      cancelAnimationFrame(raf)
      globe.destroy()
    }
  }, [size, speed])

  return (
    <div
      style={{
        width:        size,
        height:       size,
        margin:       "0 auto",
        position:     "relative",
        userSelect:   "none",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        style={{
          width:        `${size}px`,
          height:       `${size}px`,
          display:      "block",
          cursor:       "grab",
          touchAction:  "none",
          contain:      "layout paint size",
        }}
      />
    </div>
  )
}
