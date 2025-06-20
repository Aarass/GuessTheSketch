import p5 from "p5"
import { GameState } from "./GameState"
import {
  Drawing,
  DrawingInFly,
  NewDrawing,
  Point,
} from "@guessthesketch/common"
import { colorsAreEqual, HexStringToRGB } from "../../utils/colors"

type Framebuffer = p5.Framebuffer & {
  loadPixels(): void
  updatePixels(): void
}

const mustRedrawTypes: DrawingInFly["type"][] = ["circle", "rect", "line"]

const gameState = GameState.getInstance()

const bg = 0 // TODO

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
      sketch.createCanvas(700, 500, "webgl", canvas)

      sketch.background(bg)
      sketch.fill(0)
      sketch.noStroke()

      commitBuffer = sketch.createFramebuffer() as any as Framebuffer
    }

    function applyTransform() {
      sketch.translate(-sketch.width / 2, -sketch.height / 2)
    }

    sketch.draw = () => {
      const drawings = gameState.getAllDrawings()
      const thereIsNewDrawings = nextStart !== drawings.length

      if (thereIsNewDrawings) {
        commitBuffer.draw(() => {
          sketch.push()
          applyTransform()

          if (nextStart <= 0) {
            sketch.background(bg)
          }

          for (let i = Math.max(nextStart, 0); i < drawings.length; i++) {
            draw(drawings[i], sketch, commitBuffer)
          }

          sketch.pop()
        })

        nextStart = drawings.length
      }

      applyTransform()

      if (gameState.inFly) {
        const drawing = gameState.inFly.drawing

        if (mustRedrawTypes.includes(drawing.type)) {
          sketch.background(bg)
          sketch.image(commitBuffer, 0, 0)
        }

        draw(
          gameState.inFly.drawing,
          sketch,
          null as any as Framebuffer /* Safety measures*/,
        )
      } else {
        if (thereIsNewDrawings) {
          sketch.background(bg)
          sketch.image(commitBuffer, 0, 0)
        }
      }

      // sketch.fill(255)
      // sketch.noStroke()
      // sketch.rect(10, 10, 100, 100)

      // showFramerate()
    }

    // if (gameState.inFly === null) {
    //   sketch.image(commitBuffer, 0, 0)
    // } else {
    //   const drawing = gameState.inFly.drawing
    //   if (problematicTypes.includes(drawing.type)) {
    //     sketch.image(commitBuffer, 0, 0)
    //   }
    //   draw(drawing, sketch, commitBuffer)
    // }

    const pg = sketch.createGraphics(256, 256)

    function showFramerate() {
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
  }
}

function draw(
  drawing: Drawing | NewDrawing | DrawingInFly,
  sketch: p5,
  commitBuffer: Framebuffer,
) {
  // sketch.fill(255)
  // sketch.noStroke()
  // sketch.rect(10, 10, 100, 100)
  //
  // return undefined

  switch (drawing.type) {
    case "freeline":
      sketch.stroke(drawing.color)
      sketch.strokeWeight(drawing.size)

      if (drawing.points.length == 1) {
        sketch.point(drawing.points[0].x, drawing.points[0].y)
        return
      }

      let i = 0

      if (gameState.inFly?.drawing === drawing) {
        if (gameState.inFly.i === null || gameState.inFly.i === undefined)
          throw `zaboravio si da postavis i`

        i = gameState.inFly.i
        gameState.inFly.i = drawing.points.length - 2
      }

      for (; i < drawing.points.length - 1; i++) {
        line(drawing.points[i], drawing.points[i + 1])
      }

      break
    case "line":
      sketch.stroke(drawing.color)
      sketch.strokeWeight(drawing.size)
      line(drawing.p1, drawing.p2)
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
      let id

      if ((drawing as Drawing).id) {
        id = (drawing as Drawing).id
      } else if ((drawing as NewDrawing).tempId) {
        id = (drawing as NewDrawing).tempId
      } else {
        throw `floodFill can't be infly drawing`
      }

      const cachedDrawing = ffc.get(id)

      if (cachedDrawing) {
        sketch.image(cachedDrawing, 0, 0)
      } else {
        commitBuffer.loadPixels()
        floodFill(sketch, drawing, commitBuffer.pixels)
        commitBuffer.updatePixels()
      }
      break
  }

  function line(p1: Point, p2: Point) {
    sketch.line(p1.x, p1.y, 0.00075, p2.x, p2.y, 0.00075)
  }
}

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

const ffc = new Map<string, p5.Image>()

async function floodFill(
  sketch: p5,
  drawing: Drawing | NewDrawing | DrawingInFly,
  pixels: number[],
) {
  if (drawing.type !== "flood") throw ``

  const cache = sketch.createImage(sketch.width, sketch.height)
  cache.loadPixels()

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
    cache.set(currentPos.x, currentPos.y, [
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
        cache.set(newPos.x, newPos.y, [
          targetColor.r,
          targetColor.g,
          targetColor.b,
          255,
        ])
      }
    }
  }

  cache.updatePixels()
  const id = (drawing as any).id
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  // TODO
  ffc.set(id ?? "", cache)
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
