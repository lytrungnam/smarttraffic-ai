// components/Camera/CameraGrid.tsx

import { useEffect, useState } from "react"
import { Camera as CameraIcon, Plus } from "lucide-react"
import CameraCard from "./CameraCard"
import CameraModal from "./CameraModal"
import CameraAddModal from "./CameraAddModal"
import { listCameras, CameraItem, deleteCamera, updateCamera } from "@/services/cameraService"

export default function CameraGrid() {
  const token = localStorage.getItem("access_token") ?? ""

  const [cameras, setCameras] = useState<CameraItem[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CameraItem | null>(null)

  const fetch = async () => {
    try {
      const res = await listCameras()
      setCameras(res.data ?? [])
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  const onSaved = () => fetch()

  const onDelete = async (id: string) => {
    if (!confirm("Delete camera?")) return
    await deleteCamera(id)
    fetch()
  }

  const toggleActive = async (c: CameraItem) => {
    await updateCamera(c.id, { status: c.status === "active" ? "inactive" : "active" })
    fetch()
  }

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) ?? null

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Cameras</h1>
          <p className="mt-1 text-sm text-zinc-400">Register camera sources to preview streams and manage connections.</p>
        </div>

        {cameras.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-black"
            >
              <Plus className="h-4 w-4" />
              <span>Add Camera</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* GRID */}
      {cameras.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <CameraIcon className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-white">No cameras registered</h2>
          <button onClick={() => setShowAdd(true)} className="mt-4 rounded-md border px-4 py-2">Add First Camera</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {cameras.map((cam) => (
            <div key={cam.id}>
              <CameraCard
                cameraId={parseInt(cam.id.split("-")[0], 10) || 0}
                cameraName={cam.name}
                location={cam.location}
                isActive={cam.status === "active"}
                token={token}
                onExpand={cam.status === "active" ? () => setSelectedCameraId(cam.id) : undefined}
              />

              <div className="mt-2 flex gap-2">
                <button onClick={() => { setEditing(cam); setShowAdd(true) }} className="rounded-md border px-3 py-1 text-sm">Edit</button>
                <button onClick={() => toggleActive(cam)} className="rounded-md border px-3 py-1 text-sm">{cam.status === "active" ? "Disable" : "Enable"}</button>
                <button onClick={() => onDelete(cam.id)} className="rounded-md border px-3 py-1 text-sm text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PREVIEW */}
      <CameraModal
        open={selectedCamera !== null}
        onClose={() => setSelectedCameraId(null)}
        cameraId={selectedCamera ? parseInt(selectedCamera.id.split("-")[0], 10) : undefined}
        cameraName={selectedCamera?.name}
        location={selectedCamera?.location}
        token={token}
      />

      <CameraAddModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditing(null) }}
        initial={editing ?? undefined}
        onSaved={onSaved}
      />
    </div>
  )
}
