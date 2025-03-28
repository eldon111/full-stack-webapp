'use strict'

const fp = require('fastify-plugin')
const swagger = require('@fastify/swagger')

module.exports = fp(async (fastify) => {
    fastify.register(swagger);
});