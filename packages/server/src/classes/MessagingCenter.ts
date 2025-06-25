import type {
  Drawing,
  Leaderboard,
  ProcessedGameConfig,
  RoomId,
  RoundReport,
  RoundReportWithWord,
  Team,
  TeamId,
} from "@guessthesketch/common";
import type {
  GameId,
  PlayerId,
  RoundId,
} from "@guessthesketch/common/types/ids";
import { Server as SocketIOServer } from "socket.io";
import type { AppContext } from "./AppContext";
import { ChatNamespace } from "./namespaces/ChatNamespace";
import { ControlsNamespace } from "./namespaces/ControlsNamespace";
import { DrawingsNamespace } from "./namespaces/DrawingNamespace";
import { GlobalNamespace } from "./namespaces/GlobalNamespace";
import type { PersistanceService } from "./services/PersitanceService";

// ----------------
// --- Mediator ---
// ----------------
export class MessagingCenter {
  private namespaces;
  private persistanceService: PersistanceService;

  constructor(server: SocketIOServer, ctx: AppContext) {
    this.persistanceService = ctx.persistanceService;
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

  public notifyLeaderboardUpdated(room: RoomId, leaderboard: Leaderboard) {
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

  public notifyRoundStarted(room: RoomId, teamOnMove: Team) {
    this.namespaces.global.notifyRoundStarted(room, teamOnMove.id);
    this.namespaces.chat.notifyRoundStarted(room, teamOnMove);
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

  public notifyNewDrawing(
    room: RoomId,
    game: GameId,
    round: RoundId,
    drawing: Drawing,
  ) {
    this.namespaces.drawings.notifyNewDrawing(room, drawing);
    this.persistanceService.notifyNewDrawing(room, game, round, drawing);
  }
}
