import { Response } from "express";
import { IResponse } from "../types";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
) => {
  const response: IResponse<T> = {
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
  errors?: unknown
) => {
  const response: IResponse<null> = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
