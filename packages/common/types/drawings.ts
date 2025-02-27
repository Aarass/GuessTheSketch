import type { Point } from "..";

export interface DrawingBase {
  id: string;
  color: string;
  size: number;
}

export interface FreeLine extends DrawingBase {
  type: "freeline";
  points: Point[];
}

export interface Line extends DrawingBase {
  type: "line";
  p1: Point;
  p2: Point;
}

export interface Rect extends DrawingBase {
  type: "rect";
  topLeft: Point;
  w: number;
  h: number;
}

export interface Circle extends DrawingBase {
  type: "circle";
  p: Point;
  r: number;
}

export interface Dot extends DrawingBase {
  type: "dot";
  p: Point;
}

export interface FloodFill extends DrawingBase {
  type: "flood";
  p: Point;
}

export type Drawing = FreeLine | Line | Rect | Circle | Dot | FloodFill;
