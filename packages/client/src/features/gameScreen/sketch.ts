import p5 from "p5"
import { drawings, inFly } from "./state"
import { Drawing } from "./GameScreen"
import { colorsAreEqual, HexStringToRGB } from "../../utils/colors"

type Framebuffer = p5.Framebuffer & {
  loadPixels(): void
  updatePixels(): void
}

export const initSketch = (canvas: HTMLCanvasElement) => {
  return (sketch: p5) => {
    const bg = 0
    let nextStart = -1
    let commitBuffer: Framebuffer

    sketch.setup = () => {
      sketch.createCanvas(700, 500, "webgl", canvas)

      commitBuffer = sketch.createFramebuffer() as any as Framebuffer

      sketch.background(bg)
      sketch.fill(0)
      sketch.noStroke()
      sketch.noLoop()
    }

    sketch.draw = () => {
      if (nextStart > drawings.length) {
        nextStart = -1
      }

      if (nextStart !== drawings.length) {
        commitBuffer.begin()

        sketch.translate(-sketch.width / 2, -sketch.height / 2)

        if (nextStart == -1) {
          sketch.background(bg)
        }

        commitBuffer.loadPixels()

        let i = Math.max(nextStart, 0)
        for (; i < drawings.length; i++) {
          const drawing = drawings[i]

          if (drawing.type == "flood") {
            commitBuffer.loadPixels()
            draw(drawing, sketch, commitBuffer.pixels)

            // TODO
            // ovde moze optimizacija
            // updatePixels prihvata "bounding box promena"
            // znaci moze da mu se zada regija koju treba da updata umesto da updata ceo ekran

            commitBuffer.updatePixels()
          } else {
            draw(drawing, sketch, [])
          }
        }
        nextStart = i

        commitBuffer.end()
      }

      sketch.translate(-sketch.width / 2, -sketch.height / 2)
      sketch.image(commitBuffer, 0, 0)

      commitBuffer.pixels

      if (inFly.drawing) {
        draw(inFly.drawing, sketch)
      }
    }
  }
}

function draw(drawing: Drawing, sketch: p5, pixels?: number[]) {
  switch (drawing.type) {
    case "line":
      sketch.stroke(drawing.color)
      sketch.strokeWeight(drawing.size)
      sketch.line(
        drawing.p1.x,
        drawing.p1.y,
        0.00075,
        drawing.p2.x,
        drawing.p2.y,
        0.00075,
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
      sketch.rect(drawing.topLeft.x, drawing.topLeft.y, drawing.w, drawing.h)
      break
    case "flood":
      if (pixels === undefined) throw ``
      floodFill(sketch, drawing, pixels)
      break
  }
}

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

async function floodFill(sketch: p5, drawing: Drawing, pixels: number[]) {
  if (drawing.type !== "flood") throw ``

  const d = sketch.pixelDensity()
  const w = sketch.width

  const x = Math.round(drawing.p.x)
  const y = Math.round(drawing.p.y)

  const index = 4 * (y * d * w * d + x * d)

  const startColor = {
    r: pixels[index],
    g: pixels[index + 1],
    b: pixels[index + 2],
  }

  const targetColor = HexStringToRGB(drawing.color)

  if (colorsAreEqual(startColor, targetColor)) return

  const queue = [{ x, y }]

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

    for (const dir of dirs) {
      const newPos = {
        x: currentPos.x + dir[0],
        y: currentPos.y + dir[1],
      }

      if (pointContainsColor(pixels, newPos.x, newPos.y, startColor, d, w)) {
        queue.push(newPos)
      } else {
        setColor(pixels, newPos.x, newPos.y, targetColor, d, w)
      }
    }
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
