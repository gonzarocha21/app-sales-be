import { RequestHandler } from "express";
import { locationsService } from "./locations.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    res.json({
      data: locationsService.list()
    });
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Location created",
      data: locationsService.create(req.body)
    });
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    res.json({
      data: locationsService.getById(req.params.id)
    });
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Location updated",
      data: locationsService.update(req.params.id, req.body)
    });
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Location deleted",
      data: locationsService.remove(req.params.id)
    });
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
