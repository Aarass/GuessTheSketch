export const toolTypes = ["pen", "eraser"] as const;
export type ToolType = (typeof toolTypes)[number];
