import * as dotenv from 'dotenv';
import Fastify from "fastify";
import appService from "./app.js";

dotenv.config();

const server = Fastify({
  logger: true
})

server.register(appService);

// Start listening.
(async () => {
  try {
    await server.listen({port: Number(process.env.PORT) || 3000, host: '0.0.0.0'});
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
