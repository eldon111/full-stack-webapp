module "full_stack_webapp" {
  source = "../../"

  project_id               = var.project_id
  project_number = var.project_number
  region                   = var.region
  environment              = "dev"
  backend_service_name     = "${var.backend_service_name}-dev"
  frontend_service_name    = "${var.frontend_service_name}-dev"
  image_processor_name     = "${var.image_processor_name}-dev"
  image_bucket_name        = "${var.image_bucket_name}-dev"
  pubsub_topic_name        = "${var.pubsub_topic_name}-dev"
  pubsub_subscription_name = "${var.pubsub_subscription_name}-dev"
  support_email = var.support_email
}
