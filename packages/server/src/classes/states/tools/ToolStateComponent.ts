type OnChange = () => any;

export abstract class ToolStateComponent<T = unknown> {
  private notifyChange!: OnChange;

  constructor(protected state: T) {}

  public set(cb: (_: T) => T): void {
    this.state = cb(this.state);
    this.notifyChange();
  }

  public getState(): T {
    return this.state;
  }

  public setOnChangeCB(cb: OnChange) {
    this.notifyChange = cb;
  }
}
