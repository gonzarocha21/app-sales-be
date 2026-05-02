import { Router } from "express";
import { settingsController } from "./settings.controller";

export const settingsRouter = Router();

settingsRouter.get("/", settingsController.get);
settingsRouter.put("/", settingsController.update);
