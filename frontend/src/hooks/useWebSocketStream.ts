import { useCallback, useEffect, useRef, useState } from "react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export type PlateResult = {
  plate_number: string
  vehicle_type: string
  confidence: number
  status: string
}

export type StreamDetection = {
  plates: PlateResult[]
  vehicle_count: number
  processing_ms?: number
  source?: string
}

type StreamState = {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  detections: PlateResult[]
  totalDetected: number
  lastProcessingMs: number
}

export function useWebSocketStream(
  captureAndSend: (ws: WebSocket, intervalMs?: number) => void,
) {
  const [state, setState] = useState<StreamState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    detections: [],
    totalDetected: 0,
    lastProcessingMs: 0,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCount = useRef(0)
  const captureRef = useRef(captureAndSend)

  useEffect(() => { captureRef.current = captureAndSend }, [captureAndSend])

  const connect = useCallback(async (cameraId = 0, token = "") => {
    if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null }
    wsRef.current?.close()
    retryCount.current = 0

    setState((s) => ({ ...s, isConnecting: true, error: null }))

    try {
      const res = await fetch(`${API}/api/v1/stream/config`)
      const config = (await res.json()) as { ws_url: string }

      const params = new URLSearchParams({ camera_id: String(cameraId) })
      if (token) params.set("token", token)
      const url = `${config.ws_url}?${params}`

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setState((s) => ({ ...s, isConnected: true, isConnecting: false }))
        captureRef.current(ws, 500)
      }

      ws.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data as string) as StreamDetection
          const plates = data.plates ?? []
          setState((s) => ({
            ...s,
            detections: plates.length > 0
              ? [plates[0], ...s.detections].slice(0, 10)
              : s.detections,
            totalDetected: s.totalDetected + plates.length,
            lastProcessingMs: data.processing_ms ?? s.lastProcessingMs,
          }))
        } catch {
          // ignore parse errors
        }
      }

      ws.onclose = (e) => {
        setState((s) => ({ ...s, isConnected: false, isConnecting: false }))

        if (e.code === 4002) {
          setState((s) => ({ ...s, error: "daily_limit_exceeded" }))
          return
        }
        if (e.code === 4003) {
          setState((s) => ({ ...s, error: "camera_limit_exceeded" }))
          return
        }

        // Auto-retry 3 times with 3s delay
        if (retryCount.current < 3) {
          const attempt = retryCount.current + 1
          retryCount.current = attempt
          retryRef.current = setTimeout(() => connect(cameraId, token), 3000)
          setState((s) => ({ ...s, error: `Mất kết nối — thử lại lần ${attempt}/3...` }))
        } else {
          setState((s) => ({ ...s, error: "Mất kết nối. Kiểm tra WiFi và tải lại trang." }))
        }
      }

      ws.onerror = () => ws.close()
    } catch {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: "Không thể kết nối server. Đảm bảo cùng WiFi với máy tính.",
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (retryRef.current) clearTimeout(retryRef.current)
    wsRef.current?.close()
    wsRef.current = null
    setState((s) => ({ ...s, isConnected: false, isConnecting: false, error: null }))
  }, [])

  useEffect(() => {
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [])

  return { ...state, connect, disconnect }
}
