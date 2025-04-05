import {CloudEventV1} from "cloudevents/dist/event/interfaces";
import {Storage} from "@google-cloud/storage";
import sharp from "sharp";
import path from 'path'
import {PubSub} from "@google-cloud/pubsub";

// can't use import with this, or it doesn't work
const functions = require('@google-cloud/functions-framework');

const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 240;

const storage = new Storage();
const pubsub = new PubSub({projectId: 'avian-presence-455118-j3'});
const topic = pubsub.topic('thumbnail-created');
console.log(`Topic ${topic.name} accessed.`);

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent('generateThumbnail', async (cloudEvent: CloudEventV1<any>) => {
  if (!cloudEvent.data) {
    return;
  }

  const fileInfo = cloudEvent.data;
  await process(fileInfo.bucket, fileInfo.name);
});

async function process(bucket: string, filename: string) {
  const dirname = path.dirname(filename);
  if (dirname.includes('thumbnails')) {
    console.log(`skipping thumbnail ${filename}`);
    return;
  }

  const newDir = dirname.replace('/uploads','/thumbnails');
  const oldExt = path.extname(filename);
  const basename = path.basename(filename, oldExt);
  const newFilename = `${newDir}/${basename}.webp`

  const [buffer] = await storage
    .bucket(bucket)
    .file(filename)
    .download()

  await resizeImage(buffer)
    .then(function (data) {
      storage.bucket(bucket).file(newFilename).save(data)
    });

  try {
    const messageId = await topic.publishMessage({data: Buffer.from(filename)});
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(
      `Received error while publishing: ${(error as Error).message}`
    );
  }

  console.log("Done");
}

export async function resizeImage(buffer: Buffer | string): Promise<Buffer<ArrayBufferLike>> {
  return await sharp(buffer)
    .resize({
      fit: sharp.fit.cover,
      position: sharp.strategy.attention,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
    })
    .webp()
    .toBuffer();
}