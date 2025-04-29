'use strict';

import { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyOauth2, { OAuth2Namespace, Token } from '@fastify/oauth2';
import { accessSecret } from '../utils/secretManagement';

async function oauthPlugin(fastify: FastifyInstance) {
  console.log('loading oauth2 plugin');

  function getCurrentToken(request: FastifyRequest): Token | undefined {
    return request.session.get('accessToken') as unknown as Token | undefined;
  }

  await fastify.register(fastifyOauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: await accessSecret('oauth-client-id'),
        secret: await accessSecret('oauth-client-secret'),
      },
    },
    discovery: {
      issuer: 'https://accounts.google.com',
    },
    callbackUri: (req) => {
      return req.port
        ? `${req.protocol}://${req.hostname}:${req.port}/login/google/callback`
        : `${req.protocol}://${req.hostname}/login/google/callback`;
    },
  });

  fastify.get('/login/google', { cors: false }, async (request, reply) => {
    reply.redirect(await fastify.googleOAuth2.generateAuthorizationUri(request, reply));
  });

  fastify.get('/login/google/callback', function (request, reply) {
    this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, (err: any, result: any) => {
      if (err) {
        reply.send(err);
        return;
      }

      request.session.set('accessToken', result.token);

      this.googleOAuth2.userinfo(result.token, (err: any, userinfo: Object) => {
        if (err) {
          reply.send(err);
          return;
        }
        console.log('userInfo: ', userinfo);
        request.session.set('userInfo', userinfo);
        reply.redirect(process.env.FRONTEND_URL || '/');
      });
    });
  });

  fastify.get('/logout', { cors: false }, async (request, reply) => {
    const token = getCurrentToken(request);
    if (!token) return reply.redirect(request.headers.referer || '/');
    try {
      await fastify.googleOAuth2.revokeToken(token, 'access_token', undefined);
    } catch (e) {
      console.error(e);
    }
    request.session.delete();
    reply.redirect(process.env.FRONTEND_URL || '/');
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

export default oauthPlugin;
