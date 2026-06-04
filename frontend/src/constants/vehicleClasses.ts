import {
  Activity,
  Bike,
  Bus,
  Car,
  CircleDashed,
  Train,
  Truck,
  type LucideIcon,
} from "lucide-react"

export type TrafficVehicleClass =
  | "bicycle"
  | "bus"
  | "car"
  | "motorcycle"
  | "train"
  | "truck"

export const TRAFFIC_VEHICLE_CLASSES: TrafficVehicleClass[] = [
  "bicycle",
  "bus",
  "car",
  "motorcycle",
  "train",
  "truck",
]

export const VEHICLE_CLASS_LABELS: Record<TrafficVehicleClass, string> = {
  bicycle: "Bicycle",
  bus: "Bus",
  car: "Car",
  motorcycle: "Motorcycle",
  train: "Train",
  truck: "Truck",
}

export const VEHICLE_CLASS_COLORS: Record<TrafficVehicleClass, string> = {
  bicycle: "#22c55e",
  bus: "#f59e0b",
  car: "#06b6d4",
  motorcycle: "#3b82f6",
  train: "#a855f7",
  truck: "#8b5cf6",
}

export const VEHICLE_CLASS_ICONS: Record<TrafficVehicleClass, LucideIcon> = {
  bicycle: Bike,
  bus: Bus,
  car: Car,
  motorcycle: Bike,
  train: Train,
  truck: Truck,
}

export const MODEL_EVALUATION_VALUES: Record<TrafficVehicleClass, number> = {
  bicycle: 0.93,
  bus: 0.93,
  car: 0.97,
  motorcycle: 0.92,
  train: 0.91,
  truck: 0.9,
}

export function normalizeVehicleClass(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase().replace("_", " ")
  if (!normalized) return null
  if (normalized === "motorbike") return "motorcycle"
  if (TRAFFIC_VEHICLE_CLASSES.includes(normalized as TrafficVehicleClass)) {
    return normalized as TrafficVehicleClass
  }
  return null
}

export function getVehicleClassLabel(value: string | undefined | null) {
  const normalized = normalizeVehicleClass(value)
  if (normalized) return VEHICLE_CLASS_LABELS[normalized]
  return value ? "Unclassified Vehicle" : "Unknown Detection"
}

export const FALLBACK_VEHICLE_ICON = Activity
export const UNCLASSIFIED_ICON = CircleDashed
