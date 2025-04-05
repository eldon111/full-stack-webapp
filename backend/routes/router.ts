import {router} from "../trpc";
import {imageRouter} from "./imageRouter";
import {usersRouter} from "./usersRouter";

export const appRouter = router({
  users: usersRouter,
  image: imageRouter,
});

export type AppRouter = typeof appRouter;