import { Lock, Radio, Smartphone, X } from "lucide-react"
import { useState } from "react"
import { useWalletAuth } from "@/hooks/useWalletAuth"
import UpgradeModal from "./UpgradeModal"
import MobileQRCode from "@/components/Mobile/MobileQRCode"

const STREAM_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/detections/stream`

const DEMO_CAMERAS = [
  { id: 1, name: "Intersection Camera A1", location: "Hai Chau District" },
  { id: 2, name: "Traffic Camera B2", location: "Thanh Khe District" },
  { id: 3, name: "Highway Camera C3", location: "Lien Chieu District" },
  { id: 4, name: "Port Camera D4", location: "Son Tra District" },
  { id: 5, name: "Bridge Camera E5", location: "Ngu Hanh Son" },
]

export default function CameraGrid() {
  const { isConnected, plan, cameraLimit, remainingMinutes, getToken } = useWalletAuth()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<"camera_limit" | "time_limit">("camera_limit")
  const [mobileQROpen, setMobileQROpen] = useState(false)

  const limit = isConnected ? cameraLimit : 1
  const exhausted = isConnected && plan === "free" && (remainingMinutes ?? 120) <= 0

  const openUpgrade = (reason: "camera_limit" | "time_limit") => {
    setUpgradeReason(reason)
    setUpgradeOpen(true)
  }

  const activeCameras = DEMO_CAMERAS.slice(0, limit)
  const lockedCameras = DEMO_CAMERAS.slice(limit, Math.min(DEMO_CAMERAS.length, limit + 2))

  const gridClass =
    limit === 1
      ? "grid-cols-1"
      : limit <= 3
        ? "grid-cols-1 xl:grid-cols-2"
        : "grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"

  return (
    <>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />

      {/* Mobile QR Modal */}
      {mobileQROpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={() => setMobileQROpen(false)}
              className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <MobileQRCode />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black p-6 text-white">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Smart Camera Monitoring</h1>
            <p className="mt-2 text-sm text-zinc-400">AI-powered realtime traffic surveillance system</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Nút dùng điện thoại */}
            <button
              type="button"
              onClick={() => setMobileQROpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 transition hover:bg-purple-500/20"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Dùng điện thoại
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <Radio className="h-4 w-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">Live System Active</span>
            </div>
          </div>
        </div>

        {/* Active cameras */}
        <div className={`grid gap-6 ${gridClass}`}>
          {activeCameras.map((cam) => (
            <CameraCard
              key={cam.id}
              cam={cam}
              streamUrl={STREAM_URL}
              token={getToken()}
              exhausted={exhausted}
              onExhausted={() => openUpgrade("time_limit")}
            />
          ))}

          {/* Locked slots */}
          {lockedCameras.map((cam) => (
            <LockedCameraCard key={cam.id} cam={cam} onUnlock={() => openUpgrade("camera_limit")} />
          ))}

          {/* Add camera button */}
          {limit < DEMO_CAMERAS.length && (
            <button
              type="button"
              onClick={() => openUpgrade("camera_limit")}
              className="flex h-48 items-center justify-center rounded-3xl border-2 border-dashed border-white/10 text-zinc-500 transition hover:border-cyan-500/30 hover:text-cyan-400"
            >
              + Thêm camera
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function CameraCard({ cam, streamUrl, token, exhausted, onExhausted }: {
  cam: { id: number; name: string; location: string }
  streamUrl: string
  token: string
  exhausted: boolean
  onExhausted: () => void
}) {
  const src = token ? `${streamUrl}?camera_id=${cam.id}&token=${token}` : streamUrl

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <div className="relative h-[280px] overflow-hidden">
        {exhausted ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-zinc-900">
            <Lock className="h-10 w-10 text-red-400" />
            <p className="text-sm font-semibold text-red-400">Hết 2 giờ hôm nay</p>
            <button
              type="button"
              onClick={onExhausted}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black"
            >
              ⚡ Nâng cấp ngay
            </button>
          </div>
        ) : (
          <img src={src} alt={cam.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-5">
          <p className="text-lg font-semibold text-white">{cam.name}</p>
          <p className="mt-1 text-sm text-zinc-400">{cam.location}</p>
        </div>
      </div>
    </div>
  )
}

function LockedCameraCard({ cam, onUnlock }: {
  cam: { id: number; name: string; location: string }
  onUnlock: () => void
}) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      className="group relative flex h-[280px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 transition hover:border-cyan-500/30"
    >
      <div className="absolute inset-0 opacity-20 bg-zinc-900 blur-sm" />
      <Lock className="relative h-10 w-10 text-zinc-500 group-hover:text-cyan-400 transition" />
      <p className="relative mt-3 text-sm font-semibold text-zinc-500 group-hover:text-white transition">{cam.name}</p>
      <p className="relative mt-1 text-xs text-zinc-600">{cam.location}</p>
      <span className="relative mt-4 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
        🔒 Nâng cấp để mở khóa
      </span>
    </button>
  )
}
