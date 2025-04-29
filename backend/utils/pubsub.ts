'use strict';

import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({ projectId: 'avian-presence-455118-j3' });

const thumbnailCreatedListeners: { [key: string]: (filename: string) => void } = {};

const thumbnailCreatedSubscription = pubsub.subscription('thumbnail-created-sub');
thumbnailCreatedSubscription.on('message', (message) => {
  for (const listener of Object.values(thumbnailCreatedListeners)) {
    listener(message.data.toString());
  }
  message.ack();
});

export function listenToThumbnailCreated(id: string, listener: (filename: string) => void) {
  thumbnailCreatedListeners[id] = listener;
}

export function stopListeningToThumbnailCreated(id: string) {
  delete thumbnailCreatedListeners[id];
}
