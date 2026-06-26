// components/Camera/CameraGrid.tsx

import { useEffect, useState } from "react"
import { Camera as CameraIcon, Plus } from "lucide-react"
import CameraCard from "./CameraCard"
import CameraModal from "./CameraModal"
import CameraAddModal from "./CameraAddModal"
import {
  listCameras,
  CameraItem,
  deleteCamera,
  updateCamera,
} from "@/services/cameraService"

export default function CameraGrid() {
  const token = localStorage.getItem("access_token") ?? ""

  const [cameras, setCameras] = useState<CameraItem[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CameraItem | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCameras = async () => {
    try {
      setLoading(true)
      const res = await listCameras()
      setCameras(res.data ?? [])
    } catch (err) {
      console.error("Failed to fetch cameras:", err)
      setCameras([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCameras()
  }, [])

  const onSaved = () => {
    fetchCameras()
  }

  const onDelete = async (id: string) => {
    if (!confirm("Delete camera?")) return

    try {
      await deleteCamera(id)
      fetchCameras()
    } catch (err) {
      console.error("Failed to delete camera:", err)
      alert("Delete camera failed")
    }
  }

  const toggleActive = async (camera: CameraItem) => {
    try {
      await updateCamera(camera.id, {
        status: camera.status === "active" ? "inactive" : "active",
      })

      fetchCameras()
    } catch (err) {
      console.error("Failed to update camera status:", err)
      alert("Update camera status failed")
    }
  }

  const toNumericCameraId = (id?: string) => {
    if (!id) return 1

    const firstPart = id.split("-")[0]
    const parsed = Number.parseInt(firstPart, 16)

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }

  const selectedCamera =
    cameras.find((camera) => camera.id === selectedCameraId) ?? null

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

        {cameras.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setShowAdd(true)
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 font-semibold text-black transition hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" />
              <span>Add Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* LOADING */}
      {loading && cameras.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/40 p-8 text-center">
          <p className="text-sm text-zinc-400">Loading cameras...</p>
        </div>
      ) : cameras.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <CameraIcon className="h-8 w-8 text-zinc-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            No cameras registered
          </h2>

          <p className="mt-2 max-w-md text-sm text-zinc-500">
            Add a webcam, RTSP/IP camera, video file, or mobile camera source to
            start testing Smart Traffic AI.
          </p>

          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setShowAdd(true)
            }}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Add First Camera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((cam) => {
            const isMobileCamera = cam.camera_type === "mobile"
            const isActive = cam.status === "active"

            return (
              <div key={cam.id}>
                <CameraCard
                  cameraId={toNumericCameraId(cam.id)}
                  cameraName={cam.name}
                  location={cam.location}
                  isActive={isActive}
                  token={token}
                  cameraType={cam.camera_type}
                  onExpand={
                    isActive && !isMobileCamera
                      ? () => setSelectedCameraId(cam.id)
                      : undefined
                  }
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(cam)
                      setShowAdd(true)
                    }}
                    className="min-h-[40px] rounded-md border border-white/10 px-3 py-1 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleActive(cam)}
                    className="min-h-[40px] rounded-md border border-white/10 px-3 py-1 text-sm font-semibold transition hover:bg-white/10"
                  >
                    {isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(cam.id)}
                    className="min-h-[40px] rounded-md border border-red-500/30 px-3 py-1 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL PREVIEW */}
      <CameraModal
        open={selectedCamera !== null}
        onClose={() => setSelectedCameraId(null)}
        cameraId={selectedCamera ? toNumericCameraId(selectedCamera.id) : undefined}
        cameraName={selectedCamera?.name}
        location={selectedCamera?.location}
        token={token}
      />

      <CameraAddModal
        open={showAdd}
        onClose={() => {
          setShowAdd(false)
          setEditing(null)
        }}
        initial={editing ?? undefined}
        onSaved={onSaved}
      />
    </div>
  )
}