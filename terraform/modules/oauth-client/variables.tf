variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment (dev, prod)"
  type        = string
}

variable "application_name" {
  description = "Name of the application"
  type        = string
  default     = "Full Stack Webapp"
}

variable "support_email" {
  description = "Support email for the OAuth consent screen"
  type        = string
}

variable "service_account_email" {
  description = "Service account email that needs access to the secrets"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type = map(string)
  default = {}
}
