"""
API route definitions.

Defines all HTTP endpoints for the CellCount API.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from ..core.config import get_settings
from ..core.model import get_model_manager
from ..schemas.detection import DetectionResponse, HealthResponse
from ..services.detection import detect_cells

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check the health status of the API and model loading state.",
)
async def health_check() -> HealthResponse:
    """
    Perform a health check on the API.

    Returns:
        HealthResponse: Current health status of the service.
    """
    settings = get_settings()
    model_manager = get_model_manager()

    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        model_loaded=model_manager.is_loaded,
    )


@router.post(
    "/detect",
    response_model=DetectionResponse,
    summary="Detect Cells",
    description="Upload an image and detect blood cells (RBCs, WBCs, Platelets).",
    responses={
        400: {"description": "Invalid image format"},
        500: {"description": "Detection processing error"},
    },
)
async def detect_cells_endpoint(
    file: Annotated[UploadFile, File(description="Blood smear image to analyze")],
) -> DetectionResponse:
    """
    Detect blood cells in an uploaded image.

    Args:
        file: Uploaded image file (JPEG, PNG supported).

    Returns:
        DetectionResponse: Detection results with cell counts and bounding boxes.

    Raises:
        HTTPException: If image is invalid or detection fails.
    """
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Supported: JPEG, PNG",
        )

    logger.info(f"Received image for detection: {file.filename}")

    try:
        # Read file content
        contents = await file.read()

        # Process detection
        from io import BytesIO

        result = await detect_cells(BytesIO(contents))

        return result

    except ValueError as e:
        logger.error(f"Invalid image: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during detection",
        )
