'use strict'

import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fastifyOauth2, {OAuth2Namespace} from "@fastify/oauth2";
import {getCurrentToken} from "../utils/authenticationGuardMiddleware";
import {accessSecret} from "../utils/secretManagement";

const oauthPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  console.log('loading oauth2 plugin')

  await fastify.register(fastifyOauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: await accessSecret('oauth-client-id'),
        secret: await accessSecret('oauth-client-secret'),
      }
    },
    discovery: {
      issuer: 'https://accounts.google.com'
    },
    callbackUri: req => {
      return req.port
        ? `${req.protocol}://${req.hostname}:${req.port}/login/google/callback`
        : `${req.protocol}://${req.hostname}/login/google/callback`
    }
  })

  fastify.get('/login/google', {cors: false}, async (request, reply) => {
    reply.redirect(await fastify.googleOAuth2.generateAuthorizationUri(request, reply));
  });

  fastify.get('/login/google/callback', function (request, reply) {
    this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, (err: any, result: any) => {
      if (err) {
        reply.send(err)
        return
      }

      request.session.set('accessToken', result.token);

      this.googleOAuth2.userinfo(result.token, (err: any, userinfo: Object) => {
        console.log('userInfo: ', userinfo)
        request.session.set('userInfo', userinfo)
        // TODO: stop hard-coding
        reply.redirect('http://localhost:5173/')
      })
    })
  })

  fastify.get('/logout', {cors: false}, async (request, reply) => {
    const token = getCurrentToken(request);
    if (!token) return reply.redirect(request.headers.referer || '/');
    await fastify.googleOAuth2.revokeToken(token, 'access_token', undefined);
    request.session.delete();
    // TODO: stop hard-coding
    reply.redirect('http://localhost:5173/')
  });
}

//Declare types for the plugin
declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }

  interface RouteShorthandOptions {
    cors?: boolean;
  }
}

export default oauthPlugin

