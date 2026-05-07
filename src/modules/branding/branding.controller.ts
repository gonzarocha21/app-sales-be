import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { brandingService } from "./branding.service";

const get: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, brandingService.get());
  } catch (error) {
    next(error);
  }
};

export const brandingController = {
  get
};
