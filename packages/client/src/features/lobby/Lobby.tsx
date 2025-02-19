import { useEffect, useState } from "react"
import { backend, sockets } from "../../global"
import { io } from "socket.io-client"
import { GameConfig, Player, PlayerId } from "@guessthesketch/common"
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

const initialConfig = `{
    "rounds": {
      "cycles": 1,
      "duration": 5000
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
    ]
  }`

export function Lobby() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const roomInfo = useAppSelector(selectRoomInfo)
  const myId = useAppSelector(selectMyId)
  const [config, setConfig] = useState(initialConfig)

  const iamOwner = roomInfo.ownerId === myId

  useEffect(() => {
    if (sockets.global === null) {
      sockets.global = io(`ws://${backend}`, { withCredentials: true })

      sockets.global.on("all players", (players: Player[]) => {
        dispatch(syncPlayers(players))
      })

      sockets.global.on("player joined room", (player: Player) => {
        dispatch(playerJoined(player))
      })

      sockets.global.on("player left room", (playerId: PlayerId) => {
        dispatch(playerLeft(playerId))
      })

      sockets.global.on("start game", () => {
        navigate("/game")
      })

      sockets.global.emit("ready")
    }
  }, [sockets])

  return myId ? (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <p>{roomInfo.id}</p>
      <div className="flex">
        <Players />
        <div className="flex flex-col">
          {iamOwner ? (
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
