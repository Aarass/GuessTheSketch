import { ToolType } from "@guessthesketch/common"
import { ToolId } from "@guessthesketch/common/types/ids"
import p5 from "p5"
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
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
import { DeselectToolCommand } from "../../classes/commands/concrete/deselectTool"
import { SelectToolCommand } from "../../classes/commands/concrete/selectTool"
import { UndoCommand } from "../../classes/commands/concrete/undo"
import { CircleTool } from "../../classes/tools/concrete/Circle"
import { FloodFillTool } from "../../classes/tools/concrete/FloodFill"
import { LineTool } from "../../classes/tools/concrete/Line"
import { PenTool } from "../../classes/tools/concrete/Pen"
import { PipetteTool } from "../../classes/tools/concrete/Pipete"
import { RectTool } from "../../classes/tools/concrete/Rect"
import { sockets } from "../../global"
import { HSVtoRGB, RGBtoHexString } from "../../utils/colors"
import { Context } from "../context/Context"
import { selectColor, selectSize, setColor, setSize } from "./GameScreenSlice"

/**
 * myId and roomId must be set
 */
export function Tools({ sketch }: { sketch: p5 }) {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error(`Context is undefined`)
  }

  const state = context.gameState
  const connManager = context.connectionManager

  useEffect(() => {
    function onToolDeactivated() {
      state.currentTool?.deactivate()
      state.currentTool = null
    }

    connManager.ensureControlsIsConnected()

    sockets.controls!.on("tool deactivated", onToolDeactivated)
    return () => {
      sockets.controls?.off("tool deactivated", onToolDeactivated)
    }
  }, [])

  return (
    <div className="mt-4 flex flex-row items-center justify-items-center gap-x-10">
      <SelectTool sketch={sketch}></SelectTool>
      <div className="mr-4 flex flex-col items-center justify-items-center">
        <SelectColor></SelectColor>
        <SelectSize></SelectSize>
      </div>
    </div>
  )
}

export const SelectColor = () => {
  const dispatch = useAppDispatch()
  const color = useAppSelector(selectColor)
  const pickerRef = useRef<HTMLImageElement>(null)
  const monoPickerRef = useRef<HTMLDivElement>(null)

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

  function calcMonoColor(event: MouseEvent) {
    const picker = monoPickerRef.current!
    const rect = picker.getBoundingClientRect()
    let y = event.clientY - rect.top

    if (y < 0) y = 0
    if (y > rect.height) y = rect.height

    const yp = 1 - y / rect.height
    const v = Math.round(yp * 255)

    return RGBtoHexString({ r: v, g: v, b: v })
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
          ref={monoPickerRef}
          style={{
            width: 25,
            height: 50,
            // backgroundColor: "white",
          }}
          className="bg-linear-to-t from-black to-white"
          onMouseDown={event => {
            dispatch(setColor(calcMonoColor(event.nativeEvent)))
            const onMove = (event: MouseEvent) => {
              dispatch(setColor(calcMonoColor(event)))
            }

            const onUp = () => {
              document.removeEventListener("mousemove", onMove)
              document.removeEventListener("mouseup", onUp)
            }
            document.addEventListener("mousemove", onMove)
            document.addEventListener("mouseup", onUp)
          }}
          onClick={() => {
            dispatch(setColor("#FFFFFF"))
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

type ToolButtonBundle = {
  command: Command
  icon: JSX.Element
  stateToTrack: ToolType | null
}

export const SelectTool = ({ sketch }: { sketch: p5 }) => {
  const [bundles, setBundles] = useState([] as ToolButtonBundle[])

  const context = useContext(Context)
  const state = context?.gameState

  useEffect(() => {
    if (sketch == null) return

    if (state === undefined) {
      throw new Error(`No state in context`)
    }

    setBundles([
      {
        command: new DeselectToolCommand(state),
        icon: <LuCircleX />,
        stateToTrack: null,
      },
      {
        command: new SelectToolCommand(PenTool, sketch, state),
        icon: <LuPen />,
        stateToTrack: "pen",
      },
      {
        command: new SelectToolCommand(RectTool, sketch, state),
        icon: <LuRectangleHorizontal />,
        stateToTrack: "rect",
      },

      {
        command: new SelectToolCommand(CircleTool, sketch, state),
        icon: <LuCircle />,
        stateToTrack: "circle",
      },
      {
        command: new SelectToolCommand(LineTool, sketch, state),
        icon: <TbLine />,
        stateToTrack: "line",
      },
      {
        command: new SelectToolCommand(FloodFillTool, sketch, state),
        icon: <LuPaintBucket />,
        stateToTrack: "bucket",
      },
      {
        command: new SelectToolCommand(PipetteTool, sketch, state),
        icon: <LuPipette />,
        stateToTrack: null,
      },
      {
        command: new UndoCommand(state),
        icon: <LuUndo2 />,
        stateToTrack: "eraser",
      },
      // [new DeleteAllCommand(), <LuTrash2 />],
    ])
  }, [sketch])

  return (
    <div>
      {bundles.map(bundle => (
        <SelectToolButton key={bundle.command.getName()} bundle={bundle}>
          <div className="p-4 bg-amber-700">{bundle.icon}</div>
        </SelectToolButton>
      ))}
    </div>
  )
}

const SelectToolButton = (
  props: PropsWithChildren & {
    bundle: ToolButtonBundle
  },
) => {
  const context = useContext(Context)!
  const connManager = context.connectionManager

  const [state, setState] = useState(null as object | null)

  useEffect(() => {
    function onStateChange(type: ToolType, state: object) {
      if (type !== props.bundle.stateToTrack) return

      setState(state)
    }

    connManager.ensureControlsIsConnected()

    sockets.controls!.on("tool state change", onStateChange)
    return () => {
      sockets.controls?.off("tool state change", onStateChange)
    }
  }, [])

  return (
    <button
      className="relative cursor-pointer rounded-full border-none bg-transparent text-[20px] text-white"
      onClick={e => {
        props.bundle.command.execute()
        e.stopPropagation()
      }}
    >
      {props.children}
      <div className="absolute top-full w-xs -translate-x-[50%]">
        <StateDisplay state={state} />
      </div>
    </button>
  )
}

function StateDisplay(props: { state: object | null }) {
  const context = useContext(Context)
  const gameState = context?.gameState!

  const state = props.state
  if (state === null) return null

  return Object.entries(state).map(([key, value]) => {
    if (key === "toolsLeft") {
      return (
        <div key={key}>
          <p>Left tools: {value}</p>
        </div>
      )
    } else if (key === "usesLeft") {
      return (
        <div key={key}>
          <p>Left uses: {value}</p>
        </div>
      )
    } else if (key === "timers") {
      const val = value as {
        toolId: ToolId
        leftUseTime: number
        leftCooldownTime: number
      }[]

      const cooldowns = val
        .map(v => v.leftCooldownTime)
        .filter(t => t !== -1)
        .sort((a, b) => a - b)
        .reduce((prev, t) => prev + t + ", ", "")
        .slice(0, -2)

      const current = gameState.currentToolId
        ? val.find(x => x.toolId === gameState.currentToolId)
        : null

      return (
        <div key={key}>
          {current ? <p>Left time: {current.leftUseTime}</p> : null}
          <p>Cooldowns: {cooldowns}</p>
        </div>
      )
    }
  })
}

export const SelectSize = () => {
  const dispatch = useAppDispatch()
  const size = useAppSelector(selectSize)

  return (
    <div>
      <input
        style={
          {
            // writingMode: "vertical-lr",
            // direction: "rtl",
            // height: "70px",
          }
        }
        type="range"
        max={42}
        min={2}
        step={2}
        value={size}
        onChange={event => {
          const value = parseInt(event.target.value)
          dispatch(setSize(value))
        }}
      ></input>
    </div>
  )
}
