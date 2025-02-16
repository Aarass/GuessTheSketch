export interface RGB {
  r: number
  g: number
  b: number
}

export function HSVtoRGB(h: number, s: number, v: number): RGB {
  let r, g, b, i, f, p, q, t

  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
    default:
      throw ``
  }

  const rgb: RGB = {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }

  return rgb
}

export function RGBtoHexString(rgb: RGB): string {
  const r = rgb.r.toString(16).padStart(2, "0")
  const g = rgb.g.toString(16).padStart(2, "0")
  const b = rgb.b.toString(16).padStart(2, "0")

  return `#${r}${g}${b}`
}

export function HexStringToRGB(color: string): RGB {
  const rgb: RGB = {
    r: parseInt(color.substring(1, 3), 16),
    g: parseInt(color.substring(3, 5), 16),
    b: parseInt(color.substring(5, 7), 16),
  }
  return rgb
}

export function colorsAreEqual(clr1: RGB, clr2: RGB) {
  return clr1.r === clr2.r && clr1.g === clr2.g && clr1.b === clr2.b
}
