import { Activity, Car, Clock3, Wifi } from "lucide-react"

import { getVehicleClassLabel } from "@/constants/vehicleClasses"
import type { DetectionItem } from "@/services/detectionService"

type DetectionStatus = "detected" | "stored" | "monitoring" | "processing"

type Props = {
  realtimeData: {
    vehicles: unknown[]
    plates: DetectionItem[]
  }
}

const statusStyles = {
  detected: {
    icon: Activity,
    className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  stored: {
    icon: Activity,
    className: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
  monitoring: {
    icon: Activity,
    className: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  processing: {
    icon: Activity,
    className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  },
}

type DetectionCardProps = DetectionItem

const isDetectionStatus = (
  status: string | undefined,
): status is DetectionStatus => {
  return (
    status === "detected" ||
    status === "stored" ||
    status === "monitoring" ||
    status === "processing"
  )
}

function DetectionCard({
  plate_number,
  vehicle_type = "unclassified",
  location = "Smart Camera",
  created_at = "Realtime",
  confidence = 0,
  status = "detected",
}: DetectionCardProps) {
  const normalizedStatus = status.toLowerCase()

  const statusConfig =
    statusStyles[
      isDetectionStatus(normalizedStatus) ? normalizedStatus : "detected"
    ]

  const StatusIcon = statusConfig.icon

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-black/30
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:border-cyan-500/20
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute right-0 top-0
          h-32 w-32
          bg-cyan-500/5
          blur-3xl
        "
      />

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
        <div className="flex items-center gap-5">
          {/* ICON */}
          <div
            className="
              rounded-2xl
              border border-white/10
              bg-black/40
              p-4
              backdrop-blur-md
            "
          >
            <Car className="h-7 w-7 text-cyan-400" />
          </div>

          {/* INFO */}
          <div>
            <h3
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              {plate_number}
            </h3>

            <div className="mt-2 flex items-center gap-3">
              <span
                className="
                  text-sm
                  font-medium
                  tracking-wide
                  text-zinc-300
                "
              >
                {getVehicleClassLabel(vehicle_type)}
              </span>

              <span className="text-zinc-600">•</span>

              <span
                className="
                  text-sm
                  font-medium
                  tracking-wide
                  text-zinc-500
                "
              >
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-right">
          {/* TIME */}
          <div
            className="
              flex items-center justify-end gap-2
              text-sm
              font-medium
              tracking-wide
              text-zinc-500
            "
          >
            <Clock3 className="h-4 w-4" />

            <span>{created_at}</span>
          </div>

          {/* STATUS */}
          <div
            className={`
              mt-4 inline-flex items-center gap-2
              rounded-2xl border
              px-4 py-2
              text-sm
              font-semibold
              tracking-wide
              ${statusConfig.className}
            `}
          >
            <StatusIcon className="h-4 w-4" />

            {normalizedStatus}
          </div>

          {/* CONFIDENCE */}
          <p
            className="
              mt-3
              text-sm
              text-cyan-400
            "
          >
            Confidence: {confidence}%
          </p>
        </div>
      </div>

      {/* LIVE BAR */}
      <div className="mt-5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="
            h-[3px] w-full
            animate-pulse
            bg-gradient-to-r
            from-cyan-500
            via-blue-500
            to-cyan-500
          "
        />
      </div>
    </div>
  )
}

export default function DashboardRealtime({ realtimeData }: Props) {
  return (
    <section
      className="
        rounded-3xl
        border border-white/10
        bg-black/40
        p-6
        shadow-2xl
        backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-8
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
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
            Realtime Detection Feed
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
            AI-powered vehicle recognition and live traffic monitoring
          </p>
        </div>

        {/* LIVE STATUS */}
        <div
          className="
            flex items-center gap-2
            rounded-2xl
            border border-emerald-500/20
            bg-emerald-500/10
            px-4 py-2
          "
        >
          <Wifi className="h-5 w-5 text-emerald-400" />

          <span
            className="
              text-sm
              font-semibold
              tracking-[0.12em]
              text-emerald-400
            "
          >
            LIVE
          </span>
        </div>
      </div>

      {/* DETECTIONS */}
      <div className="space-y-5">
        {realtimeData?.plates?.length > 0 ? (
          realtimeData.plates.map((item, index) => (
            <DetectionCard
              key={index}
              plate_number={item.plate_number}
              vehicle_type={item.vehicle_type}
              confidence={item.confidence}
              created_at={item.created_at}
              location={item.location}
              status={item.status || "detected"}
            />
          ))
        ) : (
          <div
            className="
              rounded-2xl
              border border-dashed
              border-white/10
              p-10
              text-center
              text-zinc-500
            "
          >
            Waiting for realtime AI detections...
          </div>
        )}
      </div>
    </section>
  )
}
