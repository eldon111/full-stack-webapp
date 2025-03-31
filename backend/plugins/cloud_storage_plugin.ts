'use strict'

import {FastifyInstance, FastifyPluginAsync} from 'fastify';
import {Bucket, Storage} from '@google-cloud/storage';
import fastifyPlugin from "fastify-plugin";

const storagePlugin: FastifyPluginAsync = fastifyPlugin(async function (fastify: FastifyInstance) {
    const IMAGE_BUCKET_NAME = 'eldons-full-stack-webapp-images';

    // Initialize Google Cloud Storage Client
    const storage = new Storage();

    // Helper function to get a bucket reference
    function getBucketByName(bucketName: string): Bucket {
        return storage.bucket(bucketName);
    }

    // Method to upload a file to a specified bucket
    fastify.decorate('uploadToStorage', async (filePath: string, destination: string): Promise<string> => {
        try {
            const bucket = getBucketByName(IMAGE_BUCKET_NAME);
            await bucket.upload(filePath, {
                destination: destination,
            });
            return `File uploaded to ${IMAGE_BUCKET_NAME}/${destination}`;
        } catch (error) {
            fastify.log.error(`Error uploading file to bucket: ${error}`);
            throw error;
        }
    });

    // Method to read a file from a specified bucket
    fastify.decorate('readFromStorage', async (fileName: string): Promise<Buffer> => {
        try {
            const bucket = getBucketByName(IMAGE_BUCKET_NAME);
            const file = bucket.file(fileName);
            const [contents] = await file.download();
            return contents;
        } catch (error) {
            fastify.log.error(`Error reading file from bucket: ${error}`);
            throw error;
        }
    });
});

// Declare additional methods added to Fastify
declare module 'fastify' {
    interface FastifyInstance {
        uploadToStorage(filePath: string, destination: string): Promise<string>;
        readFromStorage(fileName: string): Promise<Buffer>;
    }
}

export default storagePlugin;