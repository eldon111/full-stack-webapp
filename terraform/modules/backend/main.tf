# Get the service account email from the project
data "google_service_account" "backend_service_account" {
  account_id = "backend-service-${var.environment}"
}

# Create a Cloud Run service for the backend
resource "google_cloud_run_v2_service" "backend" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = "us-east4-docker.pkg.dev/${var.project_id}/cloud-run-source-deploy/${var.service_name}:latest"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "GCS_BUCKET"
        value = var.image_bucket_name
      }

      env {
        name  = "PUBSUB_TOPIC"
        value = var.pubsub_topic_name
      }

      env {
        name  = "PUBSUB_SUBSCRIPTION"
        value = var.pubsub_subscription_name
      }

      # Set resource limits
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }
    }

    # Set service account
    service_account = data.google_service_account.backend_service_account.email

    # Set scaling
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  # Add labels
  labels = var.labels
}

# Make the backend service publicly accessible
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  name = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create a secure session key in Secret Manager
resource "google_secret_manager_secret" "secure_session_key" {
  secret_id = "secure-session-key"

  replication {
    auto {}
  }

  labels = var.labels
}

# Generate a random secure session key
resource "random_id" "secure_session_key" {
  byte_length = 32
}

# Store the secure session key in Secret Manager
resource "google_secret_manager_secret_version" "secure_session_key" {
  secret      = google_secret_manager_secret.secure_session_key.id
  secret_data = random_id.secure_session_key.hex
}
