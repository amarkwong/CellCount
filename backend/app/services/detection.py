"""
Cell detection service.

Handles image processing and cell detection using YOLOv8.
"""

import logging
from io import BytesIO
from typing import BinaryIO

from PIL import Image

from ..core.config import get_settings
from ..core.model import get_model_manager
from ..schemas.detection import (
    BoundingBox,
    CellCounts,
    CellDetection,
    DetectionResponse,
)

logger = logging.getLogger(__name__)

# Map model class names to standardized cell types
CELL_TYPE_MAPPING = {
    "RBC": "RBC",
    "WBC": "WBC",
    "Platelets": "Platelets",
    # Handle potential variations in class names
    "rbc": "RBC",
    "wbc": "WBC",
    "platelets": "Platelets",
    "platelet": "Platelets",
    "Red Blood Cell": "RBC",
    "White Blood Cell": "WBC",
}


async def detect_cells(image_data: BinaryIO) -> DetectionResponse:
    """
    Detect cells in the provided image.

    Args:
        image_data: Binary image data (file-like object).

    Returns:
        DetectionResponse: Detection results including counts and bounding boxes.

    Raises:
        ValueError: If image cannot be processed.
    """
    settings = get_settings()
    model_manager = get_model_manager()

    try:
        # Load and validate image
        image = Image.open(image_data)
        image_width, image_height = image.size
        logger.info(f"Processing image: {image_width}x{image_height}")
    except Exception as e:
        logger.error(f"Failed to load image: {e}")
        raise ValueError(f"Invalid image format: {e}") from e

    try:
        # Log model class names for debugging
        logger.info(f"Model class names: {model_manager.model.names}")

        # Run detection with lower threshold for testing
        conf_threshold = settings.model_confidence_threshold
        logger.info(f"Running detection with confidence threshold: {conf_threshold}")

        results = model_manager.model.predict(
            source=image,
            conf=conf_threshold,
            iou=settings.model_iou_threshold,
            verbose=False,
        )

        # Process results
        detections: list[CellDetection] = []
        counts = {"RBC": 0, "WBC": 0, "Platelets": 0}

        if results and len(results) > 0:
            result = results[0]
            logger.info(f"Raw detection count: {len(result.boxes) if result.boxes is not None else 0}")

            if result.boxes is not None:
                for box in result.boxes:
                    # Extract box data
                    xyxy = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])

                    # Get class name from model
                    class_name = result.names.get(cls_id, "Unknown")
                    cell_type = CELL_TYPE_MAPPING.get(class_name, class_name)

                    # Create detection record
                    detection = CellDetection(
                        cell_type=cell_type,
                        confidence=conf,
                        bounding_box=BoundingBox(
                            x_min=xyxy[0],
                            y_min=xyxy[1],
                            x_max=xyxy[2],
                            y_max=xyxy[3],
                        ),
                    )
                    detections.append(detection)

                    # Update counts
                    if cell_type in counts:
                        counts[cell_type] += 1

        logger.info(
            f"Detection complete: {counts['RBC']} RBCs, "
            f"{counts['WBC']} WBCs, {counts['Platelets']} Platelets"
        )

        return DetectionResponse(
            success=True,
            message="Detection completed successfully",
            counts=CellCounts(
                rbc=counts["RBC"],
                wbc=counts["WBC"],
                platelets=counts["Platelets"],
            ),
            detections=detections,
            image_width=image_width,
            image_height=image_height,
        )

    except Exception as e:
        logger.error(f"Detection failed: {e}")
        raise RuntimeError(f"Detection failed: {e}") from e
