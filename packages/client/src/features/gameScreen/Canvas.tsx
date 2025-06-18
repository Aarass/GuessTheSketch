import { Drawing } from "@guessthesketch/common"
import p5 from "p5"
import { useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { backend, sockets } from "../../global"
import { GameState } from "./GameState"
import { initSketch } from "./sketch"

export let sketch: p5 | null = null

/**
 * myId and roomId must be set
 */
export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = GameState.getInstance()

  useEffect(() => {
    if (sketch === null && canvasRef.current !== null) {
      sketch = new p5(initSketch(canvasRef.current))
    }

    if (sockets.drawings === null) {
      console.log("connection to drawings")
      sockets.drawings = io(`ws://${backend}/drawings`)
    }

    console.log("About to register for drawing")
    sockets.drawings.on("drawing", onDrawing)

    return () => {
      sketch = null

      console.log("About to unregister for drawing")
      sockets.drawings?.off("drawing", onDrawing)
    }
  }, [])

  const onDrawing = (drawing: Drawing) => {
    console.log(drawing)
    if (drawing.type == "eraser") {
      const index = state.drawings.findLastIndex(el => {
        return el.id === drawing.toDelete
      })

      if (index === -1) {
        console.log("Can't find drawing to delete with id: ", drawing.id)
        return
      }

      state.drawings.splice(index, 1)
    } else {
      state.drawings.push(drawing)
    }
  }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
