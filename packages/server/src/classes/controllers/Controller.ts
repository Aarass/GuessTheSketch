import express from "express";
import type { AppContext } from "../AppContext";

export abstract class Controller {
  protected router = express.Router();
  protected ctx!: AppContext;

  public withContext(ctx: AppContext) {
    this.ctx = ctx;
    return this.router;
  }
}
