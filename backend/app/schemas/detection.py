"""
Pydantic schemas for cell detection API.

Defines request and response models for the detection endpoints.
"""

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Bounding box coordinates for a detected cell."""

    x_min: float = Field(..., description="Left edge x-coordinate")
    y_min: float = Field(..., description="Top edge y-coordinate")
    x_max: float = Field(..., description="Right edge x-coordinate")
    y_max: float = Field(..., description="Bottom edge y-coordinate")


class CellDetection(BaseModel):
    """Single cell detection result."""

    cell_type: str = Field(..., description="Type of cell detected (RBC, WBC, Platelets)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    bounding_box: BoundingBox = Field(..., description="Bounding box coordinates")


class CellCounts(BaseModel):
    """Aggregated cell counts by type."""

    rbc: int = Field(default=0, description="Red blood cell count")
    wbc: int = Field(default=0, description="White blood cell count")
    platelets: int = Field(default=0, description="Platelet count")


class DetectionResponse(BaseModel):
    """Response model for cell detection endpoint."""

    success: bool = Field(..., description="Whether detection was successful")
    message: str = Field(..., description="Status message")
    counts: CellCounts = Field(..., description="Aggregated cell counts")
    detections: list[CellDetection] = Field(
        default_factory=list, description="List of individual detections"
    )
    image_width: int = Field(..., description="Width of processed image")
    image_height: int = Field(..., description="Height of processed image")


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""

    status: str = Field(..., description="Service health status")
    version: str = Field(..., description="API version")
    model_loaded: bool = Field(..., description="Whether the ML model is loaded")
