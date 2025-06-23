import { Drawing } from "@guessthesketch/common"
import p5 from "p5"
import { useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { backend, sockets } from "../../global"
import { GameState } from "./GameState"
import { initSketch } from "./sketch"

// TODO
// ne exportovati vec proslediti
export let sketch: p5 | null = null

/**
 * myId and roomId must be set
 */
export function Canvas() {
  const hasCreatedSketch = useRef<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = GameState.getInstance()

  useEffect(() => {
    if (!canvasRef.current) return

    if (!hasCreatedSketch.current) {
      sketch = new p5(initSketch(canvasRef.current))

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
    if (drawing.type !== "eraser") {
      console.log(drawing)
      state.confirmedDrawings.push(drawing)
    } else {
      state.deleteFlag = true
      state.confirmedDrawings = state.confirmedDrawings.filter(
        d => d.id !== drawing.toDelete,
      )
    }
  }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
