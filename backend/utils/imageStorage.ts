import {Bucket, GetSignedUrlConfig, Storage} from "@google-cloud/storage";
import {UserInfo} from "../trpc";

const IMAGE_BUCKET_NAME = 'eldons-full-stack-webapp-images';

// Initialize Google Cloud Storage Client
const storage = new Storage();

// Helper function to get a bucket reference
function getBucketByName(bucketName: string): Bucket {
  return storage.bucket(bucketName);
}

function getImageNamespace(userInfo: UserInfo): string {
  return `${userInfo.email}/uploads`;
}

function getThumbnailNamespace(userInfo: UserInfo): string {
  return `${userInfo.email}/thumbnails`;
}

async function listFilenames(namespace: string): Promise<string[]> {
  const options = {
    prefix: namespace,
  };

  const bucket = getBucketByName(IMAGE_BUCKET_NAME);
  const [files] = await bucket.getFiles(options);
  return files.map(file => file.name);
}

async function generateImageUrl(fileName: string, action: 'read' | 'write' | 'delete' | 'resumable'): Promise<string> {
  const bucket = getBucketByName(IMAGE_BUCKET_NAME);

  // These options will allow temporary read access to the file
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: action,
    expires: Date.now() + 60 * 60 * 1000, // 60 minutes
  };

  // Get a v4 signed URL for reading the file
  const [url] = await bucket
    .file(fileName)
    .getSignedUrl(options);

  return url;
}

export async function generateImageURLs(userInfo: UserInfo): Promise<string[]> {
  const filenames = await listFilenames(getImageNamespace(userInfo))
  return Promise.all(
    filenames
      .map(async filename => await generateImageUrl(filename, 'read'))
  );
}

export async function generateThumbnailURLs(userInfo: UserInfo): Promise<string[]> {
  const filenames = await listFilenames(getThumbnailNamespace(userInfo))
  return Promise.all(
    filenames
      .map(async filename => await generateImageUrl(filename, 'read'))
  );
}

export async function generateImageUploadUrl(userInfo: UserInfo, filename: string): Promise<string> {
  return await generateImageUrl(`${getImageNamespace(userInfo)}/${filename}`, 'write')
}