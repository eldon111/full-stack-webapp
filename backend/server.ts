import * as dotenv from 'dotenv';
import Fastify from "fastify";
import appService from "./app.js";

dotenv.config();

const server = Fastify({
  logger: true,
  maxParamLength: 5000,
})

server.register(appService);

// Start listening.
(async () => {
  try {
    process.on('unhandledRejection', (reason, promise) => {
      console.log(reason, promise);
      // TODO: better error-handling
    });
    await server.listen({port: Number(process.env.PORT) || 3000, host: '0.0.0.0'});
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
