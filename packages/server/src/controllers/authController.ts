import express from "express";
import createHttpError from "http-errors";

import { LoginDtoSchema, type LoginDto } from "@guessthesketch/common";
import authService from "../services/authService";

let router = express.Router();

declare module "express-serve-static-core" {
  interface Request {
    session: {
      data: {
        userId?: string;
      };
    };
  }
}

router.post("/login", async (req, res, next) => {
  const validationResult = await LoginDtoSchema.safeParseAsync(req.body);
  if (!validationResult.success) {
    return next(createHttpError(404, validationResult.error));
  }

  const data = validationResult.data;
  const user = await authService.login(data);

  console.log(user);

  req.session.data = {
    userId: user.id,
  };

  res.sendStatus(200);
});

router.post("/logout", async (req, res, next) => {
  try {
    (req.session as any).destroy();
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return next(createHttpError(400, `Logout failed`));
  }
});

export default router;
