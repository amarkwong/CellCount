"""
CellCount API - Main Application Entry Point.

FastAPI application for AI-assisted blood cell counting.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .core.config import get_settings
from .core.model import get_model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events for resource management.
    """
    # Startup
    logger.info("Starting CellCount API...")
    settings = get_settings()
    logger.info(f"App: {settings.app_name} v{settings.app_version}")

    # Pre-load model on startup for faster first request
    logger.info("Pre-loading detection model...")
    try:
        model_manager = get_model_manager()
        _ = model_manager.model  # Trigger model loading
        logger.info("Model pre-loaded successfully")
    except Exception as e:
        logger.warning(f"Model pre-loading failed (will retry on first request): {e}")

    yield

    # Shutdown
    logger.info("Shutting down CellCount API...")
    model_manager = get_model_manager()
    model_manager.unload_model()
    logger.info("Cleanup complete")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured application instance.
    """
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-assisted blood cell counting API. "
            "Upload blood smear images to detect and count RBCs, WBCs, and Platelets."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(router, prefix="/api", tags=["Detection"])

    return app


# Create application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
