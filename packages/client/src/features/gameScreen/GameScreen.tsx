import p5 from "p5"
import {
  LuTrash2,
  LuUndo2,
  LuPipette,
  LuRectangleHorizontal,
  LuCircle,
  LuPen,
  LuPaintBucket,
  LuCircleX,
} from "react-icons/lu"
import { TbLine } from "react-icons/tb"
import { PropsWithChildren, useEffect, useRef, useState } from "react"
import { initSketch } from "./sketch"
import { GameState } from "./GameState"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { store } from "../../app/store"
import { selectColor, selectSize, setColor, setSize } from "./GameScreenSlice"
import { HSVtoRGB, RGBtoHexString } from "../../utils/colors"
import {
  Drawing,
  Point,
  RoundReport,
  TeamId,
  ToolType,
} from "@guessthesketch/common"
import { backend, sockets } from "../../global"
import { io } from "socket.io-client"
import { selectMyId } from "../auth/AuthSlice"
import { LogoutButton } from "../global/Logout"
import { Chat } from "../chat/Chat"
import { Leaderboard } from "../leaderboard/Leaderboard"
import { useNavigate } from "react-router"

export const GameScreen = () => {
  const navigate = useNavigate()
  const myId = useAppSelector(selectMyId)

  const onRoundStarted = (teamOnMove: TeamId) => {
    console.log(`Round started. Team on move: ${teamOnMove}`)
  }

  const onRoundEnded = (roundReport: RoundReport) => {
    console.log("Round ended. Heres round report", roundReport)
  }

  useEffect(() => {
    if (myId === null) return

    if (sockets.controls === null) {
      sockets.controls = io(`ws://${backend}/controls`)
    }

    sockets.controls.on("round started", onRoundStarted)
    sockets.controls.on("round ended", onRoundEnded)

    return () => {
      sockets.controls?.off("round started", onRoundStarted)
      sockets.controls?.off("round ended", onRoundEnded)
    }
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex">
        <Leaderboard></Leaderboard>
        <div className="flex flex-col items-center">
          <Canvas></Canvas>
          <Tools></Tools>
        </div>
        <Chat></Chat>
      </div>

      <button
        onClick={() => {
          navigate("/rooms")
        }}
      >
        Rooms
      </button>

      <LogoutButton />
    </div>
  )
}

let sketch: p5 | null = null

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = GameState.getInstance()

  useEffect(() => {
    if (sketch === null && canvasRef.current !== null) {
      sketch = new p5(initSketch(canvasRef.current))
    }

    if (sockets.drawings === null) {
      sockets.drawings = io(`ws://${backend}/drawings`)
    }

    const onDrawing = (bm: any) => {
      console.log("drawing", bm)
      state.drawings.push(bm.drawing)
    }

    sockets.drawings.on("drawing", onDrawing)

    return () => {
      sockets.drawings?.off("drawing")
    }
  }, [])

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export const Tools = () => {
  return (
    <div className="mt-4 flex flex-row items-center justify-items-center">
      <div className="mr-4 flex flex-col items-center justify-items-center">
        <SelectTool></SelectTool>
        <SelectColor></SelectColor>
      </div>
      <SelectSize></SelectSize>
    </div>
  )
}

export const SelectColor = () => {
  const dispatch = useAppDispatch()
  const color = useAppSelector(selectColor)
  const pickerRef = useRef<HTMLImageElement>(null)

  function calcColor(event: MouseEvent) {
    const picker = pickerRef.current!
    const rect = picker.getBoundingClientRect()
    let x = event.clientX - rect.left
    let y = event.clientY - rect.top

    if (x < 0) x = 0
    if (x > rect.width) x = rect.width
    if (y < 0) y = 0
    if (y > rect.height) y = rect.height

    const xp = (x / rect.width + 0.95) % 1.0
    const yp = y / rect.height

    const s = yp > 0.5 ? 1.0 : yp * 2
    const v = yp < 0.5 ? 1.0 : 2.0 - yp * 2

    return RGBtoHexString(HSVtoRGB(xp, s, v))
  }

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: 25,
            height: 25,
            backgroundColor: "white",
          }}
          onClick={() => {
            dispatch(setColor("#FFFFFF"))
          }}
        ></div>
        <div
          style={{
            width: 25,
            height: 25,
            backgroundColor: "black",
          }}
          onClick={() => {
            dispatch(setColor("#000000"))
          }}
        ></div>
      </div>
      <img
        ref={pickerRef}
        draggable="false"
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.tutsplus.com%2Fcdn-cgi%2Fimage%2Fwidth%3D360%2Factive%2Fuploads%2Flegacy%2Ftuts%2F008_colorPicker%2FTutorial%2F8.jpg&f=1&nofb=1&ipt=a61eac348a5dc4bd00b3cb2fbfd2a2272dc2399fb1faa83958ad4a4aee87214b&ipo=images"
        style={{
          display: "block",
          width: 200,
          height: 50,
          backgroundColor: "yellow",
        }}
        onMouseDown={event => {
          dispatch(setColor(calcColor(event.nativeEvent)))
          const onMove = (event: MouseEvent) => {
            dispatch(setColor(calcColor(event)))
          }

          const onUp = () => {
            document.removeEventListener("mousemove", onMove)
            document.removeEventListener("mouseup", onUp)
          }
          document.addEventListener("mousemove", onMove)
          document.addEventListener("mouseup", onUp)
        }}
      ></img>
      <div
        style={{
          width: 50,
          height: 50,
          backgroundColor: color,
        }}
      ></div>
    </div>
  )
}

// TODO
// sketch.mousePressed = () => {}
// sketch.mouseReleased = () => {}
// sketch.mouseClicked = () => {}
// sketch.mouseDragged = () => {}

export const SelectTool = () => {
  const [buttons, setButtons] = useState([] as [Command, JSX.Element][])

  useEffect(() => {
    if (sketch == null) return

    setButtons([
      [new DeselectTool(), <LuCircleX />],
      [new SelectToolCommand(PenTool, sketch), <LuPen />],
      [new SelectToolCommand(RectTool, sketch), <LuRectangleHorizontal />],
      [new SelectToolCommand(CircleTool, sketch), <LuCircle />],
      [new SelectToolCommand(LineTool, sketch), <TbLine />],
      [new SelectToolCommand(FloodFillTool, sketch), <LuPaintBucket />],
      [new SelectToolCommand(PipetteTool, sketch), <LuPipette />],
      [new UndoCommand(sketch), <LuUndo2 />],
      [new DeleteAllCommand(sketch), <LuTrash2 />],
    ])
  }, [sketch])

  return (
    <div>
      {buttons.map(button => (
        <SelectToolButton key={button[0].getName()} command={button[0]}>
          {button[1]}
        </SelectToolButton>
      ))}
    </div>
  )
}

const SelectToolButton = (props: PropsWithChildren & { command: Command }) => {
  return (
    <button
      className="cursor-pointer rounded-full border-none bg-transparent text-[20px] text-white"
      onClick={e => {
        props.command.execute()
        e.stopPropagation()
      }}
    >
      {props.children}
    </button>
  )
}

export const SelectSize = () => {
  const dispatch = useAppDispatch()
  const size = useAppSelector(selectSize)

  return (
    <div>
      <input
        style={{
          writingMode: "vertical-lr",
          direction: "rtl",
          height: "70px",
        }}
        type="range"
        max={42}
        min={2}
        step={5}
        value={size}
        onChange={event => {
          const value = parseInt(event.target.value)
          dispatch(setSize(value))
        }}
      ></input>
    </div>
  )
}
export abstract class Tool {
  public abstract type: ToolType

  protected abstract onMousePressed(event: MouseEvent): void
  protected abstract onMouseReleased(event: MouseEvent): void
  protected abstract onMouseDragged(event: MouseEvent): void

  abstract onDeselect(): void

  block: boolean = false

  constructor(
    protected sketch: p5,
    protected gameState = GameState.getInstance(),
  ) {}

  showTmpDrawing(drawing: Drawing) {
    this.gameState.inFly.drawing = drawing
  }

  // TODO
  // crtez odavnde treba da ode u neki niz privremenih crteza
  // gde ce cekati potvrdu ili zabranu od servera
  commit(drawing: Drawing) {
    this.gameState.drawings.push(drawing)
    sockets.controls?.emit("use tool", drawing)
  }

  activate() {
    this.sketch.mousePressed = this.helper(e => {
      try {
        if ((e.target as HTMLElement).tagName !== "CANVAS") throw ""
      } catch {
        this.block = true
        return
      }

      this.block = false
      this.onMousePressed(e)
    })
    this.sketch.mouseReleased = this.helper(e => {
      if (!this.block) {
        this.onMouseReleased(e)
      }
      this.gameState.inFly.drawing = null
      this.gameState.inFly.i = null
    })

    this.sketch.mouseClicked = () => {}
    this.sketch.mouseDragged = this.helper(e => {
      if (!this.block) {
        this.onMouseDragged(e)
      }
    })
  }

  private helper(fn: (event: MouseEvent) => void) {
    return (event?: MouseEvent) => {
      if (event) {
        fn(event)
        return true
      }
    }
  }
}

class PenTool extends Tool {
  public type: ToolType = "pen"

  points: Point[] = []

  override showTmpDrawing(drawing: Drawing): void {
    super.showTmpDrawing(drawing)
    this.gameState.inFly.i = 0
  }

  onMousePressed(event: MouseEvent) {
    this.points = [
      {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    ]

    const tmp: Drawing = {
      ...DrawingAutoFillIn(),
      type: "freeline",
      points: this.points,
    }

    this.showTmpDrawing(tmp)
  }

  onMouseDragged(event: MouseEvent) {
    this.points.push({
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    })

    // Ovde nije potrebno da explicitno postavimo in fly drawing
    // zbog prenosa vrednosti po referenci

    //this.sketch.redraw()
  }

  onMouseReleased(event: MouseEvent): void {
    const drawing: Drawing = {
      ...DrawingAutoFillIn(),
      type: "freeline",
      points: [...this.points],
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}

class RectTool extends Tool {
  public type: ToolType = "pen"

  startingPoint: Point = {
    x: Infinity,
    y: Infinity,
  }

  onMousePressed(_: MouseEvent): void {
    this.startingPoint = {
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    }
  }

  onMouseDragged(_: MouseEvent): void {
    const tmp: Drawing = {
      ...DrawingAutoFillIn(),
      type: "rect",
      topLeft: {
        x: Math.round(this.startingPoint.x),
        y: Math.round(this.startingPoint.y),
      },
      w: Math.round(this.sketch.mouseX - this.startingPoint.x),
      h: Math.round(this.sketch.mouseY - this.startingPoint.y),
    }

    this.showTmpDrawing(tmp)

    //this.sketch.redraw()
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: Drawing = {
      ...DrawingAutoFillIn(),
      type: "rect",
      topLeft: {
        x: Math.round(this.startingPoint.x),
        y: Math.round(this.startingPoint.y),
      },
      w: Math.round(this.sketch.mouseX - this.startingPoint.x),
      h: Math.round(this.sketch.mouseY - this.startingPoint.y),
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}

class CircleTool extends Tool {
  public type: ToolType = "pen"

  startingPoint: Point = {
    x: Infinity,
    y: Infinity,
  }

  onMousePressed(_: MouseEvent): void {
    this.startingPoint = {
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    }
  }

  private getRadius() {
    return (
      this.sketch
        .createVector(
          this.sketch.mouseX - this.startingPoint.x,
          this.sketch.mouseY - this.startingPoint.y,
        )
        .mag() * 2
    )
  }

  onMouseDragged(_: MouseEvent): void {
    const tmp: Drawing = {
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.showTmpDrawing(tmp)

    //this.sketch.redraw()
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: Drawing = {
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}

class LineTool extends Tool {
  public type: ToolType = "pen"

  startingPoint: Point = {
    x: Infinity,
    y: Infinity,
  }

  onMousePressed(_: MouseEvent): void {
    this.startingPoint = {
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    }
  }

  onMouseDragged(_: MouseEvent): void {
    const tmp: Drawing = {
      ...DrawingAutoFillIn(),
      type: "line",
      p1: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      p2: {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    }

    this.showTmpDrawing(tmp)

    //this.sketch.redraw()
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: Drawing = {
      ...DrawingAutoFillIn(),
      type: "line",
      p1: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      p2: {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}

class FloodFillTool extends Tool {
  public type: ToolType = "pen"

  onMouseReleased(event: MouseEvent): void {
    let drawing: Drawing
    if (this.gameState.drawings.length == 0) {
      drawing = {
        ...DrawingAutoFillIn(),
        type: "rect",
        topLeft: {
          x: 0,
          y: 0,
        },
        w: this.sketch.width,
        h: this.sketch.height,
      }
    } else {
      drawing = {
        ...DrawingAutoFillIn(),
        type: "flood",
        p: {
          x: this.sketch.mouseX,
          y: this.sketch.mouseY,
        },
      }
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onMousePressed(event: MouseEvent): void {}
  onMouseDragged(event: MouseEvent): void {}

  onDeselect(): void {}
}

class PipetteTool extends Tool {
  public type: ToolType = "pen"

  onMouseReleased(event: MouseEvent): void {
    const res = this.sketch.get(this.sketch.mouseX, this.sketch.mouseY)
    let p1 = res[0].toString(16)
    if (p1.length == 1) p1 = `0${p1}`
    let p2 = res[1].toString(16)
    if (p2.length == 1) p2 = `0${p2}`
    let p3 = res[2].toString(16)
    if (p3.length == 1) p3 = `0${p3}`

    store.dispatch(setColor(`#${p1}${p2}${p3}`))
  }

  onMousePressed(event: MouseEvent): void {}
  onMouseDragged(event: MouseEvent): void {}

  onDeselect(): void {}
}

abstract class Command {
  abstract execute(): void
  abstract getName(): string
}

class UndoCommand extends Command {
  constructor(private sketch: p5) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()
    gameState.drawings.pop()
    //this.sketch.redraw()
  }
  getName(): string {
    return "Undo"
  }
}

class DeleteAllCommand extends Command {
  constructor(private sketch: p5) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()
    gameState.drawings.length = 0
    //this.sketch.redraw()
  }
  getName(): string {
    return "Bin"
  }
}

class DeselectTool extends Command {
  execute(): void {
    const gameState = GameState.getInstance()
    const prev = gameState.currentTool
    if (prev) {
      prev.onDeselect()
      sockets.controls?.emit("deselect tool")
    }

    gameState.currentTool = null
  }

  getName(): string {
    return "Deselect"
  }
}

class SelectToolCommand extends Command {
  constructor(
    private ToolConstructor: new (sketch: p5) => Tool,
    private sketch: p5,
  ) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()
    const prev = gameState.currentTool
    if (prev) {
      prev.onDeselect()
      sockets.controls?.emit("deselect tool")
    }

    const newTool = new this.ToolConstructor(this.sketch)
    sockets.controls?.emit("select tool", newTool.type)

    // TODO uradi ovo tek kada server potvrdi
    newTool.activate()
    gameState.currentTool = newTool
  }

  getName() {
    return this.ToolConstructor.name
  }
}

function DrawingAutoFillIn() {
  const color = selectColor(store.getState())
  const size = selectSize(store.getState())
  return {
    // TODO zameniti za nesto sto ce teze kreirati konflikte - neki uuid ili tako nesto
    id: Date.now().toString(),
    color,
    size,
  }
}
