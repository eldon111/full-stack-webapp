output "frontend_url" {
  description = "URL of the frontend service"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "frontend_service_id" {
  description = "ID of the frontend service"
  value       = google_cloud_run_v2_service.frontend.id
}
