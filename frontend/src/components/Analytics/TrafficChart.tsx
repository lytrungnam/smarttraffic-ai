// components/Analytics/TrafficChart.tsx

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

const trafficData = [
  { time: "stored", vehicles: 0 },
  { time: "today", vehicles: 0 },
]

export default function TrafficChart() {
  return (
    <div
      className="
        relative overflow-hidden

        rounded-3xl

        border border-white/10

        bg-gradient-to-br
        from-zinc-950
        to-black

        p-6

        shadow-2xl
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute right-0 top-0

          h-64 w-64

          bg-cyan-500/10

          blur-3xl
        "
      />

      {/* HEADER */}
      <div
        className="
          relative

          mb-8

          flex flex-col gap-5

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* LEFT */}
        <div>
          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            Traffic Flow Analytics
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Realtime vehicle movement monitoring
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            inline-flex items-center
            gap-2

            rounded-full

            border border-cyan-500/20

            bg-cyan-500/10

            px-3 py-1.5
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

      {/* STATS */}
      <div
        className="
          mb-8

          grid grid-cols-1
          gap-5

          md:grid-cols-3
        "
      >
        {/* PEAK */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
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
                Peak Traffic
              </p>

              <h3
                className="
                  mt-4

                  text-2xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                710
              </h3>
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
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>

        {/* AVERAGE */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
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
                Average Flow
              </p>

              <h3
                className="
                  mt-4

                  text-2xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                326
              </h3>
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
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* RUSH HOUR */}
        <div
          className="
            rounded-3xl

            border border-white/10

            bg-zinc-900/60

            p-5
          "
        >
          <div
            className="
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
                Rush Hour
              </p>

              <h3
                className="
                  mt-4

                  text-2xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                18:00
              </h3>
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
              tick={{
                fontSize: 12,
                fontWeight: 600,
              }}
            />

            <YAxis
              stroke="#71717a"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
                fontWeight: 600,
              }}
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
