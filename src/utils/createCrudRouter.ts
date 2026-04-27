import { RequestHandler, Router } from "express";

type CrudController = {
  list: RequestHandler;
  create: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
};

export const createCrudRouter = (controller: CrudController) => {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
};
