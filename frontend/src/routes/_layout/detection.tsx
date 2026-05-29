import { createFileRoute } from "@tanstack/react-router"

import {
  Activity,
  Camera,
  Upload,
} from "lucide-react"

import { useCallback, useState } from "react"

import DashboardSection from "@/components/Dashboard/DashboardSection"

import DetectionCamera from "@/components/Detection/DetectionCamera"
import DetectionHero from "@/components/Detection/DetectionHero"
import DetectionPreview from "@/components/Detection/DetectionPreview"
import DetectionRealtime from "@/components/Detection/DetectionRealtime"
import DetectionResult from "@/components/Detection/DetectionResult"
import DetectionUpload from "@/components/Detection/DetectionUpload"
import { useWebSocket } from "@/hooks/useWebSocket"
import type { TrackInfo, TrackEvent } from "@/components/Detection/DetectionCamera"

export const Route = createFileRoute(
  "/_layout/detection",
)({
  component: DetectionPage,
})

function DetectionPage() {
  const [tracks, setTracks] = useState<TrackInfo[]>([])
  const [events, setEvents] = useState<TrackEvent[]>([])

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as Record<string, unknown>
    if (Array.isArray(msg.tracks)) setTracks(msg.tracks as TrackInfo[])
    if (Array.isArray(msg.events)) setEvents(msg.events as TrackEvent[])
  }, [])

  const wsUrl = `${(import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/^http/, "ws")}/api/v1/ws/detections`
  useWebSocket(wsUrl, handleWsMessage)

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#020617]
        via-[#09090B]
        to-[#0F172A]
        text-white
      "
    >
      {/* HERO */}
      <DetectionHero />

      {/* MAIN */}
      <main
        className="
          space-y-6
          px-4 py-6
          sm:px-5
          lg:px-8
          2xl:px-10
        "
      >
        {/* ========================= */}
        {/* TOP SECTION */}
        {/* ========================= */}
        <section
          className="
            grid grid-cols-1
            gap-6
            xl:grid-cols-3
            items-stretch
          "
        >
          {/* UPLOAD */}
          <div className="h-full">
            <DashboardSection
              className="h-full"
              title="Upload Detection Source"
              description="
                Upload image or video
                for AI processing
              "
              icon={Upload}
            >
              <div className="h-full">
                <DetectionUpload />
              </div>
            </DashboardSection>
          </div>

          {/* CAMERA */}
          <div className="xl:col-span-2 h-full">
            <DashboardSection
              className="h-full"
              title="Live AI Camera Detection"
              description="
                Real-time vehicle and
                license plate monitoring
              "
              icon={Camera}
            >
              <div className="h-full">
                <DetectionCamera tracks={tracks} events={events} />
              </div>
            </DashboardSection>
          </div>
        </section>

        {/* ========================= */}
        {/* PREVIEW + RESULT */}
        {/* ========================= */}
<section
  className="
    flex flex-col
    gap-6
  "
>
          {/* PREVIEW */}
          <div className="h-full">
            <DashboardSection
              className="h-full"
              title="Detection Preview"
              description="
                AI frame analysis and
                object tracking preview
              "
              icon={Activity}
            >
              <div className="h-full">
                <DetectionPreview />
              </div>
            </DashboardSection>
          </div>

          {/* RESULT */}
          <div className="h-full">
            <DashboardSection
              className="h-full"
              title="Detection Results"
              description="
                Vehicle recognition and
                violation analysis output
              "
              icon={Activity}
            >
              <div className="h-full">
                <DetectionResult />
              </div>
            </DashboardSection>
          </div>
        </section>

        {/* ========================= */}
        {/* REALTIME */}
        {/* ========================= */}
        <section>
          <DashboardSection
            title="Real-Time Monitoring Feed"
            description="
              Continuous AI detection stream
              and live vehicle tracking
            "
            icon={Activity}
          >
            <DetectionRealtime />
          </DashboardSection>
        </section>
      </main>
    </div>
  )
}