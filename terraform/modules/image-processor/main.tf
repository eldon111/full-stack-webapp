# Get the service account email from the project
data "google_service_account" "image_processor_service_account" {
  account_id = "image-processor-${var.environment}"
}

# Create a Cloud Function for image processing
resource "google_cloudfunctions2_function" "image_processor" {
  name     = var.function_name
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "generateThumbnail"

    source {
      storage_source {
        bucket = "gcf-sources-${var.project_id}-${var.region}"
        object = "${var.function_name}-source.zip"
      }
    }
  }

  service_config {
    max_instance_count = 10
    available_memory   = var.memory
    timeout_seconds    = var.timeout_seconds

    environment_variables = {
      GCS_BUCKET   = var.image_bucket_name
      PUBSUB_TOPIC = var.pubsub_topic_name
      NODE_ENV     = var.environment
    }

    service_account_email = data.google_service_account.image_processor_service_account.email
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.storage.object.v1.finalized"
    retry_policy = "RETRY_POLICY_DO_NOT_RETRY"

    event_filters {
      attribute = "bucket"
      value     = var.image_bucket_name
    }
  }

  labels = var.labels
}
