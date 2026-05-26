// components/Camera/CameraCard.tsx

import { Camera, Maximize2 } from "lucide-react"
import { useCameraStream } from "@/hooks/useCameraStream"

type Props = {
  cameraId?: number
  cameraName?: string
  location?: string
  isActive?: boolean
  token?: string
  onExpand?: () => void
}

export default function CameraCard({
  cameraId = 1,
  cameraName = "AI Traffic Camera #01",
  location = "Da Nang - Hai Chau District",
  isActive = true,
  token = "",
  onExpand,
}: Props) {
  const stream = useCameraStream(cameraId, token)

  // ── Offline placeholder ────────────────────────────────────────────────────
  if (!isActive) {
    return (
      <div
        className="
          flex h-[220px] flex-col
          items-center justify-center

          rounded-3xl
          border border-white/10
          bg-zinc-900/60

          sm:h-[260px]
          md:h-[300px]
        "
      >
        <Camera className="h-10 w-10 text-zinc-700" />
        <p className="mt-3 text-sm font-semibold text-zinc-600">Camera offline</p>
        <p className="mt-1 text-xs text-zinc-700">{location}</p>
      </div>
    )
  }

  const activeTracks = stream.tracks.filter((t) => t.state === "active")

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">

      {/* STREAM + CANVAS */}
      <div
        ref={stream.containerRef}
        className="
          relative
          h-[220px]
          overflow-hidden

          sm:h-[260px]
          md:h-[300px]
        "
      >
        {/* MJPEG stream */}
        <img
          src={stream.streamUrl}
          alt={cameraName}
          className="h-full w-full object-cover"
        />

        {/* Canvas overlay for bbox */}
        <canvas
          ref={stream.canvasRef}
          className="pointer-events-none absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Dark gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Expand button */}
        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="
              absolute right-3 top-3

              min-h-[44px] min-w-[44px]

              rounded-xl
              border border-white/10
              bg-black/40

              p-2.5

              backdrop-blur-sm
              transition

              hover:bg-black/60
            "
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </button>
        )}

        {/* Overlay: reconnecting */}
        {stream.error === "connection" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <p className="text-sm font-semibold text-orange-400">Đang kết nối lại...</p>
            <button
              type="button"
              onClick={stream.reconnect}
              className="
                min-h-[44px]
                rounded-full
                border border-orange-500/30
                bg-orange-500/10

                px-4

                text-sm font-semibold text-orange-400
                transition hover:bg-orange-500/20
              "
            >
              Kết nối lại
            </button>
          </div>
        )}

        {stream.error === "daily_limit" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-sm font-semibold text-red-400">Hết 2h hôm nay</p>
          </div>
        )}

        {stream.error === "camera_limit" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-sm font-semibold text-red-400">Vượt giới hạn camera</p>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center gap-3 border-t border-white/10 bg-zinc-900/80 px-4 py-2.5">
        {/* Live dot */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              stream.isConnected ? "animate-pulse bg-red-500" : "bg-zinc-600"
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              stream.isConnected ? "text-red-400" : "text-zinc-500"
            }`}
          >
            {stream.isConnected ? "LIVE" : "Offline"}
          </span>
        </div>

        <span className="h-3 w-px shrink-0 bg-white/10" />

        {/* Camera name */}
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
          {cameraName}
        </span>

        {/* Vehicle count */}
        <span className="shrink-0 text-xs text-zinc-400">
          🚗 {activeTracks.length} xe
        </span>

        {/* Processing time */}
        {stream.processingMs > 0 && (
          <span className="shrink-0 text-xs text-zinc-600">
            {stream.processingMs}ms
          </span>
        )}
      </div>
    </div>
  )
}
