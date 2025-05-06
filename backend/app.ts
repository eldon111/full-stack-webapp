'use strict';

import path from 'node:path';
import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import closeWithGrace from 'close-with-grace';

import secureSession from '@fastify/secure-session';
import fastifyCookie from '@fastify/cookie';
import { Token } from '@fastify/oauth2';
import { accessSecretAsBuffer } from './utils/secretManagement';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { AppRouter, appRouter } from './routes';
import { createContext } from './trpc';
import ws from '@fastify/websocket';

const appService: FastifyPluginAsync = async (server: FastifyInstance) => {
  // delay is the number of milliseconds for the graceful close to finish
  closeWithGrace({ delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500 }, async function ({ err }) {
    if (err) {
      server.log.error(err);
    }
    await server.close();
  });

  server.register(fastifyCookie); // Required for sessions

  server.register(secureSession, {
    key: await accessSecretAsBuffer('secure-session-key'),
    expiry: 24 * 60 * 60, // Default 1 day
    cookie: {
      path: '/',
      sameSite: 'none', // Allow cross-site cookies
      secure: true, // Required when sameSite is 'none'
      httpOnly: true, // Prevent JavaScript access to the cookie
    },
  });

  server.register(ws);

  server.register(fastifyTRPCPlugin, {
    prefix: '/api',
    useWSS: true,
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  });

  server.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      server.log.info('CORS origin: ', origin);
      if (!origin) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        return cb(null, true);
      }

      // Allow all origins in development and production
      // This is necessary for the static website to communicate with the backend
      return cb(null, true);

      // If you want to restrict to specific domains later, uncomment this code:
      /*
      const allowedOrigins = [
        'http://localhost:5173',
        'https://full-stack-webapp-frontend-dev-static.example.com',
        'https://full-stack-webapp-frontend-static.example.com'
      ];

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'), false);
      */
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}),
  });
};

declare module '@fastify/secure-session' {
  interface SessionData {
    accessToken?: Token;
    userInfo?: any;
  }
}

export default appService;
