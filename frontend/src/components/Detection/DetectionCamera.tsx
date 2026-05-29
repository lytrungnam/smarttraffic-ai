import { Camera, Maximize2, Radio, ScanLine, Wifi } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const NATIVE_W = 960
const NATIVE_H = 540

export type TrackInfo = {
  track_id: number
  state: "tentative" | "active" | "occluded" | "lost"
  bbox: [number, number, number, number]
  predicted_bbox: [number, number, number, number] | null
  plate_text: string | null
  plate_confidence: number
  occluded_frames: number
  velocity: [number, number]
  trajectory_last10: [number, number][]
  time_in_frame_sec: number
}

export type TrackEvent = {
  type: "exit"
  track_id: number
  plate: string | null
  duration_sec: number
  first_seen: string
  last_seen: string
}

type Toast = TrackEvent & { expiresAt: number; flashId: string }

type Props = {
  tracks?: TrackInfo[]
  events?: TrackEvent[]
}

export default function DetectionCamera({ tracks = [], events = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const tracksRef = useRef<TrackInfo[]>(tracks)
  const [toasts, setToasts] = useState<Toast[]>([])
  // track_id → expiry timestamp for recovery flash
  const flashRef = useRef<Map<number, number>>(new Map())

  // keep tracksRef current without re-triggering draw effect
  useEffect(() => { tracksRef.current = tracks }, [tracks])

  // handle new exit events
  useEffect(() => {
    if (!events.length) return
    const now = Date.now()
    setToasts((prev) => {
      const next = [...prev.filter((t) => t.expiresAt > now)]
      for (const ev of events) {
        if (ev.type === "exit") {
          next.push({ ...ev, expiresAt: now + 5000, flashId: `${ev.track_id}-${now}` })
        }
      }
      return next.slice(-5) // keep at most 5 toasts
    })
  }, [events])

  // clean up expired toasts
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setToasts((prev) => prev.filter((t) => t.expiresAt > now))
    }, 500)
    return () => clearInterval(id)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const cw = container.offsetWidth
    const ch = container.offsetHeight
    if (canvas.width !== cw) canvas.width = cw
    if (canvas.height !== ch) canvas.height = ch

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, cw, ch)

    const sx = cw / NATIVE_W
    const sy = ch / NATIVE_H

    const scale = (box: [number, number, number, number]): [number, number, number, number] =>
      [box[0] * sx, box[1] * sy, box[2] * sx, box[3] * sy]

    const now = Date.now()

    for (const t of tracksRef.current) {
      const isOccluded = t.state === "occluded"
      const bbox = isOccluded && t.predicted_bbox ? t.predicted_bbox : t.bbox
      const [x1, y1, x2, y2] = scale(bbox as [number, number, number, number])
      const w = x2 - x1
      const h = y2 - y1

      // Recovery flash: white border for 500ms
      const flashExpiry = flashRef.current.get(t.track_id) ?? 0
      const isFlashing = now < flashExpiry

      if (isOccluded) {
        // yellow dashed bbox
        ctx.save()
        ctx.strokeStyle = isFlashing ? "white" : "#facc15"
        ctx.lineWidth = isFlashing ? 3 : 2
        ctx.setLineDash([8, 4])
        ctx.strokeRect(x1, y1, w, h)
        ctx.restore()

        // label
        const label = `ID:${t.track_id} [khuất - ${t.occluded_frames}f]`
        ctx.save()
        ctx.font = "bold 11px monospace"
        ctx.fillStyle = "#facc15"
        ctx.fillText(label, x1 + 4, y1 + 14)
        ctx.restore()
      } else {
        // active: green bbox
        ctx.save()
        ctx.strokeStyle = isFlashing ? "white" : "#22c55e"
        ctx.lineWidth = isFlashing ? 3 : 2
        ctx.strokeRect(x1, y1, w, h)
        ctx.restore()

        // trajectory tail (blue faded)
        if (t.trajectory_last10.length > 1) {
          ctx.save()
          for (let i = 1; i < t.trajectory_last10.length; i++) {
            const alpha = i / t.trajectory_last10.length
            const [px, py] = t.trajectory_last10[i - 1]
            const [qx, qy] = t.trajectory_last10[i]
            ctx.beginPath()
            ctx.moveTo(px * sx, py * sy)
            ctx.lineTo(qx * sx, qy * sy)
            ctx.strokeStyle = `rgba(59,130,246,${alpha * 0.8})`
            ctx.lineWidth = 2
            ctx.stroke()
          }
          ctx.restore()
        }

        // label
        const plate = t.plate_text ?? `ID:${t.track_id}`
        const label = `${plate} (${t.time_in_frame_sec}s)`
        ctx.save()
        ctx.font = "bold 11px monospace"
        ctx.fillStyle = "#22c55e"
        ctx.fillText(label, x1 + 4, y1 - 4)
        ctx.restore()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [draw])

  const handleFullscreen = () => {
    containerRef.current?.requestFullscreen?.()
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* STREAM + CANVAS */}
      <div ref={containerRef} className="relative h-[50vh] min-h-[300px] overflow-hidden md:h-[560px] lg:h-[700px]">
        <img
          src={`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/detections/stream`}
          alt="camera-stream"
          className="h-full w-full object-cover"
        />

        {/* Canvas overlay for track bboxes */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

        {/* AI scan line */}
        <div className="absolute left-0 right-0 top-1/2 h-[3px] animate-pulse bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,1)] pointer-events-none" />

        {/* TOP BAR */}
        <div className="absolute left-5 right-5 top-5">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 backdrop-blur-xl">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">VEHICLE MONITORING</span>
            </div>
            <button
              type="button"
              onClick={handleFullscreen}
              className="min-h-[44px] min-w-[44px] rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl transition-all hover:bg-white/10"
            >
              <Maximize2 className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Exit toasts */}
        {toasts.length > 0 && (
          <div className="absolute bottom-24 left-5 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.flashId}
                className="rounded-xl border border-orange-500/30 bg-black/80 px-4 py-2 text-xs text-orange-300 backdrop-blur-sm animate-in fade-in slide-in-from-left-4"
              >
                🚗 Xe <span className="font-bold text-white">{t.plate ?? `#${t.track_id}`}</span>{" "}
                đã rời khỏi camera ({t.duration_sec}s)
              </div>
            ))}
          </div>
        )}

        {/* Track count badge */}
        {tracks.length > 0 && (
          <div className="absolute right-5 top-20 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-xl">
            <span className="text-xs font-semibold text-cyan-400">
              {tracks.filter((t) => t.state === "active").length} xe đang theo dõi
            </span>
          </div>
        )}

        {/* BOTTOM INFO */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pointer-events-none">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">AI Realtime Detection</h2>
              <p className="mt-2 text-sm text-zinc-300">Smart traffic monitoring camera system</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
                  <ScanLine className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400">YOLO Detection Active</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5">
                  <Radio className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">OCR Recognition Running</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
              <Camera className="h-10 w-10 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE TRACK LIST */}
      {tracks.filter((t) => t.state === "active" && t.plate_text).length > 0 && (
        <div className="border-t border-white/10 bg-zinc-950 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Active Tracks</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {tracks
              .filter((t) => t.state === "active" && t.plate_text)
              .slice(0, 8)
              .map((t) => (
                <div key={t.track_id} className="rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{t.plate_text}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    ID:{t.track_id} · {t.time_in_frame_sec}s
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
