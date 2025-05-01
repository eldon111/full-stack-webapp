# Get the service account email from the project
data "google_service_account" "frontend_service_account" {
  account_id = "frontend-service-${var.environment}"
}

# Create a Cloud Run service for the frontend
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = "us-east4-docker.pkg.dev/${var.project_id}/cloud-run-source-deploy/${var.service_name}:latest"

      # Set environment variables
      env {
        name = "PORT"
        value = tostring(var.container_port)
      }

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "VITE_API_URL"
        value = "${var.backend_url}/api"
      }

      # Set resource limits
      resources {
        cpu    = var.cpu
        memory = var.memory
      }

      # Set container port
      ports {
        container_port = var.container_port
      }
    }

    # Set service account
    service_account = data.google_service_account.frontend_service_account.email

    # Set scaling
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  # Add labels
  labels = var.labels
}

# Make the frontend service publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
