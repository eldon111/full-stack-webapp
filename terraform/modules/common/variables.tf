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

variable "image_bucket_name" {
  description = "Name of the GCS bucket for images"
  type        = string
}

variable "pubsub_topic_name" {
  description = "Name of the PubSub topic for thumbnail notifications"
  type        = string
}

variable "pubsub_subscription_name" {
  description = "Name of the PubSub subscription for thumbnail notifications"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type = map(string)
  default = {}
}

variable "project_number" {
  description = "The GCP project number"
  type        = string
}
