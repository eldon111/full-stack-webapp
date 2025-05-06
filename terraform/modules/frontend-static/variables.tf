variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
}

variable "service_name" {
  description = "Name of the frontend service"
  type        = string
}

variable "backend_url" {
  description = "URL of the backend service"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type = map(string)
  default = {}
}

# Domain name variable for HTTPS setup
variable "frontend_domain_name" {
  description = "Domain name for the frontend (for HTTPS setup)"
  type        = string
  default     = ""  # Default to empty, but should be provided for production
}

# Whether to manage DNS records in Cloud DNS
variable "manage_dns" {
  description = "Whether to create and manage DNS records in Cloud DNS"
  type        = bool
  default     = false  # Default to false, set to true if you want Terraform to manage DNS
}
