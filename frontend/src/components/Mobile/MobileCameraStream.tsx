import { Camera, FlipHorizontal, Zap, Square, Play } from "lucide-react"
import { useEffect } from "react"
import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import { useMobileCamera } from "@/hooks/useMobileCamera"
import { useWebSocketStream } from "@/hooks/useWebSocketStream"
import { formatPlateNumber } from "@/utils/plateDisplay"

type Props = {
  token?: string
  cameraId?: number
}

export default function MobileCameraStream({ token = "", cameraId = 99 }: Props) {
  const cam = useMobileCamera()
  const stream = useWebSocketStream(cam.captureAndSend)

  // Khi camera bật và WS kết nối → bắt đầu stream
  const handleStart = async () => {
    if (!cam.isStreaming) {
      await cam.startCamera("environment")
    }
    await stream.connect(cameraId, token)
  }

  const handleStop = () => {
    stream.disconnect()
    cam.stopCamera()
  }

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stream.disconnect()
      cam.stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // === HTTPS ERROR SCREEN ===
  if (cam.error === "HTTPS_REQUIRED") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-yellow-400">Cần kết nối HTTPS</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Chrome Android chỉ cho phép camera trên HTTPS hoặc localhost.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4 text-sm">
            <p className="mb-3 font-semibold text-cyan-400">Cách fix khi demo local:</p>
            <ol className="space-y-2 text-zinc-300">
              <li>1. Mở Chrome Android → <code className="rounded bg-zinc-800 px-1 text-xs">chrome://flags</code></li>
              <li>2. Tìm <em>Insecure origins treated as secure</em></li>
              <li>
                3. Thêm địa chỉ:
                <code className="mt-1 block rounded bg-zinc-800 px-2 py-1 text-xs text-cyan-300">
                  http://[IP-máy-tính]:5173
                </code>
              </li>
              <li>4. Nhấn Relaunch</li>
            </ol>
          </div>

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

  // === IDLE SCREEN (chưa bật camera) ===
  if (!cam.isStreaming && !cam.error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 text-white">
        <button
          type="button"
          onClick={handleStart}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
            <Camera className="h-10 w-10 text-cyan-400" />
          </div>
          <p className="text-lg font-semibold text-white">Nhấn để bật camera</p>
          <p className="text-sm text-zinc-500">Camera sau — nhận diện biển số</p>
        </button>
      </div>
    )
  }

  // === ERROR SCREEN (lỗi camera khác) ===
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

  // Lấy detection mới nhất để hiển thị card lớn
  const latest = stream.detections[0] ?? null

  // === MAIN STREAM UI ===
  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">

      {/* VIDEO PREVIEW — 60% màn hình */}
      <div className="relative flex-[6] overflow-hidden bg-black">
        {/* Video element */}
        <video
          ref={cam.videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: cam.facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Hidden canvas để capture frame */}
        <canvas ref={cam.canvasRef} className="hidden" />

        {/* LIVE badge */}
        {stream.isConnected && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-bold tracking-wider text-white">LIVE</span>
          </div>
        )}

        {/* FPS counter */}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-cyan-400 backdrop-blur-sm">
          {cam.fps} fps
        </div>

        {/* Camera label */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
          {cam.facingMode === "environment" ? "Camera sau" : "Camera trước"}
        </div>

        {/* Connecting overlay */}
        {stream.isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <p className="mt-2 text-sm text-cyan-400">Đang kết nối...</p>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS + RESULTS — 40% màn hình */}
      <div className="flex-[4] overflow-y-auto bg-zinc-950 px-4 py-4">

        {/* Hàng 1: Controls */}
        <div className="mb-4 flex items-center justify-between gap-3">
          {/* Đổi camera */}
          <button
            type="button"
            onClick={cam.flipCamera}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900 py-3 text-xs text-zinc-300 transition active:bg-zinc-800"
          >
            <FlipHorizontal className="h-5 w-5" />
            Đổi camera
          </button>

          {/* Start / Stop */}
          <button
            type="button"
            onClick={stream.isConnected ? handleStop : handleStart}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 text-xs font-semibold transition active:scale-95 ${
              stream.isConnected
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "bg-cyan-500 text-black"
            }`}
          >
            {stream.isConnected ? (
              <><Square className="h-5 w-5" /> Dừng</>
            ) : (
              <><Play className="h-5 w-5" /> Bắt đầu</>
            )}
          </button>

          {/* Đèn flash */}
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

        {/* Error banner */}
        {stream.error && stream.error !== "daily_limit_exceeded" && stream.error !== "camera_limit_exceeded" && (
          <div className="mb-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
            {stream.error}
          </div>
        )}

        {/* Hàng 2: Kết quả nhận diện */}
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
                    {getVehicleClassLabel(latest.vehicle_type)} · Confidence: {Math.round(latest.confidence )}%
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
              <p className="text-sm text-zinc-600">Chỉ xuống xe để nhận diện biển số...</p>
            </div>
          )
        )}

        {/* Recent detections list */}
        {stream.detections.length > 1 && (
          <div className="mb-4 space-y-2">
            {stream.detections.slice(1, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-zinc-900/60 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatPlateNumber(d.plate_number)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {getVehicleClassLabel(d.vehicle_type)}
                  </p>
                </div>
                <span className="text-xs text-cyan-400">{Math.round(d.confidence 
                
                )}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Hàng 3: Mini stats */}
        <div className="flex items-center justify-center gap-4 rounded-xl bg-zinc-900/40 px-4 py-2.5 text-xs text-zinc-500">
          <span>Đã nhận diện: <span className="text-white font-semibold">{stream.totalDetected}</span> xe</span>
          <span className="h-3 w-px bg-zinc-700" />
          <span>Frames: <span className="text-white font-semibold">{cam.framesSent}</span></span>
          {stream.lastProcessingMs > 0 && (
            <>
              <span className="h-3 w-px bg-zinc-700" />
              <span>AI: <span className="text-white font-semibold">{stream.lastProcessingMs}ms</span></span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
