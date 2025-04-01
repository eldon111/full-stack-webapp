'use strict'

import path from "node:path"
import AutoLoad from "@fastify/autoload"
import {FastifyInstance, FastifyPluginAsync} from "fastify"
import cors from "@fastify/cors";
import {fastifyTRPCPlugin, FastifyTRPCPluginOptions} from "@trpc/server/adapters/fastify";
import {AppRouter, appRouter} from "./routes/router";
import {createContext} from "./routes/context";
import closeWithGrace from "close-with-grace";

const appService: FastifyPluginAsync = async (server: FastifyInstance) => {

  // delay is the number of milliseconds for the graceful close to finish
  closeWithGrace({delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500}, async function ({signal, err, manual}) {
    if (err) {
      server.log.error(err)
    }
    await server.close()
  })

  server.register(cors, {
    origin: (origin, cb) => {
      server.log.info(origin)
      if (!origin) return cb(new Error("Not allowed"), false)
      const hostname = new URL(origin).hostname
      if (hostname === "localhost") {
        server.log.info('localhost')
        //  Request from localhost will pass
        cb(null, true)
      } else {
        //   Generate an error on other origins, disabling access
        cb(new Error("Not allowed"), false)
      }
    },
  })

  server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({path, error}) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
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

export default appService