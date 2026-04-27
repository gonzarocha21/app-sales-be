import { Router } from "express";
import { movementsController } from "./movements.controller";

const movementsRouter = Router();

movementsRouter.get("/", movementsController.list);

export { movementsRouter };
