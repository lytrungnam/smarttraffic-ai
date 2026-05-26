import { createFileRoute } from "@tanstack/react-router"

import { Activity, BarChart3, Table2 } from "lucide-react"

import { useCallback, useEffect, useState } from "react"

import DashboardCards from "@/components/Dashboard/DashboardCards"
import DashboardCharts from "@/components/Dashboard/DashboardCharts"
import DashboardHero from "@/components/Dashboard/DashboardHero"
import DashboardRealtime from "@/components/Dashboard/DashboardRealtime"
import DashboardSection from "@/components/Dashboard/DashboardSection"
import DashboardTable from "@/components/Dashboard/DashboardTable"
import {
  type AnalyticsSummary,
  getAnalyticsSummary,
} from "@/services/analyticsService"
import type {
  DetectionItem,
  DetectionRealtimePayload,
} from "@/services/detectionService"
import { useWebSocket } from "@/hooks/useWebSocket"

export const Route = createFileRoute("/_layout/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  type RealtimeData = {
    vehicles: unknown[]
    plates: DetectionItem[]
  }

  const isDetectionItem = useCallback(
    (value: unknown): value is DetectionItem => {
      return (
        typeof value === "object" &&
        value !== null &&
        "plate_number" in value &&
        typeof (value as DetectionItem).plate_number === "string"
      )
    },
    [],
  )

  const normalizeRealtimeData = useCallback(
    (data: DetectionRealtimePayload): RealtimeData => {
      if (Array.isArray(data)) {
        return {
          vehicles: [],
          plates: data.filter(isDetectionItem),
        }
      }

      if (isDetectionItem(data)) {
        return {
          vehicles: [],
          plates: [data],
        }
      }

      return {
        vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
        plates: Array.isArray(data.plates)
          ? data.plates.filter(isDetectionItem)
          : [],
      }
    },
    [isDetectionItem],
  )

  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    vehicles: [],
    plates: [],
  })

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)

  const [isSummaryLoading, setIsSummaryLoading] = useState(true)

  useEffect(() => {
    getAnalyticsSummary()
      .then(setSummary)
      .catch((error) => {
        console.error("Failed to load dashboard analytics:", error)
      })
      .finally(() => {
        setIsSummaryLoading(false)
      })
  }, [])

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const normalized = normalizeRealtimeData(data as DetectionRealtimePayload)

      setRealtimeData(normalized)

      if (normalized.plates.length > 0) {
        setSummary((current) => {
          if (!current) return current

          const nextVehicleCounts = { ...current.vehicle_type_counts }

          for (const detection of normalized.plates) {
            const vehicleType = detection.vehicle_type || "unknown"
            nextVehicleCounts[vehicleType] =
              (nextVehicleCounts[vehicleType] ?? 0) + 1
          }

          return {
            ...current,
            total_detections:
              current.total_detections + normalized.plates.length,
            detections_today:
              current.detections_today + normalized.plates.length,
            latest_detections: [
              ...normalized.plates,
              ...current.latest_detections,
            ].slice(0, 5),
            vehicle_type_counts: nextVehicleCounts,
            total_vehicle_count:
              current.total_vehicle_count + normalized.plates.length,
          }
        })
      }
    },
    [normalizeRealtimeData],
  )

  useWebSocket("ws://127.0.0.1:8000/api/v1/ws/detections", handleWsMessage)

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
      <DashboardHero summary={summary} isLoading={isSummaryLoading} />

      {/* MAIN */}
      <main
        className="
          space-y-8
          px-6 py-8
          lg:px-10
        "
      >
        {/* CARDS */}
        <DashboardCards summary={summary} isLoading={isSummaryLoading} />

        {/* REALTIME */}
        <DashboardSection
          title="Realtime Vehicle Detection"
          description="Live AI traffic monitoring"
          icon={Activity}
        >
          {/* REALTIME COMPONENT */}
          <DashboardRealtime realtimeData={realtimeData} />
        </DashboardSection>

        {/* CHARTS */}
        <DashboardSection
          title="Traffic Analytics"
          description="Vehicle flow and congestion analytics"
          icon={BarChart3}
        >
          <DashboardCharts summary={summary} />
        </DashboardSection>

        {/* TABLE */}
        <DashboardSection
          title="Recent Detection Records"
          description="Latest vehicle detections"
          icon={Table2}
        >
          <DashboardTable
            records={summary?.latest_detections ?? []}
            isLoading={isSummaryLoading}
          />
        </DashboardSection>
      </main>
    </div>
  )
}
