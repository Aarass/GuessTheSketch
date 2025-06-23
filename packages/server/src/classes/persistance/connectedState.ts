import {
  drawingsQueueName,
  roundReplayQueueName,
  type Drawing,
  type GetRoundReplayDto,
  type QueuedDrawing,
  type RoomId,
  type RoundReplay,
} from "@guessthesketch/common";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";
import type { Channel } from "amqplib";
import { v4 as uuid } from "uuid";
import type { PersistanceServiceState } from "./stateInterface";

export class ConnectedState implements PersistanceServiceState {
  private constructor(private channel: Channel) {}

  private async init() {
    await this.channel.assertQueue(drawingsQueueName);
    await this.channel.assertQueue(roundReplayQueueName);
  }

  static async create(channel: Channel) {
    const instance = new ConnectedState(channel);
    await instance.init();
    return instance;
  }

  public notifyNewDrawing(
    room: RoomId,
    game: GameId,
    round: RoundId,
    drawing: Drawing,
  ) {
    const obj = {
      roomId: room,
      gameId: game,
      roundId: round,
      drawing,
    } satisfies QueuedDrawing;

    console.log("about to sent to queue", obj);

    this.channel.sendToQueue(
      drawingsQueueName,
      Buffer.from(JSON.stringify(obj)),
    );
  }

  public getRoundReplay(dto: GetRoundReplayDto) {
    return this.makeRPC<RoundReplay>(roundReplayQueueName, dto);
  }

  private makeRPC<T>(queueName: string, args: any): Promise<T> {
    return TimeoutablePromise(
      3000,
      new Promise<T>(async (resolve) => {
        const { queue: responseQueue } = await this.channel.assertQueue("", {
          exclusive: true,
        });

        const correlationId = uuid();

        const { consumerTag } = await this.channel.consume(
          responseQueue,
          async (msg) => {
            if (msg === null) {
              console.error("Msg is null");
              return;
            }

            if (msg.properties.correlationId !== correlationId) {
              this.channel.nack(msg);
              return;
            }

            resolve(JSON.parse(msg.content.toString()));

            this.channel.ack(msg);
            await this.channel.cancel(consumerTag);
          },
        );

        this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(args)), {
          correlationId: correlationId,
          replyTo: responseQueue,
        });
      }),
    );
  }
}

function TimeoutablePromise<T>(ms: number, promise: Promise<T>) {
  return Promise.race([wait(ms), promise]) as Promise<T>;
}

function wait(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
}
