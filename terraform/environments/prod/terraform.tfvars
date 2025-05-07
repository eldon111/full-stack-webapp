# Replace with your actual GCP project ID and number
project_id     = "terraform-app-458517"
project_number = "207891619672"
region         = "us-east4"

# Service names
backend_service_name  = "full-stack-webapp-backend"
frontend_service_name = "full-stack-webapp-frontend"
image_processor_name = "image-processor"

# Resource names
image_bucket_name        = "eldons-full-stack-webapp-images"
pubsub_topic_name        = "thumbnail-created"
pubsub_subscription_name = "thumbnail-created-sub"

# Domain name for HTTPS (replace with your actual domain for production environment)
frontend_domain_name = "webapp.emathias.com"

# Set to true if you want Terraform to manage DNS records in Cloud DNS
# Set to false if you're managing DNS elsewhere (e.g., external DNS provider)
manage_dns = false
