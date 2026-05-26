// components/Camera/CameraModal.tsx

import { Camera, Radio, X } from "lucide-react"
import { useEffect } from "react"
import { useCameraStream } from "@/hooks/useCameraStream"

type Props = {
  open: boolean
  onClose: () => void
  cameraId?: number
  cameraName?: string
  location?: string
  token?: string
}

export default function CameraModal({
  open,
  onClose,
  cameraId = 1,
  cameraName = "AI Traffic Camera #01",
  location = "Da Nang - Hai Chau District",
  token = "",
}: Props) {
  // Modal has its own stream instance — CameraCard's stream keeps running unaffected
  const stream = useCameraStream(cameraId, token)

  const activeTracks = stream.tracks.filter((t) => t.state === "active")
  const occludedTracks = stream.tracks.filter((t) => t.state === "occluded")

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    /* Backdrop — click outside to close */
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center

        bg-black/80
        p-0
        backdrop-blur-md

        md:p-4
      "
      onClick={onClose}
    >
      {/* Modal panel — stop click from bubbling to backdrop */}
      <div
        className="
          relative
          flex flex-col

          h-full w-full

          overflow-hidden
          rounded-none
          border border-white/10
          bg-zinc-950
          shadow-2xl

          md:h-[85vh]
          md:max-w-[80vw]
          md:rounded-3xl
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div
          className="
            flex shrink-0 items-center
            justify-between gap-4

            border-b border-white/10

            px-4 py-4

            lg:px-6
          "
        >
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            {/* Live badge */}
            <div
              className="
                inline-flex shrink-0
                items-center gap-2

                rounded-full
                border border-green-500/20
                bg-green-500/10

                px-3 py-1.5
              "
            >
              <Radio className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400">LIVE</span>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                {cameraName}
              </h2>
              <p className="text-xs text-zinc-500">{location}</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-semibold text-cyan-400">
              {activeTracks.length + occludedTracks.length} xe trong khung
            </span>
            <button
              type="button"
              onClick={onClose}
              className="
                min-h-[44px] min-w-[44px]
                rounded-2xl
                border border-white/10
                bg-zinc-900

                p-3

                transition hover:bg-zinc-800
              "
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* BODY: stream (70%) + detection list (30%) */}
        <div
          className="
            flex flex-1
            flex-col
            overflow-hidden

            lg:flex-row
          "
        >
          {/* VIDEO — 70% on desktop, 60% on mobile */}
          <div
            ref={stream.containerRef}
            className="
              relative
              flex-[6]
              overflow-hidden
              bg-black

              lg:flex-[7]
            "
          >
            {/* MJPEG stream */}
            <img
              src={stream.streamUrl}
              alt={cameraName}
              className="h-full w-full object-cover"
            />

            {/* Canvas overlay */}
            <canvas
              ref={stream.canvasRef}
              className="pointer-events-none absolute inset-0"
              style={{ width: "100%", height: "100%" }}
            />

            {/* Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Reconnect overlay */}
            {stream.error === "connection" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
                <p className="text-sm font-semibold text-orange-400">Đang kết nối lại...</p>
                <button
                  type="button"
                  onClick={stream.reconnect}
                  className="
                    min-h-[44px]
                    rounded-full
                    border border-orange-500/30
                    bg-orange-500/10
                    px-5

                    text-sm font-semibold text-orange-400
                    transition hover:bg-orange-500/20
                  "
                >
                  Kết nối lại
                </button>
              </div>
            )}

            {/* Processing time badge */}
            {stream.processingMs > 0 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-cyan-400 backdrop-blur-sm">
                AI: {stream.processingMs}ms
              </div>
            )}
          </div>

          {/* DETECTION LIST — 30% on desktop, 40% on mobile */}
          <div
            className="
              flex-[4]
              overflow-y-auto
              border-t border-white/10
              bg-zinc-950

              px-4 py-4

              lg:flex-[3]
              lg:border-l lg:border-t-0
              lg:px-5
            "
          >
            {/* Section title */}
            <div className="mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4 text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Xe đang trong khung
              </p>
            </div>

            {/* Empty state */}
            {stream.tracks.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-white/10">
                <p className="text-sm text-zinc-600">
                  {stream.isConnected ? "Không có xe nào..." : "Đang kết nối..."}
                </p>
              </div>
            )}

            {/* Track rows */}
            <div className="space-y-2">
              {stream.tracks
                .filter((t) => t.state !== "lost")
                .map((t) => (
                  <div
                    key={t.track_id}
                    className="
                      flex items-center
                      justify-between gap-3

                      rounded-2xl
                      border border-white/10
                      bg-zinc-900/60

                      px-4 py-3
                    "
                  >
                    {/* Left: ID + plate */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {t.plate_text ?? "đang đọc..."}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        ID:{t.track_id} · {t.time_in_frame_sec}s
                      </p>
                    </div>

                    {/* Right: confidence + state */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-cyan-400">
                        {t.plate_text
                          ? `${Math.round(t.plate_confidence * 100)}%`
                          : "--"}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          t.state === "active"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        <span>{t.state === "active" ? "●" : "◌"}</span>
                        <span>{t.state === "active" ? "active" : "khuất"}</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Stats footer */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-zinc-500">Đang theo dõi</p>
                  <p className="mt-1 font-semibold text-white">
                    {activeTracks.length} xe
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Tổng đã detect</p>
                  <p className="mt-1 font-semibold text-white">
                    {stream.totalDetected}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
