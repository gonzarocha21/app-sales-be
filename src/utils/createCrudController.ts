import { RequestHandler } from "express";
import { CrudService } from "../types/crud";
import { sendSuccess } from "./apiResponse";

export const createCrudController = <T>(resourceName: string, service: CrudService<T>) => {
  const list: RequestHandler = (_req, res) => {
    sendSuccess(res, service.list());
  };

  const create: RequestHandler = (req, res) => {
    sendSuccess(res, service.create(req.body), `${resourceName} created placeholder`, 201);
  };

  const getById: RequestHandler = (req, res) => {
    sendSuccess(res, service.getById(req.params.id));
  };

  const update: RequestHandler = (req, res) => {
    sendSuccess(res, service.update(req.params.id, req.body), `${resourceName} updated placeholder`);
  };

  const remove: RequestHandler = (req, res) => {
    sendSuccess(res, service.remove(req.params.id), `${resourceName} deleted placeholder`);
  };

  return {
    list,
    create,
    getById,
    update,
    remove
  };
};
