import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { authService } from "./auth.service";

const login: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, authService.login(req.body), "Login successful");
  } catch (error) {
    next(error);
  }
};

export const authController = {
  login
};
