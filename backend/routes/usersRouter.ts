import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

export const usersRouter = router({
  loggedIn: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/users/logged-in' } })
    .input(z.void())
    .output(z.boolean())
    .query((opts) => !!opts.ctx.userInfo),
});
