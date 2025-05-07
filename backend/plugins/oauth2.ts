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
      console.log(req);
      return req.port
        ? `https://${req.hostname}:${req.port}/login/google/callback`
        : `https://${req.hostname}/login/google/callback`;
    },
  });

  fastify.get('/login/google', async (request, reply) => {
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
        // Redirect to the static website after successful login
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        reply.redirect(frontendUrl);
      });
    });
  });

  fastify.get('/logout', async (request, reply) => {
    const token = getCurrentToken(request);
    if (!token) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return reply.redirect(frontendUrl);
    }
    try {
      await fastify.googleOAuth2.revokeToken(token, 'access_token', undefined);
    } catch (e) {
      console.error(e);
    }
    request.session.delete();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    reply.redirect(frontendUrl);
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
