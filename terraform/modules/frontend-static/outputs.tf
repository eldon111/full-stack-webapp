output "frontend_url" {
  description = "URL of the frontend static website"
  value = var.frontend_domain_name != "" ? "https://${var.frontend_domain_name}" : "http://${google_compute_global_address.frontend_static.address}"
}

output "frontend_bucket_name" {
  description = "Name of the frontend static bucket"
  value       = google_storage_bucket.frontend_static.name
}

output "frontend_ip_address" {
  description = "IP address of the frontend static website"
  value       = google_compute_global_address.frontend_static.address
}
