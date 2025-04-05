'use strict';

import {PubSub} from "@google-cloud/pubsub";

const pubsub = new PubSub({projectId: 'avian-presence-455118-j3'});

const listeners: {[key: string]: (filename: string) => void} = {};

const subscription = pubsub.subscription('thumbnail-created-sub');
subscription.on('message', message => {
  for (const listener of Object.values(listeners)) {
    listener(message.data.toString());
  }
  message.ack();
});

export function listenToThumbnailCreated(id: string, listener: (filename: string) => void) {
  listeners[id] = listener;
}

export function stopListeningToThumbnailCreated(id: string) {
  delete listeners[id];
}
