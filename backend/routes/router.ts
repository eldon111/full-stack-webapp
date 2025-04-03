import {protectedProcedure, publicProcedure, router} from "../trpc";
import {generateImageUploadUrl, generateImageURLs} from "../plugins/imageStorage";
import {z} from "zod";

export const appRouter = router({
  users: router({
    loggedIn: publicProcedure.query((opts) => opts.ctx.userInfo !== null),
  }),
  image: router({
    list: protectedProcedure.query(async (opts): Promise<string[]> => {
      return await generateImageURLs(opts.ctx.userInfo!)
    }),
    uploadUrl: protectedProcedure
      .input(
        z.object({
          filename: z.string().min(3),
        }),
      )
      .query(async (opts): Promise<string> => {
        const { filename } = opts.input;
        return await generateImageUploadUrl(opts.ctx.userInfo!, filename);
      })
  }),
});

export type AppRouter = typeof appRouter;