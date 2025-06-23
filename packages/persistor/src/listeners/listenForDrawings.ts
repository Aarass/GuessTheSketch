import { drawingsQueueName, type QueuedDrawing } from "@guessthesketch/common";
import amqp from "amqplib";
import { repository, type Entry } from "../repositories/drawingRepository";

export async function listenForDrawings(channel: amqp.Channel) {
  await channel.assertQueue(drawingsQueueName);

  channel.consume(drawingsQueueName, async (msg) => {
    if (msg) {
      const obj = JSON.parse(msg.content.toString()) as QueuedDrawing;

      const entry: Entry = {
        roomId: obj.roomId,
        gameId: obj.gameId,
        roundId: obj.roundId,
        drawing: JSON.stringify(obj.drawing),
      };

      try {
        console.log("about to save to redis");
        await repository.save(entry);
        console.log("success");
      } catch (err) {
        console.error(err);
      }

      channel.ack(msg);
    }
  });
}
