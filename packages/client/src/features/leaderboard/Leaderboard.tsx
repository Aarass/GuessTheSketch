import {
  Leaderboard as LeaderboardType,
  RoundReport,
} from "@guessthesketch/common"
import { useEffect, useState } from "react"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { sockets } from "../../global"
import { useAppSelector } from "../../app/hooks"
import { selectTeamsConfig } from "../gameScreen/GameScreenSlice"
import { ReportOverlay } from "../report/ReportOverlay"

/**
 * myId and roomId must be set
 */
export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | undefined>()
  const [report, setReport] = useState<RoundReport | null>(null)
  const teamsConfig = useAppSelector(selectTeamsConfig)

  useEffect(() => {
    ConnectionManager.getInstance().ensureGlobalIsConnected()

    sockets.global!.on("leaderboard", onLeaderboard)
    sockets.global!.on("round ended", onRoundEnded)
    return () => {
      sockets.global?.off("leaderboard", onLeaderboard)
      sockets.global?.off("round ended", onRoundEnded)
    }
  }, [])

  function onLeaderboard(leaderboard: LeaderboardType) {
    setLeaderboard(leaderboard)
  }

  function onRoundEnded(report: RoundReport): void {
    setReport(report)

    setTimeout(() => {
      setReport(null)
    }, 5000)
  }

  function getPrettyLeaderboard() {
    if (teamsConfig && leaderboard) {
      return teamsConfig.map(team => {
        return {
          name: team.name,
          points: leaderboard[team.id],
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
