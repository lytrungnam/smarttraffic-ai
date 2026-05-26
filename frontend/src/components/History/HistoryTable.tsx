// components/History/HistoryTable.jsx

import { CalendarDays, Clock3, Eye, MapPin, ShieldAlert } from "lucide-react"

import { useState } from "react"

import type { DetectionItem } from "@/services/detectionService"

import EvidencePreviewDialog from "./EvidencePreviewDialog"

const normalizeStatus = (status?: string) => {
  const value = status?.toLowerCase()

  if (value === "stored" || value === "processing" || value === "monitoring") {
    return value
  }

  return "detected"
}

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

type HistoryTableProps = {
  records: DetectionItem[]
  isLoading: boolean
  error: string | null
}

export default function HistoryTable({
  records,
  isLoading,
  error,
}: HistoryTableProps) {
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

  const exportVisibleRecords = () => {
    const headers = [
      "plate_number",
      "vehicle_type",
      "confidence",
      "location",
      "status",
      "image_path",
      "created_at",
    ]

    const rows = records.map((record) =>
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
    link.download = "detection-history.csv"
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
        {/* HEADER */}
        <div
          className="
          flex flex-col gap-4

          border-b border-white/10

          px-4 py-5

          sm:flex-row
          sm:items-center
          sm:justify-between

          lg:px-6
        "
        >
          {/* LEFT */}
          <div>
            <h2
              className="
              text-xl
              font-semibold
              tracking-tight

              text-white
            "
            >
              Detection History Records
            </h2>

            <p
              className="
              mt-2

              text-sm
              text-zinc-400
            "
            >
              Historical AI traffic monitoring data
            </p>
          </div>

          {/* RIGHT */}
          <button
            type="button"
            disabled={records.length === 0}
            onClick={exportVisibleRecords}
            className="
            inline-flex items-center
            gap-2

            rounded-full

            border border-cyan-500/20

            bg-cyan-500/10

            px-4 py-2

            transition-all

            hover:bg-cyan-500/20

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          >
            <span
              className="
              text-xs
              font-semibold

              text-cyan-400
            "
            >
              Export History
            </span>
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* HEAD */}
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10">
                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Plate Number
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Vehicle
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Location
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Date
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Time
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Status
                </th>

                <th
                  className="
                  px-6 py-5

                  text-left

                  text-xs
                  font-semibold

                  text-zinc-400
                "
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="
                      px-6 py-10
                      text-center
                      text-sm
                      font-semibold
                      text-cyan-400
                    "
                  >
                    Loading detection history...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={7}
                    className="
                      px-6 py-10
                      text-center
                      text-sm
                      font-semibold
                      text-red-400
                    "
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="
                        px-6 py-10
                        text-center
                        text-sm
                        font-semibold
                        text-zinc-400
                      "
                  >
                    No detection records found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                records.map((item) => (
                  <tr
                    key={item.id ?? item.plate_number}
                    className="
                  border-b border-white/5

                  transition-all

                  hover:bg-zinc-900/40
                "
                  >
                    {/* PLATE */}
                    <td className="px-6 py-5">
                      <div
                        className="
                      flex items-center
                      gap-4
                    "
                      >
                        {/* ICON */}
                        <div
                          className="
                        rounded-2xl

                        border border-white/10

                        bg-cyan-500/10

                        p-3
                      "
                        >
                          <ShieldAlert className="h-5 w-5 text-cyan-400" />
                        </div>

                        {/* INFO */}
                        <div>
                          <h3
                            className="
                          text-sm
                          font-semibold
                          tracking-tight

                          text-white
                        "
                          >
                            {item.plate_number}
                          </h3>

                          <p
                            className="
                          mt-1

                          text-xs
                          font-semibold

                          text-zinc-500
                        "
                          >
                            OCR Recognized
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}
                    <td className="px-6 py-5">
                      <span
                        className="
                      text-sm
                      font-semibold

                      text-zinc-300
                    "
                      >
                        {item.vehicle_type}
                      </span>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-5">
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
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5">
                      <div
                        className="
                      flex items-center
                      gap-2

                      text-sm
                      text-zinc-400
                    "
                      >
                        <CalendarDays className="h-4 w-4" />

                        <span>{formatDetectionDate(item.created_at)}</span>
                      </div>
                    </td>

                    {/* TIME */}
                    <td className="px-6 py-5">
                      <div
                        className="
                      flex items-center
                      gap-2

                      text-sm
                      text-zinc-400
                    "
                      >
                        <Clock3 className="h-4 w-4" />

                        <span>{formatDetectionTime(item.created_at)}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
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
                        <span
                          className="
                        text-xs
                        font-semibold
                      "
                        >
                          {normalizeStatus(item.status)}
                        </span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">
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
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
