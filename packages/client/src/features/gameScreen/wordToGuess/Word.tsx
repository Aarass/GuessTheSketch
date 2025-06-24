import { useEffect, useState } from "react"
import { ConnectionManager } from "../../../classes/ConnectionManager"
import { sockets } from "../../../global"
import { GetCurrentWord, MakeGetCurrentWordRequest } from "./WordApi"

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
    ;(async () => {
      try {
        const restoredWord = await getCurrentWord()

        if (word === undefined) {
          setWord(restoredWord)
        }
      } catch {}
    })().catch(console.error)
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
    <div>
      <p>{word}</p>
    </div>
  )
}
