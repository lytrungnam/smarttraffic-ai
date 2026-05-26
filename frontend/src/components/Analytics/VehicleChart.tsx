// components/Analytics/VehicleChart.tsx

import { Activity, Bike, Bus, Car, Truck } from "lucide-react"

const vehicleData = [
  {
    name: "car",
    value: 0,
    total: 12847,
    icon: Car,
    color: "#06b6d4",
  },

  {
    name: "motorbike",
    value: 0,
    total: 8742,
    icon: Bike,
    color: "#3b82f6",
  },

  {
    name: "truck",
    value: 0,
    total: 2134,
    icon: Truck,
    color: "#8b5cf6",
  },

  {
    name: "unknown",
    value: 0,
    total: 834,
    icon: Bus,
    color: "#f43f5e",
  },
]

export default function VehicleChart() {
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
          absolute left-0 top-0

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
            Vehicle Detection Analysis
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            AI-based vehicle classification statistics
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
            Live AI
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-5">
        {/* TOTAL VEHICLES */}
        <div
          className="
            relative overflow-hidden

            rounded-[32px]

            border border-cyan-500/20

            bg-gradient-to-br
            from-cyan-500/10
            via-zinc-950
            to-blue-500/10

            p-8
          "
        >
          {/* INNER GLOW */}
          <div
            className="
              absolute left-1/2 top-1/2

              h-64 w-64

              -translate-x-1/2
              -translate-y-1/2

              rounded-full

              bg-cyan-500/10

              blur-3xl
            "
          />

          <div
            className="
              relative

              flex flex-col
              items-center
              justify-center

              text-center
            "
          >
            {/* ICON */}
            <div
              className="
                mb-5

                rounded-3xl

                border border-cyan-500/20

                bg-cyan-500/10

                p-5
              "
            >
              <Activity className="h-10 w-10 text-cyan-400" />
            </div>

            {/* VALUE */}
            <h2
              className="
                text-5xl
                font-semibold
                tracking-tight

                text-white
              "
            >
              Live
            </h2>

            {/* LABEL */}
            <p
              className="
                mt-3

                text-sm
                text-zinc-400
              "
            >
              Total Vehicles Detected
            </p>

            {/* STATUS */}
            <div
              className="
                mt-6

                rounded-full

                border border-cyan-500/20

                bg-cyan-500/10

                px-4 py-2
              "
            >
              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-400
                "
              >
                Realtime AI Monitoring Active
              </span>
            </div>
          </div>
        </div>

        {/* VEHICLE CARDS */}
        <div
          className="
            grid grid-cols-1
            gap-4

            lg:grid-cols-2
          "
        >
          {vehicleData.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.name}
                className="
                  group

                  rounded-3xl

                  border border-white/10

                  bg-zinc-900/60

                  p-5

                  transition-all
                  duration-300

                  hover:border-cyan-500/30
                "
              >
                <div className="flex flex-col gap-5">
                  {/* TOP */}
                  <div
                    className="
                      flex items-center
                      gap-4

                      min-w-0
                    "
                  >
                    {/* ICON */}
                    <div
                      className="
                        shrink-0

                        rounded-2xl

                        p-4
                      "
                      style={{
                        backgroundColor: `${item.color}20`,
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{
                          color: item.color,
                        }}
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      {/* TITLE */}
                      <h3
                        className="
                          text-sm
                          font-semibold
                          tracking-tight

                          text-white
                        "
                      >
                        {item.name}
                      </h3>

                      {/* INFO */}
                      <div
                        className="
                          mt-2

                          flex items-center
                          justify-between
                          gap-3
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-semibold

                            text-zinc-400
                          "
                        >
                          {item.total.toLocaleString()} detected
                        </p>

                        <h2
                          className="
                            shrink-0

                            text-xl
                            font-semibold
                            tracking-tight
                          "
                          style={{
                            color: item.color,
                          }}
                        >
                          {item.value}%
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div
                      className="
                        h-2.5
                        w-full

                        overflow-hidden

                        rounded-full

                        bg-zinc-800
                      "
                    >
                      <div
                        className="
                          h-full

                          rounded-full

                          transition-all
                        "
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
