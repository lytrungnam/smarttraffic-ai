import {
  Activity,
  Cpu,
  Database,
  ShieldCheck,
} from "lucide-react"

const systems = [
  {
    title: "YOLOv11 Detection",
    status: "Operational",
    icon: Activity,
    color: "text-cyan-400",
  },

  {
    title: "OCR Engine",
    status: "Realtime Active",
    icon: Cpu,
    color: "text-green-400",
  },

  {
    title: "PostgreSQL Database",
    status: "Connected",
    icon: Database,
    color: "text-violet-400",
  },

  {
    title: "Security Firewall",
    status: "Protected",
    icon: ShieldCheck,
    color: "text-yellow-400",
  },
]

export default function AdminSystem() {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-white/[0.03]
        p-6
      "
    >
      {/* HEADER */}
      <div className="mb-8">
        <h2
          className="
            text-xl
            font-semibold
            tracking-tight

            text-white
          "
        >
          Realtime AI Infrastructure
        </h2>

        <p
          className="
            mt-2

            text-sm
            text-zinc-400
          "
        >
          Operational status of detection
          engines, OCR processing, database
          connectivity, and surveillance
          security services.
        </p>
      </div>

      {/* GRID */}
      <div
        className="
          grid grid-cols-1 gap-5

          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {systems.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="
                rounded-3xl
                border border-white/10
                bg-black/20
                p-5
              "
            >
              <div
                className="
                  flex items-center gap-4
                "
              >
                <div
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-black/20
                    p-4
                  "
                >
                  <Icon
                    className={`h-6 w-6 ${item.color}`}
                  />
                </div>

                <div>
                  <h3
                    className="
                      text-sm
                      font-semibold

                      text-white
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`
                      mt-1

                      text-xs
                      font-semibold

                      ${item.color}
                    `}
                  >
                    {item.status}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}