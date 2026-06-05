// components/Dashboard/DashboardCards.tsx

import { Activity, Camera, Car, Database, TrendingUp } from "lucide-react"

import type { AnalyticsSummary } from "@/services/analyticsService"

type CardColor = "cyan" | "red" | "green" | "yellow"

type DashboardCardItem = {
  title: string
  value: string
  growth: string
  status: string
  icon: any
  color: CardColor
}

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    border: "hover:border-cyan-400/20",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },

  red: {
    icon: "text-red-400",
    glow: "shadow-red-500/10",
    border: "hover:border-red-400/20",
    gradient: "from-red-500/20 to-orange-500/10",
  },

  green: {
    icon: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    border: "hover:border-emerald-400/20",
    gradient: "from-emerald-500/20 to-green-500/10",
  },

  yellow: {
    icon: "text-yellow-400",
    glow: "shadow-yellow-500/10",
    border: "hover:border-yellow-400/20",
    gradient: "from-yellow-500/20 to-amber-500/10",
  },
}

type DashboardCardProps = {
  title: string
  value: string
  growth: string
  status: string
  icon: any
  color: CardColor
}

function DashboardCard({
  title,
  value,
  growth,
  status,
  icon: Icon,
  color,
}: DashboardCardProps) {
  const styles = colorStyles[color]

  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-black/40
        bg-gradient-to-br ${styles.gradient}

        p-5

        backdrop-blur-xl
        shadow-2xl ${styles.glow}

        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]

        ${styles.border}
      `}
    >
      {/* GLOW EFFECT */}
      <div
        className="
          absolute right-0 top-0
          h-32 w-32
          bg-white/5
          blur-3xl
        "
      />

      {/* CONTENT */}
      <div className="relative flex items-start justify-between">
        {/* LEFT */}
        <div className="flex-1">
          {/* TITLE */}
          <p
            className="
              text-xs
              font-medium
              tracking-[0.12em]
              text-zinc-500
            "
          >
            {title}
          </p>

          {/* VALUE */}
          <h2
            className="
              mt-2

              text-2xl
              font-semibold
              tracking-tight
              leading-none

              text-white
            "
          >
            {value}
          </h2>

          {/* GROWTH */}
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />

            <span
              className="
                text-sm
                font-semibold
                tracking-wide
                text-emerald-400
              "
            >
              {growth}
            </span>
          </div>
        </div>

        {/* ICON */}
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-black/30

            p-3

            backdrop-blur-md
            transition-transform duration-300
            group-hover:scale-105
          "
        >
          <Icon className={`h-6 w-6 ${styles.icon}`} />
        </div>
      </div>

      {/* STATUS */}
      <div className="relative mt-4 flex items-center gap-2">
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
            text-zinc-300
          "
        >
          {status}
        </span>
      </div>

      {/* BORDER EFFECT */}
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
}

type DashboardCardsProps = {
  summary: AnalyticsSummary | null
  isLoading?: boolean
}

export default function DashboardCards({
  summary,
  isLoading = false,
}: DashboardCardsProps) {
  const cards: DashboardCardItem[] = [
    {
      title: "Total Detections",
      value: isLoading ? "..." : String(summary?.total_detections ?? 0),
      growth: "PostgreSQL",
      status: "Stored Records",
      icon: Database,
      color: "cyan",
    },

    {
      title: "Detections Today",
      value: isLoading ? "..." : String(summary?.detections_today ?? 0),
      growth: "UTC Day",
      status: "Live Monitoring",
      icon: Activity,
      color: "green",
    },

    {
      title: "Unique Plates",
      value: isLoading ? "..." : String(summary?.unique_plates ?? 0),
      growth: "OCR Index",
      status: "Plate Recognition",
      icon: Car,
      color: "yellow",
    },

    {
      title: "Online Cameras",
      value: isLoading ? "..." : String(summary?.online_camera_count ?? 0),
      growth: "AI Detection Loop",
      status:
        !isLoading && (summary?.online_camera_count ?? 0) > 0
          ? "Camera Feed Active"
          : "No Cameras Registered",
      icon: Camera,
      color: (summary?.online_camera_count ?? 0) > 0 ? "green" : "yellow",
    },
  ]

  return (
    <section
      className="
        grid grid-cols-1 gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      {cards.map((card) => (
        <DashboardCard key={card.title} {...card} />
      ))}
    </section>
  )
}
