import { GameConfig, ProcessedGameConfig } from "@guessthesketch/common"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { sockets } from "../../global"
import { selectMyId } from "../auth/AuthSlice"
import { selectPlayers, selectRoomInfo } from "../rooms/RoomSlice"

import { ConnectionManager } from "../../classes/ConnectionManager"
import { setConfig as setConfigAction } from "../gameScreen/GameScreenSlice"
import { LogoutButton } from "../global/Logout"

/**
 * myId must be set when mounting this component
 */
export function Lobby() {
  const isFirstTime = useRef(true)

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const myId = useAppSelector(selectMyId)!
  const roomInfo = useAppSelector(selectRoomInfo)

  const [config, setConfig] = useState(initialConfig)

  const onGameStarted = (config: ProcessedGameConfig) => {
    dispatch(setConfigAction(config))
    navigate("/game")
  }

  const onGameNotStarted = (error: string) => {
    alert(error)
  }

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("game started", onGameStarted)
    sockets.global!.on("game not started", onGameNotStarted)

    if (isFirstTime.current) {
      // Ovo radim zbog reactovo strict moda
      // Ovo odlaze slanje ready eventa, do sledeceg tick-a, sto bi,
      // nadam se, trebalo da bude dovoljno da se listeneri ponovo
      // prikace.
      // Nisam siguran koliko ovo stavrno moze da bude problem, ali
      // ako ni ovo resenje nije dovoljno, moze da se proba
      // da se saceka malo duze od jednog ticka
      setTimeout(() => {
        sockets.global!.emit("ready")
      }, 0)

      isFirstTime.current = false
    }

    return () => {
      sockets.global?.off("game started", onGameStarted)
      sockets.global?.off("game not started", onGameNotStarted)
    }
  }, [])

  return (
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

const initialConfig = `{
    "rounds": {
      "cycles": 3,
      "duration": 25000
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
      },
      "eraser": {
        "count": 1
      }
    }
  }`
