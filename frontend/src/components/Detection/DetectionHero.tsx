import { Activity, Camera, Database, Radar, ScanSearch } from "lucide-react"

import { useEffect, useState } from "react"

import type { AnalyticsSummary } from "@/services/analyticsService"
import { getAnalyticsSummary } from "@/services/analyticsService"

const heroStats = [
  {
    title: "Detection Model",
    value: "YOLOv11",
    status: "ACTIVE",
    icon: ScanSearch,
    color: "cyan",
  },

  {
    title: "Stored Detections",
    value: "0",
    status: "POSTGRES",
    icon: Activity,
    color: "green",
  },

  {
    title: "Today",
    value: "0",
    status: "DETECTED",
    icon: Database,
    color: "green",
  },

  {
    title: "AI Cameras",
    value: "0",
    status: "ONLINE",
    icon: Camera,
    color: "violet",
  },
] as const

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    badge: "text-emerald-400",
  },

  green: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badge: "text-cyan-400",
  },

  red: {
    icon: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "text-red-400",
  },

  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    badge: "text-violet-400",
  },
}

export default function DetectionHero() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    getAnalyticsSummary()
      .then(setSummary)
      .catch((error) => {
        console.error("Failed to load detection hero analytics:", error)
      })
  }, [])

  const stats = heroStats.map((item) => {
    if (item.title === "Stored Detections") {
      return {
        ...item,
        value: String(summary?.total_detections ?? 0),
      }
    }

    if (item.title === "Today") {
      return {
        ...item,
        value: String(summary?.detections_today ?? 0),
      }
    }

    if (item.title === "AI Cameras") {
      return {
        ...item,
        value: String(summary?.online_camera_count ?? 0),
      }
    }

    return item
  })

  return (
    <section
      className="
        relative overflow-hidden

        border-b border-white/10

        bg-gradient-to-br
        from-cyan-500/10
        via-transparent
        to-red-500/10
      "
    >
      {/* BG */}
      <div
        className="
          absolute inset-0

          bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_35%)]
        "
      />

      <div
        className="
          relative

          px-4 py-8

          sm:px-5

          lg:px-8 lg:py-10

          2xl:px-10
        "
      >
        <div
          className="
            flex flex-col gap-8

            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* LEFT */}
          <div className="max-w-3xl">
            {/* BADGE */}
            <div
              className="
                mb-5

                inline-flex items-center
                gap-2

                rounded-full

                border border-cyan-500/20

                bg-cyan-500/10

                px-3 py-1.5
              "
            >
              <Radar className="size-4 text-cyan-300" />

              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-300
                "
              >
                AI Vehicle Detection
              </span>
            </div>

            {/* TITLE */}
            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight

                text-white

                lg:text-3xl
              "
            >
              Realtime Vehicle Detection System
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4

                max-w-3xl

                text-sm
                leading-relaxed

                text-slate-400
              "
            >
              Intelligent license plate recognition, vehicle monitoring, and
              AI-powered traffic violation analysis using realtime video
              processing technology.
            </p>
          </div>

          {/* RIGHT */}
          <div
            className="
              grid grid-cols-1
              gap-4

              sm:grid-cols-2
            "
          >
            {stats.map((stat) => {
              const Icon = stat.icon

              const styles = colorStyles[stat.color]

              return (
                <div
                  key={stat.title}
                  className={`
                    rounded-3xl

                    border ${styles.border}

                    bg-black/40

                    p-5

                    backdrop-blur-xl
                  `}
                >
                  {/* TOP */}
                  <div
                    className="
                      flex items-start
                      justify-between
                      gap-4
                    "
                  >
                    {/* ICON */}
                    <div
                      className={`
                        rounded-2xl

                        ${styles.bg}

                        p-3
                      `}
                    >
                      <Icon
                        className={`
                          size-5
                          ${styles.icon}
                        `}
                      />
                    </div>

                    {/* STATUS */}
                    <span
                      className={`
                        text-xs
                        font-semibold

                        ${styles.badge}
                      `}
                    >
                      {stat.status}
                    </span>
                  </div>

                  {/* VALUE */}
                  <h2
                    className="
                      mt-5

                      text-2xl
                      font-semibold
                      tracking-tight

                      text-white
                    "
                  >
                    {stat.value}
                  </h2>

                  {/* LABEL */}
                  <p
                    className="
                      mt-2

                      text-xs
                      font-semibold

                      text-slate-400
                    "
                  >
                    {stat.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
