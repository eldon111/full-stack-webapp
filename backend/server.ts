import * as dotenv from 'dotenv';
import Fastify from "fastify";
import closeWithGrace from "close-with-grace";
import appService from "./app.js";

dotenv.config();

const app = Fastify({
    logger: true
})
app.register(appService)

// delay is the number of milliseconds for the graceful close to finish
closeWithGrace({ delay: Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500 }, async function ({ signal, err, manual }) {
    if (err) {
        app.log.error(err)
    }
    await app.close()
})

// Start listening.
app.listen({ port: Number(process.env.PORT) || 3000 }, (err) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
})