module "full_stack_webapp" {
  source = "../../"

  project_id               = var.project_id
  project_number           = var.project_number
  region                   = var.region
  environment              = "prod"
  backend_service_name     = "${var.backend_service_name}-prod"
  frontend_service_name    = "${var.frontend_service_name}-prod"
  image_processor_name     = "${var.image_processor_name}-prod"
  image_bucket_name        = "${var.image_bucket_name}-prod"
  pubsub_topic_name        = "${var.pubsub_topic_name}-prod"
  pubsub_subscription_name = "${var.pubsub_subscription_name}-prod"
  frontend_domain_name     = var.frontend_domain_name
  frontend_url             = "https://${var.frontend_domain_name}"
  manage_dns               = var.manage_dns
}
