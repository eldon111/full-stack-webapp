'use strict';

import { generateImageUploadUrl, generateImageURLs, generateThumbnailURLs } from '../utils/imageStorage';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { listenToThumbnailCreated } from '../utils/pubsub';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export const imageRouter = router({
  getImageUrls: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/images/image-urls' } })
    .input(z.void())
    .output(z.array(z.string()))
    .query(async (opts): Promise<string[]> => {
      return await generateImageURLs(opts.ctx.userInfo!);
    }),
  getThumbnailUrls: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/images/thumbnail-urls' } })
    .input(z.void())
    .output(z.array(z.string()))
    .query(async (opts): Promise<string[]> => {
      return await generateThumbnailURLs(opts.ctx.userInfo!);
    }),
  uploadUrl: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/images/upload-url' } })
    .input(
      z.object({
        filename: z.string().min(3),
      }),
    )
    .output(z.string())
    .query(async (opts): Promise<string> => {
      const { filename } = opts.input;
      return await generateImageUploadUrl(opts.ctx.userInfo!, filename);
    }),
  waitForThumbnail: publicProcedure
    // .meta({openapi: {method: "GET", path: "/images/watch-thumbnails"}})
    // .input(z.void())
    .subscription(async function* () {
      const filenames: string[] = [];
      let resolveFunction: () => void;

      const createNewPromise = (): Promise<void> => new Promise((resolve) => (resolveFunction = resolve));

      let promise = createNewPromise();

      listenToThumbnailCreated(randomUUID(), (filename) => {
        const basename = path.basename(filename);
        filenames.push(basename);
        resolveFunction();
      });

      while (true) {
        await promise;
        const filename = filenames.shift();
        if (filenames.length === 0) {
          promise = createNewPromise();
        } else {
          promise = Promise.resolve();
        }
        if (filename) {
          yield filename;
        }
      }
    }),
});
