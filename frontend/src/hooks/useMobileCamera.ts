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

const CANVAS_W = 960
const CANVAS_H = 540

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
  const fpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fpsCountRef = useRef(0)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (fpsTimerRef.current) {
      clearInterval(fpsTimerRef.current)
      fpsTimerRef.current = null
    }
  }, [])

  const stopStreamOnly = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const waitForVideoReady = useCallback(async () => {
    const video = videoRef.current

    if (!video) return false

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      return true
    }

    return await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => {
        resolve(false)
      }, 3000)

      const done = () => {
        window.clearTimeout(timeout)
        resolve(true)
      }

      video.onloadedmetadata = done
      video.oncanplay = done
    })
  }, [])

  const startCamera = useCallback(
    async (facing: FacingMode = "environment") => {
      setError(null)

      if (
        typeof navigator.mediaDevices === "undefined" ||
        typeof navigator.mediaDevices.getUserMedia === "undefined"
      ) {
        if (
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          setError("HTTPS_REQUIRED")
        } else {
          setError("Trình duyệt không hỗ trợ camera. Dùng Chrome/Safari mới hơn.")
        }

        return
      }

      clearTimers()
      stopStreamOnly()

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 15, max: 30 },
          },
          audio: false,
        })

        streamRef.current = newStream
        setIsStreaming(true)
        setFacingMode(facing)
        setTorchOn(false)

        const video = videoRef.current

        if (video) {
          video.srcObject = newStream
          video.muted = true
          video.playsInline = true

          try {
            await video.play()
          } catch {
            // iOS đôi khi cần user gesture, nhưng preview thường vẫn chạy
          }
        }
      } catch (err) {
        const name = (err as Error).name ?? ""

        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setError("Cần cấp quyền camera. Nhấn Cho phép khi trình duyệt hỏi.")
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setError("Không tìm thấy camera trên thiết bị.")
        } else if (name === "NotReadableError" || name === "TrackStartError") {
          setError("Camera đang được dùng bởi ứng dụng khác.")
        } else if (
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          setError("HTTPS_REQUIRED")
        } else {
          setError(`Lỗi camera: ${(err as Error).message}`)
        }
      }
    },
    [clearTimers, stopStreamOnly],
  )

  const flipCamera = useCallback(async () => {
    const next: FacingMode = facingMode === "environment" ? "user" : "environment"
    await startCamera(next)
  }, [facingMode, startCamera])

  const stopCamera = useCallback(() => {
    clearTimers()
    stopStreamOnly()
    setIsStreaming(false)
    setFramesSent(0)
    setFps(0)
    setTorchOn(false)
  }, [clearTimers, stopStreamOnly])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return

    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      })

      setTorchOn((value) => !value)
    } catch {
      // Thiết bị không hỗ trợ flash thì bỏ qua
    }
  }, [torchOn])

  const captureAndSend = useCallback(
    async (ws: WebSocket, intervalMs = 700) => {
      clearTimers()

      fpsCountRef.current = 0
      setFramesSent(0)
      setFps(0)

      const ready = await waitForVideoReady()

      if (!ready) {
        setError("Camera chưa sẵn sàng để gửi frame. Hãy bấm Dừng rồi Bắt đầu lại.")
        return
      }

      fpsTimerRef.current = setInterval(() => {
        setFps(fpsCountRef.current)
        fpsCountRef.current = 0
      }, 1000)

      const sendFrame = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return
        if (video.readyState < 2) return
        if (video.videoWidth <= 0 || video.videoHeight <= 0) return
        if (ws.readyState !== WebSocket.OPEN) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = CANVAS_W
        canvas.height = CANVAS_H

        ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H)

        const base64 = canvas.toDataURL("image/jpeg", 0.65)

        if (!base64 || base64.length < 1000) return

        ws.send(base64)

        fpsCountRef.current += 1
        setFramesSent((value) => value + 1)
      }

      sendFrame()

      intervalRef.current = setInterval(sendFrame, intervalMs)
    },
    [clearTimers, waitForVideoReady],
  )

  useEffect(() => {
    return () => {
      clearTimers()
      stopStreamOnly()
    }
  }, [clearTimers, stopStreamOnly])

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