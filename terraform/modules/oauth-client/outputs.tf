output "oauth_client_id_secret_id" {
  description = "ID of the OAuth client ID secret"
  value       = google_secret_manager_secret.oauth_client_id.id
}

output "oauth_client_secret_id" {
  description = "ID of the OAuth client secret"
  value       = google_secret_manager_secret.oauth_client_secret.id
}

output "oauth_brand_name" {
  description = "Name of the OAuth brand"
  value       = google_iap_brand.oauth_brand.name
}
