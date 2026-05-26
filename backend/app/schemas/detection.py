from sqlmodel import SQLModel


class DetectionResponse(SQLModel):
    plate_number: str
    vehicle_type: str
    confidence: float