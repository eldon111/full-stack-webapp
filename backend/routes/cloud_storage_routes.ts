'use strict'

import {FastifyInstance, FastifyPluginAsync} from 'fastify';
import path from 'path';
import fs from 'fs';
import multipart from "@fastify/multipart";
import {promisify} from "util";
import {pipeline} from "stream";

// Promisify the pipeline method for handling file streams.
const pump = promisify(pipeline);

const storageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    const tempDirPath = path.join(__dirname, '..', 'uploads');

    // Ensure uploads directory exists
    const uploadDir = path.dirname(tempDirPath);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Enable Fastify multipart plugin to handle file uploads
    fastify.register(multipart);

    // Upload a file to Google Cloud Storage
    fastify.post('/storage/image/upload', async (request, reply) => {
        // TODO: verify user

        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'No file was uploaded.' });
            }
            const { fieldname, filename, mimetype, file } = data; // Extract file data

            // TODO: check mimetype

            if (!file) {
                return reply.status(400).send({ error: 'No file was provided. Please upload a file.' });
            }

            // Create a temporary file path to save the uploaded file locally
            const tempFilePath = path.join(uploadDir, filename);

            // Save the file locally using a stream
            const writeStream = fs.createWriteStream(tempFilePath);
            await pump(file, writeStream);

            // Upload file to GCS using the plugin method
            const destination = `uploads/${filename}`; // Destination in the bucket
            const result = await fastify.uploadToStorage(tempFilePath, destination);

            // Clean up the temporary file after upload
            fs.unlinkSync(tempFilePath);

            reply.send({ message: result, fileName: filename, destination });
        } catch (error: any) {
            fastify.log.error(error);
            reply.status(500).send({ error: error.message || 'An error occurred during file upload' });
        }
    });

    // Read a file from Google Cloud Storage
    fastify.get('/storage/image/read', async (request, reply) => {
        try {
            const query = request.query as { fileName: string };

            // Validate query parameters
            if (!query.fileName) {
                return reply.status(400).send({ error: 'fileName is required' });
            }

            // Use the plugin's method to read the file
            const fileBuffer = await fastify.readFromStorage(query.fileName);
            const fileExtension = path.extname(query.fileName).toLowerCase();

            // Handle content-type based on file extension
            const contentTypeMap: { [key: string]: string } = {
                '.txt': 'text/plain',
                '.json': 'application/json',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.pdf': 'application/pdf',
            };

            reply
                .headers({
                    'Content-Type': contentTypeMap[fileExtension] || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename=${query.fileName}`,
                })
                .send(fileBuffer);
        } catch (error: any) {
            fastify.log.error(error);
            reply.status(500).send({ error: error.message || 'An error occurred while reading the file from storage' });
        }
    });
};

export default storageRoutes;