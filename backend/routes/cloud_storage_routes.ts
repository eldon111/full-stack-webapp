'use strict'

import {FastifyInstance, FastifyPluginAsync, FastifyRequest} from 'fastify';
import path from 'path';
import fs from 'fs';
import multipart from "@fastify/multipart";
import {promisify} from "util";
import {pipeline} from "stream";
import {authenticationGuard} from "../utils/authenticationGuardMiddleware";

// Promisify the pipeline method for handling file streams.
const pump = promisify(pipeline);

const storageRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const tempDirPath = path.join(__dirname, '..', 'uploads');

  // Ensure uploads directory exists
  const uploadDir = path.dirname(tempDirPath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
  }

  function getNamespace(request: FastifyRequest): string {
    return `uploads/${request.session.get('userInfo').email}`;
  }

  // Enable Fastify multipart plugin to handle file uploads
  fastify.register(multipart);

  // Upload a file to Google Cloud Storage
  fastify.post('/storage/image/upload', {preHandler: [authenticationGuard]}, async (request, reply) => {
    try {
      for await (const data of request.files()) {
        const {fieldname, filename, mimetype, file} = data; // Extract file data

        // TODO: check mimetype?

        if (!file) {
          return reply.status(400).send({error: 'No file was provided. Please upload a file.'});
        }

        // Create a temporary file path to save the uploaded file locally
        const tempFilePath = path.join(uploadDir, filename);

        // Save the file locally using a stream
        const writeStream = fs.createWriteStream(tempFilePath);
        await pump(file, writeStream);

        // Upload file to GCS using the plugin method
        const destination = [getNamespace(request), filename].join('/'); // Destination in the bucket
        const result = await fastify.uploadToStorage(tempFilePath, destination);

        // Clean up the temporary file after upload
        fs.unlinkSync(tempFilePath);
      }

      reply.send({message: "success"});
    } catch (error: any) {
      fastify.log.error(error);
      reply.status(500).send({error: error.message || 'An error occurred during file upload'});
    }
  });

  // Read a list of files from Google Cloud Storage
  fastify.get(
    '/storage/image/list',
    {preHandler: [authenticationGuard]},
    async (request, reply) => {
      try {
        const filenames = await fastify.listFiles(getNamespace(request))
        const urls = Promise.all(
          filenames.map(async fn => await fastify.generateImageUrl(fn))
        );

        reply.send(await urls);
      } catch (error: any) {
        fastify.log.error(error);
        reply.status(500).send({error: error.message || 'An error occurred while reading the file from storage'});
      }
    });

  // Read a file from Google Cloud Storage
  fastify.get('/storage/image/read', {preHandler: [authenticationGuard]}, async (request, reply) => {
    try {
      const query = request.query as { fileName: string };

      // Validate query parameters
      if (!query.fileName) {
        return reply.status(400).send({error: 'fileName is required'});
      }

      // Use the plugin's method to read the file
      const fileBuffer = await fastify.readFromStorage([getNamespace(request), query.fileName].join('/'));
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
      reply.status(500).send({error: error.message || 'An error occurred while reading the file from storage'});
    }
  });
};

export default storageRoutes;