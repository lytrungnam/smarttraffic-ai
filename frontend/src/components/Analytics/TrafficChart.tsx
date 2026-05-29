import { useQuery } from "@tanstack/react-query"
import { Activity, Clock3, TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { getAnalyticsSummary } from "@/services/analyticsService"

export default function TrafficChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary,
    refetchInterval: 5000,
  })

  const total = data?.total_detections ?? 0
  const today = data?.detections_today ?? 0
  const uniquePlates = data?.unique_plates ?? 0

  const trafficData = [
    { time: "Unique Plates", vehicles: uniquePlates },
    { time: "Today", vehicles: today },
    { time: "All Time", vehicles: total },
  ]

  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        border border-white/10
        bg-gradient-to-br from-zinc-950 to-black
        p-6 shadow-2xl
      "
    >
      {/* GLOW */}
      <div className="absolute right-0 top-0 h-64 w-64 bg-cyan-500/10 blur-3xl" />

      {/* HEADER */}
      <div className="relative mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Traffic Flow Analytics
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Realtime vehicle movement monitoring
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">Live Monitoring</span>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* TOTAL */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Total Detections</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {isLoading ? "..." : total.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>

        {/* TODAY */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Today</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {isLoading ? "..." : today.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* UNIQUE PLATES */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Unique Plates</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {isLoading ? "..." : uniquePlates.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
              <Clock3 className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="relative h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficData}>
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

            <XAxis
              dataKey="time"
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />

            <YAxis
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #27272a",
                borderRadius: "16px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />

            <Area
              type="monotone"
              dataKey="vehicles"
              stroke="#06b6d4"
              strokeWidth={3}
              fill="url(#trafficGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
