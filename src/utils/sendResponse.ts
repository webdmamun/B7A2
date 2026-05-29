import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
) => {
  const response: any = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any
) => {
  const response: any = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
