TRAFFIC_VEHICLE_CLASSES = (
    "bicycle",
    "bus",
    "car",
    "motorcycle",
    "train",
    "truck",
)

MODEL_EVALUATION_CLASSES = (
    *TRAFFIC_VEHICLE_CLASSES,
    "background",
)

LEGACY_VEHICLE_CLASS_ALIASES = {
    "motorbike": "motorcycle",
    "moto": "motorcycle",
}

NON_TRAFFIC_CLASSES = {
    "background",
    "unknown",
    "unclassified",
    "unknown detection",
    "",
}


def normalize_vehicle_class(vehicle_type: str | None) -> str | None:
    if vehicle_type is None:
        return None

    normalized = vehicle_type.strip().lower().replace("_", " ")
    normalized = LEGACY_VEHICLE_CLASS_ALIASES.get(normalized, normalized)

    if normalized in NON_TRAFFIC_CLASSES:
        return None

    if normalized in TRAFFIC_VEHICLE_CLASSES:
        return normalized

    return None
