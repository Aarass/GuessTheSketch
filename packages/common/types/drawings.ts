import type { Point } from "..";

export type DrawingId = string & { __brand: "DrawingId" };

interface DrawingBase {
  id: DrawingId;
  type: string;
}

interface RegularDrawingBase extends DrawingBase {
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
  type: "eraser";
  toDelete: DrawingId;
}

type DrawingList = readonly [
  FreeLine,
  Line,
  Rect,
  Circle,
  Dot,
  FloodFill,
  Eraser,
];

export type Drawing = DrawingList[number];
export type NewDrawing = _NewDrawing<DrawingList>;

// ************************************************************
/**
 * Type used for server side stuff. Don't touch.
 */
export type UnvalidatedNewDrawing = _UnvalidatedNewDrawing<DrawingList>;
// ************************************************************
/**
 * Type used for server side stuff. Don't touch.
 */
export type UnvalidatedNewDrawingWithType =
  _UnvalidatedNewDrawingWithType<DrawingList>;
// ************************************************************

type _NewDrawing<L extends DrawingList> = {
  [I in keyof L]: Omit<L[I], "id"> & { tempId: string };
}[number];

type _UnvalidatedNewDrawing<L extends DrawingList> = {
  [I in keyof L]: Partial<Omit<L[I], "id"> & { tempId: string }>;
}[number];

type _UnvalidatedNewDrawingWithType<L extends DrawingList> = {
  [I in keyof L]: Pick<L[I], "type"> & Partial<Omit<L[I], "id" | "type">>;
}[number];

// Kako je pocelo:
// ---------------------------------------------------------------
// type DrawingWithType<T extends Drawing> = Pick<T, "type"> &
//   Partial<Omit<T, "type">>;
//
// type t2 = DrawingWithType<FreeLine> | DrawingWithType<Circle>;
//
// const tmp: t2 = {
//   type: "circle",
// };
// ---------------------------------------------------------------

// Sta me spasilo:
// -------------------------------------------
// type Example<L extends readonly any[]> = {
//   [I in keyof L]: Partial<L[I]>;
// }[number];
// -------------------------------------------

// function foo(tmp: UnvalidatedNewDrawing) {
//   if (tmp.type) {
//     if (tmp.type == "circle") {
//       console.log(tmp.r);
//     } else if (tmp.type == "line") {
//       console.log(tmp.p1);
//     }
//   }
// }

// function bar(tmp: UnvalidatedNewDrawingWithType) {
//   if (tmp.type == "circle") {
//     console.log(tmp.r);
//   } else if (tmp.type == "line") {
//     console.log(tmp.p1);
//   }
// }
//
