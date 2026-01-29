#!/bin/bash
# =============================================================================
# CellCount EC2 Instance User Data Script
# =============================================================================
# This script runs on first boot to set up the CellCount API server
# =============================================================================

set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting CellCount setup at $(date)"

# -----------------------------------------------------------------------------
# Configuration (injected by Terraform templatefile)
# -----------------------------------------------------------------------------
# These variables are populated by Terraform's templatefile function
# Using lowercase to match Terraform variable interpolation
GITHUB_REPO="${github_repo}"

# -----------------------------------------------------------------------------
# System Updates and Dependencies
# -----------------------------------------------------------------------------
echo "Updating system packages..."
dnf update -y

echo "Installing Docker..."
dnf install -y docker git

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# -----------------------------------------------------------------------------
# Application Setup
# -----------------------------------------------------------------------------
APP_DIR="/opt/cellcount"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository if URL provided, otherwise create minimal setup
if [ -n "$GITHUB_REPO" ]; then
    echo "Cloning repository from $GITHUB_REPO..."
    git clone "$GITHUB_REPO" .
else
    echo "No GitHub repo provided, creating minimal backend setup..."
    mkdir -p backend/app/api backend/app/core backend/app/schemas backend/app/services

    # Create minimal requirements.txt
    cat > backend/requirements.txt << 'REQUIREMENTS'
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
ultralytics>=8.1.0
huggingface_hub>=0.20.0
python-multipart>=0.0.6
pillow>=10.2.0
pydantic-settings>=2.1.0
REQUIREMENTS

    # Create minimal main.py
    cat > backend/app/main.py << 'MAINPY'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="CellCount API", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "CellCount API is running"}

@app.get("/")
def root():
    return {"message": "Welcome to CellCount API. Visit /docs for API documentation."}
MAINPY

    # Create __init__.py files
    touch backend/app/__init__.py
    touch backend/app/api/__init__.py
    touch backend/app/core/__init__.py
    touch backend/app/schemas/__init__.py
    touch backend/app/services/__init__.py
fi

# -----------------------------------------------------------------------------
# Docker Configuration
# -----------------------------------------------------------------------------
echo "Creating Docker configuration..."

# Create Dockerfile if not exists
if [ ! -f backend/Dockerfile ]; then
    cat > backend/Dockerfile << 'DOCKERFILE'
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
DOCKERFILE
fi

# Create docker-compose.yml
cat > docker-compose.yml << COMPOSE
version: '3.8'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cellcount-api
    restart: unless-stopped
    ports:
      - "${app_port}:8000"
    environment:
      - CORS_ORIGINS=${cors_origins}
      - MODEL_NAME=${model_name}
      - DEBUG=false
    volumes:
      - model-cache:/root/.cache
    mem_limit: 900m
    memswap_limit: 1500m
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  model-cache:
COMPOSE

# -----------------------------------------------------------------------------
# Create Swap Space (helps with 1GB RAM limit)
# -----------------------------------------------------------------------------
echo "Creating swap space..."
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# -----------------------------------------------------------------------------
# Build and Start Application
# -----------------------------------------------------------------------------
echo "Building and starting application..."
cd $APP_DIR
docker-compose build
docker-compose up -d

# -----------------------------------------------------------------------------
# Create Update Script
# -----------------------------------------------------------------------------
cat > /opt/cellcount/update.sh << 'UPDATESH'
#!/bin/bash
# Script to update CellCount application
cd /opt/cellcount
git pull origin main 2>/dev/null || echo "No git repo, skipping pull"
docker-compose build
docker-compose up -d
UPDATESH
chmod +x /opt/cellcount/update.sh

# -----------------------------------------------------------------------------
# Create systemd service for auto-restart
# -----------------------------------------------------------------------------
cat > /etc/systemd/system/cellcount.service << 'SYSTEMD'
[Unit]
Description=CellCount API
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/cellcount
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable cellcount.service

# -----------------------------------------------------------------------------
# Setup Complete
# -----------------------------------------------------------------------------
echo "=============================================="
echo "CellCount setup complete at $(date)"
echo "API should be available at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${app_port}"
echo "Health check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${app_port}/api/health"
echo "=============================================="
