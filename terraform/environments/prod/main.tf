module "full_stack_webapp" {
  source = "../../"

  project_id               = var.project_id
  project_number = var.project_number
  region                   = var.region
  environment              = "prod"
  backend_service_name     = var.backend_service_name
  frontend_service_name    = var.frontend_service_name
  image_processor_name     = var.image_processor_name
  image_bucket_name        = var.image_bucket_name
  pubsub_topic_name        = var.pubsub_topic_name
  pubsub_subscription_name = var.pubsub_subscription_name
  support_email = var.support_email
}
