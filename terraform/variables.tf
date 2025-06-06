variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-east4"  # Default to us-east4 based on your existing configuration
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
  default     = "dev"
}

variable "backend_service_name" {
  description = "Name of the backend service"
  type        = string
  default     = "full-stack-webapp-backend"
}

variable "frontend_service_name" {
  description = "Name of the frontend service"
  type        = string
  default     = "full-stack-webapp-frontend"
}

variable "image_processor_name" {
  description = "Name of the image processor function"
  type        = string
  default = "image-processor"
}

variable "image_bucket_name" {
  description = "Name of the GCS bucket for images"
  type        = string
  default     = "eldons-full-stack-webapp-images"
}

variable "pubsub_topic_name" {
  description = "Name of the PubSub topic for thumbnail notifications"
  type        = string
  default     = "thumbnail-created"
}

variable "pubsub_subscription_name" {
  description = "Name of the PubSub subscription for thumbnail notifications"
  type        = string
  default     = "thumbnail-created-sub"
}

variable "project_number" {
  description = "The GCP project number"
  type        = string
}

variable "frontend_domain_name" {
  description = "Domain name for the frontend static website (for HTTPS setup)"
  type        = string
  default     = ""  # Default to empty, should be provided in environment-specific tfvars
}

variable "frontend_url" {
  description = "Full URL for the frontend static website"
  type        = string
  default     = ""  # Default to empty, should be provided in environment-specific tfvars
}

variable "manage_dns" {
  description = "Whether to create and manage DNS records in Cloud DNS"
  type        = bool
  default     = false  # Default to false, set to true if you want Terraform to manage DNS
}
