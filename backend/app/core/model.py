"""
YOLOv8 model loading and management.

Handles loading the pre-trained blood cell detection model from Hugging Face.
"""

import logging
from pathlib import Path
from typing import Optional

from huggingface_hub import hf_hub_download
from ultralytics import YOLO

from .config import get_settings

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manages the YOLOv8 model lifecycle.

    Handles lazy loading and caching of the detection model.
    """

    _instance: Optional["ModelManager"] = None
    _model: Optional[YOLO] = None

    def __new__(cls) -> "ModelManager":
        """Singleton pattern to ensure single model instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def model(self) -> YOLO:
        """
        Get the loaded YOLO model, loading it if necessary.

        Returns:
            YOLO: The loaded YOLOv8 model instance.

        Raises:
            RuntimeError: If model loading fails.
        """
        if self._model is None:
            self._load_model()
        return self._model

    @property
    def is_loaded(self) -> bool:
        """Check if the model is currently loaded."""
        return self._model is not None

    def _load_model(self) -> None:
        """
        Load the YOLOv8 model from Hugging Face.

        The model is automatically downloaded and cached on first use.
        """
        settings = get_settings()
        model_name = settings.model_name

        logger.info(f"Loading model: {model_name}")

        try:
            # Download model from Hugging Face Hub
            model_path = hf_hub_download(
                repo_id=model_name,
                filename="best.pt"
            )
            logger.info(f"Model downloaded to: {model_path}")

            # Load the downloaded model
            self._model = YOLO(model_path)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Failed to load model '{model_name}': {e}") from e

    def unload_model(self) -> None:
        """Unload the model to free memory."""
        if self._model is not None:
            del self._model
            self._model = None
            logger.info("Model unloaded")


def get_model_manager() -> ModelManager:
    """
    Get the singleton ModelManager instance.

    Returns:
        ModelManager: The model manager instance.
    """
    return ModelManager()
