import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  //eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!req.session || req.session.userId === undefined) {
    next(createHttpError(401, "You must be logged in to proceed!"));
  } else {
    next();
  }
}
