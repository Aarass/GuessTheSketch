import { createContext } from "react"
import { GameState } from "../gameScreen/GameState"
import { ConnectionManager } from "../../classes/ConnectionManager"

export const Context = createContext<
  | {
      gameState: GameState
      connectionManager: ConnectionManager
    }
  | undefined
>(undefined)
