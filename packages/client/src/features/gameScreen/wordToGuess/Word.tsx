import { useContext, useEffect, useState } from "react"
import { sockets } from "../../../global"
import { Context } from "../../context/Context"
import { getCurrectWordRequest } from "../../restore/restoreApi"

/**
 * myId and roomId must be set
 */
export function Word() {
  const [word, setWord] = useState<string | undefined | null>()
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const connManager = context.connectionManager

  useEffect(() => {
    connManager.ensureChatIsConnected()

    sockets.chat!.on("word", onWord)

    return () => {
      sockets.chat?.off("word", onWord)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const restoredWord = await getCurrentWord()

        if (word === undefined) {
          setWord(restoredWord)
        }
      } catch {}
    })()
  }, [])

  function onWord(word: string) {
    setWord(word)
  }

  async function getCurrentWord() {
    const res = await getCurrectWordRequest()

    const body = (await res.json()) as { word: string | null }

    return body.word
  }

  return (
    <div className="flex gap-2">
      {word?.split("").map((l, i) => {
        return (
          <span key={i} className="underline">
            {l}
          </span>
        )
      })}
    </div>
  )
}
