import p5 from "p5"
import { GameState } from "./GameState"
import { Drawing, DrawingInFly, Point } from "@guessthesketch/common"
import { colorsAreEqual, HexStringToRGB } from "../../utils/colors"

/*
 * Note, da sledeci put ne gubis vreme.

 * Index u Snapshot-u je index crteza koji je poslednji iscrtan. Dakle,
 * to je crtez koji je obuhvacen snapshotom. Snapshot sadrzi taj index.
 *  
 * NextStart predstavljla indeks crteza koji treba biti prvi iscrtan u novoj
 * iteraciji. Dakle, taj crtez ne pripada ni jednom snapshotu.
 * 
 * Jos jedna stvar NextStart moze da ima vrenost -1. Ne mogu da se setim zasto,
 * ali mislim da je zbog brisanje pozadine.
 */

type Framebuffer = p5.Framebuffer & {
  loadPixels(): void
  updatePixels(): void
}

type Index = number & { __brand: "Index" }
type Pixels = number[] & { __brand: "Pixels" }

type Snapshot = {
  index: Index
  pixels: Pixels
}

const gameState = GameState.getInstance()

const snapshots: Snapshot[] = []
const snapshotStep = 5

export const initSketch = (canvas: HTMLCanvasElement) => {
  return (sketch: p5) => {
    gameState.reset()

    const bg = 0
    let nextStart = -1
    let commitBuffer: Framebuffer

    let pg: any
    sketch.setup = () => {
      sketch.createCanvas(700, 500, "webgl", canvas)

      commitBuffer = sketch.createFramebuffer() as any as Framebuffer

      sketch.background(bg)
      sketch.fill(0)
      sketch.noStroke()
      // sketch.noLoop()

      pg = sketch.createGraphics(256, 256)
    }

    function applyTransforms() {
      sketch.translate(-sketch.width / 2, -sketch.height / 2)
    }

    sketch.draw = () => {
      const drawings = gameState.drawings
      const drawingsLength = gameState.drawings.length

      const undoHappened = nextStart > drawingsLength

      if (undoHappened) {
        let currentSnapshot: Snapshot | null = null

        for (let i = snapshots.length - 1; i >= 0; i--) {
          if (snapshots[i].index >= drawingsLength) {
            snapshots.pop()
          } else {
            currentSnapshot = snapshots[i]
            break
          }
        }

        // console.log("Novi aktuelni snapshot je: ", currentSnapshot)

        if (currentSnapshot) {
          commitBuffer.loadPixels()
          for (let i = 0; i < currentSnapshot.pixels.length; i++)
            commitBuffer.pixels[i] = currentSnapshot.pixels[i]
          commitBuffer.updatePixels()

          nextStart = currentSnapshot.index + 1
        } else {
          nextStart = -1
        }

        // console.log("NextStart je sada: ", nextStart)
      }

      if (nextStart !== drawingsLength) {
        commitBuffer.begin()

        if (nextStart <= 0) {
          sketch.background(bg)
        }

        applyTransforms()

        for (let i = Math.max(nextStart, 0); i < drawingsLength; i++) {
          const drawing = drawings[i]

          if (drawing.type === "flood") {
            const cachedDrawing = ffc.get(drawing.id)

            if (cachedDrawing) {
              sketch.image(cachedDrawing, 0, 0)
            } else {
              commitBuffer.loadPixels()
              draw(drawing, sketch, commitBuffer.pixels)
              commitBuffer.updatePixels()
            }
          } else {
            draw(drawing, sketch, [])
          }
        }

        commitBuffer.end()
        nextStart = drawingsLength

        if (drawingsLength > 0 && drawingsLength % snapshotStep === 0) {
          const currentIndex = drawingsLength - 1
          const currentSnapshot = snapshots.at(-1)

          // console.log(
          //   `currentIndex: ${currentIndex}, currentSnapshot:`,
          //   currentSnapshot,
          // )

          if (
            currentSnapshot === undefined ||
            currentSnapshot.index !== currentIndex
          ) {
            commitBuffer.loadPixels()
            snapshots.push({
              index: currentIndex as Index,
              pixels: commitBuffer.pixels.slice() as Pixels,
            })

            // console.log("Ubacio sam novi snapshot:", snapshots.at(-1))
          }
        }
      }

      const drawingInFly = gameState.inFly.drawing

      const problematicTypes: Drawing["type"][] = ["circle", "rect", "line"]

      applyTransforms()

      if (drawingInFly === null) {
        sketch.image(commitBuffer, 0, 0)
      } else {
        if (problematicTypes.includes(drawingInFly.type)) {
          sketch.image(commitBuffer, 0, 0)
        }
        draw(drawingInFly, sketch)
      }

      if (false) {
        sketch.noStroke()
        sketch.noFill()
        sketch.translate(50, 50)
        ;(pg as any).background(255)
        ;(pg as any).textSize(200)
        ;(pg as any).text(Math.round(sketch.frameRate()), 20, 200)
        sketch.texture(pg)
        sketch.plane(50)
      }
    }
  }
}

function draw(drawing: Drawing | DrawingInFly, sketch: p5, pixels?: number[]) {
  switch (drawing.type) {
    case "freeline":
      sketch.stroke(drawing.color)
      sketch.strokeWeight(drawing.size)

      if (drawing.points.length == 1) {
        sketch.point(drawing.points[0].x, drawing.points[0].y)
        return
      }

      let i = 0

      if (drawing == gameState.inFly.drawing) {
        if (gameState.inFly.i === null) throw `zaboravio si da postavis i`
        i = gameState.inFly.i
      }

      for (; i < drawing.points.length - 1; i++) {
        line(drawing.points[i], drawing.points[i + 1])
      }

      gameState.inFly.i = i

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
      if (pixels === undefined) throw ``
      floodFill(sketch, drawing, pixels)
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
  drawing: Drawing | DrawingInFly,
  pixels: number[],
) {
  if (drawing.type !== "flood") throw ``

  const cache = sketch.createImage(sketch.width, sketch.height)
  cache.loadPixels()
  const imgPixels = cache.pixels

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
