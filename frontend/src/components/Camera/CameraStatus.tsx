// components/Camera/CameraStatus.tsx

import {
  Activity,
  Camera,
  CheckCircle2,
  Cpu,
  HardDrive,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react"

const cameraSystems = [
  {
    id: "CAM-A1",
    location: "Hai Chau District",
    status: "online",
    fps: 32,
    ai: "Active",
    storage: "78%",
    alerts: 2,
  },

  {
    id: "CAM-B2",
    location: "Thanh Khe District",
    status: "online",
    fps: 29,
    ai: "Active",
    storage: "64%",
    alerts: 0,
  },

  {
    id: "CAM-C3",
    location: "Lien Chieu District",
    status: "offline",
    fps: 0,
    ai: "Disconnected",
    storage: "0%",
    alerts: 1,
  },
]

export default function CameraStatus() {
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
            Camera System Status
          </h2>

          <p
            className="
              mt-2

              text-sm
              text-zinc-400
            "
          >
            Realtime monitoring infrastructure overview
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
          <Activity className="h-4 w-4 text-green-400" />

          <span
            className="
              text-xs
              font-semibold

              text-green-400
            "
          >
            Monitoring Active
          </span>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-5">
        {cameraSystems.map((camera) => (
          <div
            key={camera.id}
            className="
              relative overflow-hidden

              rounded-3xl

              border border-white/10

              bg-zinc-900/60

              p-6

              transition-all

              hover:border-cyan-500/20
            "
          >
            {/* GLOW */}
            <div
              className="
                absolute right-0 top-0

                h-40 w-40

                bg-cyan-500/5

                blur-3xl
              "
            />

            {/* TOP */}
            <div
              className="
                relative

                flex flex-col gap-4

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* LEFT */}
              <div
                className="
                  flex items-center gap-5
                "
              >
                {/* ICON */}
                <div
                  className="
                    rounded-2xl

                    border border-white/10

                    bg-black/30

                    p-4
                  "
                >
                  <Camera className="h-6 w-6 text-cyan-400" />
                </div>

                {/* INFO */}
                <div>
                  <h3
                    className="
                      text-lg
                      font-semibold
                      tracking-tight

                      text-white
                    "
                  >
                    {camera.id}
                  </h3>

                  <p
                    className="
                      mt-1

                      text-sm
                      text-zinc-400
                    "
                  >
                    {camera.location}
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div
                className={`
                  inline-flex items-center
                  gap-2

                  rounded-full

                  border

                  px-3 py-1.5

                  ${
                    camera.status === "online"
                      ? "border-green-500/20 bg-green-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  }
                `}
              >
                {camera.status === "online" ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}

                <span
                  className={`
                    text-xs
                    font-semibold

                    ${
                      camera.status === "online"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  `}
                >
                  {camera.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* METRICS */}
            <div
              className="
                mt-6

                grid grid-cols-1
                gap-4

                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              {/* FPS */}
              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-black/30

                  p-4
                "
              >
                <div
                  className="
                    flex items-center gap-3
                  "
                >
                  <Activity className="h-5 w-5 text-cyan-400" />

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold

                        text-zinc-500
                      "
                    >
                      FPS
                    </p>

                    <h4
                      className="
                        mt-1

                        text-lg
                        font-semibold

                        text-white
                      "
                    >
                      {camera.fps}
                    </h4>
                  </div>
                </div>
              </div>

              {/* AI */}
              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-black/30

                  p-4
                "
              >
                <div
                  className="
                    flex items-center gap-3
                  "
                >
                  <Cpu className="h-5 w-5 text-purple-400" />

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold

                        text-zinc-500
                      "
                    >
                      AI Status
                    </p>

                    <h4
                      className="
                        mt-1

                        text-sm
                        font-semibold

                        text-white
                      "
                    >
                      {camera.ai}
                    </h4>
                  </div>
                </div>
              </div>

              {/* STORAGE */}
              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-black/30

                  p-4
                "
              >
                <div
                  className="
                    flex items-center gap-3
                  "
                >
                  <HardDrive className="h-5 w-5 text-yellow-400" />

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold

                        text-zinc-500
                      "
                    >
                      Storage
                    </p>

                    <h4
                      className="
                        mt-1

                        text-lg
                        font-semibold

                        text-white
                      "
                    >
                      {camera.storage}
                    </h4>
                  </div>
                </div>
              </div>

              {/* ALERTS */}
              <div
                className="
                  rounded-2xl

                  border border-white/10

                  bg-black/30

                  p-4
                "
              >
                <div
                  className="
                    flex items-center gap-3
                  "
                >
                  {camera.alerts > 0 ? (
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold

                        text-zinc-500
                      "
                    >
                      Alerts
                    </p>

                    <h4
                      className={`
                        mt-1

                        text-lg
                        font-semibold

                        ${camera.alerts > 0 ? "text-red-400" : "text-green-400"}
                      `}
                    >
                      {camera.alerts}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* STORAGE BAR */}
            <div className="mt-6">
              <div
                className="
                  mb-3

                  flex items-center
                  justify-between
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold

                    text-zinc-400
                  "
                >
                  System Storage Usage
                </p>

                <p
                  className="
                    text-xs
                    font-semibold

                    text-zinc-300
                  "
                >
                  {camera.storage}
                </p>
              </div>

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
                  className="
                    h-full

                    rounded-full

                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-500
                  "
                  style={{
                    width: camera.storage,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
