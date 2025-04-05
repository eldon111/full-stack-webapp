import {publicProcedure, router} from "../trpc";

export const usersRouter = router({
  loggedIn: publicProcedure.query((opts) => !!opts.ctx.userInfo),
})