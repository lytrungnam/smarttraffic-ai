import { Activity, Camera, ShieldCheck, Users } from "lucide-react"

const stats = [
  {
    title: "Active Users",
    value: "24",
    icon: Users,
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-500/10",
  },

  {
    title: "Surveillance Cameras",
    value: "48",
    icon: Camera,
    color: "text-green-400",
    bg: "from-green-500/20 to-emerald-500/10",
  },

  {
    title: "Detection Accuracy",
    value: "98.7%",
    icon: Activity,
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-orange-500/10",
  },

  {
    title: "Infrastructure Status",
    value: "Stable",
    icon: ShieldCheck,
    color: "text-violet-400",
    bg: "from-violet-500/20 to-purple-500/10",
  },
]

export default function AdminStats() {
  return (
    <div
      className="
        grid grid-cols-1 gap-6

        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      {stats.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.title}
            className={`
              overflow-hidden
              rounded-3xl
              border border-white/10

              bg-gradient-to-br
              ${item.bg}

              p-6
            `}
          >
            <div
              className="
                flex items-start
                justify-between
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

                <h3
                  className="
                    mt-4

                    text-2xl
                    font-semibold
                    tracking-tight

                    text-white
                  "
                >
                  {item.value}
                </h3>
              </div>

              {/* RIGHT */}
              <div
                className="
                  rounded-2xl
                  border border-white/10
                  bg-black/20
                  p-4
                "
              >
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
