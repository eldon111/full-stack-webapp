import {FastifyReply, FastifyRequest} from 'fastify';
import {Token} from "@fastify/oauth2";


export function getCurrentToken(request: FastifyRequest): Token | undefined {
  return (request.session.get('accessToken') as unknown as Token | undefined);
}

export async function authenticationGuard(request: FastifyRequest, reply: FastifyReply) {
  const accessToken = getCurrentToken(request)?.access_token;

  if (!accessToken) {
    reply.code(401).send({ message: 'Unauthorized' }); // User is not authenticated
    return;
  }

  try {
    // Optional: Validate token with a remote provider if needed
    // await validateTokenWithProvider(token);
    // Proceed if token is valid
    return;
  } catch (error) {
    reply.code(403).send({ message: 'Invalid or expired token' });
  }
}