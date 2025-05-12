import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserInfo } from '../trpc';

// Initialize AWS S3 Client
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

function getImageNamespace(userInfo: UserInfo): string {
  return `${userInfo.email}/uploads`;
}

function getThumbnailNamespace(userInfo: UserInfo): string {
  return `${userInfo.email}/thumbnails`;
}

async function listFilenames(namespace: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET!,
    Prefix: namespace,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map(file => file.Key!) || [];
}

async function generateImageUrl(fileName: string, action: 'read' | 'write'): Promise<string> {
  // Create the appropriate command based on the action
  const command = action === 'read'
    ? new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: fileName })
    : new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: fileName });

  // Set expiration time (60 minutes)
  const expiresIn = 60 * 60;

  // Generate a signed URL
  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function generateImageURLs(userInfo: UserInfo): Promise<string[]> {
  const filenames = await listFilenames(getImageNamespace(userInfo));
  return Promise.all(filenames.map(async (filename) => await generateImageUrl(filename, 'read')));
}

export async function generateThumbnailURLs(userInfo: UserInfo): Promise<string[]> {
  const filenames = await listFilenames(getThumbnailNamespace(userInfo));
  return Promise.all(filenames.map(async (filename) => await generateImageUrl(filename, 'read')));
}

export async function generateImageUploadUrl(userInfo: UserInfo, filename: string): Promise<string> {
  return await generateImageUrl(`${getImageNamespace(userInfo)}/${filename}`, 'write');
}
