'use strict'

import path from "node:path"
import AutoLoad from "@fastify/autoload"
import {FastifyInstance, FastifyPluginAsync} from "fastify"
import cors from "@fastify/cors";
import closeWithGrace from "close-with-grace";

import secureSession from "@fastify/secure-session";
import fastifyCookie from "@fastify/cookie";
import {Token} from "@fastify/oauth2";
import {accessSecretAsBuffer} from "./utils/secretManagement";
import {fastifyTRPCPlugin, FastifyTRPCPluginOptions} from "@trpc/server/adapters/fastify";
import {AppRouter, appRouter} from "./routes/router";
import {createContext} from "./trpc";
import ws from '@fastify/websocket';

const appService: FastifyPluginAsync = async (server: FastifyInstance) => {

  // delay is the number of milliseconds for the graceful close to finish
  closeWithGrace({delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500}, async function ({err}) {
    if (err) {
      server.log.error(err)
    }
    await server.close()
  })

  server.register(fastifyCookie); // Required for sessions

  server.register(secureSession, {
    key: await accessSecretAsBuffer('secure-session-key'),
    expiry: 24 * 60 * 60, // Default 1 day
    cookie: {
      path: '/'
    }
  });

  server.register(ws);

  server.register(fastifyTRPCPlugin, {
    prefix: '/api',
    useWSS: true,
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({path, error}) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  });

  server.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      server.log.info('CORS origin: ', origin)
      if (!origin) {
        // TODO: better handling of missing origin
        // return cb(new Error("Not allowed"), false)
        return cb(null, true)
      }
      const hostname = new URL(origin).hostname
      if (hostname === "localhost") {
        server.log.info('localhost, no CORS protection')
        //  Request from localhost will pass
        cb(null, true)
      } else {
        //   Generate an error on other origins, disabling access
        cb(new Error("Not allowed"), false)
      }
    },
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({})
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({})
  })
}

declare module '@fastify/secure-session' {
  interface SessionData {
    accessToken?: Token;
    userInfo?: any;
  }
}

export default appService