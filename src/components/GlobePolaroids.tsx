import React, { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface PolaroidMarker {
  location: [number, number]
  size: number
}

const MARKERS: PolaroidMarker[] = [
  { location: [37.78,  -122.44], size: 0.05 },
  { location: [40.71,   -74.01], size: 0.05 },
  { location: [35.68,   139.65], size: 0.05 },
  { location: [-33.87,  151.21], size: 0.05 },
  { location: [48.86,     2.35], size: 0.05 },
  { location: [51.51,    -0.13], size: 0.05 },
  { location: [40.42,    -3.70], size: 0.05 },
]

interface GlobePolaroidsProps {
  className?: string
  speed?: number
}

export function GlobePolaroids({ className = "", speed = 0.003 }: GlobePolaroidsProps) {
  const canvasRef          = useRef<HTMLCanvasElement>(null)
  const phiRef             = useRef(0)
  const phiOffsetRef       = useRef(0)
  const thetaOffsetRef     = useRef(0)
  const dragStartRef       = useRef<{ x: number; y: number } | null>(null)
  const dragDeltaRef       = useRef({ phi: 0, theta: 0 })
  const isPausedRef        = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    isPausedRef.current  = true
    e.currentTarget.style.cursor = "grabbing"
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      dragDeltaRef.current = {
        phi:   (e.clientX - dragStartRef.current.x) / 200,
        theta: (e.clientY - dragStartRef.current.y) / 500,
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
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup",   onUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let globe: ReturnType<typeof createGlobe> | null = null
    let raf: number
    let active = true

    const start = (w: number) => {
      if (!active || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width:  w,
        height: w,
        phi:    0,
        theta:  0.3,
        dark:   0,
        diffuse:       1.5,
        mapSamples:    16000,
        mapBrightness: 8,
        baseColor:   [0.97, 0.97, 1.0],
        markerColor: [0.25, 0.47, 0.85],
        glowColor:   [0.95, 0.95, 1.0],
        markers: MARKERS,
        opacity: 1,
      })

      canvas.style.opacity = "1"

      const tick = () => {
        if (!active) return
        if (!isPausedRef.current) phiRef.current += speed
        globe!.update({
          phi:   phiRef.current + phiOffsetRef.current + dragDeltaRef.current.phi,
          theta: 0.3 + thetaOffsetRef.current + dragDeltaRef.current.theta,
        })
        raf = requestAnimationFrame(tick)
      }
      tick()
    }

    // Use the parent's width so aspect-square has a real value
    const w = canvas.parentElement?.offsetWidth || canvas.offsetWidth
    if (w > 0) {
      start(w)
    } else {
      const ro = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect.width
        if (width > 0) { ro.disconnect(); start(width) }
      })
      ro.observe(canvas.parentElement ?? canvas)
    }

    return () => {
      active = false
      cancelAnimationFrame(raf)
      globe?.destroy()
    }
  }, [speed])

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        style={{
          width:         "100%",
          height:        "100%",
          display:       "block",
          cursor:        "grab",
          opacity:       0,
          transition:    "opacity 0.8s ease",
          borderRadius:  "50%",
          touchAction:   "none",
        }}
      />
    </div>
  )
}
