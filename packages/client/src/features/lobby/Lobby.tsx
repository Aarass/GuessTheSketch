import {
  GameConfig,
  PlayerId,
  ProcessedGameConfig,
} from "@guessthesketch/common"
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

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("game started", onGameStarted)
    sockets.global!.on("game not started", onGameNotStarted)

    return () => {
      sockets.global?.off("game started", onGameStarted)
      sockets.global?.off("game not started", onGameNotStarted)
    }
  }, [])

  function onGameStarted(config: ProcessedGameConfig) {
    dispatch(setConfigAction(config))
    navigate("/game")
  }

  function onGameNotStarted(error: string) {
    alert(error)
  }

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

const tmp: GameConfig = {
  rounds: {
    cycles: 3,
    duration: 120000,
  },
  teams: [
    {
      name: "team",
      players: ["" as PlayerId],
    },
    {
      name: "team",
      players: ["" as PlayerId],
    },
  ],
  tools: {
    pen: {
      count: 2,
      timeoutable: {
        useTime: 2000,
        cooldownTime: 5000,
      },
    },
    line: {
      count: 1,
    },
    rect: {
      count: 1,
      consumable: {
        maxUses: 4,
      },
    },
    circle: {
      count: 1,
      consumable: {
        maxUses: 4,
      },
    },
    bucket: {
      count: 1,
    },
    eraser: {
      count: 1,
    },
  },
}

const initialConfig = JSON.stringify(tmp, null, 2)
// const initialConfig = `{
//     "rounds": {
//       "cycles": 3,
//       "duration": 120000
//     },
//     "teams": [
//       {
//         "name": "Tim A",
//         "players": ["id1"]
//       },
//       {
//         "name": "Tim B",
//         "players": ["id2"]
//       }
//     ],
//     "tools": {
//       "pen": {
//         "count": 2
//       },
//       "eraser": {
//         "count": 1
//       }
//     }
//   }`
