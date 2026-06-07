// components/Analytics/AnalyticsCards.tsx

import { useQuery } from "@tanstack/react-query"
import { Activity, Camera, Car, Cpu, Database } from "lucide-react"

import {
  getAnalyticsSummary,
  getTotalVehicleCount,
} from "@/services/analyticsService"

export default function AnalyticsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary,
    refetchInterval: 5000,
  })

  const countValue = (value: number) =>
    isLoading ? "..." : value.toLocaleString()
  const analyticsCards = [
    {
      title: "Total Vehicles",
      value: countValue(getTotalVehicleCount(data)),
      description: "AI-classified vehicle records",
      icon: Car,
      glow: "from-cyan-500/20 to-blue-500/10",
      iconColor: "text-cyan-400",
    },
    {
      title: "Stored Detections",
      value: countValue(data?.total_detections ?? 0),
      description: "Evidence-backed ALPR records",
      icon: Database,
      glow: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "Realtime Cameras",
      value: countValue(data?.online_camera_count ?? 0),
      description: "Online registered cameras",
      icon: Camera,
      glow: "from-yellow-500/20 to-amber-500/10",
      iconColor: "text-yellow-400",
    },
    {
      title: "AI Monitoring",
      value: "Live",
      description: "Realtime deep learning",
      icon: Cpu,
      glow: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-400",
    },
    {
      title: "System Activity",
      value: "Online",
      description: "Server uptime stability",
      icon: Activity,
      glow: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "Processing Queue",
      value: "Live",
      description: "Realtime monitoring events",
      icon: Activity,
      glow: "from-orange-500/20 to-red-500/10",
      iconColor: "text-orange-400",
    },
  ]

  return (
    <div
      className="
        grid grid-cols-1
        gap-6

        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {analyticsCards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.title}
            className={`
              relative overflow-hidden

              rounded-3xl

              border border-white/10

              bg-gradient-to-br
              ${card.glow}

              p-6

              shadow-2xl
              backdrop-blur-xl

              transition-all duration-300

              hover:border-white/20
              hover:translate-y-[-2px]
            `}
          >
            {/* GLOW */}
            <div
              className="
                absolute right-0 top-0

                h-40 w-40

                bg-white/5

                blur-3xl
              "
            />

            {/* CONTENT */}
            <div className="relative">
              {/* TOP */}
              <div
                className="
                  flex items-start
                  justify-between
                  gap-4
                "
              >
                {/* LEFT */}
                <div className="min-w-0 flex-1">
                  {/* TITLE */}
                  <p
                    className="
                      text-xs
                      font-semibold

                      truncate
                      text-zinc-400
                    "
                  >
                    {card.title}
                  </p>

                  {/* VALUE */}
                  <h2
                    className="
                      mt-4

                      text-2xl
                      font-semibold
                      tracking-tight

                      truncate
                      text-white
                    "
                  >
                    {card.value}
                  </h2>

                  {/* DESCRIPTION */}
                  <p
                    className="
                      mt-3

                      text-sm
                      leading-relaxed

                      text-zinc-400
                    "
                  >
                    {card.description}
                  </p>
                </div>

                {/* ICON */}
                <div
                  className="
                    shrink-0
                    rounded-2xl

                    border border-white/10

                    bg-black/30

                    p-4
                  "
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>

              {/* STATUS */}
              <div
                className="
                  mt-6

                  flex items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-2 w-2

                    animate-pulse

                    rounded-full

                    bg-green-400
                  "
                />

                <span
                  className="
                    text-xs
                    font-semibold

                    text-green-400
                  "
                >
                  Live Monitoring
                </span>
              </div>
            </div>

            {/* BORDER */}
            <div
              className="
                pointer-events-none

                absolute inset-0

                rounded-3xl

                border border-white/5
              "
            />
          </div>
        )
      })}
    </div>
  )
}
