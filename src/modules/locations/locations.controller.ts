import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { locationsService } from "./locations.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, locationsService.list());
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, locationsService.create(req.body), "Location created successfully", 201);
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, locationsService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, locationsService.update(req.params.id, req.body), "Location updated");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, locationsService.remove(req.params.id), "Location deleted");
  } catch (error) {
    next(error);
  }
};

export const locationsController = {
  list,
  create,
  getById,
  update,
  remove
};
