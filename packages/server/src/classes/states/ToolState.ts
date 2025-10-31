import { ToolStateComponent } from "./tools/ToolStateComponent";

export interface ToolStateChangeObserver {
  onChange(state: object): void;
}

export class ToolState {
  private observers: ToolStateChangeObserver[] = [];

  private constructor(private components: ToolStateComponent[]) {}

  public static ctor(components: ToolStateComponent[]) {
    const obj = new ToolState(components);
    obj.init();

    return obj;
  }

  public init() {
    const cb = () => this.onChange();
    this.components.forEach((c) => c.setOnChangeCB(cb));
  }

  public findComponent<T>(constructor: new (...args: any[]) => T): T | null {
    const component = this.components.find((x) => x instanceof constructor);
    if (component) {
      return component as T;
    } else {
      return null;
    }
  }

  public getState(): object {
    return Object.assign({}, ...this.components.map((c) => c.getState()));
  }

  public registerListener(observer: ToolStateChangeObserver) {
    this.observers.push(observer);
  }

  public onChange() {
    const state = this.getState();
    this.observers.forEach((o) => o.onChange(state));
  }
}
