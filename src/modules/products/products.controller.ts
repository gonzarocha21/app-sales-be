import { RequestHandler } from "express";
import { productsService } from "./products.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    res.json({
      data: productsService.list()
    });
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Product created",
      data: productsService.create(req.body)
    });
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    res.json({
      data: productsService.getById(req.params.id)
    });
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Product updated",
      data: productsService.update(req.params.id, req.body)
    });
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    res.json({
      message: "Product deleted",
      data: productsService.remove(req.params.id)
    });
  } catch (error) {
    next(error);
  }
};

export const productsController = {
  list,
  create,
  getById,
  update,
  remove
};
