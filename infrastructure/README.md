# CellCount Infrastructure

This directory contains Terraform configurations to deploy the CellCount backend API on AWS Free Tier.

## Architecture Overview

```
                                    ┌─────────────────────────────────────┐
                                    │           Cloudflare                │
                                    │  ┌─────────────────────────────┐    │
                                    │  │   DNS: api.yourdomain.com   │    │
    ┌──────────────┐               │  │   (A Record → Elastic IP)   │    │
    │   Frontend   │               │  └─────────────────────────────┘    │
    │  (Cloudflare │◄──────────────│  ┌─────────────────────────────┐    │
    │    Pages)    │               │  │      Cloudflare Proxy       │    │
    └──────┬───────┘               │  │   - SSL/TLS Termination     │    │
           │                        │  │   - DDoS Protection         │    │
           │ HTTPS                  │  │   - Caching                 │    │
           ▼                        │  └──────────────┬──────────────┘    │
    ┌─────────────────────────────────────────────────┼───────────────────┘
    │                                                 │
    │                               AWS               │
    │  ┌──────────────────────────────────────────────┼────────────────┐
    │  │                    VPC (Default)             │                │
    │  │  ┌───────────────────────────────────────────┼─────────────┐  │
    │  │  │              Security Group               │             │  │
    │  │  │  ┌────────────────────────────────────────▼──────────┐  │  │
    │  │  │  │              EC2 t2.micro                         │  │  │
    │  │  │  │  ┌─────────────────────────────────────────────┐  │  │  │
    │  │  │  │  │              Docker                         │  │  │  │
    │  │  │  │  │  ┌───────────────────────────────────────┐  │  │  │  │
    │  │  │  │  │  │         FastAPI + YOLOv8              │  │  │  │  │
    │  │  │  │  │  │         (Port 8000)                   │  │  │  │  │
    │  │  │  │  │  └───────────────────────────────────────┘  │  │  │  │
    │  │  │  │  └─────────────────────────────────────────────┘  │  │  │
    │  │  │  │                                                   │  │  │
    │  │  │  │  Elastic IP: x.x.x.x                             │  │  │
    │  │  │  └───────────────────────────────────────────────────┘  │  │
    │  │  └─────────────────────────────────────────────────────────┘  │
    │  └───────────────────────────────────────────────────────────────┘
    └──────────────────────────────────────────────────────────────────────
```

## Cost Estimate (Free Tier)

| Resource | Free Tier Allowance | Our Usage | Cost |
|----------|---------------------|-----------|------|
| EC2 t2.micro | 750 hrs/month (12 months) | ~730 hrs/month | $0 |
| EBS Storage | 30 GB/month | 8 GB | $0 |
| Elastic IP | Free when attached | 1 | $0 |
| Data Transfer | 100 GB/month out | ~1-5 GB | $0 |
| CloudWatch | 10 alarms | 2 alarms | $0 |
| **Total** | | | **$0/month** |

> **Note:** Free tier is valid for 12 months from AWS account creation. After that, expect ~$8-10/month for t2.micro.

## Prerequisites

1. **AWS Account** with Free Tier eligibility
2. **AWS CLI** installed and configured
3. **Terraform** >= 1.0.0 installed
4. **Cloudflare Account** with a domain

### Install AWS CLI
```bash
# macOS
brew install awscli

# Verify and configure
aws --version
aws configure
```

### Install Terraform
```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Verify
terraform --version
```

## Quick Start

### 1. Configure Variables

Create a `terraform.tfvars` file:

```hcl
# terraform.tfvars
aws_region    = "ap-southeast-2"  # Sydney (change to nearest region)
environment   = "prod"
project_name  = "cellcount"

# Your domain configuration
domain_name   = "api.yourdomain.com"
cors_origins  = "https://cellcount.pages.dev,https://yourdomain.com"

# Optional: GitHub repo for auto-deployment
github_repo   = "https://github.com/yourusername/CellCount.git"

# Optional: SSH key pair name (create in AWS Console first)
key_pair_name = "your-key-pair"

# Security: Restrict SSH to your IP
ssh_allowed_cidrs = ["YOUR_IP/32"]
```

### 2. Deploy Infrastructure

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy (type 'yes' when prompted)
terraform apply
```

### 3. Get Outputs

```bash
# Show all outputs
terraform output

# Get specific values
terraform output elastic_ip
terraform output api_url_direct
```

## Cloudflare Configuration

### DNS Setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Go to **DNS** > **Records**
4. Add a new record:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | api | `<elastic_ip from terraform output>` | Proxied (orange cloud) | Auto |

### SSL/TLS Setup

1. Go to **SSL/TLS** > **Overview**
2. Set encryption mode to **Full (strict)**
   - Note: Use **Full** if you don't have a valid SSL cert on EC2

### Page Rules (Optional)

For caching API responses:

1. Go to **Rules** > **Page Rules**
2. Create rule for `api.yourdomain.com/api/health*`
   - Cache Level: Standard
   - Edge Cache TTL: 30 seconds

## Cloudflare Pages (Frontend)

### Deploy Frontend

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click **Create a project** > **Connect to Git**
3. Select your repository
4. Configure build:
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
   - Root directory: `/` (or `frontend` if only deploying frontend)

### Environment Variables

Set in Cloudflare Pages dashboard:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.yourdomain.com` |

## Verification

### Test API Health

```bash
# Direct (before Cloudflare setup)
curl http://<elastic_ip>:8000/api/health

# Via Cloudflare (after DNS propagation)
curl https://api.yourdomain.com/api/health
```

Expected response:
```json
{"status": "healthy", "message": "CellCount API is running"}
```

### Test Detection Endpoint

```bash
curl -X POST "https://api.yourdomain.com/api/detect" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/blood-image.jpg"
```

## Management Commands

### SSH to Instance

```bash
# Using SSH key
ssh -i ~/.ssh/your-key.pem ec2-user@<elastic_ip>

# Using SSM Session Manager (no key needed)
aws ssm start-session --target <instance_id> --region ap-southeast-2
```

### View Application Logs

```bash
# SSH to instance first, then:
cd /opt/cellcount
docker-compose logs -f

# Or view user-data script logs
sudo cat /var/log/user-data.log
```

### Update Application

```bash
# SSH to instance first, then:
cd /opt/cellcount
./update.sh
```

### Restart Application

```bash
cd /opt/cellcount
docker-compose restart
```

## Troubleshooting

### Instance Not Responding

1. Check instance status in AWS Console
2. Verify security group allows traffic on port 8000
3. Check user-data logs: `sudo cat /var/log/user-data.log`

### Out of Memory

The t2.micro has only 1GB RAM. If you see OOM errors:

```bash
# Check memory usage
free -h

# Check Docker memory
docker stats

# Restart with less memory
docker-compose down
docker-compose up -d
```

### Cloudflare 502/504 Errors

1. Verify EC2 is running
2. Check API is responding: `curl http://<elastic_ip>:8000/api/health`
3. Verify Cloudflare DNS points to correct IP
4. Check SSL/TLS mode (try "Full" instead of "Full (strict)")

### Model Loading Slow

First request may take 30-60 seconds to load the YOLOv8 model. Subsequent requests will be fast.

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

> **Warning:** This will delete the EC2 instance and all data. Make sure to backup any important data first.

## Files Structure

```
infrastructure/
├── main.tf           # Main Terraform configuration
├── variables.tf      # Variable definitions
├── outputs.tf        # Output values
├── user-data.sh      # EC2 initialization script
├── terraform.tfvars  # Your configuration (create this)
└── README.md         # This file

backend/
└── Dockerfile        # Docker configuration for the API
```

## Security Considerations

1. **SSH Access:** Restrict `ssh_allowed_cidrs` to your IP only
2. **CORS Origins:** Only allow your frontend domain
3. **Cloudflare Proxy:** Always enable (orange cloud) for DDoS protection
4. **SSL/TLS:** Use "Full (strict)" mode when possible
5. **IAM:** Instance uses minimal permissions (SSM only)

## Monitoring

### CloudWatch Alarms

Two alarms are automatically created:
- **CPU High:** Alerts when CPU > 80% for 10 minutes
- **Status Check:** Alerts on instance health issues

### View in AWS Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch)
2. Navigate to **Alarms** > **All alarms**
3. Look for `cellcount-*` alarms

## CI/CD Pipeline

This project uses GitHub Actions for automated deployment on push/merge to the `main` branch.

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions CI/CD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Push to main                                                                │
│       │                                                                      │
│       ├──► backend/**  ──► backend-deploy.yml                               │
│       │                        │                                             │
│       │                        ├─► Build Docker Image                        │
│       │                        ├─► Push to ghcr.io                          │
│       │                        ├─► SSH to EC2                               │
│       │                        ├─► Pull & Run Container                     │
│       │                        └─► Health Check                              │
│       │                                                                      │
│       └──► frontend/** ──► frontend-deploy.yml                              │
│                                │                                             │
│                                ├─► Install Dependencies                      │
│                                ├─► Build Vite App                           │
│                                ├─► Deploy to Cloudflare Pages               │
│                                └─► Health Check                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow Files

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/backend-deploy.yml` | Build, push, and deploy backend API | Push to `main` with changes in `backend/` |
| `.github/workflows/frontend-deploy.yml` | Build and deploy frontend | Push to `main` with changes in `frontend/` |

### Required GitHub Secrets

You must configure the following secrets in your GitHub repository settings.

#### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret listed below

#### Backend Deployment Secrets

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `EC2_HOST` | EC2 instance public IP or hostname | `terraform output elastic_ip` |
| `EC2_USERNAME` | SSH username for EC2 | Usually `ec2-user` for Amazon Linux |
| `EC2_SSH_KEY` | Private SSH key for EC2 access | Your `.pem` key file contents |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `https://cellcount.feifan.dev,https://cellcount.pages.dev` |
| `MODEL_NAME` | ML model name from HuggingFace | `Ruben-F/bloodcelldiff` |

#### Frontend Deployment Secrets

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages access | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in Cloudflare Dashboard URL or sidebar |

### Setting Up Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Pages** template, or create custom token with:
   - **Permissions:**
     - Account > Cloudflare Pages > Edit
   - **Account Resources:**
     - Include > Your Account
4. Copy the token and add it as `CLOUDFLARE_API_TOKEN` secret

### Setting Up EC2 SSH Key

1. Get your EC2 key pair `.pem` file
2. Copy the entire contents including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
3. Add as `EC2_SSH_KEY` secret

**Example format:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234...
...
...abcd5678=
-----END RSA PRIVATE KEY-----
```

### Deployment Workflow Details

#### Backend Deployment (`backend-deploy.yml`)

1. **Build Stage**
   - Checks out code
   - Builds Docker image with multi-stage Dockerfile
   - Pushes to GitHub Container Registry (ghcr.io)
   - Tags: `latest`, `main`, `<commit-sha>`

2. **Deploy Stage**
   - SSHs to EC2 instance
   - Pulls latest code from GitHub
   - Pulls latest Docker image from ghcr.io
   - Stops old container, starts new one
   - Cleans up old images

3. **Health Check**
   - Waits 30 seconds for startup
   - Polls `https://api.cellcount.feifan.dev/api/health`
   - Retries up to 10 times with 10-second intervals

#### Frontend Deployment (`frontend-deploy.yml`)

1. **Build Stage**
   - Installs Node.js dependencies
   - Runs linter (non-blocking)
   - Builds Vite app with production API URL
   - Uploads build artifacts

2. **Deploy Stage**
   - Downloads build artifacts
   - Deploys to Cloudflare Pages using Wrangler
   - Assigns to `cellcount` project

3. **Health Check**
   - Verifies frontend is accessible
   - Checks API connectivity with CORS headers

4. **Preview Deployments (PRs only)**
   - Creates preview deployment for pull requests
   - Comments on PR with preview URL

### Manual Deployment

If you need to deploy manually:

#### Backend
```bash
# SSH to EC2
ssh -i ~/.ssh/your-key.pem ec2-user@<elastic_ip>

# Update and restart
cd /opt/cellcount
./update.sh
```

#### Frontend
```bash
cd frontend
npm ci
VITE_API_URL=https://api.cellcount.feifan.dev npm run build
npx wrangler pages deploy dist --project-name=cellcount
```

### Monitoring Deployments

#### GitHub Actions
- View workflow runs: Repository > **Actions** tab
- Check logs for each step
- Re-run failed jobs if needed

#### Rollback

**Backend:**
```bash
# SSH to EC2
cd /opt/cellcount

# List available images
docker images | grep cellcount

# Run previous version
docker stop cellcount-api
docker rm cellcount-api
docker run -d --name cellcount-api \
  -p 8000:8000 \
  -e CORS_ORIGINS="https://cellcount.feifan.dev" \
  ghcr.io/<your-repo>/cellcount-api:<previous-sha>
```

**Frontend:**
Cloudflare Pages maintains deployment history. Rollback from the Cloudflare Dashboard:
1. Go to Pages > cellcount
2. Select **Deployments**
3. Click the rollback icon on a previous deployment

### Environment Configuration

The workflows use these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.cellcount.feifan.dev` | Backend API URL for frontend |
| `REGISTRY` | `ghcr.io` | Docker container registry |
| `IMAGE_NAME` | `<repo>/cellcount-api` | Docker image name |

### Secrets Summary Checklist

Before your first deployment, ensure all secrets are configured:

- [ ] `EC2_HOST` - Your EC2 elastic IP
- [ ] `EC2_USERNAME` - SSH username (ec2-user)
- [ ] `EC2_SSH_KEY` - Private key content
- [ ] `CORS_ORIGINS` - Allowed origins
- [ ] `MODEL_NAME` - HuggingFace model ID
- [ ] `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `/var/log/user-data.log` and `docker-compose logs`
3. Check GitHub Actions logs for deployment issues
4. Open an issue in the GitHub repository
