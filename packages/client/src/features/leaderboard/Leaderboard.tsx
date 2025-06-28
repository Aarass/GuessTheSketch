import { Player, RoundReportWithWord } from "@guessthesketch/common"
import { useContext, useEffect, useState } from "react"
import { useAppSelector } from "../../app/hooks"
import { sockets } from "../../global"
import { Context } from "../context/Context"
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
  const [report, setReport] = useState<RoundReportWithWord | null>(null)
  const leaderboard = useAppSelector(selectLeaderboard)
  const teamsConfig = useAppSelector(selectTeamsConfig)
  const allPlayers = useAppSelector(selectPlayers)
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  useEffect(() => {
    connManager.ensureGlobalIsConnected()

    function onRoundEnded(report: RoundReportWithWord): void {
      setReport(report)

      setTimeout(() => {
        setReport(null)
      }, 3000)
    }

    sockets.global!.on("round ended", onRoundEnded)
    return () => {
      sockets.global?.off("round ended", onRoundEnded)
    }
  }, [])

  function getEntries(): TeamEntry[] | null {
    if (teamsConfig === undefined) return null

    const res = teamsConfig.map(team => {
      const entry: TeamEntry = {
        teamName: team.name,
        players: team.players.map(id => allPlayers.find(p => p.id === id)),
        points: leaderboard ? leaderboard[team.id] : 0,
      }

      return entry
    })

    return res.sort((a, b) => a.points - b.points)
  }

  const entries = getEntries()

  const entriesDisplayed = entries
    ? entries.map(entry => <TeamEntryDisplay entry={entry} />)
    : null

  const reportDisplayed = report ? <ReportOverlay report={report} /> : null

  return (
    <div>
      <div>{entriesDisplayed}</div>
      {reportDisplayed}
    </div>
  )
}

interface TeamEntry {
  points: number
  teamName: string
  players: (Player | undefined)[]
}

function TeamEntryDisplay({ entry }: { entry: TeamEntry }) {
  return (
    <div>
      <div className="px-4">
        <div className="flex gap-5">
          <span>{entry.teamName}</span>
          <span>{entry.points} pts</span>
        </div>
        <div className="flex flex-col items-end">
          {entry.players.map(player => {
            return player ? (
              <p className="my-1">{player.name}</p>
            ) : (
              <p>No name</p>
            )
          })}
        </div>
      </div>
      <hr />
    </div>
  )
}
