'use strict'

import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fastifySwagger, {SwaggerOptions} from "@fastify/swagger";

const swaggerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) =>  {

    const swaggerOptions: SwaggerOptions =  {
        swagger: {
            info: {
                title: 'Full Stack Webapp API',
                description: 'API documentation',
                version: '1.0.0',
            },
        },
    }

    await fastify.register(fastifySwagger, swaggerOptions)
}

export default swaggerPlugin