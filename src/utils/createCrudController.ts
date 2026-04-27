import { RequestHandler } from "express";
import { CrudService } from "../types/crud";

export const createCrudController = <T>(resourceName: string, service: CrudService<T>) => {
  const list: RequestHandler = (_req, res) => {
    res.json({
      data: service.list()
    });
  };

  const create: RequestHandler = (req, res) => {
    res.status(201).json({
      message: `${resourceName} created placeholder`,
      data: service.create(req.body)
    });
  };

  const getById: RequestHandler = (req, res) => {
    res.json({
      data: service.getById(req.params.id)
    });
  };

  const update: RequestHandler = (req, res) => {
    res.json({
      message: `${resourceName} updated placeholder`,
      data: service.update(req.params.id, req.body)
    });
  };

  const remove: RequestHandler = (req, res) => {
    res.json({
      message: `${resourceName} deleted placeholder`,
      data: service.remove(req.params.id)
    });
  };

  return {
    list,
    create,
    getById,
    update,
    remove
  };
};
