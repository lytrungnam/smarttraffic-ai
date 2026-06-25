import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { createCamera, updateCamera } from "@/services/cameraService"

type Props = {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  initial?: {
    id?: string
    name?: string
    location?: string
    source_url?: string
    camera_type?: string
    status?: string
  }
}

export default function CameraAddModal({ open, onClose, onSaved, initial }: Props) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [cameraType, setCameraType] = useState("webcam")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? "")
    setLocation(initial?.location ?? "")
    setSourceUrl(initial?.source_url ?? "")
    setCameraType(initial?.camera_type ?? "webcam")
    setError(null)
  }, [initial, open])

  if (!open) return null

  const submit = async () => {
    setError(null)
    if (!name || name.trim() === "") {
      setError("Name is required")
      return
    }

    try {
      if (initial?.id) {
        await updateCamera(initial.id, {
          name,
          location,
          source_url: sourceUrl,
          camera_type: cameraType,
        })
      } else {
        await createCamera({ name, location, source_url: sourceUrl, camera_type: cameraType })
      }
      onSaved && onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save camera")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{initial?.id ? "Edit Camera" : "Add Camera"}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-400">Camera Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md bg-black/20 p-2" />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-md bg-black/20 p-2" />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Source URL</label>
            <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="mt-1 w-full rounded-md bg-black/20 p-2" />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Camera Type</label>
            <select value={cameraType} onChange={(e) => setCameraType(e.target.value)} className="mt-1 w-full rounded-md bg-black/20 p-2">
              <option value="webcam">webcam</option>
              <option value="rtsp">rtsp</option>
              <option value="ip_camera">ip_camera</option>
              <option value="video_file">video_file</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2">Cancel</button>
          <button onClick={submit} className="rounded-md bg-cyan-500 px-4 py-2 text-black font-semibold">{initial?.id ? "Save" : "Add"}</button>
        </div>
      </div>
    </div>
  )
}
