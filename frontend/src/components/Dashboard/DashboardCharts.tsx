// components/Dashboard/DashboardCharts.tsx

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  TRAFFIC_VEHICLE_CLASSES,
  VEHICLE_CLASS_COLORS,
  VEHICLE_CLASS_LABELS,
} from "@/constants/vehicleClasses"
import type { AnalyticsSummary } from "@/services/analyticsService"

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
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
      <div className="mb-8">
        <h2
          className="
            text-2xl
            font-semibold
            tracking-tight
            text-white
          "
        >
          {title}
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
          {description}
        </p>
      </div>

      {children}
    </div>
  )
}

type DashboardChartsProps = {
  summary: AnalyticsSummary | null
}

export default function DashboardCharts({ summary }: DashboardChartsProps) {
  const trafficData = [
    {
      time: "stored",
      vehicles: summary?.total_detections ?? 0,
    },
    {
      time: "today",
      vehicles: summary?.detections_today ?? 0,
    },
  ]

  const totalVehicles = summary?.total_vehicle_count ?? 0
  const vehicleData = TRAFFIC_VEHICLE_CLASSES.map((vehicleClass) => {
    const count = summary?.vehicle_type_counts[vehicleClass] ?? 0
    return {
      name: VEHICLE_CLASS_LABELS[vehicleClass],
      value: totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0,
      count,
      color: VEHICLE_CLASS_COLORS[vehicleClass],
    }
  })

  return (
    <section
      className="
        grid grid-cols-1 gap-6
        xl:grid-cols-3
      "
    >
      {/* AREA CHART */}
      <div className="xl:col-span-2">
        <ChartCard
          title="Traffic Flow Analytics"
          description="Realtime vehicle movement and congestion monitoring"
        >
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient
                    id="trafficGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />

                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#trafficGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* PIE CHART */}
      <ChartCard
        title="Vehicle Distribution"
        description="AI classification statistics"
      >
        <div className="relative h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicleData}
                dataKey="count"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
              >
                {vehicleData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER INFO */}
          <div
            className="
              pointer-events-none
              absolute inset-0
              flex flex-col items-center justify-center
            "
          >
            <h3
              className="
                text-4xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              {totalVehicles}
            </h3>

            <p
              className="
                mt-1
                text-sm
                font-medium
                tracking-wide
                text-zinc-400
              "
            >
              Vehicles
            </p>
          </div>
        </div>

        {/* LEGEND */}
        <div className="mt-8 space-y-2">
          {vehicleData.map((item) => (
            <div
              key={item.name}
              className="
                flex items-center justify-between gap-3
                rounded-2xl
                border border-white/10
                bg-zinc-900/40
                px-4 py-2.5
                transition-all duration-300
                hover:border-white/20
                hover:bg-zinc-900/60
              "
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span
                  className="
                    truncate
                    text-sm
                    font-medium
                    tracking-wide
                    text-white
                  "
                >
                  {item.name}
                </span>
              </div>

              <span
                className="
                  flex-shrink-0
                  text-sm
                  font-semibold
                  tracking-wide
                "
                style={{
                  color: item.color,
                }}
              >
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </section>
  )
}
