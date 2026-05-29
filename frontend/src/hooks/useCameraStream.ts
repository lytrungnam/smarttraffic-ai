import { useCallback, useEffect, useRef, useState } from "react"

const API_HTTP = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"
const API_WS = API_HTTP.replace(/^http/, "ws")

export const STREAM_URL = `${API_HTTP}/api/v1/detections/stream`
const WS_URL = `${API_WS}/api/v1/ws/detections`

// Native resolution the detection engine outputs
const NATIVE_W = 960
const NATIVE_H = 540

const MAX_RETRIES = 3

export type TrackState = "tentative" | "active" | "occluded" | "lost"

export type CameraTrack = {
  track_id: number
  state: TrackState
  bbox: [number, number, number, number]
  predicted_bbox: [number, number, number, number] | null
  plate_text: string | null
  plate_confidence: number
  time_in_frame_sec: number
  velocity: [number, number]
  trajectory_last10: [number, number][]
}

export type CameraStreamError = null | "daily_limit" | "camera_limit" | "connection"

export type CameraStreamResult = {
  streamUrl: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  isConnected: boolean
  tracks: CameraTrack[]
  processingMs: number
  totalDetected: number
  error: CameraStreamError
  reconnect: () => void
}

function drawTracks(
  canvas: HTMLCanvasElement,
  container: HTMLDivElement,
  tracks: CameraTrack[],
) {
  const cw = container.offsetWidth
  const ch = container.offsetHeight
  if (cw === 0 || ch === 0) return

  if (canvas.width !== cw) canvas.width = cw
  if (canvas.height !== ch) canvas.height = ch

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, cw, ch)

  const sx = cw / NATIVE_W
  const sy = ch / NATIVE_H
  const fontSize = cw < 500 ? 12 : 14

  for (const t of tracks) {
    const isOccluded = t.state === "occluded"
    const raw = isOccluded && t.predicted_bbox ? t.predicted_bbox : t.bbox
    const x1 = raw[0] * sx
    const y1 = raw[1] * sy
    const w = (raw[2] - raw[0]) * sx
    const h = (raw[3] - raw[1]) * sy

    ctx.save()
    ctx.lineWidth = 2
    if (isOccluded) {
      ctx.strokeStyle = "#ffaa00"
      ctx.setLineDash([5, 5])
    } else {
      ctx.strokeStyle = "#00ff88"
      ctx.setLineDash([])
    }
    ctx.strokeRect(x1, y1, w, h)
    ctx.restore()

    const label = t.plate_text
      ? `ID:${t.track_id} | ${t.plate_text}`
      : `ID:${t.track_id} | đang nhận diện...`
    const labelY = y1 > fontSize + 6 ? y1 - 4 : y1 + fontSize + 4

    ctx.save()
    ctx.font = `bold ${fontSize}px monospace`
    ctx.fillStyle = isOccluded ? "#ffaa00" : "#00ff88"
    ctx.fillText(label, x1 + 4, labelY)
    ctx.restore()
  }
}

export function useCameraStream(_cameraId: number, _token: string): CameraStreamResult {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<CameraTrack[]>([])
  const rafRef = useRef<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  const [isConnected, setIsConnected] = useState(false)
  const [tracks, setTracks] = useState<CameraTrack[]>([])
  const [processingMs, setProcessingMs] = useState(0)
  const [totalDetected, setTotalDetected] = useState(0)
  const [error, setError] = useState<CameraStreamError>(null)

  // RAF drawing loop — reads tracksRef to avoid stale closure
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (canvas && container) {
      drawTracks(canvas, container, tracksRef.current)
    }
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  const connect = useCallback(() => {
    if (cancelledRef.current) return

    setIsConnected(false)
    setError(null)

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      if (cancelledRef.current) { ws.close(); return }
      setIsConnected(true)
      setError(null)
      retryCountRef.current = 0
    }

    ws.onmessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data as string) as Record<string, unknown>
        if (Array.isArray(msg.tracks)) {
          const newTracks = msg.tracks as CameraTrack[]
          tracksRef.current = newTracks
          setTracks(newTracks)
          const active = newTracks.filter((t) => t.state === "active").length
          if (active > 0) setTotalDetected((n) => n + active)
        }
        if (typeof msg.processing_ms === "number") {
          setProcessingMs(msg.processing_ms)
        }
      } catch { /* ignore parse errors */ }
    }

    ws.onerror = () => ws.close()

    ws.onclose = (ev) => {
      if (cancelledRef.current) return
      setIsConnected(false)
      tracksRef.current = []
      setTracks([])

      if (ev.code === 4002) { setError("daily_limit"); return }
      if (ev.code === 4003) { setError("camera_limit"); return }

      if (retryCountRef.current < MAX_RETRIES) {
        setError("connection")
        const delay = 3000 * (retryCountRef.current + 1)
        retryCountRef.current++
        retryTimerRef.current = setTimeout(connect, delay)
      } else {
        setError("connection")
      }
    }
  }, []) // stable: no deps change after mount

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    wsRef.current?.close()
    connect()
  }, [connect])

  useEffect(() => {
    cancelledRef.current = false
    connect()
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelledRef.current = true
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      wsRef.current?.close()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [connect, draw])

  return {
    streamUrl: STREAM_URL,
    canvasRef,
    containerRef,
    isConnected,
    tracks,
    processingMs,
    totalDetected,
    error,
    reconnect,
  }
}
