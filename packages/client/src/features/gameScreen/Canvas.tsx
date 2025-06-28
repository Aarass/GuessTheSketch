import { Drawing } from "@guessthesketch/common"
import p5 from "p5"
import { useContext, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { backend, sockets } from "../../global"
import { Context } from "../context/Context"
import { initSketch } from "./sketch"

/**
 * myId and roomId must be set
 */
export function Canvas(props: {
  setSketch: React.Dispatch<React.SetStateAction<p5 | null>>
}) {
  const hasCreatedSketch = useRef<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const state = context.gameState

  useEffect(() => {
    if (!canvasRef.current) return

    if (!hasCreatedSketch.current) {
      props.setSketch(new p5(initSketch(canvasRef.current, state)))

      hasCreatedSketch.current = true
    }
  }, [canvasRef.current])

  useEffect(() => {
    if (sockets.drawings === null) {
      console.log("connection to drawings")
      sockets.drawings = io(`ws://${backend}/drawings`)
    }

    sockets.drawings.on("drawing", onDrawing)

    return () => {
      sockets.drawings?.off("drawing", onDrawing)
    }
  }, [])

  const onDrawing = (drawing: Drawing) => {
    state.processNewDrawing(drawing)
  }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
