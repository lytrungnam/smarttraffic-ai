import { Camera, FlipHorizontal, Zap, Square, Play } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import { useMobileCamera } from "@/hooks/useMobileCamera"
import { type PlateResult, useWebSocketStream } from "@/hooks/useWebSocketStream"
import { formatPlateNumber } from "@/utils/plateDisplay"

type Props = {
  token?: string
  cameraId?: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type PlateWithBox = PlateResult & {
  box: [number, number, number, number]
}

function hasValidBox(plate: PlateResult): plate is PlateWithBox {
  return Array.isArray(plate.box) && plate.box.length === 4
}

function normalizeConfidence(confidence: number) {
  if (!Number.isFinite(confidence)) return 0
  if (confidence <= 1) return Math.round(confidence * 100)
  return Math.round(confidence)
}

function drawBoxes(
  canvas: HTMLCanvasElement,
  plates: PlateResult[],
  videoEl: HTMLVideoElement,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const rect = videoEl.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const plate of plates) {
    if (!hasValidBox(plate)) continue

    const [bx1, by1, bx2, by2] = plate.box

    const srcW =
      plate.box_source_width && plate.box_source_width > 0
        ? plate.box_source_width
        : videoEl.videoWidth || 960

    const srcH =
      plate.box_source_height && plate.box_source_height > 0
        ? plate.box_source_height
        : videoEl.videoHeight || 540

    const scaleX = canvas.width / srcW
    const scaleY = canvas.height / srcH

    const x = bx1 * scaleX
    const y = by1 * scaleY
    const w = (bx2 - bx1) * scaleX
    const h = (by2 - by1) * scaleY

    ctx.strokeStyle = "#22d3ee"
    ctx.lineWidth = 2
    ctx.shadowColor = "#22d3ee"
    ctx.shadowBlur = 6
    ctx.strokeRect(x, y, w, h)
    ctx.shadowBlur = 0

    const label = formatPlateNumber(plate.plate_number)
    const vehicleLabel = getVehicleClassLabel(plate.vehicle_type)
    const confLabel = `${normalizeConfidence(plate.confidence)}%`

    ctx.font = "bold 13px monospace"

    const textW = Math.max(
      ctx.measureText(label).width,
      ctx.measureText(`${vehicleLabel} · ${confLabel}`).width,
    )

    const labelH = 38
    const labelY = y > labelH + 4 ? y - labelH - 4 : y + h + 4

    ctx.fillStyle = "rgba(0,0,0,0.75)"
    ctx.fillRect(x, labelY, textW + 12, labelH)

    ctx.fillStyle = "#22d3ee"
    ctx.font = "bold 13px monospace"
    ctx.fillText(label, x + 6, labelY + 14)

    ctx.fillStyle = "#ffffff"
    ctx.font = "11px sans-serif"
    ctx.fillText(`${vehicleLabel} · ${confLabel}`, x + 6, labelY + 30)
  }
}

export default function MobileCameraStream({ token = "", cameraId = 99 }: Props) {
  const cam = useMobileCamera()
  const stream = useWebSocketStream(cam.captureAndSend)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const [starting, setStarting] = useState(false)

  const latest = stream.detections[0] ?? null

  useEffect(() => {
    const overlay = overlayRef.current
    const video = cam.videoRef.current

    if (!overlay || !video) return

    const plates = stream.detections.filter(hasValidBox)

    if (plates.length === 0) {
      const ctx = overlay.getContext("2d")
      ctx?.clearRect(0, 0, overlay.width, overlay.height)
      return
    }

    drawBoxes(overlay, plates, video)
  }, [stream.detections, cam.videoRef])

  const handleStart = useCallback(async () => {
    if (starting || stream.isConnected || stream.isConnecting) return

    try {
      setStarting(true)

      if (!cam.isStreaming) {
        await cam.startCamera("environment")
      }

      await sleep(800)

      await stream.connect(cameraId, token)
    } finally {
      setStarting(false)
    }
  }, [
    starting,
    stream,
    cam,
    cameraId,
    token,
  ])

  const handleStop = useCallback(() => {
    stream.disconnect()
    cam.stopCamera()
    setStarting(false)

    const overlay = overlayRef.current
    const ctx = overlay?.getContext("2d")

    if (ctx && overlay) {
      ctx.clearRect(0, 0, overlay.width, overlay.height)
    }
  }, [stream, cam])

  useEffect(() => {
    return () => {
      stream.disconnect()
      cam.stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (cam.error === "HTTPS_REQUIRED") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <span className="text-3xl">⚠️</span>
          </div>

          <h2 className="text-lg font-semibold text-yellow-400">
            Cần kết nối HTTPS
          </h2>

          <p className="text-sm text-zinc-400">
            Chrome Android chỉ cho phép camera trên HTTPS hoặc localhost.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-cyan-500 py-3 text-sm font-semibold text-black"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!cam.isStreaming && !cam.error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 text-white">
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="flex flex-col items-center gap-4 disabled:opacity-60"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
            <Camera className="h-10 w-10 text-cyan-400" />
          </div>

          <p className="text-lg font-semibold text-white">
            {starting ? "Đang bật camera..." : "Nhấn để bật camera"}
          </p>

          <p className="text-sm text-zinc-500">
            Camera sau — nhận diện biển số
          </p>
        </button>
      </div>
    )
  }

  if (cam.error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <span className="text-3xl">📷</span>
          </div>

          <p className="text-sm text-red-400">{cam.error}</p>

          <button
            type="button"
            onClick={() => cam.startCamera("environment")}
            className="mt-4 rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <div className="relative flex-[6] overflow-hidden bg-black">
        <video
          ref={cam.videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{
            transform: cam.facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />

        <canvas
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        <canvas ref={cam.canvasRef} className="hidden" />

        {stream.isConnected && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-bold tracking-wider text-white">
              LIVE
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-cyan-400 backdrop-blur-sm">
            {cam.fps} fps
          </div>

          {stream.lastProcessingMs > 0 && (
            <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-emerald-400 backdrop-blur-sm">
              {stream.lastProcessingMs} ms
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
          {cam.facingMode === "environment" ? "Camera sau" : "Camera trước"}
        </div>

        {(stream.isConnecting || starting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <p className="mt-2 text-sm text-cyan-400">Đang kết nối...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-[4] overflow-y-auto bg-zinc-950 px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={cam.flipCamera}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900 py-3 text-xs text-zinc-300 transition active:bg-zinc-800"
          >
            <FlipHorizontal className="h-5 w-5" />
            Đổi camera
          </button>

          <button
            type="button"
            onClick={stream.isConnected ? handleStop : handleStart}
            disabled={starting}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-semibold transition active:scale-95 disabled:opacity-60 ${
              stream.isConnected
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "bg-cyan-500 text-black"
            }`}
          >
            {stream.isConnected ? (
              <>
                <Square className="h-5 w-5" />
                Dừng
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                {starting ? "Đang bật" : "Bắt đầu"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={cam.toggleTorch}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-3 text-xs transition active:bg-zinc-800 ${
              cam.torchOn
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-white/10 bg-zinc-900 text-zinc-300"
            }`}
          >
            <Zap className="h-5 w-5" />
            Đèn flash
          </button>
        </div>

        {stream.error &&
          stream.error !== "daily_limit_exceeded" &&
          stream.error !== "camera_limit_exceeded" && (
            <div className="mb-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
              {stream.error}
            </div>
          )}

        {latest ? (
          <div className="mb-4 overflow-hidden rounded-2xl border border-cyan-500/20 bg-zinc-900">
            <div className="bg-cyan-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-500">
              Latest Detection
            </div>

            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚗</span>

                <div>
                  <p className="text-2xl font-black tracking-widest text-white">
                    {formatPlateNumber(latest.plate_number)}
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-400">
                    {getVehicleClassLabel(latest.vehicle_type)} · Confidence:{" "}
                    {normalizeConfidence(latest.confidence)}%
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    {new Date().toLocaleTimeString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          stream.isConnected && (
            <div className="mb-4 flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10">
              <p className="text-sm text-zinc-600">
                Hướng camera vào biển số xe...
              </p>
            </div>
          )
        )}

        {stream.detections.length > 1 && (
          <div className="mb-4 space-y-2">
            {stream.detections.slice(1, 5).map((d, i) => (
              <div
                key={`${d.plate_number}-${i}`}
                className="flex items-center justify-between rounded-xl bg-zinc-900/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatPlateNumber(d.plate_number)}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {getVehicleClassLabel(d.vehicle_type)}
                  </p>
                </div>

                <span className="text-xs text-cyan-400">
                  {normalizeConfidence(d.confidence)}%
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 rounded-xl bg-zinc-900/40 px-4 py-2.5 text-xs text-zinc-500">
          <span>
            Nhận diện:{" "}
            <span className="font-semibold text-white">
              {stream.totalDetected}
            </span>{" "}
            xe
          </span>

          <span className="h-3 w-px bg-zinc-700" />

          <span>
            Frames:{" "}
            <span className="font-semibold text-white">{cam.framesSent}</span>
          </span>

          {stream.lastProcessingMs > 0 && (
            <>
              <span className="h-3 w-px bg-zinc-700" />

              <span>
                AI:{" "}
                <span className="font-semibold text-white">
                  {stream.lastProcessingMs}ms
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}