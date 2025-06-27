export const toolTypes = [
  "pen",
  "bucket",
  "circle",
  "rect",
  "line",
  "eraser",
] as const;
export type ToolType = (typeof toolTypes)[number];
