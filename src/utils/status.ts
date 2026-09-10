import { Response } from "express";

export const responseStatus = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  const error = res.status(statusCode).json({
    message,
    data
  });
  return error;
};
