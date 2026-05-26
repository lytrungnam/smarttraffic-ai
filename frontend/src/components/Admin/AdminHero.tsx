export default function AdminHero() {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl

        border border-white/10

        bg-gradient-to-br
        from-cyan-500/10
        via-transparent
        to-violet-500/10

        p-8
      "
    >
      <div
        className="
          flex flex-col gap-6

          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >
        {/* LEFT */}
        <div className="max-w-3xl">
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight

              text-white
            "
          >
            Smart Traffic Command Center
          </h1>

          <p
            className="
              mt-4

              text-sm
              text-zinc-400
            "
          >
            Centralized monitoring platform
            for realtime traffic surveillance,
            vehicle detection, violation
            management, and AI-powered
            roadway analytics.
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            inline-flex
            flex-col

            rounded-3xl

            border border-cyan-500/20
            bg-cyan-500/10

            px-5 py-4
          "
        >
          <span
            className="
              text-xs
              font-semibold
              text-zinc-400
            "
          >
            Realtime Detection Pipeline
          </span>

          <h3
            className="
              mt-2

              text-lg
              font-semibold
              tracking-tight

              text-cyan-400
            "
          >
            YOLOv5 + OCR ONLINE
          </h3>
        </div>
      </div>
    </div>
  )
}