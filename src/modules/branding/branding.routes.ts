import { Router } from "express";
import { brandingController } from "./branding.controller";

export const brandingRouter = Router();

brandingRouter.get("/", brandingController.get);
