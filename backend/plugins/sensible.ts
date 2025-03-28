'use strict'

import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fastifySensible from "@fastify/sensible";

/**
 * This plugin adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
const sensiblePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) =>  {
    console.log('loading sensible plugin')
    await fastify.register(fastifySensible, {})
}

export default sensiblePlugin