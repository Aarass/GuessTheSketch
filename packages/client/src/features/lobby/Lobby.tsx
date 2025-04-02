import { useEffect, useRef, useState } from "react"
import { backend, sockets } from "../../global"
import { io } from "socket.io-client"
import {
  GameConfig,
  Player,
  PlayerId,
  ProcessedGameConfig,
} from "@guessthesketch/common"
import { useNavigate } from "react-router"
import { NotLoggedIn } from "../auth/RedirectToLoginScreen"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectMyId } from "../auth/AuthSlice"
import {
  playerJoined,
  playerLeft,
  selectPlayers,
  selectRoomInfo,
  syncPlayers,
} from "../rooms/RoomSlice"

import { setConfig as setConfigAction } from "../gameScreen/GameScreenSlice"
import { LogoutButton } from "../global/Logout"

const initialConfig = `{
    "rounds": {
      "cycles": 1,
      "duration": 15000
    },
    "teams": [
      {
        "name": "Tim A",
        "players": ["id1", "id2"]
      },
      {
        "name": "Tim B",
        "players": ["id3", "id4"]
      }
    ],
    "tools": {
      "pen": {
        "count": 2
      }
    }
  }`

export function Lobby() {
  const isFirstTime = useRef(true)

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const roomInfo = useAppSelector(selectRoomInfo)
  const myId = useAppSelector(selectMyId)
  const [config, setConfig] = useState(initialConfig)

  const onSyncPlayers = (players: Player[]) => {
    dispatch(syncPlayers(players))
  }

  const onPlayerJoined = (player: Player) => {
    dispatch(playerJoined(player))
  }

  const onPlayerLeft = (playerId: PlayerId) => {
    dispatch(playerLeft(playerId))
  }

  const onGameStart = (config: ProcessedGameConfig) => {
    dispatch(setConfigAction(config))
    navigate("/game")
  }

  const onGameEnded = () => {
    console.log("Game Ended!")
  }

  useEffect(() => {
    if (myId === null) return

    if (sockets.global === null) {
      sockets.global = io(`ws://${backend}`, { withCredentials: true })
    }

    sockets.global.on("sync players", onSyncPlayers)
    sockets.global.on("player joined room", onPlayerJoined)
    sockets.global.on("player left room", onPlayerLeft)
    sockets.global.on("game started", onGameStart)
    sockets.global.on("game ended", onGameEnded)

    if (isFirstTime.current) {
      sockets.global.emit("ready")
      isFirstTime.current = false
    }

    return () => {
      sockets.global?.off("sync players")
      sockets.global?.off("player joined room")
      sockets.global?.off("player left room")
      sockets.global?.off("game started")
    }
  }, [])

  return myId ? (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <p>{roomInfo.id}</p>
      <div className="flex">
        <Players />
        <div className="flex flex-col">
          {roomInfo.ownerId === myId ? (
            <form
              onSubmit={e => {
                e.preventDefault()
                const arg = JSON.parse(config) as GameConfig
                sockets.global?.emit("start game", arg)
              }}
            >
              <div className="flex flex-col">
                <textarea
                  rows={25}
                  cols={50}
                  value={config}
                  onChange={e => setConfig(e.target.value)}
                ></textarea>

                <button type="submit">Start game</button>
              </div>
            </form>
          ) : (
            <p>Wait for the owner to start the game...</p>
          )}
        </div>
      </div>

      <LogoutButton />
    </div>
  ) : (
    NotLoggedIn()
  )
}

function Players() {
  const players = useAppSelector(selectPlayers)

  return (
    <div className="">
      {players.map(player => (
        <div className="m-2 bg-amber-700" key={player.id}>
          <p>{player.name}</p>
          <p>{player.id}</p>
        </div>
      ))}
    </div>
  )
}
