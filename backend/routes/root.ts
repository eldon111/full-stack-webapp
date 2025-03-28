'use strict'

import {FastifyInstance, FastifyPluginAsync} from 'fastify';

const rootRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) =>  {
  fastify.get('/', async function () {
    return {root: true}
  })
}

export default rootRoutes
