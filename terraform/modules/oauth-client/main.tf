# Enable required APIs
resource "google_project_service" "resourcemanager_api" {
  project            = var.project_id
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam_api" {
  project            = var.project_id
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager_api" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iamcredentials_api" {
  project            = var.project_id
  service            = "iamcredentials.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iap_api" {
  project            = var.project_id
  service            = "iap.googleapis.com"
  disable_on_destroy = false
}

# Create OAuth consent screen (brand)
resource "google_iap_brand" "oauth_brand" {
  project           = var.project_id
  support_email     = var.support_email
  application_title = "${var.application_name} ${var.environment}"

  depends_on = [
    google_project_service.resourcemanager_api,
    google_project_service.iam_api,
    google_project_service.iap_api
  ]
}

# Create OAuth client using gcloud command
resource "null_resource" "create_oauth_client" {
  triggers = {
    brand_id = google_iap_brand.oauth_brand.name
  }

  provisioner "local-exec" {
    command = <<-EOT
      # Create OAuth client
      CLIENT_INFO=$(gcloud alpha iap oauth-clients create ${google_iap_brand.oauth_brand.name} \
        --display-name="${var.application_name}-oauth-client-${var.environment}" \
        --format=json)

      # Extract client ID and secret
      echo $CLIENT_INFO | jq -r '.name' | cut -d'/' -f6 > ${path.module}/client_id.txt
      echo $CLIENT_INFO | jq -r '.secret' > ${path.module}/client_secret.txt
    EOT
  }

  depends_on = [
    google_iap_brand.oauth_brand
  ]
}

# Read client ID and secret from files
data "local_file" "client_id" {
  filename = "${path.module}/client_id.txt"
  depends_on = [null_resource.create_oauth_client]
}

data "local_file" "client_secret" {
  filename = "${path.module}/client_secret.txt"
  depends_on = [null_resource.create_oauth_client]
}

# Create Secret Manager secrets for OAuth client ID
resource "google_secret_manager_secret" "oauth_client_id" {
  secret_id = "oauth-client-id-${var.environment}"

  replication {
    auto {}
  }

  labels = var.labels

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store OAuth client ID in Secret Manager
resource "google_secret_manager_secret_version" "oauth_client_id" {
  secret = google_secret_manager_secret.oauth_client_id.id
  secret_data = trimspace(data.local_file.client_id.content)

  depends_on = [
    data.local_file.client_id
  ]
}

# Create Secret Manager secrets for OAuth client secret
resource "google_secret_manager_secret" "oauth_client_secret" {
  secret_id = "oauth-client-secret-${var.environment}"

  replication {
    auto {}
  }

  labels = var.labels

  depends_on = [
    google_project_service.secretmanager_api
  ]
}

# Store OAuth client secret in Secret Manager
resource "google_secret_manager_secret_version" "oauth_client_secret" {
  secret = google_secret_manager_secret.oauth_client_secret.id
  secret_data = trimspace(data.local_file.client_secret.content)

  depends_on = [
    data.local_file.client_secret
  ]
}

# Clean up temporary files
resource "null_resource" "cleanup_files" {
  triggers = {
    client_id_version     = google_secret_manager_secret_version.oauth_client_id.id
    client_secret_version = google_secret_manager_secret_version.oauth_client_secret.id
  }

  provisioner "local-exec" {
    command = "rm -f ${path.module}/client_id.txt ${path.module}/client_secret.txt"
  }

  depends_on = [
    google_secret_manager_secret_version.oauth_client_id,
    google_secret_manager_secret_version.oauth_client_secret
  ]
}

# Grant access to the secrets
resource "google_secret_manager_secret_iam_binding" "oauth_client_id_accessor" {
  secret_id = google_secret_manager_secret.oauth_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${var.service_account_email}",
  ]
}

resource "google_secret_manager_secret_iam_binding" "oauth_client_secret_accessor" {
  secret_id = google_secret_manager_secret.oauth_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    "serviceAccount:${var.service_account_email}",
  ]
}
