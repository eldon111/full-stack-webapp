output "vpc_id" {
  description = "ID of the VPC network"
  value       = google_compute_network.vpc.id
}

output "subnet_id" {
  description = "ID of the subnet"
  value       = google_compute_subnetwork.subnet.id
}

output "image_bucket_name" {
  description = "Name of the GCS bucket for images"
  value       = google_storage_bucket.images.name
}

output "pubsub_topic_name" {
  description = "Name of the PubSub topic for thumbnail notifications"
  value       = google_pubsub_topic.thumbnail_created.name
}

output "pubsub_subscription_name" {
  description = "Name of the PubSub subscription for thumbnail notifications"
  value       = google_pubsub_subscription.thumbnail_created_sub.name
}

output "backend_service_account_email" {
  description = "Email of the backend service account"
  value       = google_service_account.backend_service_account.email
}

output "frontend_service_account_email" {
  description = "Email of the frontend service account"
  value       = google_service_account.frontend_service_account.email
}

output "image_processor_service_account_email" {
  description = "Email of the image processor service account"
  value       = google_service_account.image_processor_service_account.email
}
