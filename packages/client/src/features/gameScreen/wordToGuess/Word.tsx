import { useEffect, useState } from "react"
import { ConnectionManager } from "../../../classes/ConnectionManager"
import { sockets } from "../../../global"
import { MakeGetCurrentWordRequest } from "./WordApi"

/**
 * myId and roomId must be set
 */
export function Word() {
  const [word, setWord] = useState<string | undefined | null>()

  useEffect(() => {
    ConnectionManager.getInstance().ensureChatIsConnected()

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
    const res = await MakeGetCurrentWordRequest()
    const body = (await res.json()) as { word: string | null }

    return body.word
  }

  return (
    <div className="flex gap-2">
      {word?.split("").map(l => {
        return <span className="underline">{l}</span>
      })}
    </div>
  )
}
