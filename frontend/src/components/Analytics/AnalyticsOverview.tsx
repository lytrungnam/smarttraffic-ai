// components/Analytics/AnalyticsOverview.tsx

import { Activity, AlertTriangle, Car, Database, Radar } from "lucide-react"
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

const trafficData = [
  { time: "stored", vehicles: 0 },
  { time: "today", vehicles: 0 },
]

const vehicleTypes = [
  { name: "car", value: 0 },
  { name: "motorbike", value: 0 },
  { name: "truck", value: 0 },
  { name: "unknown", value: 0 },
]

const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#f43f5e"]

const stats = [
  {
    title: "Total Vehicles",
    value: "PostgreSQL",
    icon: Car,
    color: "text-cyan-400",
  },

  {
    title: "AI Monitoring",
    value: "Live",
    icon: Radar,
    color: "text-green-400",
  },

  {
    title: "Stored Detections",
    value: "PostgreSQL",
    icon: Database,
    color: "text-cyan-400",
  },

  {
    title: "Realtime Cameras",
    value: "24",
    icon: Activity,
    color: "text-yellow-400",
  },
]

export default function AnalyticsOverview() {
  return (
    <div className="min-h-screen bg-black p-6 text-white">
      {/* HEADER */}
      <div
        className="
          mb-8

          flex flex-col gap-6

          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        {/* LEFT */}
        <div>
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            Traffic Analytics
          </h1>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            AI-powered smart traffic monitoring dashboard
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            inline-flex items-center
            gap-2

            rounded-full

            border border-green-500/20

            bg-green-500/10

            px-3 py-1.5
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
            System Active
          </span>
        </div>
      </div>

      {/* STATS */}
      <div
        className="
          mb-8

          grid grid-cols-1
          gap-5

          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="
                relative overflow-hidden

                rounded-3xl

                border border-white/10

                bg-gradient-to-br
                from-zinc-900
                to-zinc-950

                p-6

                shadow-2xl

                transition-all

                hover:border-cyan-500/30
              "
            >
              {/* GLOW */}
              <div
                className="
                  absolute right-0 top-0

                  h-32 w-32

                  bg-cyan-500/10

                  blur-3xl
                "
              />

              {/* CONTENT */}
              <div
                className="
                  relative

                  flex items-start
                  justify-between
                  gap-4
                "
              >
                {/* LEFT */}
                <div>
                  <p
                    className="
                      text-xs
                      font-semibold

                      text-zinc-400
                    "
                  >
                    {item.title}
                  </p>

                  <h2
                    className="
                      mt-4

                      text-2xl
                      font-semibold
                      tracking-tight

                      text-white
                    "
                  >
                    {item.value}
                  </h2>
                </div>

                {/* ICON */}
                <div
                  className="
                    rounded-2xl

                    border border-white/10

                    bg-zinc-800

                    p-4
                  "
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CHARTS */}
      <div
        className="
          grid grid-cols-1
          gap-6

          xl:grid-cols-3
        "
      >
        {/* TRAFFIC FLOW */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-950

            p-6

            xl:col-span-2
          "
        >
          {/* HEADER */}
          <div
            className="
              mb-8

              flex flex-col gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* LEFT */}
            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                Traffic Flow Analysis
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  text-zinc-400
                "
              >
                Vehicle movement throughout the day
              </p>
            </div>

            {/* RIGHT */}
            <div
              className="
                inline-flex items-center
                gap-2
              "
            >
              <Activity className="h-4 w-4 text-cyan-400" />

              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-400
                "
              >
                Live Monitoring
              </span>
            </div>
          </div>

          {/* CHART */}
          <div className="h-[400px]">
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

                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

                <XAxis dataKey="time" stroke="#71717a" />

                <YAxis stroke="#71717a" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#trafficGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VEHICLE TYPES */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-950

            p-6
          "
        >
          {/* HEADER */}
          <div
            className="
              mb-8

              flex flex-col gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                Vehicle Types
              </h2>

              <p
                className="
                  mt-2

                  text-sm
                  text-zinc-400
                "
              >
                Distribution analysis
              </p>
            </div>

            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>

          {/* CHART */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleTypes}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                >
                  {vehicleTypes.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEGEND */}
          <div className="mt-6 space-y-4">
            {vehicleTypes.map((item, index) => (
              <div
                key={item.name}
                className="
                    flex items-center
                    justify-between
                    gap-4
                  "
              >
                {/* LEFT */}
                <div
                  className="
                      flex items-center
                      gap-3
                    "
                >
                  <div
                    className="
                        h-3 w-3
                        rounded-full
                      "
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />

                  <span
                    className="
                        text-sm
                        font-semibold

                        text-zinc-300
                      "
                  >
                    {item.name}
                  </span>
                </div>

                {/* RIGHT */}
                <span
                  className="
                      text-sm
                      font-semibold

                      text-white
                    "
                >
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
