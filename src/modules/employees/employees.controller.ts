import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { employeesService } from "./employees.service";

const list: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, employeesService.list(req.query));
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, employeesService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, employeesService.create(req.body), "Employee created successfully", 201);
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, employeesService.update(req.params.id, req.body), "Employee updated successfully");
  } catch (error) {
    next(error);
  }
};

const deactivate: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, employeesService.deactivate(req.params.id), "Employee deactivated successfully");
  } catch (error) {
    next(error);
  }
};

export const employeesController = {
  list,
  getById,
  create,
  update,
  deactivate
};
