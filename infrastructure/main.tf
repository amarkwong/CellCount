# =============================================================================
# CellCount Infrastructure - Main Terraform Configuration
# =============================================================================
# This configuration creates:
# - EC2 t2.micro instance running Docker with the FastAPI backend
# - Security group allowing HTTP/HTTPS and SSH access
# - IAM role for EC2 (SSM access for management)
# - Elastic IP for stable DNS pointing
# =============================================================================

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CellCount"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# =============================================================================
# Data Sources
# =============================================================================

# Get the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# Get current AWS region
data "aws_region" "current" {}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# =============================================================================
# VPC - Use Default VPC for simplicity (Free Tier friendly)
# =============================================================================

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# =============================================================================
# Security Group
# =============================================================================

resource "aws_security_group" "cellcount_sg" {
  name        = "${var.project_name}-sg-${var.environment}"
  description = "Security group for CellCount API server"
  vpc_id      = data.aws_vpc.default.id

  # SSH access (restrict to your IP in production)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
  }

  # HTTP (for Let's Encrypt validation and redirect)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API port (8000) - Direct access for testing
  ingress {
    description = "API Direct"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg-${var.environment}"
  }
}

# =============================================================================
# IAM Role for EC2 (SSM access for remote management)
# =============================================================================

resource "aws_iam_role" "cellcount_ec2_role" {
  name = "${var.project_name}-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ec2-role-${var.environment}"
  }
}

# Attach SSM policy for Session Manager access (no need for SSH key management)
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.cellcount_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile
resource "aws_iam_instance_profile" "cellcount_profile" {
  name = "${var.project_name}-profile-${var.environment}"
  role = aws_iam_role.cellcount_ec2_role.name
}

# =============================================================================
# EC2 Instance
# =============================================================================

resource "aws_instance" "cellcount_server" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name != "" ? var.key_pair_name : null
  vpc_security_group_ids = [aws_security_group.cellcount_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.cellcount_profile.name

  # Use first available subnet
  subnet_id = tolist(data.aws_subnets.default.ids)[0]

  # Root volume - 8GB is free tier eligible
  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  # User data script to set up Docker and deploy the application
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    app_port     = var.app_port
    domain_name  = var.domain_name
    cors_origins = var.cors_origins
    environment  = var.environment
    github_repo  = var.github_repo
    model_name   = var.model_name
  }))

  # Enable detailed monitoring (basic monitoring is free)
  monitoring = false

  tags = {
    Name = "${var.project_name}-server-${var.environment}"
  }

  # Ensure instance is replaced if user_data changes
  lifecycle {
    create_before_destroy = true
  }
}

# =============================================================================
# Elastic IP (for stable DNS pointing)
# =============================================================================

resource "aws_eip" "cellcount_eip" {
  instance = aws_instance.cellcount_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip-${var.environment}"
  }

  # Wait for instance to be created
  depends_on = [aws_instance.cellcount_server]
}

# =============================================================================
# CloudWatch Alarms (Free Tier: 10 alarms)
# =============================================================================

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.project_name}-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors EC2 CPU utilization"

  dimensions = {
    InstanceId = aws_instance.cellcount_server.id
  }

  # No actions configured - just for monitoring
  alarm_actions = []

  tags = {
    Name = "${var.project_name}-cpu-alarm-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "status_check" {
  alarm_name          = "${var.project_name}-status-check-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "This alarm monitors EC2 status checks"

  dimensions = {
    InstanceId = aws_instance.cellcount_server.id
  }

  alarm_actions = []

  tags = {
    Name = "${var.project_name}-status-alarm-${var.environment}"
  }
}
