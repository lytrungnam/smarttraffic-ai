import { useQuery } from "@tanstack/react-query"
import { Activity, Bike, Bus, Car, Truck } from "lucide-react"

import { getAnalyticsSummary } from "@/services/analyticsService"

const ICON_MAP: Record<string, React.ElementType> = {
  car: Car,
  motorbike: Bike,
  truck: Truck,
  bus: Bus,
}

const COLOR_MAP: Record<string, string> = {
  car: "#06b6d4",
  motorbike: "#3b82f6",
  truck: "#8b5cf6",
  bus: "#f59e0b",
  unknown: "#f43f5e",
}

export default function VehicleChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary,
    refetchInterval: 5000,
  })

  const counts = data?.vehicle_type_counts ?? {}
  const total = data?.total_vehicle_count ?? 0

  const vehicleItems = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    value: total > 0 ? Math.round((count / total) * 100) : 0,
    Icon: ICON_MAP[name] ?? Activity,
    color: COLOR_MAP[name] ?? "#71717a",
  }))

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
      <div className="absolute left-0 top-0 h-64 w-64 bg-cyan-500/10 blur-3xl" />

      {/* HEADER */}
      <div className="relative mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Vehicle Detection Analysis
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            AI-based vehicle classification statistics
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">Live AI</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-5">
        {/* TOTAL */}
        <div className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-950 to-blue-500/10 p-8">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="mb-5 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <Activity className="h-10 w-10 text-cyan-400" />
            </div>
            <h2 className="text-5xl font-semibold tracking-tight text-white">
              {isLoading ? "..." : total.toLocaleString()}
            </h2>
            <p className="mt-3 text-sm text-zinc-400">Total Vehicles Detected</p>
            <div className="mt-6 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2">
              <span className="text-xs font-semibold text-cyan-400">
                Realtime AI Monitoring Active
              </span>
            </div>
          </div>
        </div>

        {/* VEHICLE TYPE CARDS */}
        {isLoading ? (
          <p className="text-center text-sm text-zinc-500">Loading...</p>
        ) : vehicleItems.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            No detections yet — start the AI engine to see data
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {vehicleItems.map((item) => (
              <div
                key={item.name}
                className="
                  group rounded-3xl border border-white/10
                  bg-zinc-900/60 p-5
                  transition-all duration-300 hover:border-cyan-500/30
                "
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="shrink-0 rounded-2xl p-4"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.Icon className="h-6 w-6" style={{ color: item.color }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold tracking-tight text-white capitalize">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-zinc-400">
                          {item.count.toLocaleString()} detected
                        </p>
                        <h2
                          className="shrink-0 text-xl font-semibold tracking-tight"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
