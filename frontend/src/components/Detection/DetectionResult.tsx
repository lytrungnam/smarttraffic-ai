// components/Detection/DetectionResult.jsx

import {
  Car,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  MapPin,
  ScanLine,
  ShieldAlert,
} from "lucide-react"

import { useEffect, useState } from "react"

import EvidencePreviewDialog from "@/components/History/EvidencePreviewDialog"
import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import type { DetectionItem } from "@/services/detectionService"
import { getLatestDetections } from "@/services/detectionService"
import {
  EVIDENCE_SAVED_LABEL,
  EVIDENCE_SAVED_MESSAGE,
  LOW_OCR_CONFIDENCE_MESSAGE,
  formatPlateNumber,
  formatPlateStatus,
  getDetectionStatusLabel,
  getOcrStatusLabel,
  isLowOcrConfidence,
} from "@/utils/plateDisplay"

const formatDetectionTime = (createdAt?: string) => {
  if (!createdAt) {
    return "Unknown"
  }

  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt
  }

  return parsedDate.toLocaleString()
}

export default function DetectionResult() {
  const [detectionResults, setDetectionResults] = useState<DetectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDetection, setSelectedDetection] =
    useState<DetectionItem | null>(null)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)

  useEffect(() => {
    getLatestDetections()
      .then((detections) => {
        setDetectionResults(detections.slice(0, 5))
      })
      .catch((error) => {
        console.error("Failed to load detection results:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const exportResults = () => {
    const headers = [
      "plate_number",
      "vehicle_type",
      "confidence",
      "location",
      "status",
      "image_path",
      "created_at",
    ]

    const rows = detectionResults.map((record) =>
      headers.map((header) => {
        const value = record[header as keyof DetectionItem] ?? ""

        return `"${String(value).replace(/"/g, '""')}"`
      }),
    )

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    )

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "detection-results.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <EvidencePreviewDialog
        detection={selectedDetection}
        open={isEvidenceOpen}
        onOpenChange={setIsEvidenceOpen}
      />

      <div
        className="
          overflow-hidden
          rounded-3xl
          border border-white/10
          bg-zinc-950
          shadow-2xl
        "
      >
        <div
          className="
            flex flex-col gap-5
            border-b border-white/10
            px-5 py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            lg:px-6
          "
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Stored Detection Results
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              PostgreSQL vehicle recognition and OCR records
            </p>
          </div>

          <button
            type="button"
            disabled={detectionResults.length === 0}
            onClick={exportResults}
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-cyan-500/20
              bg-cyan-500/10
              px-4 py-2
              transition-all
              hover:bg-cyan-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">
              Export Results
            </span>
          </button>
        </div>

        <div className="space-y-6 p-6">
          {isLoading && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-sm font-semibold text-cyan-400">
              Loading PostgreSQL detections...
            </div>
          )}

          {!isLoading && detectionResults.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 text-sm font-semibold text-zinc-400">
              No detection results stored yet.
            </div>
          )}

          {!isLoading &&
            detectionResults.map((item) => {
              const lowConfidence = isLowOcrConfidence(
                item.confidence,
                item.plate_number,
              )

              return (
                <div
                  key={item.id ?? item.plate_number}
                className="
                  group relative overflow-hidden
                  rounded-3xl
                  border border-white/10
                  bg-zinc-900/60
                  p-6
                  transition-all duration-300
                  hover:border-cyan-500/20
                "
                >
                  <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-500/5 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-5">
                        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                          <Car className="h-8 w-8 text-cyan-400" />
                        </div>

                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight text-white">
                            {formatPlateNumber(item.plate_number)}
                          </h3>

                          <p className="mt-2 max-w-xl text-sm text-zinc-400">
                            {formatPlateStatus(item.plate_number)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-semibold text-zinc-300">
                              {getVehicleClassLabel(item.vehicle_type)}
                            </span>

                            <span className="text-zinc-600">•</span>

                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location || "Smart Camera"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`
                        inline-flex items-center gap-2
                        rounded-full
                        border
                        px-3 py-1.5
                        ${
                          lowConfidence
                            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                            : "border-green-500/20 bg-green-500/10 text-green-400"
                        }
                      `}
                      >
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-xs font-semibold">
                          {lowConfidence
                            ? getOcrStatusLabel(item.plate_number)
                            : getDetectionStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <ScanLine className="h-5 w-5 text-cyan-400" />
                          <h4 className="text-sm font-semibold text-white">
                            OCR Confidence
                          </h4>
                        </div>

                        <div className="mb-4 flex items-end justify-between">
                          <h2
                            className={`text-2xl font-semibold tracking-tight ${
                              lowConfidence ? "text-yellow-300" : "text-cyan-400"
                            }`}
                          >
                            {item.confidence ?? 0}%
                          </h2>
                          <CheckCircle2
                            className={`h-5 w-5 ${
                              lowConfidence ? "text-yellow-300" : "text-green-400"
                            }`}
                          />
                        </div>

                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${
                              lowConfidence
                                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500"
                            }`}
                            style={{
                              width: `${item.confidence ?? 0}%`,
                            }}
                          />
                        </div>
                        {lowConfidence && (
                          <p className="mt-3 text-sm font-semibold text-yellow-300">
                            {LOW_OCR_CONFIDENCE_MESSAGE}
                          </p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <Clock3 className="h-5 w-5 text-purple-400" />
                          <h4 className="text-sm font-semibold text-white">
                            Detection Time
                          </h4>
                        </div>

                        <h2 className="text-lg font-semibold tracking-tight text-white">
                          {formatDetectionTime(item.created_at)}
                        </h2>

                        <p className="mt-3 text-sm text-zinc-400">
                          Stored monitoring event
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <FileSearch className="h-5 w-5 text-yellow-400" />
                          <h4 className="text-sm font-semibold text-white">
                            Evidence
                          </h4>
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight text-yellow-400">
                          {item.image_path ? EVIDENCE_SAVED_LABEL : "Unavailable"}
                        </h2>

                        <p className="mt-3 text-sm text-zinc-400">
                          {item.image_path
                            ? EVIDENCE_SAVED_MESSAGE
                            : "No evidence image is available."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        <span className="text-xs font-semibold text-green-400">
                          AI Detection Stored
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!item.image_path}
                        title={
                          item.image_path
                            ? "View stored evidence image"
                            : "No evidence image is available for this detection."
                        }
                        onClick={() => {
                          setSelectedDetection(item)
                          setIsEvidenceOpen(true)
                        }}
                        className="
                        inline-flex items-center gap-2
                        rounded-full
                        border border-cyan-500/20
                        bg-cyan-500/10
                        px-4 py-2
                        transition-all
                        hover:bg-cyan-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                      >
                        <span className="text-xs font-semibold text-cyan-400">
                          View Evidence
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}
