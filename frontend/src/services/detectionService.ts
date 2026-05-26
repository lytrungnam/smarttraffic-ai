import axios from "axios"

const API_URL = "http://localhost:8000/api/v1"

const API_ORIGIN = "http://localhost:8000"

export type DetectionItem = {
  id?: string

  plate_number: string

  vehicle_type?: string

  confidence?: number

  location?: string

  created_at?: string

  status?: string

  image_path?: string

  cropped_plate_path?: string

  violation_type?: string

  speed?: number
}

export type DetectionRealtimePayload =
  | DetectionItem
  | DetectionItem[]
  | {
      vehicles?: unknown[]
      plates?: DetectionItem[]
    }

export type DetectionHistoryParams = {
  page?: number
  limit?: number
  search?: string
  vehicle_type?: string
}

export type DetectionHistoryResponse = {
  items: DetectionItem[]
  page: number
  limit: number
  total: number
  pages: number
}

export const getDetectionHistory = async ({
  page = 1,
  limit = 10,
  search,
  vehicle_type,
}: DetectionHistoryParams = {}) => {
  const response = await axios.get<DetectionHistoryResponse>(
    `${API_URL}/detections/history`,
    {
      params: {
        page,
        limit,
        search: search || undefined,
        vehicle_type: vehicle_type || undefined,
      },
    },
  )

  return response.data
}

export const getLatestDetections = async () => {
  const response = await getDetectionHistory({
    page: 1,
    limit: 10,
  })

  return response.items
}

export const getEvidenceImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return null
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }

  const browserPath = imagePath.replace(/\\/g, "/")

  const normalizedPath = browserPath.startsWith("/")
    ? browserPath
    : `/${browserPath}`

  return `${API_ORIGIN}${normalizedPath}`
}
