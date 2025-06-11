import type { Namespace, Socket } from "socket.io";

type ClientEvents<T> = T extends Namespace<infer M, any, any, any> ? M : never;
type ServerEvents<T> = T extends Namespace<any, infer N, any, any> ? N : never;

export type ExtractSocketType<T extends Namespace> = Socket<
  ClientEvents<T>,
  ServerEvents<T>
>;
