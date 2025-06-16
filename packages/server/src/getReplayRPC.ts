/* eslint-disable */
import amqp from "amqplib";
import { v4 as uuid } from "uuid";

import { replayQueueName } from "@guessthesketch/common";

export async function GetReplayRPC(
  conn: amqp.ChannelModel,
  responseQueue: string,
  someIdentifier: any, // TODO:
  timeout: number = 2000,
) {
  const correlationId = uuid();
  const channel = await conn.createChannel();
  const { queue: requestsQueue } = await channel.assertQueue(replayQueueName);

  const promise = new Promise<Buffer<ArrayBufferLike>>(async (resolve) => {
    const { consumerTag } = await channel.consume(
      responseQueue,
      async (msg) => {
        if (msg === null) return console.error("Msg is null");

        if (msg.properties.correlationId !== correlationId)
          return channel.nack(msg);

        resolve(msg.content);

        channel.ack(msg);
        await channel.cancel(consumerTag);
      },
    );

    channel.sendToQueue(
      requestsQueue,
      Buffer.from("get replay for this and this room and game" /*TODO:*/),
      {
        correlationId: correlationId,
        replyTo: responseQueue,
      },
    );
  });

  return TimeoutablePromise(promise, timeout);
}

function TimeoutablePromise<T>(promise: Promise<T>, ms: number) {
  return Promise.race([wait(ms), promise]) as Promise<T>;
}

function wait(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
}

// Test

const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();
const { queue: responseQueue } = await channel.assertQueue("", {
  exclusive: true,
});

const tmp = await GetReplayRPC(connection, responseQueue, null);
console.log(tmp.toString());
