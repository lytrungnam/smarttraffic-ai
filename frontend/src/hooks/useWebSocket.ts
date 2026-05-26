import { useEffect, useRef, useState } from "react"

export type WebSocketStatus = "connecting" | "open" | "closed"

export function useWebSocket(
  url: string,
  onMessage: (data: unknown) => void,
): WebSocketStatus {
  const [status, setStatus] = useState<WebSocketStatus>("connecting")
  const socketRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCount = useRef(0)
  const onMessageRef = useRef(onMessage)

  // keep onMessage ref current without re-triggering the effect
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    let cancelled = false

    const connect = () => {
      if (cancelled) return

      const ws = new WebSocket(url)
      socketRef.current = ws
      setStatus("connecting")

      ws.onopen = () => {
        if (cancelled) { ws.close(); return }
        setStatus("open")
        retryCount.current = 0
      }

      ws.onmessage = (e: MessageEvent) => {
        try {
          onMessageRef.current(JSON.parse(e.data as string))
        } catch {
          // ignore parse errors
        }
      }

      ws.onerror = () => ws.close()

      ws.onclose = () => {
        if (cancelled) return
        setStatus("closed")
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000)
        retryCount.current++
        retryRef.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (retryRef.current !== null) clearTimeout(retryRef.current)
      socketRef.current?.close()
    }
  }, [url])

  return status
}
