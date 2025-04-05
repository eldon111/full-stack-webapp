import {protectedProcedure, publicProcedure, router} from "../trpc";
import {generateImageUploadUrl, generateImageURLs, generateThumbnailURLs} from "../utils/imageStorage";
import {z} from "zod";
import {listenToThumbnailCreated} from "../utils/pubsub";
import path from "node:path";
import {randomUUID} from "node:crypto";

export const appRouter = router({
  users: router({
    loggedIn: publicProcedure.query((opts) => !!opts.ctx.userInfo),
  }),
  waitForThumbnail: publicProcedure
    .subscription(async function* () {
      const filenames: string[] = [];
      let resolveFunction: () => void;

      const createNewPromise = (): Promise<void> =>
        new Promise(resolve => resolveFunction = resolve);

      let promise = createNewPromise();

      listenToThumbnailCreated(
        randomUUID(),
        filename => {
          const basename = path.basename(filename);
          filenames.push(basename);
          resolveFunction();
        }
      )

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
  image: router({
    getImageUrls: protectedProcedure.query(async (opts): Promise<string[]> => {
      return await generateImageURLs(opts.ctx.userInfo!)
    }),
    getThumbnailUrls: protectedProcedure.query(async (opts): Promise<string[]> => {
      return await generateThumbnailURLs(opts.ctx.userInfo!)
    }),
    uploadUrl: protectedProcedure
      .input(
        z.object({
          filename: z.string().min(3),
        }),
      )
      .query(async (opts): Promise<string> => {
        const {filename} = opts.input;
        return await generateImageUploadUrl(opts.ctx.userInfo!, filename);
      }),
  }),
});

export type AppRouter = typeof appRouter;