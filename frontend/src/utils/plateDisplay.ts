export const UNKNOWN_PLATE = "UNKNOWN_PLATE"

export const isUnknownPlate = (plateNumber?: string | null) =>
  plateNumber === UNKNOWN_PLATE

export const formatPlateNumber = (plateNumber?: string | null) => {
  if (isUnknownPlate(plateNumber)) {
    return "Unreadable Plate"
  }

  return plateNumber || "Unknown"
}

export const formatPlateStatus = (plateNumber?: string | null) => {
  if (isUnknownPlate(plateNumber)) {
    return "A license plate region was detected, but OCR could not reliably read the characters."
  }

  return "OCR Recognized"
}

export const getDetectionStatusLabel = (status?: string | null) => {
  const normalized = status?.toLowerCase()

  if (normalized === "processing") return "Processing"
  if (normalized === "stored") return "Stored"
  if (normalized === "monitoring") return "Monitoring"

  return "Detected"
}

export const getOcrStatusLabel = (plateNumber?: string | null) => {
  if (isUnknownPlate(plateNumber)) {
    return "Low OCR Confidence"
  }

  return "OCR Completed"
}

export const isLowOcrConfidence = (
  confidence?: number | null,
  plateNumber?: string | null,
) => isUnknownPlate(plateNumber) || (confidence ?? 0) < 50

export const LOW_OCR_CONFIDENCE_MESSAGE =
  "OCR confidence is low. Try a clearer, brighter image with a less tilted plate."
