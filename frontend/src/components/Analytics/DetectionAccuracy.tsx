// components/Analytics/DetectionAccuracy.tsx

import {
  AlertTriangle,
  Cpu,
  Radar,
  ScanSearch,
  ShieldCheck,
} from "lucide-react"

const metrics = [
  {
    title: "Plate Detection Accuracy",
    value: "Live",
    status: "Excellent",
    icon: Radar,
    color: "cyan",
  },

  {
    title: "OCR Recognition Accuracy",
    value: "97.9%",
    status: "Stable",
    icon: ScanSearch,
    color: "green",
  },

  {
    title: "False Positive Rate",
    value: "1.2%",
    status: "Low",
    icon: AlertTriangle,
    color: "red",
  },

  {
    title: "AI Processing Speed",
    value: "Stream",
    status: "Realtime",
    icon: Cpu,
    color: "yellow",
  },
] as const

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    progress: "from-cyan-500 to-blue-500",
  },

  green: {
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    progress: "from-emerald-500 to-green-500",
  },

  red: {
    icon: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    progress: "from-red-500 to-orange-500",
  },

  yellow: {
    icon: "text-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    progress: "from-yellow-500 to-orange-500",
  },
}

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
            AI Detection Metrics
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Realtime deep learning performance analysis
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
            AI Stable
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
        {metrics.map((metric) => {
          const Icon = metric.icon

          const styles = colorStyles[metric.color]

          return (
            <div
              key={metric.title}
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
                      {metric.title}
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
                      {metric.value}
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

                          ${styles.badge}
                        `}
                      >
                        {metric.status}
                      </span>
                    </div>
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
                    <Icon className={`h-5 w-5 ${styles.icon}`} />
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
                      className={`
                        h-full

                        rounded-full

                        bg-gradient-to-r

                        ${styles.progress}
                      `}
                      style={{
                        width: metric.value,
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
