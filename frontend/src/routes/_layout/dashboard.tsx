import { createFileRoute } from "@tanstack/react-router"

import {
  Activity,
  BarChart3,
  Camera,
  Database,
  Table2,
  Wifi,
} from "lucide-react"

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
import { normalizeVehicleClass } from "@/constants/vehicleClasses"
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
            const vehicleType = normalizeVehicleClass(detection.vehicle_type)
            if (!vehicleType) continue
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
              current.total_vehicle_count +
              normalized.plates.filter((detection) =>
                normalizeVehicleClass(detection.vehicle_type),
              ).length,
          }
        })
      }
    },
    [normalizeRealtimeData],
  )

  const wsUrl = `${(import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/^http/, "ws")}/api/v1/ws/detections`
  useWebSocket(wsUrl, handleWsMessage)

  const statusColorStyles: Record<
    string,
    {
      icon: string
      background: string
    }
  > = {
    emerald: {
      icon: "text-emerald-400",
      background: "bg-emerald-500/10",
    },
    cyan: {
      icon: "text-cyan-400",
      background: "bg-cyan-500/10",
    },
    blue: {
      icon: "text-sky-400",
      background: "bg-sky-500/10",
    },
    violet: {
      icon: "text-violet-400",
      background: "bg-violet-500/10",
    },
  }

  const systemStatuses = [
    {
      title: "Realtime AI Feed",
      value: realtimeData.plates.length > 0 ? "Active" : "Standby",
      detail: realtimeData.plates.length
        ? `${realtimeData.plates.length} plates seen just now`
        : "Awaiting detections",
      icon: Activity,
      color: "emerald",
    },
    {
      title: "Camera Health",
      value:
        !isSummaryLoading && (summary?.online_camera_count ?? 0) > 0
          ? "Online"
          : "Idle",
      detail: `${summary?.online_camera_count ?? 0} cameras connected`,
      icon: Camera,
      color: "cyan",
    },
    {
      title: "API Status",
      value: "Healthy",
      detail: "Dashboard data is synchronized",
      icon: Wifi,
      color: "blue",
    },
    {
      title: "Storage",
      value: !isSummaryLoading ? "Connected" : "Checking",
      detail: "PostgreSQL operational",
      icon: Database,
      color: "violet",
    },
  ]

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
      <DashboardHero summary={summary} isLoading={isSummaryLoading} />

      <main className="grid gap-6 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr] xl:gap-8">
          <DashboardCards summary={summary} isLoading={isSummaryLoading} />

          <section
            className="
              rounded-3xl
              border border-white/10
              bg-black/50
              p-6
              shadow-2xl
              backdrop-blur-xl
            "
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  System Status
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Operations Overview
                </h2>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">
                Live
              </div>
            </div>

            <div className="grid gap-4">
              {systemStatuses.map((status) => {
                const Icon = status.icon
                const colorStyles = statusColorStyles[status.color] ?? {
                  icon: "text-zinc-400",
                  background: "bg-white/5",
                }

                return (
                  <div
                    key={status.title}
                    className="
                      rounded-3xl
                      border border-white/10
                      bg-slate-950/80
                      p-4
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            `inline-flex h-11 w-11 items-center justify-center rounded-2xl ${colorStyles.background} ${colorStyles.icon}`
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-medium tracking-wide text-zinc-400">
                            {status.title}
                          </p>
                          <p className="mt-1 text-base font-semibold text-white">
                            {status.value}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-zinc-500">{status.detail}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:gap-8">
          <DashboardSection
            title="Realtime Vehicle Detection"
            description="Live AI traffic monitoring"
            icon={Activity}
          >
            <div className="min-h-0 overflow-hidden">
              <DashboardRealtime realtimeData={realtimeData} />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Recent Detection Records"
            description="Latest vehicle detections"
            icon={Table2}
          >
            <div className="min-h-0 overflow-x-auto">
              <DashboardTable
                records={summary?.latest_detections ?? []}
                isLoading={isSummaryLoading}
              />
            </div>
          </DashboardSection>
        </div>

        <DashboardSection
          title="Traffic Analytics"
          description="Vehicle flow and congestion analytics"
          icon={BarChart3}
        >
          <DashboardCharts summary={summary} />
        </DashboardSection>
      </main>
    </div>
  )
}
