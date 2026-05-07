import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { sendSuccess } from "../../utils/apiResponse";
import { authService } from "./auth.service";

const login: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, authService.login(req.body), "Login successful");
  } catch (error) {
    next(error);
  }
};

const me: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, authService.getProfile((req as AuthenticatedRequest).user));
  } catch (error) {
    next(error);
  }
};

const updateMe: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, authService.updateProfile((req as AuthenticatedRequest).user, req.body));
  } catch (error) {
    next(error);
  }
};

const updateAvatar: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(
      res,
      authService.updateAvatar((req as AuthenticatedRequest).user, {
        contentType: req.headers["content-type"],
        buffer: req.body
      })
    );
  } catch (error) {
    next(error);
  }
};

export const authController = {
  login,
  me,
  updateMe,
  updateAvatar
};
