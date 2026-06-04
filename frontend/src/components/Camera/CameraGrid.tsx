// components/Camera/CameraGrid.tsx

import { useState } from "react"
import { Radio, Smartphone } from "lucide-react"
import CameraCard from "./CameraCard"
import CameraModal from "./CameraModal"

const CAMERAS = [
  {
    id: 1,
    name: "AI Traffic Camera #01",
    location: "Da Nang - Hai Chau District",
    isActive: true,
  },
  {
    id: 2,
    name: "AI Traffic Camera #02",
    location: "Da Nang - Thanh Khe District",
    isActive: false,
  },
  {
    id: 3,
    name: "AI Traffic Camera #03",
    location: "Da Nang - Lien Chieu District",
    isActive: false,
  },
]

export default function CameraGrid() {
  const token = localStorage.getItem("access_token") ?? ""

  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null)
  const selectedCamera = CAMERAS.find((c) => c.id === selectedCameraId) ?? null

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Smart Camera Monitoring
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            AI-powered realtime traffic surveillance system
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
            <Radio className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">Live System Active</span>
          </div>

          <button
            type="button"
            className="
              inline-flex min-h-[44px] items-center gap-2
              rounded-full
              border border-white/10
              bg-zinc-900
              px-4
              text-xs font-semibold text-zinc-300
              transition hover:bg-zinc-800
            "
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Dùng điện thoại</span>
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {CAMERAS.map((cam) => (
          <CameraCard
            key={cam.id}
            cameraId={cam.id}
            cameraName={cam.name}
            location={cam.location}
            isActive={cam.isActive}
            token={token}
            onExpand={cam.isActive ? () => setSelectedCameraId(cam.id) : undefined}
          />
        ))}
      </div>

      {/* MODAL */}
      <CameraModal
        open={selectedCamera !== null}
        onClose={() => setSelectedCameraId(null)}
        cameraId={selectedCamera?.id}
        cameraName={selectedCamera?.name}
        location={selectedCamera?.location}
        token={token}
      />
    </div>
  )
}
