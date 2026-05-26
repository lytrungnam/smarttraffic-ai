import { Activity, ShieldCheck, TrendingUp } from "lucide-react"

const heroStats = [
  {
    title: "Detection Accuracy",
    value: "Live",
    growth: "+18%",
    icon: TrendingUp,
    color: "cyan",
  },

  {
    title: "Monitoring Status",
    value: "24/7",
    growth: "LIVE",
    icon: ShieldCheck,
    color: "violet",
  },
] as const

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    badge: "text-emerald-400",
  },

  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    badge: "text-cyan-400",
  },
}

export default function AnalyticsHero() {
  return (
    <section
      className="
        relative overflow-hidden

        border-b border-white/10

        bg-gradient-to-br
        from-cyan-500/10
        via-transparent
        to-blue-500/10
      "
    >
      {/* BG */}
      <div
        className="
          absolute inset-0

          bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.15),transparent_35%)]
        "
      />

      <div
        className="
          relative

          px-4 py-8

          sm:px-5

          lg:px-8 lg:py-10

          2xl:px-10
        "
      >
        <div
          className="
            flex flex-col gap-8

            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* LEFT */}
          <div className="max-w-3xl">
            {/* BADGE */}
            <div
              className="
                mb-5

                inline-flex items-center
                gap-2

                rounded-full

                border border-cyan-500/20

                bg-cyan-500/10

                px-3 py-1.5
              "
            >
              <Activity className="size-4 text-cyan-300" />

              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-300
                "
              >
                AI Traffic Analytics
              </span>
            </div>

            {/* TITLE */}
            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight

                text-white

                lg:text-3xl
              "
            >
              Traffic Monitoring Analytics Dashboard
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4

                max-w-3xl

                text-sm
                leading-relaxed

                text-slate-400
              "
            >
              Realtime vehicle analytics, detection accuracy monitoring, traffic
              density analysis, and AI surveillance insights for smart traffic
              management.
            </p>
          </div>

          {/* RIGHT */}
          <div
            className="
              grid grid-cols-1
              gap-4

              sm:grid-cols-2
            "
          >
            {heroStats.map((stat) => {
              const Icon = stat.icon

              const styles = colorStyles[stat.color]

              return (
                <div
                  key={stat.title}
                  className={`
                    rounded-3xl

                    border ${styles.border}

                    bg-black/40

                    p-5

                    backdrop-blur-xl
                  `}
                >
                  {/* TOP */}
                  <div
                    className="
                      flex items-start
                      justify-between
                      gap-4
                    "
                  >
                    {/* ICON */}
                    <div
                      className={`
                        rounded-2xl

                        ${styles.bg}

                        p-3
                      `}
                    >
                      <Icon
                        className={`
                          size-5
                          ${styles.icon}
                        `}
                      />
                    </div>

                    {/* BADGE */}
                    <span
                      className={`
                        text-xs
                        font-semibold

                        ${styles.badge}
                      `}
                    >
                      {stat.growth}
                    </span>
                  </div>

                  {/* VALUE */}
                  <h2
                    className="
                      mt-5

                      text-2xl
                      font-semibold
                      tracking-tight

                      text-white
                    "
                  >
                    {stat.value}
                  </h2>

                  {/* LABEL */}
                  <p
                    className="
                      mt-2

                      text-xs
                      font-semibold

                      text-slate-400
                    "
                  >
                    {stat.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
