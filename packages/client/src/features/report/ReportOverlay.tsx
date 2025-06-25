import { RoundReport, RoundReportWithWord } from "@guessthesketch/common"
import { useAppSelector } from "../../app/hooks"
import { selectTeamsConfig } from "../gameScreen/GameScreenSlice"

export function ReportOverlay(props: { report: RoundReportWithWord }) {
  const teamsConfig = useAppSelector(selectTeamsConfig)

  function getEntries(): Entry[] | undefined {
    if (teamsConfig === undefined) return

    const res: Entry[] = teamsConfig.map(team => {
      const reportEntry = props.report.report.find(
        ([teamId]) => teamId == team.id,
      )

      let delta = 0
      if (reportEntry !== undefined) {
        delta = reportEntry[1]
      }

      return {
        name: team.name,
        delta: delta,
      }
    })

    return res.sort((a, b) => a.delta - b.delta)
  }

  const entries = getEntries()

  const entriesDisplayed = entries
    ? entries.map(entry => <EntryDisplay entry={entry} />)
    : null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black opacity-80" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xl">
          The word was <strong>{props.report.word}</strong>
        </p>
        {entriesDisplayed}
      </div>
    </div>
  )
}

interface Entry {
  name: string
  delta: number
}

function EntryDisplay(props: { entry: Entry }) {
  return (
    <p className="my-0.5">
      {props.entry.name}: +{props.entry.delta} pts
    </p>
  )
}
