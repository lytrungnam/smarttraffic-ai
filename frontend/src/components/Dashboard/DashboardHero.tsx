// components/Dashboard/DashboardHero.tsx

import { Activity, Car, Database, ShieldCheck, TimerReset } from "lucide-react"

import type { AnalyticsSummary } from "@/services/analyticsService"

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    status: "text-cyan-400",
    glow: "from-cyan-500/10",
  },

  green: {
    icon: "text-emerald-400",
    status: "text-emerald-400",
    glow: "from-emerald-500/10",
  },

  violet: {
    icon: "text-violet-400",
    status: "text-violet-400",
    glow: "from-violet-500/10",
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
      className={
        `
        rounded-3xl
        border border-white/10
        bg-slate-950/80
        p-5
        shadow-xl
        transition duration-300
        hover:-translate-y-1
        hover:border-cyan-400/20
        ${styles.glow}
      `
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {title}
          </p>
          <h3 className="text-3xl font-semibold text-white">{value}</h3>
        </div>

        <div
          className={
            `
            inline-flex h-11 w-11 items-center justify-center rounded-2xl
            bg-black/40
            ${styles.icon}
          `
          }
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-400">
        <span>{status}</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-300">Updated</span>
      </div>
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
      status: "Stored records",
      color: "cyan",
      icon: Database,
    },
    {
      title: "Detected Today",
      value: isLoading ? "..." : String(summary?.detections_today ?? 0),
      status: "Realtime feed",
      color: "green",
      icon: Activity,
    },
    {
      title: "Unique Plates",
      value: isLoading ? "..." : String(summary?.unique_plates ?? 0),
      status: "OCR matches",
      color: "violet",
      icon: Car,
    },
    {
      title: "Monitoring Status",
      value: "Online",
      status: "Live tracking",
      color: "green",
      icon: TimerReset,
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-slate-950/90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%)]" />
      <div className="relative px-6 py-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              SmartTraffic AI
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Traffic Operations Monitoring
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                Centralized view for live vehicle detections, camera health, and AI traffic analytics.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Platform status
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-emerald-300">Live</span>
              <span className="rounded-full bg-cyan-500/10 px-3 py-2 text-cyan-300">AI Driven</span>
              <span className="rounded-full bg-violet-500/10 px-3 py-2 text-violet-300">Monitoring</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {heroStats.map((stat) => (
            <HeroStatCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
