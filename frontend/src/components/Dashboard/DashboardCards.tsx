// components/Dashboard/DashboardCards.tsx

import { Activity, Camera, Car, Database, TrendingUp } from "lucide-react"

import type { AnalyticsSummary } from "@/services/analyticsService"

type CardColor = "cyan" | "green" | "yellow"

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
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-300",
  },

  green: {
    icon: "text-emerald-400",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-300",
  },

  yellow: {
    icon: "text-yellow-400",
    border: "border-yellow-500/20",
    badge: "bg-yellow-500/10 text-yellow-300",
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
      className={
        `
        rounded-3xl
        border ${styles.border}
        bg-slate-950/80
        p-5
        shadow-xl
        transition duration-300
        hover:-translate-y-1
        hover:border-white/20
      `
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {title}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">{growth}</p>
        </div>

        <div
          className={
            `
            inline-flex h-12 w-12 items-center justify-center rounded-3xl
            bg-white/5
            ${styles.icon}
          `
          }
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-zinc-300">
        <span className={`rounded-full px-3 py-1 font-semibold ${styles.badge}`}>
          {status}
        </span>
        <div className="flex items-center gap-2 text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span>Updating</span>
        </div>
      </div>
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
      growth: "Stored records",
      status: "Database",
      icon: Database,
      color: "cyan",
    },
    {
      title: "Detections Today",
      value: isLoading ? "..." : String(summary?.detections_today ?? 0),
      growth: "Realtime feed",
      status: "Monitoring",
      icon: Activity,
      color: "green",
    },
    {
      title: "Unique Plates",
      value: isLoading ? "..." : String(summary?.unique_plates ?? 0),
      growth: "OCR index",
      status: "Recognition",
      icon: Car,
      color: "yellow",
    },
    {
      title: "Online Cameras",
      value: isLoading ? "..." : String(summary?.online_camera_count ?? 0),
      growth: "Connected feeds",
      status:
        !isLoading && (summary?.online_camera_count ?? 0) > 0
          ? "Active"
          : "Offline",
      icon: Camera,
      color: "green",
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <DashboardCard key={card.title} {...card} />
      ))}
    </section>
  )
}
