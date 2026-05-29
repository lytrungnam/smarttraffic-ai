import axios from "axios"
import {
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Image,
  Loader2,
  ScanLine,
  Upload,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`

type UploadResult = {
  plate_number: string
  vehicle_type?: string
  confidence?: number
  image_path?: string
  status?: string
}

type SelectedFile = {
  file: File
  progress: number
}

export default function DetectionUpload() {
  const [selected, setSelected] = useState<SelectedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelected({ file, progress: 0 })
    setResults([])
    setError(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setSelected({ file, progress: 0 })
    setResults([])
    setError(null)
  }

  const handleRemove = () => {
    setSelected(null)
    setResults([])
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleUpload = async () => {
    if (!selected) return

    setIsUploading(true)
    setError(null)
    setResults([])

    const formData = new FormData()
    formData.append("file", selected.file)

    try {
      const response = await axios.post<{ results: UploadResult[] }>(
        `${API_URL}/detections/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const pct = Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100)
            setSelected((prev) => (prev ? { ...prev, progress: pct } : prev))
          },
        },
      )
      setResults(response.data.results)
    } catch {
      setError("Upload failed. Make sure the backend is running and the file is a valid image.")
    } finally {
      setIsUploading(false)
    }
  }

  const isImage = selected?.file.type.startsWith("image/")
  const isVideo = selected?.file.type.startsWith("video/")
  const fileSizeMB = selected
    ? (selected.file.size / (1024 * 1024)).toFixed(1)
    : null

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Upload Detection File
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Upload images or videos for AI vehicle recognition
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
          <ScanLine className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">YOLO + OCR</span>
        </div>
      </div>

      {/* BODY */}
      <div className="p-5">
        {/* DROPZONE */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6 text-center transition-all duration-300 hover:border-cyan-400/40"
        >
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 transition-all group-hover:opacity-100" />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-xl">
            <CloudUpload className="h-10 w-10 text-cyan-400" />
          </div>

          <div className="relative mt-5">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              Drag & Drop Files
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Upload traffic images or surveillance videos
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="relative mt-5 inline-block cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 transition-all hover:opacity-90"
          >
            <span className="text-sm font-semibold tracking-tight text-black">
              Browse Files
            </span>
          </label>

          <p className="relative mt-4 text-xs font-semibold text-zinc-500">
            Supported: JPG, PNG, MP4, AVI
          </p>
        </div>

        {/* SELECTED FILE */}
        {selected && (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="shrink-0 rounded-2xl border border-white/10 bg-cyan-500/10 p-4">
                    {isVideo ? (
                      <FileVideo className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Image className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-white">
                      {selected.file.name}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-zinc-400">
                      {fileSizeMB} MB • {isImage ? "Image File" : "Video File"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>

              {/* PROGRESS */}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">
                    {isUploading ? "Uploading..." : selected.progress === 100 ? "Complete" : "Ready"}
                  </span>
                  <span className={`text-sm font-semibold ${isImage ? "text-cyan-400" : "text-purple-400"}`}>
                    {selected.progress}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${isImage ? "from-cyan-500 to-blue-500" : "from-purple-500 to-pink-500"} transition-all`}
                    style={{ width: `${selected.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400">Detection Results</h3>
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{r.plate_number}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {r.vehicle_type || "unknown"} • {r.confidence ?? 0}%
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">detected</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleRemove}
            disabled={!selected || isUploading}
            className="rounded-full border border-white/10 bg-zinc-900 px-5 py-2.5 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-sm font-semibold tracking-tight text-white">Cancel</span>
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selected || isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <Upload className="h-4 w-4 text-black" />
            )}
            <span className="text-sm font-semibold tracking-tight text-black">
              {isUploading ? "Processing..." : "Start AI Detection"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
