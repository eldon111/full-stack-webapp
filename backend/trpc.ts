import { initTRPC, TRPCError } from '@trpc/server';
import { FastifyRequest } from 'fastify';
import { Token } from '@fastify/oauth2';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import '@fastify/secure-session';
import { Session } from '@fastify/secure-session';
import { OpenApiMeta } from 'trpc-to-openapi';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createContext>().meta<OpenApiMeta>().create();

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware((opts) => {
  if (!opts.ctx.token || !opts.ctx.userInfo) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      token: opts.ctx.token,
    },
  });
});

function getCurrentToken(request: FastifyRequest): Token | undefined {
  return request.session?.get('accessToken') as unknown as Token | undefined;
}

function getCurrentUserInfo(request: FastifyRequest): UserInfo | undefined {
  return request.session?.get('userInfo');
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const token: Token | undefined = getCurrentToken(req);
  const userInfo: UserInfo | undefined = getCurrentUserInfo(req);
  return { req, res, token, userInfo };
}

// Create another context type for protected routes, so ctx.token won't be null in authed requests
export type AuthenticatedContext = Awaited<ReturnType<typeof createContext>>;

export type UserInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: Boolean;
};

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(isAuthenticated);

// Add type declaration for FastifyRequest to include session property
declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
  }
}
