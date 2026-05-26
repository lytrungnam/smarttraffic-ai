import { createFileRoute } from "@tanstack/react-router"

import {
  Camera,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react"

import DashboardSection from "@/components/Dashboard/DashboardSection"

import CameraCard from "@/components/Camera/CameraCard"
import CameraGrid from "@/components/Camera/CameraGrid"
import CameraHero from "@/components/Camera/CameraHero"
import CameraPlayer from "@/components/Camera/CameraPlayer"
import CameraStatus from "@/components/Camera/CameraStatus"

export const Route = createFileRoute(
  "/_layout/camera",
)({
  component: CameraPage,
})

function CameraPage() {
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
      <CameraHero />

      {/* MAIN */}
      <main
        className="
          space-y-8
          px-6 py-8
          lg:px-10
        "
      >
        {/* STATUS */}
        <DashboardSection
          title="Camera Network Status"
          description="
            Real-time operational status
            of AI traffic surveillance devices
          "
          icon={ShieldCheck}
        >
          <CameraStatus />
        </DashboardSection>

        {/* LIVE */}
        <section
          className="
            grid grid-cols-1 gap-6
            xl:grid-cols-3
          "
        >
          {/* PLAYER */}
          <div className="xl:col-span-2">
            <DashboardSection
              title="Live Camera Stream"
              description="
                AI-powered vehicle monitoring
                and traffic analysis
              "
              icon={MonitorPlay}
            >
              <CameraPlayer
                streamUrl={`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/detections/stream`}
                cameraName="AI Traffic Camera #01"
                location="Da Nang - Hai Chau District"
              />
            </DashboardSection>
          </div>

          {/* CAMERA CARD */}
          <div>
            <CameraCard />
          </div>
        </section>

        {/* GRID */}
        <DashboardSection
          title="Surveillance Camera Grid"
          description="
            Multi-camera monitoring
            for smart traffic management
          "
          icon={Camera}
        >
          <CameraGrid />
        </DashboardSection>
      </main>
    </div>
  )
}