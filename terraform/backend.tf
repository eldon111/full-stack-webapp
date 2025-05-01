# This file configures the Terraform backend for state storage
# Uncomment this block after creating the GCS bucket for state storage

terraform {
  backend "gcs" {
    bucket = "terraform-app-458517-tfstate"
    prefix = "env/dev"
  }
}
