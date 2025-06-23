import {
  roundReplayQueueName,
  type Drawing,
  type GetRoundReplayDto,
  type RoundReplay,
} from "@guessthesketch/common";
import amqp from "amqplib";
import { repository } from "../repositories/DrawingRepository";

export async function listenForRequests(channel: amqp.Channel) {
  handle(roundReplayQueueName, async (_input) => {
    // TODO mozda uraditi validaciju?
    const input = _input as GetRoundReplayDto;

    const entries = await repository
      .search()
      .where("roomId")
      .equals(input.roomId)
      .and("gameId")
      .equals(input.gameId)
      .and("roundId")
      .equals(input.roundId)
      .return.all();

    const res: RoundReplay = entries.map(
      (entry) => JSON.parse(entry.drawing) as Drawing,
    );
    return res;
  });

  async function handle(queue: string, handler: (_data: any) => Promise<any>) {
    await channel.assertQueue(queue);

    channel.consume(
      queue,
      async (msg) => {
        if (!msg) {
          console.error("Message is null");
          return;
        }

        if (!msg.properties.replyTo) {
          console.error("Message has no set replyTo field");
          return;
        }

        if (!msg.properties.correlationId) {
          console.error("Message has no set correlationId field");
          return;
        }

        let input;
        try {
          input = JSON.parse(msg.content.toString());
        } catch {
          console.log("parse failed");
          return;
        }

        let response;
        try {
          response = await handler(input);
        } catch (err) {
          console.log("handler failed", err);
          return;
        }

        let res;
        try {
          res = JSON.stringify(response);
        } catch {
          console.log("stringify failed");
          return;
        }

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(res), {
          correlationId: msg.properties.correlationId,
        });
      },
      { noAck: true },
    );
  }
}
