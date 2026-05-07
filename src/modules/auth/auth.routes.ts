import express, { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.get("/me", authenticate, authController.me);
authRouter.put("/me", authenticate, authController.updateMe);
authRouter.put(
  "/me/avatar",
  authenticate,
  express.raw({ type: "*/*", limit: "2mb" }),
  authController.updateAvatar
);

export { authRouter };
