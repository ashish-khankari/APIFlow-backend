import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../utils/jwt.utils";
import { User } from "../types/user.types";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }
  try {
    const decode = jwt.verify(token, getJwtSecret()) as User;
    if (!decode.id || !decode.email) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    req.user = decode as User;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
