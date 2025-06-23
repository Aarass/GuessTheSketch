import {
  drawingsQueueName,
  type RoomId,
  type Drawing,
  type QueuedDrawing,
} from "@guessthesketch/common";
import type { Channel } from "amqplib";
import type { PersistanceServiceState } from "./stateInterface";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export class ConnectedState implements PersistanceServiceState {
  constructor(private channel: Channel) {}

  public async init() {
    await this.channel.assertQueue(drawingsQueueName);
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

  public getGameReplay(roomId: string, gameId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public getRoundReplay(
    roomId: string,
    gameId: string,
    roundId: string,
  ): Promise<Drawing[]> {
    throw new Error("Method not implemented.");
  }
}
