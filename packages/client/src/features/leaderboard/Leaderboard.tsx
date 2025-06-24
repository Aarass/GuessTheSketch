import {
  Leaderboard as LeaderboardType,
  RoundReport,
} from "@guessthesketch/common"
import { useEffect, useState } from "react"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { sockets } from "../../global"
import { useAppSelector } from "../../app/hooks"
import {
  selectLeaderboard,
  selectTeamsConfig,
} from "../gameScreen/GameScreenSlice"
import { ReportOverlay } from "../report/ReportOverlay"
import { selectPlayers } from "../rooms/RoomSlice"

/**
 * myId and roomId must be set
 */
export const Leaderboard = () => {
  // const [leaderboard, setLeaderboard] = useState<LeaderboardType | undefined>()
  const [report, setReport] = useState<RoundReport | null>(null)
  const leaderboard = useAppSelector(selectLeaderboard)
  const teamsConfig = useAppSelector(selectTeamsConfig)
  const players = useAppSelector(selectPlayers)

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("round ended", onRoundEnded)
    return () => {
      sockets.global?.off("round ended", onRoundEnded)
    }
  }, [])

  function onRoundEnded(report: RoundReport): void {
    setReport(report)

    setTimeout(() => {
      setReport(null)
    }, 5000)
  }

  function getPrettyLeaderboard() {
    console.log("ovde", teamsConfig, leaderboard)
    if (teamsConfig && leaderboard) {
      return teamsConfig.map(team => {
        return {
          name: team.name,
          points: leaderboard[team.id],
          players: team.players.map(
            id => players.find(p => p.id === id)?.name ?? "no name",
          ),
        }
      })
    }
  }

  return (
    <div>
      <pre>{JSON.stringify(getPrettyLeaderboard() ?? {}, null, 2)}</pre>
      {report ? <ReportOverlay report={report} /> : null}
    </div>
  )
}
