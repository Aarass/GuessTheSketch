import type { Namespace, Socket } from "socket.io";

type ClientEvents<T> =
  T extends Namespace<infer M, infer _1, infer _2> ? M : never;
type ServerEvents<T> =
  T extends Namespace<infer _1, infer N, infer _2> ? N : never;

export type ExtractSocketType<T extends Namespace> = Socket<
  ClientEvents<T>,
  ServerEvents<T>
>;
