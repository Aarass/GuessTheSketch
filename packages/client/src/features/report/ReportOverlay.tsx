import { RoundReport } from "@guessthesketch/common"
import { useAppSelector } from "../../app/hooks"
import { selectTeamsConfig } from "../gameScreen/GameScreenSlice"

export function ReportOverlay(props: { report: RoundReport }) {
  const teamsConfig = useAppSelector(selectTeamsConfig)

  function getPrettyReport() {
    if (teamsConfig) {
      return teamsConfig.map(team => {
        const entry = props.report.find(([teamId]) => teamId == team.id)

        let delta = 0
        if (entry !== undefined) {
          delta = entry[1]
        }

        return {
          name: team.name,
          delta: `+${delta}`,
        }
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black opacity-80 z-50 flex items-center justify-center">
      <pre>{JSON.stringify(getPrettyReport() ?? {}, null, 2)}</pre>
    </div>
  )
}
