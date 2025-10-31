import type {
  Drawing,
  LeaderboardRecord,
  ProcessedGameConfig,
  RoomId,
  RoundReportWithWord,
  Team,
  TeamId,
  ToolType,
} from "@guessthesketch/common";
import type { PlayerId } from "@guessthesketch/common/types/ids";
import { Server as SocketIOServer } from "socket.io";
import type { AppContext } from "./AppContext";
import { ChatNamespace } from "./namespaces/ChatNamespace";
import { ControlsNamespace } from "./namespaces/ControlsNamespace";
import { DrawingsNamespace } from "./namespaces/DrawingNamespace";
import { GlobalNamespace } from "./namespaces/GlobalNamespace";

// ----------------
// --- Mediator ---
// ----------------
export class MessagingCenter {
  private namespaces;

  constructor(server: SocketIOServer, ctx: AppContext) {
    this.namespaces = {
      global: new GlobalNamespace("", server, this, ctx),
      drawings: new DrawingsNamespace("drawings", server, this, ctx),
      controls: new ControlsNamespace("controls", server, this, ctx),
      chat: new ChatNamespace("chat", server, this, ctx),
    };
  }

  public notifyCorrectGuess(room: RoomId, playerId: PlayerId, guess: string) {
    this.namespaces.chat.notifyCorrectGuess(room, playerId, guess);
  }

  public notifyLeaderboardUpdated(
    room: RoomId,
    leaderboard: LeaderboardRecord,
  ) {
    this.namespaces.global.notifyLeaderboardUpdated(room, leaderboard);
  }

  public notifyGameStarted(room: RoomId, config: ProcessedGameConfig) {
    this.namespaces.global.notifyGameStarted(room, config);
    this.namespaces.chat.notifyGameStarted(room, config);
  }

  public notifyGameEnded(room: RoomId, teamIds: TeamId[]) {
    this.namespaces.global.notifyGameEnded(room);
    this.namespaces.chat.notifyGameEnded(room, teamIds);
  }

  public notifyRoundStarted(
    room: RoomId,
    teamOnMove: Team,
    word: { masked: string; unmasked: string },
  ) {
    this.namespaces.global.notifyRoundStarted(room, teamOnMove.id);
    this.namespaces.chat.notifyRoundStarted(room, teamOnMove, word);
  }

  public notifyRoundsCount(
    room: RoomId,
    startedRounds: number,
    maxRounds: number,
  ) {
    this.namespaces.global.notifyRoundsCount(room, startedRounds, maxRounds);
  }

  public notifyRoundEnded(room: RoomId, report: RoundReportWithWord) {
    this.namespaces.global.notifyRoundEnded(room, report);
    this.namespaces.chat.notifyRoundEnded(room);
  }

  public notifyNewDrawing(room: RoomId, drawing: Drawing) {
    this.namespaces.drawings.notifyNewDrawing(room, drawing);
  }

  public notifyToolDeactivated(playerId: PlayerId) {
    this.namespaces.controls.notifyToolDeactivated(playerId);
  }

  public notifyToolStateChange(roomId: RoomId, type: ToolType, state: object) {
    this.namespaces.controls.notifyToolStateChange(roomId, type, state);
  }
}
