# Terraform Configuration for Full-Stack Web Application

This directory contains Terraform configurations for deploying the full-stack web application on Google Cloud Platform (
GCP). The infrastructure is organized into modules to allow for separate deployments of the backend and frontend
components.

## Directory Structure

```
terraform/
├── main.tf                  # Main configuration file
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── provider.tf              # Provider configuration
├── backend.tf               # Backend configuration for state
├── modules/
│   ├── common/              # Shared resources
│   ├── backend/             # Backend-specific resources
│   ├── frontend/            # Frontend-specific resources
│   └── image-processor/     # Cloud Function for image processing
└── environments/
    ├── dev/                 # Development environment
    └── prod/                # Production environment
```

## Modules

### Common Module

The common module creates shared resources that are used by both the backend and frontend services:

- Google Cloud Storage (GCS) bucket for storing images
- Pub/Sub topic and subscription for thumbnail notifications
- VPC network and subnet
- Service accounts with appropriate permissions

### Backend Module

The backend module deploys the backend service:

- Cloud Run service for the backend
- Environment variables configuration
- Secret Manager for secure session key
- IAM permissions for public access

### Frontend Module

The frontend module deploys the frontend service:

- Cloud Run service for the frontend
- Environment variables configuration including the backend URL
- IAM permissions for public access

### Image Processor Module

The image processor module deploys the image processing function:

- Cloud Function for processing uploaded images
- Event trigger for new image uploads
- Environment variables configuration

## Environment-Specific Configurations

The `environments` directory contains environment-specific configurations:

- `dev`: Development environment configuration
- `prod`: Production environment configuration

## Getting Started

### Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) (version >= 1.0)
2. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
3. A Google Cloud Platform project with billing enabled

### Authentication

Authenticate with Google Cloud:

```bash
gcloud auth application-default login
```

### Deployment

1. Navigate to the environment directory you want to deploy:

```bash
cd terraform/environments/dev
```

2. Initialize Terraform:

```bash
terraform init
```

3. Plan the deployment:

```bash
terraform plan -var="project_id=YOUR_PROJECT_ID"
```

4. Apply the configuration:

```bash
terraform apply -var="project_id=YOUR_PROJECT_ID"
```

### Cleanup

To destroy the resources:

```bash
terraform destroy -var="project_id=YOUR_PROJECT_ID"
```

## Notes

- The backend configuration (`backend.tf`) is commented out by default. Uncomment and configure it after creating a GCS
  bucket for Terraform state.
- Update the `terraform.tfvars` files in each environment directory with your specific values.
- For production deployments, consider using a CI/CD pipeline to automate the deployment process.
