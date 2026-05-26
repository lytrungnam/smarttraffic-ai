import { useCallback, useEffect, useRef, useState } from "react"

export type FacingMode = "environment" | "user"

export type MobileCameraState = {
  stream: MediaStream | null
  isStreaming: boolean
  facingMode: FacingMode
  error: string | null
  framesSent: number
  fps: number
  torchOn: boolean
}

const CANVAS_W = 1280
const CANVAS_H = 720

export function useMobileCamera() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")
  const [error, setError] = useState<string | null>(null)
  const [framesSent, setFramesSent] = useState(0)
  const [fps, setFps] = useState(0)
  const [torchOn, setTorchOn] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fpsCountRef = useRef(0)
  const fpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const _stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const _clearTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (fpsTimerRef.current) { clearInterval(fpsTimerRef.current); fpsTimerRef.current = null }
  }, [])

  const startCamera = useCallback(async (facing: FacingMode = "environment") => {
    setError(null)

    // Check HTTPS requirement (getUserMedia requires secure context except localhost)
    if (
      typeof navigator.mediaDevices === "undefined" ||
      typeof navigator.mediaDevices.getUserMedia === "undefined"
    ) {
      if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        setError("HTTPS_REQUIRED")
      } else {
        setError("Trình duyệt không hỗ trợ. Dùng Chrome trên Android.")
      }
      return
    }

    _stopStream()

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: CANVAS_W },
          height: { ideal: CANVAS_H },
          frameRate: { ideal: 15 },
        },
        audio: false,
      })

      streamRef.current = newStream
      setIsStreaming(true)
      setFacingMode(facing)
      setTorchOn(false)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      const msg = (err as Error).name ?? ""
      if (msg === "NotAllowedError" || msg === "PermissionDeniedError") {
        setError("Cần cấp quyền camera. Nhấn 'Cho phép' khi trình duyệt hỏi.")
      } else if (msg === "NotFoundError" || msg === "DevicesNotFoundError") {
        setError("Không tìm thấy camera trên thiết bị.")
      } else if (msg === "NotReadableError" || msg === "TrackStartError") {
        setError("Camera đang được dùng bởi ứng dụng khác.")
      } else if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        setError("HTTPS_REQUIRED")
      } else {
        setError(`Lỗi camera: ${(err as Error).message}`)
      }
    }
  }, [_stopStream])

  const flipCamera = useCallback(async () => {
    const next: FacingMode = facingMode === "environment" ? "user" : "environment"
    _clearTimers()
    await startCamera(next)
  }, [facingMode, startCamera, _clearTimers])

  const stopCamera = useCallback(() => {
    _clearTimers()
    _stopStream()
    setIsStreaming(false)
    setFramesSent(0)
    setFps(0)
    setTorchOn(false)
  }, [_clearTimers, _stopStream])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] })
      setTorchOn((v) => !v)
    } catch {
      // torch not supported on this device — silently ignore
    }
  }, [torchOn])

  const captureAndSend = useCallback(
    (ws: WebSocket, intervalMs = 500) => {
      _clearTimers()
      fpsCountRef.current = 0
      setFramesSent(0)

      fpsTimerRef.current = setInterval(() => {
        setFps(fpsCountRef.current)
        fpsCountRef.current = 0
      }, 1000)

      intervalRef.current = setInterval(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < 2) return
        if (ws.readyState !== WebSocket.OPEN) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = CANVAS_W
        canvas.height = CANVAS_H
        ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H)
        const base64 = canvas.toDataURL("image/jpeg", 0.7)

        ws.send(base64)
        fpsCountRef.current++
        setFramesSent((n) => n + 1)
      }, intervalMs)
    },
    [_clearTimers],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      _clearTimers()
      _stopStream()
    }
  }, [_clearTimers, _stopStream])

  return {
    stream: streamRef.current,
    isStreaming,
    facingMode,
    error,
    framesSent,
    fps,
    torchOn,
    videoRef,
    canvasRef,
    startCamera,
    flipCamera,
    stopCamera,
    toggleTorch,
    captureAndSend,
  }
}
