import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { sendError } from "../utils/sendResponse";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return sendError(res, 401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, "Unauthorized: Invalid token");
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      return sendError(res, 403, "Forbidden: Insufficient permissions");
    }
    next();
  };
};
