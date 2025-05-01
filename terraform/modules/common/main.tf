# Create a GCS bucket for storing images
resource "google_storage_bucket" "images" {
  name = var.image_bucket_name
  location = var.region

  # Configure uniform bucket-level access
  uniform_bucket_level_access = true

  # Set storage class to standard
  storage_class = "STANDARD"

  # Enable versioning
  versioning {
    enabled = true
  }

  # Set lifecycle rules
  lifecycle_rule {
    condition {
      age = 90  # 90 days
    }
    action {
      type = "Delete"
    }
  }

  # Add labels
  labels = var.labels
}

# Create a PubSub topic for thumbnail notifications
resource "google_pubsub_topic" "thumbnail_created" {
  name   = var.pubsub_topic_name
  labels = var.labels
}

# Create a PubSub subscription for the thumbnail notifications
resource "google_pubsub_subscription" "thumbnail_created_sub" {
  name = var.pubsub_subscription_name
  topic = google_pubsub_topic.thumbnail_created.name

  # Set message retention duration to 7 days
  message_retention_duration = "604800s"  # 7 days

  # Set acknowledgement deadline to 20 seconds
  ack_deadline_seconds = 20

  # Add labels
  labels = var.labels
}

# Create a VPC network for the services
resource "google_compute_network" "vpc" {
  name                    = "full-stack-webapp-vpc-${var.environment}"
  auto_create_subnetworks = false
}

# Create a subnet for the services
resource "google_compute_subnetwork" "subnet" {
  name          = "full-stack-webapp-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Create a service account for the backend service
resource "google_service_account" "backend_service_account" {
  account_id   = "backend-service-${var.environment}"
  display_name = "Backend Service Account ${var.environment}"
  description  = "Service account for the backend service"
}

# Create a service account for the frontend service
resource "google_service_account" "frontend_service_account" {
  account_id   = "frontend-service-${var.environment}"
  display_name = "Frontend Service Account ${var.environment}"
  description  = "Service account for the frontend service"
}

# Create a service account for the image processor function
resource "google_service_account" "image_processor_service_account" {
  account_id   = "image-processor-${var.environment}"
  display_name = "Image Processor Service Account ${var.environment}"
  description  = "Service account for the image processor function"
}

# Grant permissions to the backend service account
resource "google_project_iam_member" "backend_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.backend_service_account.email}"
}

resource "google_project_iam_member" "backend_pubsub_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.backend_service_account.email}"
}

resource "google_project_iam_member" "backend_secretmanager_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend_service_account.email}"
}

# Grant permissions to the image processor service account
resource "google_project_iam_member" "image_processor_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.image_processor_service_account.email}"
}

resource "google_project_iam_member" "image_processor_pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.image_processor_service_account.email}"
}
