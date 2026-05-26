// components/Dashboard/DashboardHero.tsx

import { Activity, Car, Database, ShieldCheck, TimerReset } from "lucide-react"

import type { AnalyticsSummary } from "@/services/analyticsService"

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    status: "text-cyan-400",
    glow: "from-cyan-500/20",
  },

  red: {
    icon: "text-red-400",
    status: "text-red-400",
    glow: "from-red-500/20",
  },

  green: {
    icon: "text-emerald-400",
    status: "text-emerald-400",
    glow: "from-emerald-500/20",
  },

  violet: {
    icon: "text-violet-400",
    status: "text-violet-400",
    glow: "from-violet-500/20",
  },
}

type HeroStatProps = {
  title: string
  value: string
  status: string
  icon: any
  color: keyof typeof colorStyles
}

function HeroStatCard({
  title,
  value,
  status,
  icon: Icon,
  color,
}: HeroStatProps) {
  const styles = colorStyles[color]

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl
        border border-white/10
        bg-black/30
        bg-gradient-to-br ${styles.glow} to-transparent

        p-5

        backdrop-blur-xl
      `}
    >
      {/* GLOW */}
      <div
        className="
          absolute right-0 top-0
          h-24 w-24
          bg-white/5
          blur-3xl
        "
      />

      {/* HEADER */}
      <div
        className="
          mb-6
          flex items-center justify-between
        "
      >
        <Icon className={`h-5 w-5 ${styles.icon}`} />

        <span
          className={`
            text-xs
            font-semibold
            tracking-[0.12em]
            ${styles.status}
          `}
        >
          {status}
        </span>
      </div>

      {/* VALUE */}
      <h3
        className="
          text-2xl
          font-semibold
          tracking-tight
          leading-none

          text-white
        "
      >
        {value}
      </h3>

      {/* TITLE */}
      <p
        className="
          mt-2

          text-sm
          font-medium
          tracking-wide

          text-zinc-400
        "
      >
        {title}
      </p>
    </div>
  )
}

type DashboardHeroProps = {
  summary: AnalyticsSummary | null
  isLoading?: boolean
}

export default function DashboardHero({
  summary,
  isLoading = false,
}: DashboardHeroProps) {
  const heroStats: HeroStatProps[] = [
    {
      title: "Total Detections",
      value: isLoading ? "..." : String(summary?.total_detections ?? 0),
      status: "STORED",
      color: "cyan",
      icon: Database,
    },

    {
      title: "Detected Today",
      value: isLoading ? "..." : String(summary?.detections_today ?? 0),
      status: "LIVE",
      color: "green",
      icon: Activity,
    },

    {
      title: "Unique Plates",
      value: isLoading ? "..." : String(summary?.unique_plates ?? 0),
      status: "OCR",
      color: "violet",
      icon: Car,
    },

    {
      title: "Monitoring Status",
      value: "Online",
      status: "REALTIME",
      color: "green",
      icon: TimerReset,
    },
  ]

  return (
    <section
      className="
        relative overflow-hidden

        border-b border-white/10

        bg-gradient-to-br
        from-cyan-500/10
        via-transparent
        to-violet-500/10
      "
    >
      {/* BACKGROUND EFFECT */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.15),transparent_35%)]
        "
      />

      <div className="relative px-6 py-8 lg:px-10">
        <div
          className="
            flex flex-col gap-8

            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LEFT CONTENT */}
          <div className="max-w-3xl">
            {/* BADGE */}
            <div
              className="
                mb-4 inline-flex items-center gap-2

                rounded-full
                border border-cyan-500/20
                bg-cyan-500/10

                px-4 py-1.5

                text-xs
                font-semibold
                tracking-[0.12em]

                text-cyan-300

                backdrop-blur-xl
              "
            >
              <ShieldCheck className="h-4 w-4" />
              SmartTraffic AI Dashboard
            </div>

            {/* TITLE */}
            <h1
              className="
                max-w-3xl

                text-3xl
                font-semibold
                leading-tight
                tracking-tight

                text-white

                lg:text-4xl
              "
            >
              Intelligent Traffic
              <span
                className="
                  font-semibold
                  text-cyan-300
                "
              >
                {" "}
                Surveillance{" "}
              </span>
              System
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4
                max-w-2xl

                text-sm
                font-medium
                leading-relaxed
                tracking-wide

                text-zinc-400
              "
            >
              Real-time vehicle monitoring, AI-powered license plate
              recognition, evidence storage, and traffic analytics for
              intelligent transportation monitoring.
            </p>

            {/* STATUS */}
            <div className="mt-5 flex items-center gap-3">
              <span
                className="
                  h-2 w-2
                  rounded-full
                  bg-emerald-400
                  animate-pulse
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  tracking-wide
                  text-emerald-400
                "
              >
                AI Monitoring System Online
              </span>
            </div>
          </div>

          {/* RIGHT STATS */}
          <div
            className="
              grid grid-cols-1 gap-4

              sm:grid-cols-2

              lg:w-[420px]
            "
          >
            {heroStats.map((stat) => (
              <HeroStatCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
