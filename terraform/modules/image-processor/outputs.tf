output "function_id" {
  description = "ID of the image processor function"
  value       = google_cloudfunctions2_function.image_processor.id
}

output "function_url" {
  description = "URL of the image processor function"
  value       = google_cloudfunctions2_function.image_processor.service_config[0].uri
}
