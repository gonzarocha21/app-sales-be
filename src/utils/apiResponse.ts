import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {})
  });
};
