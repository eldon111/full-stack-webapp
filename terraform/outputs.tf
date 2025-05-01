output "backend_url" {
  description = "URL of the backend service"
  value       = module.backend.backend_url
}

output "frontend_url" {
  description = "URL of the frontend service"
  value       = module.frontend.frontend_url
}

output "image_bucket_name" {
  description = "Name of the GCS bucket for images"
  value       = module.common.image_bucket_name
}

output "pubsub_topic_name" {
  description = "Name of the PubSub topic for thumbnail notifications"
  value       = module.common.pubsub_topic_name
}

output "image_processor_function_url" {
  description = "URL of the image processor function"
  value       = module.image_processor.function_url
}
