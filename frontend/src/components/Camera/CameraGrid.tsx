// components/Camera/CameraGrid.tsx

import { useState } from "react"
import { Camera } from "lucide-react"
import CameraCard from "./CameraCard"
import CameraModal from "./CameraModal"

type CameraItem = {
  id: number
  name: string
  location: string
  isActive: boolean
}

const cameras: CameraItem[] = []

export default function CameraGrid() {
  const token = localStorage.getItem("access_token") ?? ""

  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null)
  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) ?? null

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Cameras
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Register camera sources to preview streams and manage connections.
          </p>
        </div>
      </div>

      {/* GRID */}
      {cameras.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <Camera className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-white">
            No cameras registered
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {cameras.map((cam) => (
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
      )}

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
