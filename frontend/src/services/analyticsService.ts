import axios from "axios"

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

export const getAnalyticsSummary = async () => {
  const response = await axios.get<AnalyticsSummary>(
    `${API_URL}/analytics/summary`,
  )

  return response.data
}
