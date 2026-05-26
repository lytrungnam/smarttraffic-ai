import { Clock3, Database, ShieldCheck } from "lucide-react"

const heroStats = [
  {
    title: "Total Records",
    value: "PostgreSQL",
    icon: Database,
    color: "cyan",
  },

  {
    title: "Evidence Storage",
    value: "Live",
    icon: ShieldCheck,
    color: "green",
  },

  {
    title: "Realtime Sync",
    value: "24/7",
    icon: Clock3,
    color: "violet",
  },
] as const

const colorStyles = {
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-300",
  },

  green: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-300",
  },

  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-300",
  },
}

export default function HistoryHero() {
  return (
    <section
      className="
        relative overflow-hidden

        border-b border-white/10

        bg-gradient-to-br
        from-cyan-500/10
        via-transparent
        to-violet-500/10
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute inset-0

          bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.15),transparent_35%)]
        "
      />

      <div
        className="
          relative

          px-6 py-10

          lg:px-10
        "
      >
        {/* TOP */}
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
              <Database className="size-4 text-cyan-300" />

              <span
                className="
                  text-xs
                  font-semibold

                  text-cyan-300
                "
              >
                AI Detection Archive
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
              Vehicle Detection History
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4

                max-w-3xl

                text-sm
                leading-relaxed

                text-zinc-400
              "
            >
              Browse historical AI detection records, OCR recognition data,
              vehicle analytics, and traffic surveillance activities across all
              monitored cameras.
            </p>
          </div>

          {/* RIGHT */}
          <div
            className="
              grid grid-cols-1
              gap-4

              sm:grid-cols-3
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

                    {/* STATUS */}
                    <span
                      className={`
                        text-xs
                        font-semibold

                        ${styles.text}
                      `}
                    >
                      ACTIVE
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

                      text-zinc-400
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
