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
# New model (Ruben-F/bloodcelldiff) detects: RBC, Platelets, and 5 WBC subtypes
# Model class names from logs: {0: 'RBC', 1: 'PLT', 2: 'NEUT', 3: 'LYMPH', 4: 'MONO', 5: 'EOS', 6: 'BASO'}
CELL_TYPE_MAPPING = {
    # RBC variations
    "RBC": "RBC",
    "rbc": "RBC",
    "Red Blood Cell": "RBC",
    # Platelet variations (including abbreviated form from model)
    "PLT": "Platelets",
    "Platelets": "Platelets",
    "platelets": "Platelets",
    "platelet": "Platelets",
    # WBC subtypes (including abbreviated forms from model)
    "NEUT": "Neutrophil",
    "Neutrophil": "Neutrophil",
    "neutrophil": "Neutrophil",
    "LYMPH": "Lymphocyte",
    "Lymphocyte": "Lymphocyte",
    "lymphocyte": "Lymphocyte",
    "MONO": "Monocyte",
    "Monocyte": "Monocyte",
    "monocyte": "Monocyte",
    "EOS": "Eosinophil",
    "Eosinophil": "Eosinophil",
    "eosinophil": "Eosinophil",
    "BASO": "Basophil",
    "Basophil": "Basophil",
    "basophil": "Basophil",
    # Legacy WBC mapping (for backwards compatibility if needed)
    "WBC": "WBC",
    "wbc": "WBC",
    "White Blood Cell": "WBC",
}

# List of WBC subtypes for aggregation
WBC_SUBTYPES = ["Neutrophil", "Lymphocyte", "Monocyte", "Eosinophil", "Basophil"]


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
        counts = {
            "RBC": 0,
            "Platelets": 0,
            "Neutrophil": 0,
            "Lymphocyte": 0,
            "Monocyte": 0,
            "Eosinophil": 0,
            "Basophil": 0,
        }

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

        # Calculate total WBC count from subtypes
        total_wbc = sum(counts[subtype] for subtype in WBC_SUBTYPES)

        logger.info(
            f"Detection complete: {counts['RBC']} RBCs, "
            f"{total_wbc} WBCs (Neutrophil: {counts['Neutrophil']}, "
            f"Lymphocyte: {counts['Lymphocyte']}, Monocyte: {counts['Monocyte']}, "
            f"Eosinophil: {counts['Eosinophil']}, Basophil: {counts['Basophil']}), "
            f"{counts['Platelets']} Platelets"
        )

        return DetectionResponse(
            success=True,
            message="Detection completed successfully",
            counts=CellCounts(
                rbc=counts["RBC"],
                platelets=counts["Platelets"],
                neutrophil=counts["Neutrophil"],
                lymphocyte=counts["Lymphocyte"],
                monocyte=counts["Monocyte"],
                eosinophil=counts["Eosinophil"],
                basophil=counts["Basophil"],
            ),
            detections=detections,
            image_width=image_width,
            image_height=image_height,
        )

    except Exception as e:
        logger.error(f"Detection failed: {e}")
        raise RuntimeError(f"Detection failed: {e}") from e
