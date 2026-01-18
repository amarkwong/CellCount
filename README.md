# CellCount

An AI-assisted web application for counting red blood cells (RBCs), white blood cells (WBCs), and platelets in blood smear images.

## Overview

CellCount uses YOLOv8 machine learning models to automatically detect and count blood cells in medical images. The application is designed to assist pathologists in their workflow by providing fast, accurate cell counts with the ability to review and correct detections.

## Features

- Automatic cell detection using YOLOv8
- Support for RBC, WBC, and platelet detection
- REST API for integration with other systems
- Pre-trained model from Hugging Face (keremberke/yolov8s-blood-cell-detection)

## Project Structure

```
CellCount/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API route definitions
│   │   ├── core/           # Configuration and model loading
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Business logic
│   └── requirements.txt
├── AGENTS.md               # Agent workflow documentation
├── CLAUDE.md               # Claude Code guidance
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- pip or conda for package management

### Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Access the API documentation at http://localhost:8000/docs

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check and model status |
| `/api/detect` | POST | Upload image for cell detection |

### Example Usage

```bash
# Health check
curl http://localhost:8000/api/health

# Detect cells in an image
curl -X POST "http://localhost:8000/api/detect" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@blood_smear.jpg"
```

## Technology Stack

- **Backend:** FastAPI, Python
- **ML Model:** YOLOv8 (Ultralytics)
- **Pre-trained Model:** keremberke/yolov8s-blood-cell-detection
- **Frontend:** TBD (React recommended)

## Development

See `AGENTS.md` for the multi-agent workflow used in this project.

## License

TBD
