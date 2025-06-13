import express from "express";
import type { AppContext } from "../AppContext";

export abstract class Controller {
  protected router = express.Router();
  protected ctx!: AppContext;

  constructor() {}

  public setContext(ctx: AppContext) {
    this.ctx = ctx;
  }

  public getHandlers() {
    if (!this.ctx) throw `You forgot to set context`;

    return this.router;
  }
}
