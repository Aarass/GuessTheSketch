import {
  Player,
  PlayerId,
  ProcessedGameConfig,
  RoundReport,
  TeamId,
} from "@guessthesketch/common"
import { io } from "socket.io-client"
import { store } from "../app/store"
import {
  setConfig,
  setTeamOnMove,
} from "../features/gameScreen/GameScreenSlice"
import {
  ownerChanged,
  playerJoined,
  playerLeft,
  syncPlayers,
} from "../features/rooms/RoomSlice"
import { backend, sockets } from "../global"
import { GameState } from "../features/gameScreen/GameState"

export class ConnectionManager {
  public ensureGlobalIsConnected() {
    console.log("ensure connect to global")
    if (sockets.global === null) {
      console.log("connection to global")
      sockets.global = io(`ws://${backend}`, { withCredentials: true })

      sockets.global.on("sync players", onSyncPlayers)
      sockets.global.on("new owner", onNewOwner)
      sockets.global.on("player joined room", onPlayerJoined)
      sockets.global.on("player left room", onPlayerLeft)
      sockets.global.on("game config", onGameConfig)

      sockets.global!.on("round started", onRoundStarted)
      sockets.global!.on("round ended", onRoundEnded)
    }
  }

  public ensureControlsIsConnected() {
    console.log("ensure connect to controls")
    if (sockets.controls === null) {
      console.log("connection to controls")
      sockets.controls = io(`ws://${backend}/controls`)
    }
  }

  // TODO kad, kako?
  // public disconnectGlobal() {
  // Nesto od ova dva: *nisam proverio*
  // sockets.global.disconnect()
  // ili
  // sockets.global?.off("sync players")
  // sockets.global?.off("new owner")
  // sockets.global?.off("player joined room")
  // sockets.global?.off("player left room")
  // sockets.global?.off("game config", onGameConfig)
  // sockets.global?.off("round started", onRoundStarted)
  // sockets.global?.off("round ended", onRoundEnded)
  // }

  // -----------------
  // --- Singleton ---
  // -----------------
  private static instance: ConnectionManager | null = null

  static getInstance() {
    if (this.instance == null) {
      this.instance = new ConnectionManager()
    }
    return this.instance
  }
}

function onSyncPlayers(players: Player[]) {
  store.dispatch(syncPlayers(players))
}

function onNewOwner(ownerId: PlayerId) {
  store.dispatch(ownerChanged(ownerId))
}

function onPlayerJoined(player: Player) {
  store.dispatch(playerJoined(player))
}

function onPlayerLeft(playerId: PlayerId) {
  store.dispatch(playerLeft(playerId))
}

function onGameConfig(config: ProcessedGameConfig) {
  store.dispatch(setConfig(config))
}

function onRoundStarted(teamOnMove: TeamId) {
  console.log(`Round started. Team on move: ${teamOnMove}`)

  store.dispatch(setTeamOnMove(teamOnMove))
}

function onRoundEnded(roundReport: RoundReport) {
  console.log("Round ended. Heres round report", roundReport)

  store.dispatch(setTeamOnMove(null))
  GameState.getInstance().reset()
}
