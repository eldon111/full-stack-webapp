#!/bin/bash
set -e

# Create a temporary directory for packaging
mkdir -p python

# Install dependencies
pip install -r requirements.txt  --platform manylinux2014_x86_64 --only-binary=:all: -t python/

# Copy the Lambda function code
#cp lambda_function.py ./python/

# Create a layer ZIP file
zip -r layer.zip python

echo "Created layer.zip"

# Clean up
rm -rf python

echo "Deployment package created successfully!"
