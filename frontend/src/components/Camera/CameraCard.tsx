// components/Camera/CameraCard.tsx

import { Camera, Maximize2, Smartphone } from "lucide-react"
import { useCameraStream } from "@/hooks/useCameraStream"

type Props = {
  cameraId?: number | string
  cameraName?: string
  location?: string
  isActive?: boolean
  token?: string
  cameraType?: string
  onExpand?: () => void
}

export default function CameraCard({
  cameraId = 1,
  cameraName = "AI Traffic Camera #01",
  location = "Da Nang - Hai Chau District",
  isActive = true,
  token = "",
  cameraType = "webcam",
  onExpand,
}: Props) {
  const numericCameraId =
    typeof cameraId === "number" ? cameraId : Number.parseInt(String(cameraId), 10) || 1

  const isMobileCamera = cameraType === "mobile"

  const stream = useCameraStream(numericCameraId, token)

  const mobileCameraUrl = `${window.location.origin}/mobile-camera?camera_id=${cameraId}`

  const openMobileCamera = () => {
    window.open(mobileCameraUrl, "_blank", "noopener,noreferrer")
  }

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
        <p className="mt-3 text-sm font-semibold text-zinc-600">
          Camera offline
        </p>
        <p className="mt-1 text-xs text-zinc-700">{location}</p>
      </div>
    )
  }

  // ── Mobile camera card ─────────────────────────────────────────────────────
  if (isMobileCamera) {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div
          className="
            relative flex h-[220px] flex-col
            items-center justify-center
            overflow-hidden
            bg-gradient-to-br from-zinc-950 via-zinc-900 to-black
            px-5 text-center

            sm:h-[260px]
            md:h-[300px]
          "
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
            <Smartphone className="h-8 w-8 text-cyan-300" />
          </div>

          <h4 className="mt-4 text-base font-bold text-white">
            Mobile Camera Ready
          </h4>

          <p className="mt-2 max-w-[260px] text-xs leading-5 text-zinc-400">
            Open this link on your phone to stream video frames from the mobile
            camera to Smart Traffic AI.
          </p>

          <button
            type="button"
            onClick={openMobileCamera}
            className="
              mt-5 min-h-[44px]
              rounded-full
              bg-cyan-500
              px-5
              text-sm font-bold text-black
              transition hover:bg-cyan-400
            "
          >
            Open Mobile Camera
          </button>

          <p className="mt-3 break-all text-[11px] text-zinc-600">
            {mobileCameraUrl}
          </p>

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
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 bg-zinc-900/80 px-4 py-2.5">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300">
              MOBILE
            </span>
          </div>

          <span className="h-3 w-px shrink-0 bg-white/10" />

          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
            {cameraName}
          </span>

          <span className="shrink-0 text-xs text-zinc-400">
            📱 Phone
          </span>
        </div>
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
            <p className="text-sm font-semibold text-orange-400">
              Đang kết nối lại...
            </p>
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
            <p className="text-sm font-semibold text-red-400">
              Hết 2h hôm nay
            </p>
          </div>
        )}

        {stream.error === "camera_limit" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-sm font-semibold text-red-400">
              Vượt giới hạn camera
            </p>
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