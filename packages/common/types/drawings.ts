import type { Point } from "..";

export type DrawingId = string & { __brand: "DrawingId" };

interface DrawingBase {
  id: DrawingId;
  type: string;
}

export interface RegularDrawingBase extends DrawingBase {
  id: DrawingId;
  color: string;
  size: number;
}

export interface FreeLine extends RegularDrawingBase {
  type: "freeline";
  points: Point[];
}

export interface Line extends RegularDrawingBase {
  type: "line";
  p1: Point;
  p2: Point;
}

export interface Rect extends RegularDrawingBase {
  type: "rect";
  topLeft: Point;
  w: number;
  h: number;
}

export interface Circle extends RegularDrawingBase {
  type: "circle";
  p: Point;
  r: number;
}

export interface Dot extends RegularDrawingBase {
  type: "dot";
  p: Point;
}

export interface FloodFill extends RegularDrawingBase {
  type: "flood";
  p: Point;
}

export interface Eraser extends DrawingBase {
  id: DrawingId;
  type: "eraser";
  toDelete: DrawingId;
}

export type Drawing =
  | FreeLine
  | Line
  | Rect
  | Circle
  | Dot
  | FloodFill
  | Eraser;
