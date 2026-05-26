// components/Camera/CameraPlayer.tsx

import {
  Maximize2,
  Pause,
  Play,
  Radio,
  ScanLine,
  ShieldAlert,
  Volume2,
  WifiOff,
} from "lucide-react"
import { useState } from "react"

type CameraPlayerProps = {
  streamUrl: string
  cameraName: string
  location: string
  isPlaying?: boolean
}

export default function CameraPlayer({
  streamUrl,
  cameraName,
  location,
  isPlaying = true,
}: CameraPlayerProps) {
  const [streamError, setStreamError] = useState(false)
  return (
    <div
      className="
        relative overflow-hidden

        rounded-3xl
        border border-white/10

        bg-black

        shadow-2xl
      "
    >
      {/* VIDEO */}
      <div
        className="
          relative
          h-[40vh] min-h-[260px]
          overflow-hidden
          md:h-[420px]
          lg:h-[520px]
        "
      >
        {streamError ? (
          <div
            className="
              flex h-full flex-col
              items-center justify-center
              gap-3
              bg-zinc-900
            "
          >
            <WifiOff className="h-10 w-10 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              Stream offline — backend not running
            </p>
            <button
              type="button"
              onClick={() => setStreamError(false)}
              className="min-h-[44px] px-4 text-sm text-cyan-400 underline"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <img
            src={streamUrl}
            alt={cameraName}
            className="
              h-full w-full
              object-cover
            "
            onError={() => setStreamError(true)}
          />
        )}

        {/* OVERLAY */}
        <div
          className="
            absolute inset-0

            bg-gradient-to-t
            from-black
            via-transparent
            to-black/20
          "
        />

        {/* AI SCAN */}
        <div
          className="
            pointer-events-none
            absolute inset-0
          "
        >
          <div
            className="
              absolute left-0 right-0
              top-1/2

              h-[2px]

              bg-cyan-400

              shadow-[0_0_20px_rgba(34,211,238,1)]

              animate-pulse
            "
          />
        </div>

        {/* DETECTION */}
        <div
          className="
            absolute

            left-[30%]
            top-[42%]

            h-[110px]
            w-[260px]

            rounded-2xl

            border-[3px]
            border-cyan-400

            shadow-[0_0_25px_rgba(34,211,238,0.9)]
          "
        >
          <div
            className="
              absolute -top-11 left-0

              rounded-xl

              bg-cyan-500

              px-4 py-1.5

              text-sm
              font-semibold
              tracking-tight

              text-black
            "
          >
            Live ALPR
          </div>
        </div>

        {/* TOP */}
        <div
          className="
            absolute left-5 right-5 top-5
          "
        >
          <div
            className="
              flex items-center
              justify-between
              gap-4
            "
          >
            {/* LIVE */}
            <div
              className="
                inline-flex items-center
                gap-2

                rounded-full

                border border-green-500/20
                bg-green-500/10

                px-3 py-1.5

                backdrop-blur-xl
              "
            >
              <Radio className="h-4 w-4 text-green-400" />

              <span
                className="
                  text-xs
                  font-semibold

                  text-green-400
                "
              >
                LIVE STREAM
              </span>
            </div>

            {/* ACTIONS */}
            <div
              className="
                flex items-center gap-3
              "
            >
              <button
                type="button"
                disabled
                title="Audio control is disabled for the traffic preview stream."
                className="
                  min-h-[44px] min-w-[44px]
                  rounded-2xl

                  border border-white/10

                  bg-black/40

                  p-3

                  backdrop-blur-xl

                  transition-all

                  hover:bg-black/60
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Volume2 className="h-5 w-5 text-white" />
              </button>

              <button
                type="button"
                disabled
                title="Fullscreen playback is disabled until a live camera stream is connected."
                className="
                  min-h-[44px] min-w-[44px]
                  rounded-2xl

                  border border-white/10

                  bg-black/40

                  p-3

                  backdrop-blur-xl

                  transition-all

                  hover:bg-black/60
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Maximize2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            absolute bottom-0
            left-0 right-0

            bg-gradient-to-t
            from-black
            to-transparent

            p-6
          "
        >
          <div
            className="
              flex flex-col gap-6

              lg:flex-row
              lg:items-end
              lg:justify-between
            "
          >
            {/* LEFT */}
            <div>
              {/* TITLE */}
              <h2
                className="
                  text-xl
                  font-semibold
                  tracking-tight

                  text-white
                "
              >
                {cameraName}
              </h2>

              {/* LOCATION */}
              <p
                className="
                  mt-2

                  text-sm
                  text-zinc-400
                "
              >
                {location}
              </p>

              {/* STATS */}
              <div
                className="
                  mt-5

                  flex flex-wrap
                  items-center
                  gap-3
                "
              >
                {/* AI */}
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
                  <ScanLine className="h-4 w-4 text-cyan-400" />

                  <span
                    className="
                      text-xs
                      font-semibold

                      text-cyan-400
                    "
                  >
                    AI Detection Active
                  </span>
                </div>

                {/* ALERT */}
                <div
                  className="
                    inline-flex items-center
                    gap-2

                    rounded-full

                    border border-red-500/20
                    bg-red-500/10

                    px-3 py-1.5
                  "
                >
                  <ShieldAlert className="h-4 w-4 text-red-400" />

                  <span
                    className="
                      text-xs
                      font-semibold

                      text-red-400
                    "
                  >
                    Monitoring
                  </span>
                </div>
              </div>
            </div>

            {/* PLAY */}
            <button
              type="button"
              disabled
              title="Playback control is disabled until a live camera stream is connected."
              className="
                flex h-14 w-14
                min-h-[44px] min-w-[44px]
                items-center
                justify-center

                rounded-2xl

                border border-white/10

                bg-white/10

                backdrop-blur-xl

                transition-all

                hover:bg-white/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
