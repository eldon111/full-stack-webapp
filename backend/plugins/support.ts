'use strict'

import fastifyPlugin from 'fastify-plugin';
import {FastifyInstance, FastifyPluginAsync} from 'fastify';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const supportPlugin: FastifyPluginAsync = fastifyPlugin(async function (fastify: FastifyInstance) {
  console.log('loading support plugin')
  fastify.decorate('someSupport', function () {
    return 'hugs'
  })
})

export default supportPlugin
