'use strict';

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });

const thumbnailCreatedListeners: { [key: string]: (filename: string) => void } = {};

// Start polling SQS queue
let isPolling = false;
let pollingInterval: NodeJS.Timeout | null = null;

async function pollSQSQueue() {
  if (!isPolling) return;

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_QUEUE,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20, // Long polling
    });

    const response = await sqsClient.send(command);

    if (response.Messages && response.Messages.length > 0) {
      for (const message of response.Messages) {
        // Process the message
        if (message.Body) {
          for (const listener of Object.values(thumbnailCreatedListeners)) {
            listener(message.Body);
          }
        }

        // Delete the message from the queue
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: process.env.SQS_QUEUE,
          ReceiptHandle: message.ReceiptHandle,
        });

        await sqsClient.send(deleteCommand);
      }
    }
  } catch (error) {
    console.error('Error polling SQS queue:', error);
  }

  // Schedule the next poll
  pollingInterval = setTimeout(pollSQSQueue, 1000);
}

// Start polling when the first listener is added
function startPolling() {
  if (!isPolling && Object.keys(thumbnailCreatedListeners).length > 0) {
    isPolling = true;
    pollSQSQueue();
  }
}

// Stop polling when the last listener is removed
function stopPolling() {
  if (isPolling && Object.keys(thumbnailCreatedListeners).length === 0) {
    isPolling = false;
    if (pollingInterval) {
      clearTimeout(pollingInterval);
      pollingInterval = null;
    }
  }
}

export function listenToThumbnailCreated(id: string, listener: (filename: string) => void) {
  thumbnailCreatedListeners[id] = listener;
  startPolling();
}

export function stopListeningToThumbnailCreated(id: string) {
  delete thumbnailCreatedListeners[id];
  stopPolling();
}
