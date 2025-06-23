import type { QueuedDrawing } from "@guessthesketch/common";
import { Repository, Schema } from "redis-om";
import { client } from "../drivers/redis";

export type Entry = Omit<QueuedDrawing, "drawing"> & { drawing: string };

const schema = new Schema<Entry>("Drawing", {
  roomId: { type: "string" },
  gameId: { type: "string" },
  roundId: { type: "string" },
  drawing: { type: "string" },
});

export const repository = new Repository(schema, client);
