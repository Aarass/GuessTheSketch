import amqp from "amqplib";

export async function listenForDrawings(channel: amqp.Channel) {
  const queue = "drawings";
  await channel.assertQueue(queue);

  channel.consume(queue, (msg) => {
    if (msg) {
      console.log("Received in drawings:", msg.content.toString());
      channel.ack(msg);
    }
  });
}
