import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { settingsService } from "./settings.service";

const get: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, settingsService.get());
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, settingsService.update(req.body));
  } catch (error) {
    next(error);
  }
};

export const settingsController = {
  get,
  update
};
