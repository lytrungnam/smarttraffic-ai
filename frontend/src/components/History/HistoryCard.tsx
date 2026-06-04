// components/History/HistoryCard.jsx

import {
  CalendarDays,
  Car,
  Clock3,
  Eye,
  MapPin,
  ScanLine,
  ShieldAlert,
} from "lucide-react"

import { useState } from "react"

import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import type { DetectionItem } from "@/services/detectionService"
import {
  formatPlateNumber,
  formatPlateStatus,
  getDetectionStatusLabel,
} from "@/utils/plateDisplay"

import EvidencePreviewDialog from "./EvidencePreviewDialog"

const formatDetectionDate = (createdAt?: string) => {
  if (!createdAt) {
    return "Unknown"
  }

  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt
  }

  return parsedDate.toLocaleDateString()
}

const formatDetectionTime = (createdAt?: string) => {
  if (!createdAt) {
    return "Unknown"
  }

  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return createdAt
  }

  return parsedDate.toLocaleTimeString()
}

type HistoryCardProps = {
  records: DetectionItem[]
  isLoading: boolean
}

export default function HistoryCard({ records, isLoading }: HistoryCardProps) {
  const [selectedDetection, setSelectedDetection] =
    useState<DetectionItem | null>(null)

  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)

  const openEvidencePreview = (detection: DetectionItem) => {
    if (!detection.image_path) {
      return
    }

    setSelectedDetection(detection)
    setIsEvidenceOpen(true)
  }

  return (
    <>
      <EvidencePreviewDialog
        detection={selectedDetection}
        open={isEvidenceOpen}
        onOpenChange={setIsEvidenceOpen}
      />

      <div className="space-y-6">
        {isLoading && records.length === 0 && (
          <div
            className="
              rounded-3xl
              border border-white/10
              bg-zinc-950
              p-6
              text-sm
              font-semibold
              text-cyan-400
              shadow-2xl
            "
          >
            Loading recent detection events...
          </div>
        )}

        {!isLoading && records.length === 0 && (
          <div
            className="
              rounded-3xl
              border border-white/10
              bg-zinc-950
              p-6
              text-sm
              font-semibold
              text-zinc-400
              shadow-2xl
            "
          >
            No recent detection events found.
          </div>
        )}

        {records.map((item) => (
          <div
            key={item.id ?? item.plate_number}
            className="
              relative overflow-hidden

              rounded-3xl

              border border-white/10

              bg-zinc-950

              p-6

              shadow-2xl

              transition-all duration-300

              hover:border-cyan-500/20
            "
          >
            {/* GLOW */}
            <div
              className="
              absolute right-0 top-0

              h-40 w-40

              bg-cyan-500/5

              blur-3xl
            "
            />

            <div className="relative">
              {/* TOP */}
              <div
                className="
                mb-8

                flex flex-col gap-4

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
              >
                {/* LEFT */}
                <div
                  className="
                  flex items-center gap-5
                "
                >
                  {/* ICON */}
                  <div
                    className="
                    rounded-3xl

                    border border-white/10

                    bg-cyan-500/10

                    p-5
                  "
                  >
                    <Car className="h-8 w-8 text-cyan-400" />
                  </div>

                  {/* INFO */}
                  <div>
                    <h2
                      className="
                      text-xl
                      font-semibold
                      tracking-tight

                      text-white
                    "
                    >
                      {formatPlateNumber(item.plate_number)}
                    </h2>

                    <div
                      className="
                      mt-3

                      flex flex-wrap
                      items-center
                      gap-3
                    "
                    >
                      <span
                        className="
                        text-sm
                        font-semibold

                        text-zinc-300
                      "
                      >
                        {getVehicleClassLabel(item.vehicle_type)}
                      </span>

                      <span className="text-zinc-600">•</span>

                      <div
                        className="
                        flex items-center
                        gap-2

                        text-sm
                        text-zinc-400
                      "
                      >
                        <MapPin className="h-4 w-4" />

                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div
                  className={`
                  inline-flex items-center
                  gap-2

                  rounded-full

                  border

                  px-3 py-1.5

                  ${"border-green-500/20 bg-green-500/10 text-green-400"}
                `}
                >
                  <ShieldAlert className="h-4 w-4" />

                  <span
                    className="
                    text-xs
                    font-semibold
                  "
                  >
                    {getDetectionStatusLabel(item.status)}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div
                className="
                mt-8

                grid grid-cols-1
                gap-5

                md:grid-cols-2
                xl:grid-cols-3
              "
              >
                {/* DATE */}
                <div
                  className="
                  rounded-2xl

                  border border-white/10

                  bg-zinc-900/60

                  p-5
                "
                >
                  <div
                    className="
                    mb-4

                    flex items-center
                    gap-3
                  "
                  >
                    <CalendarDays className="h-5 w-5 text-cyan-400" />

                    <h3
                      className="
                      text-sm
                      font-semibold

                      text-white
                    "
                    >
                      Detection Date
                    </h3>
                  </div>

                  <h2
                    className="
                    text-lg
                    font-semibold
                    tracking-tight

                    text-white
                  "
                  >
                    {formatDetectionDate(item.created_at)}
                  </h2>

                  <p
                    className="
                    mt-2

                    text-sm
                    text-zinc-400
                  "
                  >
                    Historical traffic event
                  </p>
                </div>

                {/* TIME */}
                <div
                  className="
                  rounded-2xl

                  border border-white/10

                  bg-zinc-900/60

                  p-5
                "
                >
                  <div
                    className="
                    mb-4

                    flex items-center
                    gap-3
                  "
                  >
                    <Clock3 className="h-5 w-5 text-purple-400" />

                    <h3
                      className="
                      text-sm
                      font-semibold

                      text-white
                    "
                    >
                      Detection Time
                    </h3>
                  </div>

                  <h2
                    className="
                    text-lg
                    font-semibold
                    tracking-tight

                    text-white
                  "
                  >
                    {formatDetectionTime(item.created_at)}
                  </h2>

                  <p
                    className="
                    mt-2

                    text-sm
                    text-zinc-400
                  "
                  >
                    AI monitoring timestamp
                  </p>
                </div>

                {/* OCR CONFIDENCE */}
                <div
                  className="
                  rounded-2xl

                  border border-white/10

                  bg-zinc-900/60

                  p-5
                "
                >
                  <div
                    className="
                    mb-4

                    flex items-center
                    gap-3
                  "
                  >
                    <ScanLine className="h-5 w-5 text-cyan-400" />

                    <h3
                      className="
                      text-sm
                      font-semibold

                      text-white
                    "
                    >
                      OCR Confidence
                    </h3>
                  </div>

                  <h2
                    className="
                    text-lg
                    font-semibold
                    tracking-tight

                    text-cyan-400
                  "
                  >
                    {item.confidence ?? 0}%
                  </h2>

                  <p
                    className="
                    mt-2

                    text-sm
                    text-zinc-400
                  "
                  >
                    {formatPlateStatus(item.plate_number)}
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div
                className="
                mt-8

                flex flex-col gap-5

                lg:flex-row
                lg:items-center
                lg:justify-end
              "
              >
                {/* BUTTON */}
                <button
                  type="button"
                  disabled={!item.image_path}
                  onClick={() => {
                    openEvidencePreview(item)
                  }}
                  className={`
                  inline-flex items-center
                  gap-2

                  rounded-full

                  px-3 py-1.5

                  transition-all

                  ${
                    item.image_path
                      ? "border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20"
                      : "cursor-not-allowed border border-white/10 bg-white/5 opacity-50"
                  }
                `}
                >
                  <Eye
                    className={`h-4 w-4 ${
                      item.image_path ? "text-cyan-400" : "text-zinc-500"
                    }`}
                  />

                  <span
                    className={`
                    text-xs
                    font-semibold

                    ${item.image_path ? "text-cyan-400" : "text-zinc-500"}
                  `}
                  >
                    View Full Evidence
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
