import type { PlayerId } from "./ids";

export interface LoginResult {
  id: PlayerId;
}

export type RefreshResult = LoginResult;
