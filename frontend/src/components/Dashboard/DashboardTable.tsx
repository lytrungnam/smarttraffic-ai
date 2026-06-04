// components/Dashboard/DashboardTable.jsx

import { Clock3, Eye, ShieldAlert } from "lucide-react"

import { useState } from "react"

import EvidencePreviewDialog from "@/components/History/EvidencePreviewDialog"
import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import type { DetectionItem } from "@/services/detectionService"
import {
  formatPlateStatus,
  formatPlateNumber,
  getDetectionStatusLabel,
  getRealCameraName,
  isUnknownPlate,
} from "@/utils/plateDisplay"

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

type DashboardTableProps = {
  records: DetectionItem[]
  isLoading?: boolean
}

export default function DashboardTable({
  records,
  isLoading = false,
}: DashboardTableProps) {
  const [selectedDetection, setSelectedDetection] =
    useState<DetectionItem | null>(null)

  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)

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
          flex items-center justify-between
          border-b border-white/10
          px-6 py-5
        "
        >
          <div>
            <h2
              className="
              text-2xl
              font-semibold
              tracking-tight
              text-white
            "
            >
              Detection Records
            </h2>

            <p
              className="
              mt-2
              text-sm
              font-medium
              tracking-wide
              text-zinc-400
            "
            >
              Latest AI traffic monitoring detections
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Use the History page for full paginated detection records."
            className="
            rounded-2xl
            border border-cyan-500/20
            bg-cyan-500/10
            px-5 py-3

            text-sm
            font-semibold
            tracking-wide
            text-cyan-400

            transition-all
            hover:bg-cyan-500/20
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          >
            View All
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/80">
              <tr className="border-b border-white/10 text-left">
                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Plate Number
                </th>

                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Vehicle Type
                </th>

                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Location
                </th>

                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Detection Time
                </th>

                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Status
                </th>

                <th
                  className="
                  px-6 py-5

                  text-sm
                  font-semibold
                  tracking-wide
                  text-zinc-400
                "
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-semibold text-cyan-400"
                  >
                    Loading latest detections...
                  </td>
                </tr>
              )}

              {!isLoading && records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-semibold text-zinc-400"
                  >
                    No detections stored yet.
                  </td>
                </tr>
              )}

              {!isLoading &&
                records.map((record) => {
                  const cameraName = getRealCameraName(record.location)
                  const plateUnreadable = isUnknownPlate(record.plate_number)

                  return (
                    <tr
                      key={record.id ?? record.plate_number}
                    className="
                  border-b border-white/5
                  transition-all
                  hover:bg-zinc-900/40
                "
                  >
                    {/* PLATE */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
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

                        <div>
                          <h3
                            className="
                          text-lg
                          font-semibold
                          tracking-tight
                          text-white
                        "
                          >
                            {formatPlateNumber(record.plate_number)}
                          </h3>

                          {plateUnreadable && (
                            <p
                              className="
                          mt-1
                          text-sm
                          font-medium
                          tracking-wide
                          text-zinc-500
                        "
                            >
                              {formatPlateStatus(record.plate_number)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* VEHICLE */}
                    <td className="px-6 py-5">
                      <span
                        className="
                      text-sm
                      font-medium
                      tracking-wide
                      text-zinc-300
                    "
                      >
                        {getVehicleClassLabel(record.vehicle_type)}
                      </span>
                    </td>

                    {/* LOCATION */}
                    <td className="px-6 py-5">
                      <span
                        className="
                      text-sm
                      font-medium
                      tracking-wide
                      text-zinc-400
                    "
                      >
                        {cameraName ?? ""}
                      </span>
                    </td>

                    {/* TIME */}
                    <td className="px-6 py-5">
                      <div
                        className="
                      flex items-center gap-2

                      text-sm
                      font-medium
                      tracking-wide
                      text-zinc-400
                    "
                      >
                        <Clock3 className="h-4 w-4" />

                        <span>{formatDetectionTime(record.created_at)}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <div
                        className={`
                      inline-flex items-center gap-2
                      rounded-2xl
                      border
                      px-4 py-2

                      text-sm
                      font-semibold
                      tracking-wide

                      bg-green-500/10 border-green-500/20 text-green-400
                    `}
                      >
                        {getDetectionStatusLabel(record.status)}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        disabled={!record.image_path}
                        onClick={() => {
                          setSelectedDetection(record)
                          setIsEvidenceOpen(true)
                        }}
                        className="
                      flex items-center gap-2
                      rounded-2xl
                      border border-cyan-500/20
                      bg-cyan-500/10
                      px-4 py-2

                      text-sm
                      font-medium
                      tracking-wide
                      text-cyan-400

                      transition-all
                      hover:bg-cyan-500/20
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
