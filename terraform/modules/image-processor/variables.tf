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

variable "function_name" {
  description = "Name of the image processor function"
  type        = string
}

variable "image_bucket_name" {
  description = "Name of the GCS bucket for images"
  type        = string
}

variable "pubsub_topic_name" {
  description = "Name of the PubSub topic for thumbnail notifications"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type = map(string)
  default = {}
}

variable "memory" {
  description = "Memory allocation for the function"
  type        = string
  default     = "512Mi"
}

variable "timeout_seconds" {
  description = "Timeout for the function in seconds"
  type        = number
  default     = 60
}
