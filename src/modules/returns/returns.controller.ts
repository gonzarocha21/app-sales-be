import { RequestHandler } from "express";
import { returnsService } from "./returns.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    res.json({
      data: returnsService.list()
    });
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Return registered",
      data: returnsService.create(req.body)
    });
  } catch (error) {
    next(error);
  }
};

export const returnsController = {
  list,
  create
};
