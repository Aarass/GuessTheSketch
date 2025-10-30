import express from "express";
import type { AppContext } from "../AppContext";

export abstract class Controller {
  protected router = express.Router();

  constructor(protected ctx: AppContext) {}

  public getRouter() {
    return this.router;
  }
}
