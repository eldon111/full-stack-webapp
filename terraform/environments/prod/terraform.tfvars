# Replace with your actual GCP project ID and number
project_id = "terraform-app-458517"
project_number = "458517"
region     = "us-east4"

# Service names
backend_service_name  = "full-stack-webapp-backend"
frontend_service_name = "full-stack-webapp-frontend"
image_processor_name = "image-processor"

# Resource names
image_bucket_name        = "eldons-full-stack-webapp-images"
pubsub_topic_name        = "thumbnail-created"
pubsub_subscription_name = "thumbnail-created-sub"
