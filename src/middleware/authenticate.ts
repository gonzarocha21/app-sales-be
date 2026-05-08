import { Request, RequestHandler } from "express";
import { UserRole } from "../models";
import { authService } from "../modules/auth/auth.service";
import { AppError } from "../utils/AppError";

export type AuthenticatedUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string;
  workLocationId: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    throw new AppError("Authentication is required", 401);
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authentication is required", 401);
  }

  return token;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const user = authService.getUserByToken(token);

    (req as AuthenticatedRequest).user = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      workLocationId: user.workLocationId,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
