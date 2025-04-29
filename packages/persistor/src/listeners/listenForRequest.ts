import { replayQueueName } from "@guessthesketch/common";
import amqp from "amqplib";

export async function listenForRequests(channel: amqp.Channel) {
  const { queue: requestQueue } = await channel.assertQueue(replayQueueName);

  channel.consume(requestQueue, async (msg) => {
    if (msg === null) {
      console.error("Msg is null");
      return;
    }

    console.log("Received in requests:", msg.content.toString());

    if (!msg.properties.replyTo) {
      console.error("Message has no set replyTo field");
      return;
    }

    if (!msg.properties.correlationId) {
      console.error("Message has no set correlationId field");
      return;
    }

    channel.sendToQueue(msg.properties.replyTo, Buffer.from("Roger that"), {
      correlationId: msg.properties.correlationId,
    });

    channel.ack(msg);
  });
}
