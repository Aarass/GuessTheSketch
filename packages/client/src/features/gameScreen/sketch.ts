import {
  Drawing,
  DrawingInFly,
  FloodFill,
  NewDrawing,
} from "@guessthesketch/common"
import p5 from "p5"
import { colorsAreEqual, HexStringToRGB } from "../../utils/colors"
import { GameState } from "./GameState"

const bg = 255 // TODO
const gameState = GameState.getInstance()

/**
 * Osiguraj zivotom ako treba da se ova funkcija ne pozove vise
 * od jednom za isti canvas/sketch. p5.js poludi ako se to desi.
 * createCanvas je izvor problema. Nije do nas do p5.js-a je.
 */
export const initSketch = (canvas: HTMLCanvasElement) => {
  return (sketch: p5) => {
    gameState.reset()

    let commitBuffer: Framebuffer
    let nextStart = -1

    sketch.setup = () => {
      sketch.setAttributes("depth", false)
      sketch.createCanvas(700, 500, "webgl", canvas)

      sketch.background(bg)
      sketch.fill(0)
      sketch.noStroke()

      commitBuffer = sketch.createFramebuffer({
        depth: false,
      }) as any as Framebuffer
    }

    sketch.draw = () => {
      applyTransform()
      sketch.background(bg)

      prepareConfirmed()
      drawConfirmed()
      drawUnconfirmed()
      drawInFly()

      if (false) {
        drawFramerate()
      }
    }

    function applyTransform() {
      sketch.translate(-sketch.width / 2, -sketch.height / 2)
    }

    function prepareConfirmed() {
      if (gameState.deleteFlag === true) {
        nextStart = -1

        gameState.deleteFlag = false
      }

      const drawings = gameState.confirmedDrawings
      const needsRedraw = nextStart !== drawings.length

      if (needsRedraw) {
        commitBuffer.draw(() => {
          applyTransform()

          if (nextStart <= 0) {
            sketch.background(bg)
          }

          for (let i = Math.max(nextStart, 0); i < drawings.length; i++) {
            draw(drawings[i])
          }
        })

        nextStart = drawings.length
      }
    }

    function drawConfirmed() {
      sketch.image(commitBuffer, 0, 0)
    }

    function drawUnconfirmed() {
      for (const d of gameState.unconfirmedDrawings.getAll()) {
        draw(d)
      }
    }

    function drawInFly() {
      if (gameState.drawingInFly) {
        draw(gameState.drawingInFly)
      }
    }

    const pg = sketch.createGraphics(256, 256)

    function drawFramerate() {
      pg.background(255)
      pg.textSize(200)
      pg.text(Math.round(sketch.frameRate()), 20, 200)

      sketch.push()

      sketch.noFill()
      sketch.noStroke()
      sketch.translate(50, 50)
      sketch.texture(pg as any)
      sketch.plane(50)

      sketch.pop()
    }

    function draw(drawing: Drawing | NewDrawing | DrawingInFly) {
      switch (drawing.type) {
        case "freeline":
          sketch.stroke(drawing.color)
          sketch.strokeWeight(drawing.size)

          if (drawing.points.length === 1) {
            sketch.point(drawing.points[0].x, drawing.points[0].y)
            return
          }

          // Either works
          // -------------------------------------------------
          sketch.noFill()
          sketch.beginShape()
          for (let i = 0; i < drawing.points.length; i++) {
            sketch.vertex(drawing.points[i].x, drawing.points[i].y)
          }
          sketch.endShape()
          // -------------------------------------------------
          // sketch.beginShape(0x0001)
          // for (let i = 0; i < drawing.points.length - 1; i++) {
          //   sketch.vertex(drawing.points[i].x, drawing.points[i].y)
          //   sketch.vertex(drawing.points[i + 1].x, drawing.points[i + 1].y)
          // }
          // sketch.endShape()
          // -------------------------------------------------

          break
        case "line":
          sketch.stroke(drawing.color)
          sketch.strokeWeight(drawing.size)
          sketch.line(
            drawing.p1.x,
            drawing.p1.y,
            0,
            drawing.p2.x,
            drawing.p2.y,
            0,
          )
          break
        case "dot":
          sketch.stroke(drawing.color)
          sketch.strokeWeight(drawing.size)
          sketch.point(drawing.p.x, drawing.p.y)
          break
        case "circle":
          sketch.noStroke()
          sketch.fill(drawing.color)
          sketch.ellipse(drawing.p.x, drawing.p.y, drawing.r)
          break
        case "rect":
          sketch.noStroke()
          sketch.fill(drawing.color)
          sketch.rect(
            drawing.topLeft.x,
            drawing.topLeft.y,
            drawing.w,
            drawing.h,
          )
          break
        case "flood":
          const cachedResult = ffcGet(drawing)

          if (cachedResult) {
            sketch.image(cachedResult, 0, 0)
          } else {
            commitBuffer.loadPixels()
            const result = floodFill(sketch, drawing, commitBuffer.pixels)
            if (result) {
              sketch.image(result, 0, 0)
              ffcSet(drawing, result)
            }
          }
          break
      }
    }
  }
}

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

// TODO ovo je mnogo messy resenje,
// siguran siguran sam da moze bolje
function floodFill(
  sketch: p5,
  drawing: FloodFill | Omit<FloodFill, "id">,
  sourcePixels: number[],
) {
  const d = sketch.pixelDensity()
  const w = sketch.width

  const x = Math.round(drawing.p.x)
  const y = Math.round(drawing.p.y)

  const index = 4 * (y * d * w * d + x * d)

  const pixels = Array.from(sourcePixels)

  const startColor = {
    r: pixels[index],
    g: pixels[index + 1],
    b: pixels[index + 2],
  }

  const targetColor = HexStringToRGB(drawing.color)

  if (colorsAreEqual(startColor, targetColor)) return

  const result = sketch.createImage(sketch.width, sketch.height)
  const queue = [{ x, y }]

  result.loadPixels()

  while (queue.length > 0) {
    const currentPos = queue.pop()!

    if (pointIsOfColor(pixels, currentPos.x, currentPos.y, targetColor, d, w))
      continue

    if (
      currentPos.x < 0 ||
      currentPos.x >= sketch.width ||
      currentPos.y < 0 ||
      currentPos.y >= sketch.height
    )
      continue

    setColor(pixels, currentPos.x, currentPos.y, targetColor, d, w)
    // setColor(result.pixels, currentPos.x, currentPos.y, targetColor, d, w)
    result.set(currentPos.x, currentPos.y, [
      targetColor.r,
      targetColor.g,
      targetColor.b,
      255,
    ])

    for (const dir of dirs) {
      const newPos = {
        x: currentPos.x + dir[0],
        y: currentPos.y + dir[1],
      }

      if (pointContainsColor(pixels, newPos.x, newPos.y, startColor, d, w)) {
        queue.push(newPos)
      } else {
        setColor(pixels, newPos.x, newPos.y, targetColor, d, w)
        // setColor(result.pixels, newPos.x, newPos.y, targetColor, d, w)
        result.set(newPos.x, newPos.y, [
          targetColor.r,
          targetColor.g,
          targetColor.b,
          255,
        ])
      }
    }
  }

  result.updatePixels()
  return result
}

const ffc = new Map<string, p5.Image>()

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

function ffcSet(drawing: MakeOptional<FloodFill, "id">, image: p5.Image) {
  if (drawing.id) {
    ffc.set(drawing.id, image)
  }
}

function ffcGet(drawing: MakeOptional<FloodFill, "id">) {
  if (drawing.id) {
    return ffc.get(drawing.id)
  }
}

function pointIsOfColor(
  pixels: number[],
  x: number,
  y: number,
  clr: { r: number; g: number; b: number },
  d: number,
  w: number,
) {
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      const index = 4 * ((y * d + j) * w * d + (x * d + i))
      if (
        pixels[index] !== clr.r ||
        pixels[index + 1] !== clr.g ||
        pixels[index + 2] !== clr.b ||
        pixels[index + 3] !== 255
      ) {
        return false
      }
    }
  }

  return true
}

function pointContainsColor(
  pixels: number[],
  x: number,
  y: number,
  clr: { r: number; g: number; b: number },
  d: number,
  w: number,
) {
  for (let i = 0; i < d; i += 1) {
    for (let j = 0; j < d; j += 1) {
      const index = 4 * ((y * d + j) * w * d + (x * d + i))
      if (
        pixels[index] === clr.r &&
        pixels[index + 1] === clr.g &&
        pixels[index + 2] === clr.b
      ) {
        return true
      }
    }
  }

  return false
}

function setColor(
  pixels: number[],
  x: number,
  y: number,
  clr: { r: number; g: number; b: number },

  d: number,
  w: number,
) {
  for (let i = 0; i < d; i += 1) {
    for (let j = 0; j < d; j += 1) {
      const index = 4 * ((y * d + j) * w * d + (x * d + i))
      pixels[index] = clr.r
      pixels[index + 1] = clr.g
      pixels[index + 2] = clr.b
      pixels[index + 3] = 255
    }
  }
}

type Framebuffer = p5.Framebuffer & {
  loadPixels(): void
  updatePixels(): void
}
