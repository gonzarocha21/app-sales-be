import { Router } from "express";
import { returnsController } from "./returns.controller";

const returnsRouter = Router();

returnsRouter.get("/", returnsController.list);
returnsRouter.post("/", returnsController.create);

export { returnsRouter };
