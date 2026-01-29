# =============================================================================
# CellCount Infrastructure - Variable Definitions
# =============================================================================

# -----------------------------------------------------------------------------
# AWS Configuration
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-2" # Sydney - change to your nearest region
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "cellcount"
}

# -----------------------------------------------------------------------------
# EC2 Configuration
# -----------------------------------------------------------------------------

variable "instance_type" {
  description = "EC2 instance type (t2.micro is free tier eligible)"
  type        = string
  default     = "t2.micro"

  validation {
    condition     = contains(["t2.micro", "t3.micro"], var.instance_type)
    error_message = "Instance type must be t2.micro or t3.micro for free tier."
  }
}

variable "key_pair_name" {
  description = "Name of existing EC2 key pair for SSH access (optional, can use SSM instead)"
  type        = string
  default     = ""
}

variable "ssh_allowed_cidrs" {
  description = "CIDR blocks allowed to SSH (set to your IP for security)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Open to all - restrict in production
}

# -----------------------------------------------------------------------------
# Application Configuration
# -----------------------------------------------------------------------------

variable "app_port" {
  description = "Port the FastAPI application listens on"
  type        = number
  default     = 8000
}

variable "domain_name" {
  description = "Domain name for the API (e.g., api.yourdomain.com)"
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Allowed CORS origins (comma-separated)"
  type        = string
  default     = "http://localhost:3000,http://localhost:5173"
}

variable "github_repo" {
  description = "GitHub repository URL for cloning the application"
  type        = string
  default     = ""
}

variable "model_name" {
  description = "HuggingFace model name for blood cell detection"
  type        = string
  default     = "Ruben-F/bloodcelldiff"
}

# -----------------------------------------------------------------------------
# Cloudflare Configuration (for documentation purposes)
# -----------------------------------------------------------------------------

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID (for reference in outputs)"
  type        = string
  default     = ""
}
