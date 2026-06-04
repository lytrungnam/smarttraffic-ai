import { createFileRoute } from "@tanstack/react-router"

import { Camera } from "lucide-react"

import DashboardSection from "@/components/Dashboard/DashboardSection"

import CameraGrid from "@/components/Camera/CameraGrid"

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
      {/* MAIN */}
      <main
        className="
          space-y-8
          px-6 py-8
          lg:px-10
        "
      >
        {/* GRID */}
        <DashboardSection
          title="Camera Management"
          description="Registered traffic camera sources"
          icon={Camera}
        >
          <CameraGrid />
        </DashboardSection>
      </main>
    </div>
  )
}
