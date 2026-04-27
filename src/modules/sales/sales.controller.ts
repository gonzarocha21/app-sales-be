import { RequestHandler } from "express";
import { salesService } from "./sales.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    res.json({
      data: salesService.list()
    });
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Sale registered",
      data: salesService.create(req.body)
    });
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    res.json({
      data: salesService.getById(req.params.id)
    });
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Sale updated",
      data: salesService.update(req.params.id, req.body)
    });
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Sale deleted",
      data: salesService.remove(req.params.id)
    });
  } catch (error) {
    next(error);
  }
};

export const salesController = {
  list,
  create,
  getById,
  update,
  remove
};
