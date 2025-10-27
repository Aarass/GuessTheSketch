import type { ToolStateComponent } from "./tools/ToolStateComponent";

export class ToolState {
  constructor(
    public toolsLeft: number,
    public components: ToolStateComponent[] = [],
  ) {}

  findComponent<T>(constructor: new (...args: any[]) => T): T | null {
    const component = this.components.find((x) => x instanceof constructor);
    if (component) {
      return component as T;
    } else {
      return null;
    }
  }

  getState(): object {
    return Object.assign(
      {
        toolsLeft: this.toolsLeft,
      },
      ...this.components.map((c) => c.getState()),
    );
  }
}
