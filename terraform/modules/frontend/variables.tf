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

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 5173
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU allocation for the service"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory allocation for the service"
  type        = string
  default     = "512Mi"
}
