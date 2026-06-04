import {
  ShieldCheck,
} from "lucide-react"

import {
  MODEL_EVALUATION_VALUES,
  TRAFFIC_VEHICLE_CLASSES,
  VEHICLE_CLASS_COLORS,
  VEHICLE_CLASS_ICONS,
  VEHICLE_CLASS_LABELS,
} from "@/constants/vehicleClasses"

export default function DetectionAccuracy() {
  return (
    <div
      className="
        rounded-3xl

        border border-white/10

        bg-gradient-to-br
        from-zinc-950
        to-black

        p-6

        shadow-2xl
      "
    >
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
          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            AI Model Evaluation
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Normalized confusion-matrix diagonal values from the trained vehicle model.
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
          <ShieldCheck className="h-4 w-4 text-green-400" />

          <span
            className="
              text-xs
              font-semibold

              text-green-400
            "
          >
            Offline validation
          </span>
        </div>
      </div>

      {/* METRICS */}
      <div
        className="
          grid grid-cols-1
          gap-5

          md:grid-cols-2
        "
      >
        {TRAFFIC_VEHICLE_CLASSES.map((vehicleClass) => {
          const Icon = VEHICLE_CLASS_ICONS[vehicleClass]
          const value = MODEL_EVALUATION_VALUES[vehicleClass]
          const color = VEHICLE_CLASS_COLORS[vehicleClass]

          return (
            <div
              key={vehicleClass}
              className="
                relative overflow-hidden

                rounded-3xl

                border border-white/10

                bg-zinc-900/60

                p-5

                transition-all
                duration-300

                hover:border-cyan-500/30
              "
            >
              {/* GLOW */}
              <div
                className="
                  absolute right-0 top-0

                  h-28 w-28

                  bg-cyan-500/10

                  blur-3xl
                "
              />

              {/* CONTENT */}
              <div className="relative">
                {/* TOP */}
                <div
                  className="
                    flex items-start
                    justify-between
                    gap-4
                  "
                >
                  {/* LEFT */}
                  <div>
                    {/* TITLE */}
                    <p
                      className="
                        text-xs
                        font-semibold

                        text-zinc-400
                      "
                    >
                        {VEHICLE_CLASS_LABELS[vehicleClass]}
                    </p>

                    {/* VALUE */}
                    <h2
                      className="
                        mt-4

                        text-2xl
                        font-semibold
                        tracking-tight

                        text-white
                      "
                    >
                      {value.toFixed(2)}
                    </h2>

                    {/* STATUS */}
                    <div className="mt-4">
                      <span
                        className={`
                          inline-flex items-center

                          rounded-full

                          border

                          px-3 py-1.5

                          text-xs
                          font-semibold

                        `}
                        style={{
                          borderColor: `${color}40`,
                          backgroundColor: `${color}16`,
                          color,
                        }}
                      >
                        Model class
                      </span>
                    </div>
                  </div>

                  {/* ICON */}
                  <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-6">
                  <div
                    className="
                      h-2
                      w-full

                      overflow-hidden

                      rounded-full

                      bg-zinc-800
                    "
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(value * 100)}%`,
                        backgroundColor: color,
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
  )
}
