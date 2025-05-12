import json
import os
import urllib.parse
import boto3
from io import BytesIO
import logging
from PIL import Image
import os.path

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Constants
TARGET_WIDTH = 320
TARGET_HEIGHT = 240

# Initialize AWS clients
s3_client = boto3.client('s3')
sns_client = boto3.client('sns')

def lambda_handler(event, context):
    """
    AWS Lambda handler function for processing S3 events.
    Generates thumbnails for uploaded images.
    """
    # Process each record in the S3 event
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'])
        
        try:
            process_image(bucket, key)
        except Exception as e:
            logger.error(f"Error processing {key} from bucket {bucket}: {str(e)}")
            raise e

def process_image(bucket, filename):
    """
    Process an image from S3, create a thumbnail, and publish a notification.
    
    Args:
        bucket (str): S3 bucket name
        filename (str): S3 object key (file path)
    """
    # Skip if this is already a thumbnail
    dirname = os.path.dirname(filename)
    if 'thumbnails' in dirname:
        logger.info(f"Skipping thumbnail {filename}")
        return
    
    # Generate the new thumbnail path
    new_dir = dirname.replace('/uploads', '/thumbnails')
    basename = os.path.splitext(os.path.basename(filename))[0]
    new_filename = f"{new_dir}/{basename}.webp"
    
    # Download the image from S3
    logger.info(f"Downloading {filename} from {bucket}")
    response = s3_client.get_object(Bucket=bucket, Key=filename)
    image_content = response['Body'].read()
    
    # Resize the image
    logger.info(f"Resizing image")
    resized_image = resize_image(image_content)
    
    # Upload the thumbnail to S3
    logger.info(f"Uploading thumbnail to {new_filename}")
    s3_client.put_object(
        Bucket=bucket,
        Key=new_filename,
        Body=resized_image,
        ContentType='image/webp'
    )
    
    # Publish a message to SNS
    try:
        sns_topic_arn = os.environ.get('SNS_TOPIC')
        if sns_topic_arn:
            logger.info(f"Publishing message to SNS topic {sns_topic_arn}")
            response = sns_client.publish(
                TopicArn=sns_topic_arn,
                Message=filename
            )
            logger.info(f"Message {response['MessageId']} published")
    except Exception as e:
        logger.error(f"Error publishing to SNS: {str(e)}")
    
    logger.info("Image processing complete")

def resize_image(image_content):
    """
    Resize an image to the target dimensions and convert to WebP format.
    
    Args:
        image_content (bytes): The original image content
        
    Returns:
        bytes: The resized image content in WebP format
    """
    # Open the image using Pillow
    image = Image.open(BytesIO(image_content))
    
    # Resize the image
    image = image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    
    # Convert to WebP format
    output = BytesIO()
    image.save(output, format="WEBP")
    
    return output.getvalue()
