output "backend_url" {
  description = "URL of the backend service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "backend_service_id" {
  description = "ID of the backend service"
  value       = google_cloud_run_v2_service.backend.id
}

output "secure_session_key_id" {
  description = "ID of the secure session key secret"
  value       = google_secret_manager_secret.secure_session_key.id
}
