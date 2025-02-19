import type { PlayerId } from "../types/types";

type Namespace = string;
type SocketId = string;

export interface Player {
  id: PlayerId;
  name: string;
  // socketIds: Map<Namespace, SocketId>;
}
