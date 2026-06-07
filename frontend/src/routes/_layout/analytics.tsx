import { createFileRoute } from "@tanstack/react-router"

import { Activity, BarChart3 } from "lucide-react"

import DashboardSection from "@/components/Dashboard/DashboardSection"

import AnalyticsCards from "@/components/Analytics/AnalyticsCards"
import AnalyticsHero from "@/components/Analytics/AnalyticsHero"
import AnalyticsOverview from "@/components/Analytics/AnalyticsOverview"
import DetectionAccuracy from "@/components/Analytics/DetectionAccuracy"
import TrafficChart from "@/components/Analytics/TrafficChart"
import VehicleChart from "@/components/Analytics/VehicleChart"

export const Route = createFileRoute("/_layout/analytics")({
  component: AnalyticsPage,
})

function AnalyticsPage() {
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
      <AnalyticsHero />

      {/* CONTENT */}
      <main
        className="
          space-y-8
          px-4 py-6
          sm:px-5
          lg:px-8
          2xl:px-10
        "
      >
        {/* CARDS */}
        <AnalyticsCards />

        {/* OVERVIEW */}
        <AnalyticsOverview />

        {/* CHARTS */}
        <section
          className="
            grid w-full max-w-full min-w-0 grid-cols-1 gap-6 overflow-hidden
            xl:grid-cols-2
          "
        >
          {/* VEHICLE */}
          <DashboardSection
            title="Vehicle Detection Analysis"
            description="
              AI-based vehicle classification
              statistics
            "
            icon={BarChart3}
          >
            <VehicleChart />
          </DashboardSection>

          {/* TRAFFIC */}
          <DashboardSection
            title="Traffic Density Monitoring"
            description="
              Hourly traffic flow and
              congestion analytics
            "
            icon={Activity}
          >
            <TrafficChart />
          </DashboardSection>
        </section>

        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-sm leading-6 text-cyan-100">
          Traffic distribution is calculated from stored detection records.
          Model evaluation metrics are offline validation results from the
          trained YOLO vehicle model.
        </div>

        {/* ACCURACY */}
        <DashboardSection
          title="AI Model Evaluation"
          description="
            Offline validation values from
            the trained vehicle model
          "
          icon={Activity}
        >
          <DetectionAccuracy />
        </DashboardSection>
      </main>
    </div>
  )
}
