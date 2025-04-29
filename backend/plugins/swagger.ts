'use strict';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifySwagger, { SwaggerOptions } from '@fastify/swagger';
import fastifyPlugin from 'fastify-plugin';

const swaggerPlugin: FastifyPluginAsync = fastifyPlugin(async function (fastify: FastifyInstance) {
  console.log('loading swagger plugin');

  const swaggerOptions: SwaggerOptions = {
    swagger: {
      info: {
        title: 'Full Stack Webapp API',
        description: 'API documentation',
        version: '1.0.0',
      },
    },
  };

  await fastify.register(fastifySwagger, swaggerOptions);

  fastify.decorate('generateOpenAPIJson', async (): Promise<string> => {
    return JSON.stringify(fastify.swagger(), null, 2);
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    generateOpenAPIJson(): Promise<string>;
  }
}

export default swaggerPlugin;
