import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireAdmin } from "../../middleware/requireAdmin";
import { employeesController } from "./employees.controller";

export const employeesRouter = Router();

employeesRouter.get("/", authenticate, requireAdmin, employeesController.list);
employeesRouter.post("/", authenticate, requireAdmin, employeesController.create);
employeesRouter.get("/:id", authenticate, requireAdmin, employeesController.getById);
employeesRouter.put("/:id", authenticate, requireAdmin, employeesController.update);
employeesRouter.delete("/:id", authenticate, requireAdmin, employeesController.deactivate);
