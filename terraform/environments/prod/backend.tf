# Backend configuration for the production environment
terraform {
  backend "gcs" {
    bucket = "terraform-app-458517-tfstate"
    prefix = "env/prod"
  }
}
