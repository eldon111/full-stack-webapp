'use strict'

import path from "node:path"
import AutoLoad from "@fastify/autoload"
import {FastifyInstance, FastifyPluginAsync} from "fastify"

const startServer: FastifyPluginAsync = async (server: FastifyInstance) => {

    // Place here your custom code!

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

export default startServer