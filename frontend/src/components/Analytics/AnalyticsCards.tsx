// components/Analytics/AnalyticsCards.tsx

import { Activity, Camera, Car, Cpu, Database } from "lucide-react"

const analyticsCards = [
  {
    title: "Realtime Vehicles",
    value: "Live",
    description: "Detected in the last hour",
    icon: Car,
    color: "cyan",
    glow: "from-cyan-500/20 to-blue-500/10",
    iconColor: "text-cyan-400",
  },

  {
    title: "Stored Detections",
    value: "PostgreSQL",
    description: "Evidence-backed ALPR records",
    icon: Database,
    color: "green",
    glow: "from-green-500/20 to-emerald-500/10",
    iconColor: "text-green-400",
  },

  {
    title: "Active Cameras",
    value: "24",
    description: "Realtime monitoring",
    icon: Camera,
    color: "yellow",
    glow: "from-yellow-500/20 to-amber-500/10",
    iconColor: "text-yellow-400",
  },

  {
    title: "AI Processing",
    value: "Stream",
    description: "Realtime deep learning",
    icon: Cpu,
    color: "purple",
    glow: "from-purple-500/20 to-pink-500/10",
    iconColor: "text-purple-400",
  },

  {
    title: "System Activity",
    value: "Online",
    description: "Server uptime stability",
    icon: Activity,
    color: "green",
    glow: "from-green-500/20 to-emerald-500/10",
    iconColor: "text-green-400",
  },

  {
    title: "Processing Queue",
    value: "Live",
    description: "Realtime monitoring events",
    icon: Activity,
    color: "orange",
    glow: "from-orange-500/20 to-red-500/10",
    iconColor: "text-orange-400",
  },
]

export default function AnalyticsCards() {
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
                <div className="min-w-0">
                  {/* TITLE */}
                  <p
                    className="
                      text-xs
                      font-semibold

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
