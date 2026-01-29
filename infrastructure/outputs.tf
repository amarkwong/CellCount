# =============================================================================
# CellCount Infrastructure - Outputs
# =============================================================================

# -----------------------------------------------------------------------------
# EC2 Instance Outputs
# -----------------------------------------------------------------------------

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.cellcount_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance (use Elastic IP for DNS)"
  value       = aws_instance.cellcount_server.public_ip
}

output "elastic_ip" {
  description = "Elastic IP address (use this for Cloudflare DNS)"
  value       = aws_eip.cellcount_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.cellcount_server.public_dns
}

# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------

output "api_url_direct" {
  description = "Direct API URL (for testing before DNS setup)"
  value       = "http://${aws_eip.cellcount_eip.public_ip}:${var.app_port}"
}

output "api_url_https" {
  description = "HTTPS API URL (after Cloudflare setup)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "Configure domain_name variable"
}

output "api_docs_url" {
  description = "API documentation URL"
  value       = "http://${aws_eip.cellcount_eip.public_ip}:${var.app_port}/docs"
}

# -----------------------------------------------------------------------------
# SSM Connection
# -----------------------------------------------------------------------------

output "ssm_connect_command" {
  description = "AWS CLI command to connect via SSM Session Manager"
  value       = "aws ssm start-session --target ${aws_instance.cellcount_server.id} --region ${data.aws_region.current.name}"
}

# -----------------------------------------------------------------------------
# Cloudflare Configuration (copy these values)
# -----------------------------------------------------------------------------

output "cloudflare_dns_record" {
  description = "DNS record to create in Cloudflare"
  value = {
    type    = "A"
    name    = var.domain_name != "" ? split(".", var.domain_name)[0] : "api"
    content = aws_eip.cellcount_eip.public_ip
    proxied = true
    ttl     = 1 # Auto when proxied
  }
}

output "cloudflare_ssl_mode" {
  description = "Recommended Cloudflare SSL/TLS mode"
  value       = "Full (strict) - requires valid SSL cert on origin, or Full - for self-signed"
}

# -----------------------------------------------------------------------------
# Security Group
# -----------------------------------------------------------------------------

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.cellcount_sg.id
}

# -----------------------------------------------------------------------------
# Deployment Info
# -----------------------------------------------------------------------------

output "deployment_notes" {
  description = "Important notes for deployment"
  value       = <<-EOT

    ============================================================
    DEPLOYMENT COMPLETE - Next Steps:
    ============================================================

    1. Wait 2-3 minutes for EC2 instance to initialize

    2. Test the API:
       curl http://${aws_eip.cellcount_eip.public_ip}:${var.app_port}/api/health

    3. Configure Cloudflare DNS:
       - Go to your Cloudflare dashboard
       - Add an A record pointing to: ${aws_eip.cellcount_eip.public_ip}
       - Enable Cloudflare proxy (orange cloud)

    4. Update frontend .env:
       VITE_API_URL=https://${var.domain_name != "" ? var.domain_name : "api.yourdomain.com"}

    5. SSH to instance (if key pair configured):
       ssh -i your-key.pem ec2-user@${aws_eip.cellcount_eip.public_ip}

    6. Or use SSM Session Manager:
       aws ssm start-session --target ${aws_instance.cellcount_server.id}

    ============================================================
  EOT
}
