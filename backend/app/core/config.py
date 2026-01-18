"""
Application configuration settings.

Uses Pydantic settings management for type-safe configuration.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "CellCount API"
    app_version: str = "0.1.0"
    debug: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Model settings
    model_name: str = "keremberke/yolov8s-blood-cell-detection"
    model_confidence_threshold: float = 0.1  # Lowered for testing
    model_iou_threshold: float = 0.45

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached application settings.

    Returns:
        Settings: Application configuration instance.
    """
    return Settings()
