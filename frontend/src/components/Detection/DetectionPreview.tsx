import {
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  ScanLine,
  ZoomIn,
} from "lucide-react"
import { useEffect, useState } from "react"

import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import type { DetectionItem } from "@/services/detectionService"
import {
  getEvidenceImageUrl,
  getLatestDetections,
} from "@/services/detectionService"
import {
  LOW_OCR_CONFIDENCE_MESSAGE,
  formatPlateNumber,
  getDetectionStatusLabel,
  getOcrStatusLabel,
  isLowOcrConfidence,
} from "@/utils/plateDisplay"

export default function DetectionPreview() {
  const [detections, setDetections] = useState<DetectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    getLatestDetections()
      .then((items) => setDetections(items.slice(0, 4)))
      .finally(() => setIsLoading(false))
  }, [])

  const previewDetection = detections[previewIndex] ?? null
  const evidenceUrl = getEvidenceImageUrl(
    previewDetection?.annotated_image_path ??
      previewDetection?.annotated_evidence_path ??
      previewDetection?.image_path,
  )

  const handleDownload = () => {
    if (!evidenceUrl) return
    const a = document.createElement("a")
    a.href = evidenceUrl
    a.download = `evidence-${formatPlateNumber(previewDetection?.plate_number)}.jpg`
    a.click()
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Detection Preview
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            AI preview analysis before saving results
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!evidenceUrl}
            title="Open evidence image in new tab"
            onClick={() => evidenceUrl && window.open(evidenceUrl, "_blank")}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-3 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ZoomIn className="h-5 w-5 text-white" />
          </button>

          <button
            type="button"
            disabled={!evidenceUrl}
            title="Download evidence image"
            onClick={handleDownload}
            className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 transition-all hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-5 w-5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* IMAGE */}
      <div className="relative bg-black">
        <div className="relative h-[420px] overflow-hidden md:h-[520px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            </div>
          ) : evidenceUrl ? (
            <img
              src={evidenceUrl}
              alt="evidence"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-500">
              No evidence image available yet
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

          <div className="absolute left-5 top-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-xl">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">
                AI Preview Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="p-5">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold tracking-tight text-white">
            Detection Results
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            OCR and YOLO analysis output
          </p>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-center text-sm font-semibold text-cyan-400">
            Loading detections...
          </div>
        )}

        {!isLoading && detections.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            No detections stored yet
          </div>
        )}

        {!isLoading && detections.length > 0 && (
          <>
            {/* SUMMARY */}
            <div className="mb-5 rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
              <p className="text-2xl font-semibold text-white">
                {detections.length}
              </p>
              <p className="mt-1 text-sm text-zinc-400">Recent Detections</p>
            </div>

            {/* RESULT CARDS */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {detections.map((item, i) => {
                const lowConfidence = isLowOcrConfidence(
                  item.confidence,
                  item.plate_number,
                )

                return (
                  <button
                    type="button"
                    key={item.id ?? item.plate_number}
                    onClick={() => setPreviewIndex(i)}
                    className={`w-full rounded-3xl border p-5 text-left transition-all hover:border-cyan-500/20 ${
                      previewIndex === i
                        ? "border-cyan-500/40 bg-cyan-500/5"
                        : "border-white/10 bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-white">
                          {formatPlateNumber(item.plate_number)}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-400">
                          {getVehicleClassLabel(item.vehicle_type)}
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                          lowConfidence
                            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                            : "border-green-500/20 bg-green-500/10 text-green-400"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-semibold">
                          {lowConfidence
                            ? getOcrStatusLabel(item.plate_number)
                            : getDetectionStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>

                  {/* CONFIDENCE BAR */}
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400">
                        OCR Confidence
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          lowConfidence ? "text-yellow-300" : "text-cyan-400"
                        }`}
                      >
                        {item.confidence ?? 0}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${
                          lowConfidence
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }`}
                        style={{ width: `${item.confidence ?? 0}%` }}
                      />
                    </div>
                    {lowConfidence && (
                      <p className="mt-3 text-xs font-semibold text-yellow-300">
                        {LOW_OCR_CONFIDENCE_MESSAGE}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <ScanLine
                      className={`h-4 w-4 ${
                        lowConfidence ? "text-yellow-300" : "text-cyan-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        lowConfidence ? "text-yellow-300" : "text-cyan-400"
                      }`}
                    >
                      {getOcrStatusLabel(item.plate_number)}
                    </span>
                  </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
