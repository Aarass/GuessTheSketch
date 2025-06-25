import { PropsWithChildren, useEffect, useRef, useState } from "react"
import {
  LuCircle,
  LuCircleX,
  LuPaintBucket,
  LuPen,
  LuPipette,
  LuRectangleHorizontal,
  LuUndo2,
} from "react-icons/lu"
import { TbLine } from "react-icons/tb"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { Command } from "../../classes/commands/command"
import { DeselectTool } from "../../classes/commands/concrete/deselectTool"
import { SelectToolCommand } from "../../classes/commands/concrete/selectTool"
import { UndoCommand } from "../../classes/commands/concrete/undo"
import { ConnectionManager } from "../../classes/ConnectionManager"
import { CircleTool } from "../../classes/tools/concrete/Circle"
import { FloodFillTool } from "../../classes/tools/concrete/FloodFill"
import { LineTool } from "../../classes/tools/concrete/Line"
import { PenTool } from "../../classes/tools/concrete/Pen"
import { PipetteTool } from "../../classes/tools/concrete/Pipete"
import { RectTool } from "../../classes/tools/concrete/Rect"
import { HSVtoRGB, RGBtoHexString } from "../../utils/colors"
import { sketch } from "./Canvas"
import { selectColor, selectSize, setColor, setSize } from "./GameScreenSlice"

/**
 * myId and roomId must be set
 */
export function Tools() {
  useEffect(() => {
    ConnectionManager.getInstance().ensureControlsIsConnected()

    // TODO attach listeners for controls
  }, [])

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
      [new UndoCommand(), <LuUndo2 />],
      // [new DeleteAllCommand(), <LuTrash2 />],
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
