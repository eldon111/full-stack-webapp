locals {
  common_labels = {
    environment = var.environment
    managed-by  = "terraform"
    project     = "full-stack-webapp"
  }
}

# Common infrastructure module
module "common" {
  source = "./modules/common"

  project_id               = var.project_id
  project_number           = var.project_number
  region                   = var.region
  environment              = var.environment
  image_bucket_name        = var.image_bucket_name
  pubsub_topic_name        = var.pubsub_topic_name
  pubsub_subscription_name = var.pubsub_subscription_name
  labels                   = local.common_labels
}

# Backend module
module "backend" {
  source = "./modules/backend"

  project_id               = var.project_id
  region                   = var.region
  environment              = var.environment
  service_name             = var.backend_service_name
  image_bucket_name        = module.common.image_bucket_name
  pubsub_topic_name        = module.common.pubsub_topic_name
  pubsub_subscription_name = module.common.pubsub_subscription_name
  frontend_url             = var.frontend_url
  labels                   = local.common_labels

  # Dependencies
  depends_on = [module.common, module.frontend_static]
}

# Frontend static website module
module "frontend_static" {
  source = "./modules/frontend-static"

  project_id   = var.project_id
  region       = var.region
  service_name = var.frontend_service_name
  frontend_domain_name = var.frontend_domain_name
  manage_dns   = var.manage_dns
  labels       = local.common_labels

  # Dependencies
  depends_on = [module.common]
}

# Image processor module
module "image_processor" {
  source = "./modules/image-processor"

  project_id        = var.project_id
  region            = var.region
  environment       = var.environment
  function_name     = var.image_processor_name
  image_bucket_name = module.common.image_bucket_name
  pubsub_topic_name = module.common.pubsub_topic_name
  labels = local.common_labels

  # Dependencies
  depends_on = [module.common]
}
