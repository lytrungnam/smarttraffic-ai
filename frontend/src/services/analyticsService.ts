import axios from "axios"

import { TRAFFIC_VEHICLE_CLASSES } from "@/constants/vehicleClasses"
import type { DetectionItem } from "./detectionService"

const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`

export type AnalyticsSummary = {
  total_detections: number
  detections_today: number
  unique_plates: number
  vehicle_type_counts: Record<string, number>
  total_vehicle_count: number
  latest_detections: DetectionItem[]
  online_camera_count: number
}

const toCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0

export const getTotalVehicleCount = (
  summary: AnalyticsSummary | null | undefined,
) => {
  if (
    typeof summary?.total_vehicle_count === "number" &&
    Number.isFinite(summary.total_vehicle_count)
  ) {
    return summary.total_vehicle_count
  }

  return Object.values(summary?.vehicle_type_counts ?? {}).reduce(
    (total, count) => total + toCount(count),
    0,
  )
}

export const getAnalyticsSummary = async () => {
  const response = await axios.get<AnalyticsSummary>(
    `${API_URL}/analytics/summary`,
  )

  const vehicleTypeCounts = Object.fromEntries(
    TRAFFIC_VEHICLE_CLASSES.map((vehicleClass) => [
      vehicleClass,
      toCount(response.data.vehicle_type_counts?.[vehicleClass]),
    ]),
  )

  return {
    ...response.data,
    total_detections: toCount(response.data.total_detections),
    detections_today: toCount(response.data.detections_today),
    unique_plates: toCount(response.data.unique_plates),
    vehicle_type_counts: vehicleTypeCounts,
    total_vehicle_count:
      typeof response.data.total_vehicle_count === "number" &&
      Number.isFinite(response.data.total_vehicle_count)
        ? response.data.total_vehicle_count
        : Object.values(vehicleTypeCounts).reduce(
            (total, count) => total + count,
            0,
          ),
    online_camera_count: toCount(response.data.online_camera_count),
  }
}
