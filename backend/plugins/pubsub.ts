'use strict';

import {FastifyInstance, FastifyPluginAsync} from "fastify";
import {PubSub} from "@google-cloud/pubsub";

const pubsub = new PubSub({projectId: 'avian-presence-455118-j3'});

const pubsubPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  console.log('loading pub/sub plugin');

  const subscription = pubsub.subscription('thumbnail-created-sub');

  // Receive callbacks for new messages on the subscription
  subscription.on('message', message => {
    console.log('Received message', message.id, message.ackId, message.data.toString());
    message.ack();
  });

  // Receive callbacks for errors on the subscription
  subscription.on('error', error => {
    console.error('Received error:', error);
  });
}

export default pubsubPlugin