# Backend configuration for the development environment
terraform {
  backend "gcs" {
    bucket = "terraform-app-458517-tfstate"
    prefix = "env/dev"
  }
}
