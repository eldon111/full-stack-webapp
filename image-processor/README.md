# Image Processor Lambda Function (Python)

This AWS Lambda function processes images uploaded to an S3 bucket, creates thumbnails, and publishes notifications to an SNS topic.

## Features

- Triggered by S3 upload events
- Creates WebP thumbnails with dimensions 320x240
- Publishes notifications to an SNS topic when processing is complete
- Skips processing of existing thumbnails

## Requirements

- Python 3.9+
- Pillow (Python Imaging Library)
- boto3 (AWS SDK for Python)

## Deployment

### Manual Deployment

1. Install dependencies in a local directory:
   ```bash
   pip install -r requirements.txt -t ./package
   ```

2. Copy the Lambda function code to the package directory:
   ```bash
   cp lambda_function.py ./package/
   ```

3. Create a ZIP file:
   ```bash
   cd package
   zip -r ../deployment-package.zip .
   ```

4. Upload the ZIP file to AWS Lambda using the AWS Management Console or AWS CLI:
   ```bash
   aws lambda update-function-code --function-name image-processor --zip-file fileb://deployment-package.zip
   ```

### Terraform Deployment

The Lambda function can be deployed using Terraform. See the `terraform/modules/image-processor-aws` module for details.

## Environment Variables

- `SNS_TOPIC`: ARN of the SNS topic for thumbnail notifications
- `AWS_REGION`: AWS region (optional, defaults to the Lambda function's region)

## IAM Permissions

The Lambda function requires the following permissions:

- `s3:GetObject` - To read images from the S3 bucket
- `s3:PutObject` - To write thumbnails to the S3 bucket
- `sns:Publish` - To publish notifications to the SNS topic
