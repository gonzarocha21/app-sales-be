import { RequestHandler } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { AppError } from "../utils/AppError";

export const requireAdmin: RequestHandler = (req, _res, next) => {
  try {
    if ((req as AuthenticatedRequest).user.role !== "admin") {
      throw new AppError("Admin access is required", 403, "FORBIDDEN");
    }

    next();
  } catch (error) {
    next(error);
  }
};
