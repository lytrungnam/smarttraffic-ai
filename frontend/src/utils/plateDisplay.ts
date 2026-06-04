export const UNKNOWN_PLATE = "UNKNOWN_PLATE"

export const isUnknownPlate = (plateNumber?: string | null) =>
  plateNumber === UNKNOWN_PLATE

export const formatPlateNumber = (plateNumber?: string | null) => {
  if (isUnknownPlate(plateNumber)) {
    return "Không đọc được biển số"
  }

  return plateNumber || "Unknown"
}

export const formatPlateStatus = (plateNumber?: string | null) => {
  if (isUnknownPlate(plateNumber)) {
    return "Phát hiện biển số nhưng OCR chưa đọc được ký tự."
  }

  return "OCR Recognized"
}
