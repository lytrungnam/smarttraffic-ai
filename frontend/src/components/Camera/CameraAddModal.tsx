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

export default function CameraAddModal({
  open,
  onClose,
  onSaved,
  initial,
}: Props) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [cameraType, setCameraType] = useState("webcam")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isMobileCamera = cameraType === "mobile"

  useEffect(() => {
    setName(initial?.name ?? "")
    setLocation(initial?.location ?? "")
    setSourceUrl(initial?.source_url ?? "")
    setCameraType(initial?.camera_type ?? "webcam")
    setError(null)
    setSaving(false)
  }, [initial, open])

  if (!open) return null

  const submit = async () => {
    setError(null)

    if (!name.trim()) {
      setError("Camera name is required")
      return
    }

    if (!isMobileCamera && !sourceUrl.trim()) {
      setError("Source URL is required")
      return
    }

    const payload = {
      name: name.trim(),
      location: location.trim(),
      source_url: isMobileCamera ? "mobile" : sourceUrl.trim(),
      camera_type: cameraType,
    }

    try {
      setSaving(true)

      if (initial?.id) {
        await updateCamera(initial.id, payload)
      } else {
        await createCamera(payload)
      }

      onSaved?.()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save camera")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initial?.id ? "Edit Camera" : "Add Camera"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400">Camera Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Mobile Gate 1"
              className="mt-1 w-full rounded-md border border-zinc-800 bg-black/30 p-2 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Example: Main entrance"
              className="mt-1 w-full rounded-md border border-zinc-800 bg-black/30 p-2 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400">Camera Type</label>
            <select
              value={cameraType}
              onChange={(e) => {
                const value = e.target.value
                setCameraType(value)

                if (value === "mobile") {
                  setSourceUrl("mobile")
                } else if (sourceUrl === "mobile") {
                  setSourceUrl("")
                }
              }}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-black/30 p-2 outline-none focus:border-cyan-500"
            >
              <option value="webcam">Webcam</option>
              <option value="rtsp">RTSP Camera</option>
              <option value="ip_camera">IP Camera</option>
              <option value="video_file">Video File</option>
              <option value="mobile">Mobile Camera</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Source URL</label>
            <input
              value={isMobileCamera ? "mobile" : sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              disabled={isMobileCamera}
              placeholder={
                isMobileCamera
                  ? "Mobile camera uses phone browser"
                  : "Example: rtsp://... or http://..."
              }
              className="mt-1 w-full rounded-md border border-zinc-800 bg-black/30 p-2 outline-none focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {isMobileCamera && (
              <p className="mt-2 text-xs text-cyan-400">
                Mobile Camera will use the phone camera through the mobile
                streaming page.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : initial?.id ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  )
}