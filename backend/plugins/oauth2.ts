'use strict'

import sget from 'simple-get';
import {FastifyInstance, FastifyPluginAsync} from "fastify";
import fastifyOauth2, {OAuth2Namespace} from "@fastify/oauth2";

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager').v1
const secretManagerClient = new SecretManagerServiceClient();

const oauthPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    console.log('loading oauth plugin')

    async function accessSecretVersion(name: String) {
        const [version] = await secretManagerClient.accessSecretVersion({
            name: name,
        });
        return version.payload.data.toString('utf8');
    }

    fastify.register(fastifyOauth2, {
        name: 'googleOAuth2',
        scope: ['profile'],
        credentials: {
            client: {
                id: await accessSecretVersion( 'projects/622349036584/secrets/oauth-client-id/versions/latest'),
                secret: await accessSecretVersion( 'projects/622349036584/secrets/oauth-client-secret/versions/latest'),
            },
            auth: fastifyOauth2.GOOGLE_CONFIGURATION
        },
        // register a fastify url to start the redirect flow to the service provider's OAuth2 login
        startRedirectPath: '/login/google',
        // service provider redirects here after user login
        callbackUri: 'http://localhost:3000/login/google/callback'
        // You can also define callbackUri as a function that takes a FastifyRequest and returns a string
        // callbackUri: req => `${req.protocol}://${req.hostname}/login/google/callback`
        // callbackUri: req => `${req.protocol}://${req.hostname}:${req.port}/login/google/callback`
    })

    fastify.get('/login/google/callback', function (request, reply) {
        this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, (err:any, result:any) => {
            if (err) {
                reply.send(err)
                return
            }

            sget.concat({
                url: 'https://www.googleapis.com/oauth2/v2/userinfo',
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + result.token.access_token
                },
                json: true
            }, function (err, _res, data) {
                if (err) {
                    reply.send(err)
                    return
                }
                reply.send(data)
            })
        })
    })
}

//Declare types for the plugin
declare module 'fastify' {
    interface FastifyInstance {
        googleOAuth2: OAuth2Namespace;
    }
}

export default oauthPlugin

